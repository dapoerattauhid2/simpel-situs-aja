
export interface BatchCartItem {
  id: string;
  menu_item_id: string;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
  delivery_date: string;
  child_id: string;
  child_name: string;
  child_class: string;
  notes?: string;
}

export interface BatchOrder {
  items: BatchCartItem[];
  total_amount: number;
  parent_notes?: string;
}
