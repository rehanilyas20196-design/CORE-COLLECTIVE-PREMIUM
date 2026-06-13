import { createClient } from '@supabase/supabase-js';
import ProductDetailClient from './ProductDetailClient';

const SITE_URL = 'https://frontend-next-one-ebon.vercel.app';

export async function generateMetadata({ params }) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    const { data: product } = await supabase
      .from('products')
      .select('name, description, category, price_min, price, image_url, rating, reviews_count')
      .eq('id', Number(params.id))
      .single();

    if (!product) {
      return { title: 'Product Not Found' };
    }

    const price = product.price_min || product.price || 0;
    const productName = product.name;
    const productDesc = product.description
      ? product.description.substring(0, 160)
      : `Buy ${productName} at wholesale price. PKR ${Number(price).toLocaleString()} per unit. Bulk orders available.`;
    const productImage = product.image_url || 'https://izqxsfuyibbzwdxdcmev.supabase.co/storage/v1/object/public/Background/Logo/Core%20Collective%20(1).png';

    return {
      title: productName,
      description: productDesc,
      keywords: [`${productName}`, `${product.category} wholesale`, 'buy bulk Pakistan', 'wholesale price', product.category],
      openGraph: {
        title: `${productName} | Core Collective`,
        description: productDesc,
        url: `${SITE_URL}/products/${params.id}`,
        type: 'product',
        images: [{ url: productImage, width: 800, height: 800, alt: productName }],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${productName} | Core Collective`,
        description: productDesc,
        images: [productImage],
      },
      other: {
        'product:price:amount': price.toString(),
        'product:price:currency': 'PKR',
        'product:availability': 'in stock',
        'product:category': product.category,
      },
    };
  } catch {
    return { title: 'Product Details' };
  }
}

export default function ProductDetailPage({ params }) {
  return <ProductDetailClient params={params} />;
}
