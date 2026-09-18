import SuccessClient from './SuccessClient';

export const metadata = {
  title: 'Order Successful',
  description: 'Your Paddle payment was completed successfully on Core Collective.',
};

export default function SuccessPage({ searchParams }) {
  return (
    <SuccessClient
      orderId={searchParams?.order_id}
      provider={searchParams?.provider}
      product={searchParams?.product}
      amount={searchParams?.amount}
      productId={searchParams?.product_id}
      qty={searchParams?.qty}
    />
  );
}