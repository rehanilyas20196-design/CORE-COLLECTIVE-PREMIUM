import { verifyPaddleWebhookSignature, recordPaddleEvent, decrementStockForOrder } from '../../../../lib/payments';

export async function POST(request) {
  const payload = await request.text();
  const signature = request.headers.get('paddle-signature') || '';

  let valid;
  try {
    valid = verifyPaddleWebhookSignature(payload, signature);
  } catch (err) {
    return Response.json({ error: `Verification error: ${err.message}` }, { status: 400 });
  }
  if (!valid) {
    return Response.json({ error: 'Webhook signature verification failed.' }, { status: 400 });
  }

  let event;
  try {
    event = JSON.parse(payload);
  } catch {
    return Response.json({ error: 'Invalid webhook payload.' }, { status: 400 });
  }

  try {
    const result = await recordPaddleEvent(event);
    if (result?.handled === false) {
      return Response.json({ error: 'Could not process webhook event.' }, { status: 500 });
    }

    // Reduce stock only after payment is confirmed, and only once per order
    // (recordPaddleEvent returns duplicate:true on Paddle retries). If this
    // step ever fails we still ack the webhook; Paddle retries would be
    // deduped anyway, and stock is reconciled manually via the order.
    if (
      result?.state === 'paid' &&
      (result.updated || result.upserted) &&
      result.orderId
    ) {
      try {
        await decrementStockForOrder(result.orderId);
      } catch (err) {
        console.error(`Stock decrement failed for order ${result.orderId}:`, err);
      }
    }
  } catch (err) {
    return Response.json({ error: err.message || 'Could not record the Paddle event.' }, { status: 500 });
  }

  return Response.json({ received: true });
}