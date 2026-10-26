export const CREDIT_PRICE_ID = 'pri_01kr1kcpmnjsqadxa8mpd3jhnp';
export const SUBSCRIPTION_PRICE_ID = 'pri_01kr1kb3qkfnhx7cyzz6h675h3';

export function paymentEntitlement(items: { price?: { id?: string } | null; quantity: number }[]) {
  if (!items.length) throw new Error('No purchased items.');
  let credits = 0;
  let plan: 'credit' | 'subscription' = 'credit';
  for (const item of items) {
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 100) throw new Error('Invalid quantity.');
    if (item.price?.id === CREDIT_PRICE_ID) credits += item.quantity;
    else if (item.price?.id === SUBSCRIPTION_PRICE_ID && item.quantity === 1) { credits += 5; plan = 'subscription'; }
    else throw new Error('Unrecognized price.');
  }
  return { credits, plan };
}
