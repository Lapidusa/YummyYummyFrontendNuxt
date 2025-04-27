export interface Store {
  id: string;
  address: string;
  start_working_hours: string;
  end_working_hours: string;
  start_delivery_time: string;
  end_delivery_time: string;
  phone_number: string;
  min_order_price: number
  city_id: string;
  created_at: Date;
  updated_at: Date;
  area:number[][];
  point:[number, number];
}