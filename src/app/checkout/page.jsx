import CheckoutClient from './CheckoutClient';

export const metadata = {
  title: 'Checkout',
  description: 'Review your order and pay securely through Paddle on Core Collective.',
};

export default function CheckoutPage({ searchParams }) {
  const cancelled =
    searchParams?.cancel === '1' || searchParams?.error === 'cancel' || searchParams?.cancel === 'true';
  return (
    <CheckoutClient
      initialProductId={searchParams?.product_id}
      initialQty={searchParams?.qty}
      initialCancelled={cancelled}
    />
  );
}