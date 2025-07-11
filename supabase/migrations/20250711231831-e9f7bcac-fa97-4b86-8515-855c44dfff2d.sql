
-- Add missing columns to orders table for better tracking
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS order_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS parent_notes TEXT;

-- Create a new table for order items with delivery date tracking
CREATE TABLE IF NOT EXISTS public.order_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE NOT NULL,
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE,
  child_name TEXT NOT NULL,
  child_class TEXT,
  delivery_date DATE NOT NULL,
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC GENERATED ALWAYS AS (quantity * unit_price) STORED,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on the new table
ALTER TABLE public.order_line_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for order_line_items
CREATE POLICY "Users can view their own order line items" 
  ON public.order_line_items 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_line_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create order line items for their orders" 
  ON public.order_line_items 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_line_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all order line items" 
  ON public.order_line_items 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_order_line_items_order_id ON public.order_line_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_line_items_delivery_date ON public.order_line_items(delivery_date);
CREATE INDEX IF NOT EXISTS idx_order_line_items_child_id ON public.order_line_items(child_id);
