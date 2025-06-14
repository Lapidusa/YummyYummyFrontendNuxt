export interface OrderAddress {
  id?: string;
  street: string;
  house: string;
  apartment: string;
  comment: string;
}
export enum OrderStatus {
  PENDING = 0,
  IN_PROGRESS = 1,
  COMPLETED = 2,
  CANCELLED = 3,
}

export enum PaymentMethod {
  CASH     = 'CASH',
  CARD     = 'CARD',
  ONLINE   = 'ONLINE',
}
export interface OrderItem {
  product_variant_id: string;
  quantity:           number;
  price_per_item:     number;
}

interface BaseOrder {
  id:            string;
  user_id:       string;
  total_price:   number;
  created_at:    string;
  status:        OrderStatus;
  payment_method: PaymentMethod;
  items:         OrderItem[];
}

export interface PickupOrder extends BaseOrder {
  is_pickup: true;
  store_id:  string;
  address?:  never;
}

export interface DeliveryOrder extends BaseOrder {
  is_pickup: false;

  store_id?: never;

  address:  OrderAddress;
}

export type Order = PickupOrder | DeliveryOrder;

export const OrderStatusLabels: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]:     'Ожидает подтверждения',
  [OrderStatus.IN_PROGRESS]: 'В процессе',
  [OrderStatus.COMPLETED]:   'Выполнен',
  [OrderStatus.CANCELLED]:   'Отменён',
}

export const createEmptyOrderAddress = () :OrderAddress => ({
  street: '',
  house: '',
  apartment: '',
  comment: '',
})