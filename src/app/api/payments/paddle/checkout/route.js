import {
  getSupabaseAdmin,
  verifyUser,
  fetchProducts,
  deriveUnit,
  createLocalCartOrder,
  createPaddleTransaction,
  paddleConfig,
} from '../../../../../lib/payments';

export async function POST(request) {
  let user;
  try {
    user = await verifyUser(request);
    if (!user) {
      return Response.json({ error: 'You must be signed in to check out.' }, { status: 401 });
    }
  } catch (err) {
    return Response.json({ error: err.message || 'Authentication failed.' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  try {
    // Accept a multi-product cart ({ lines }) or a single product payload.
    let rawLines = Array.isArray(body.lines) ? body.lines : [];
    if (rawLines.length === 0 && body.product_id != null) {
      rawLines = [{ product_id: body.product_id, quantity: body.quantity ?? body.qty }];
    }
    if (rawLines.length === 0) {
      return Response.json({ error: 'Your cart is empty.' }, { status: 400 });
    }

    const requested = rawLines
      .map((l) => ({
        product_id: Number(l.product_id ?? l.productId),
        quantity: Math.min(1000, Math.max(1, Math.floor(Number(l.quantity ?? l.qty) || 1))),
      }))
      .filter((l) => Number.isInteger(l.product_id) && l.product_id > 0);

    if (requested.length === 0) {
      return Response.json({ error: 'Your cart contains no valid products.' }, { status: 400 });
    }
    if (requested.length > 100) {
      return Response.json({ error: 'Too many line items for one checkout.' }, { status: 400 });
    }

    // Prices always come from the products table (source of truth), never the client.
    const products = await fetchProducts(requested.map((l) => l.product_id));
    const byId = new Map(products.map((p) => [Number(p.id), p]));

    const lines = requested
      .map((l) => {
        const product = byId.get(l.product_id);
        if (!product) return null;
        return {
          product_id: Number(product.id),
          name: product.name,
          description: product.description || '',
          image_url: product.image_url || '',
          price: deriveUnit(product),
          quantity: l.quantity,
        };
      })
      .filter(Boolean);

    if (lines.length === 0) {
      return Response.json({ error: 'No products match your cart. Refresh and try again.' }, { status: 404 });
    }

    const amount = Math.round(lines.reduce((sum, l) => sum + l.price * l.quantity, 0) * 100) / 100;
    const quantity = lines.reduce((sum, l) => sum + l.quantity, 0);

    const localOrder = await createLocalCartOrder({ user, lines, provider: 'paddle' });

    const { transactionId } = await createPaddleTransaction(localOrder);

    // Store the Paddle transaction id so the webhook can match by it too.
    await getSupabaseAdmin()
      .from('orders')
      .update({ transaction_id: transactionId })
      .eq('id', localOrder.id);

    const cfg = paddleConfig();

    return Response.json({
      transactionId,
      orderId: localOrder.id,
      environment: cfg.envName,
      amount,
      quantity,
      itemsCount: lines.length,
    });
  } catch (err) {
    return Response.json({ error: err.message || 'Could not start Paddle checkout.' }, { status: 500 });
  }
}