import { supabase } from '../../../lib/supabase';
import ProductDetailClient from './ProductDetailClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://buy-allproduts-corecollective.vercel.app';

export async function generateMetadata({ params }) {
  try {
    if (!supabase) return { title: 'Product Details' };
    const { data: product } = await supabase
      .from('products')
      .select('name, description, category, price_min, price, image_url, rating, reviews_count')
      .eq('id', Number(params.id))
      .single();

    if (!product) {
      return { title: 'Product Not Found' };
    }

    const price = product.price_min || product.price || 0;
    const productName = product.name || 'Product';
    const productDesc = product.description
      ? product.description.substring(0, 160)
      : `Buy ${productName} at wholesale price. $${Number(price).toFixed(2)} per unit. Bulk orders available.`;
    const productImage = product.image_url || 'https://izqxsfuyibbzwdxdcmev.supabase.co/storage/v1/object/public/Background/Logo/Core%20Collective%20(1).png';
    const category = product.category || 'General';

    return {
      title: productName,
      description: productDesc,
      keywords: [`${productName}`, `${category} wholesale`, 'buy bulk Pakistan', 'wholesale price', category],
      openGraph: {
        title: `${productName} | Core Collective`,
        description: productDesc,
        url: `${SITE_URL}/products/${params.id}`,
        type: 'website',
        images: [{ url: productImage, width: 800, height: 800, alt: productName }],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${productName} | Core Collective`,
        description: productDesc,
        images: [productImage],
      },
      other: {
        'product:price:amount': price.toFixed(2),
        'product:price:currency': 'USD',
        'product:availability': 'in stock',
        'product:category': category,
      },
    };
  } catch {
    return { title: 'Product Details' };
  }
}

export default function ProductDetailPage({ params }) {
  return <ProductDetailClient params={params} />;
}
