export type FulfillmentStatus =
  | 'canceled'
  | 'not_fulfilled'
  | 'partially_fulfilled'
  | 'fulfilled'
  | 'partially_shipped'
  | 'shipped'
  | 'partially_delivered'
  | 'delivered';

export const getFulfillmentStatus = (status: FulfillmentStatus) => {
  const statusMap: Record<FulfillmentStatus, string> = {
    canceled: 'canceled',
    not_fulfilled: 'not-fulfilled',
    partially_fulfilled: 'partially-fulfilled',
    fulfilled: 'fulfilled',
    partially_shipped: 'partially-shipped',
    shipped: 'shipped',
    partially_delivered: 'partially-delivered',
    delivered: 'delivered',
  };

  return statusMap[status] || 'not-fulfilled';
};
