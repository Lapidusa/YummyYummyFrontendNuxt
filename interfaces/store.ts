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
  area:[number, number][];
  point:[number, number];
}

export const createEmptyStore = (): Store => ({
  id: '',
  address: '',
  start_working_hours: '',
  end_working_hours: '',
  start_delivery_time: '',
  end_delivery_time: '',
  phone_number: '',
  min_order_price: 500,
  city_id: '',
  created_at: new Date(),
  updated_at: new Date(),
  area: [],
  point: null as unknown as [number, number],
});

export const StoreFieldLabels: Record<string, string> = {
  address: 'Адрес',
  start_working_hours: 'Начало работы',
  end_working_hours: 'Конец работы',
  start_delivery_time: 'Начало доставки',
  end_delivery_time: 'Конец доставки',
  phone_number: 'Номер телефона',
  min_order_price: 'Мин. сумма заказа',
  city_id: 'Город',
  area: 'Область доставки',
  point: 'Точка магазина',
};