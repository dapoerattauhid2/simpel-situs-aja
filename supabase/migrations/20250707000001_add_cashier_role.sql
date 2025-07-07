
-- Add cashier role to user_roles table
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_role_check CHECK (role IN ('admin', 'parent', 'cashier'));

-- Update the handle_new_user function to support cashier role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, address, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(new.raw_user_meta_data ->> 'phone', ''),
    COALESCE(new.raw_user_meta_data ->> 'address', ''),
    COALESCE(new.raw_user_meta_data ->> 'role', 'parent')
  );
  
  -- Also insert into user_roles table
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'role', 'parent')
  );
  
  RETURN new;
END;
$$;

-- Add RLS policies for cashier role
CREATE POLICY "Cashiers can view all orders" 
  ON public.orders 
  FOR SELECT 
  USING (public.has_role(auth.uid(), 'cashier'));

CREATE POLICY "Cashiers can update order payment status" 
  ON public.orders 
  FOR UPDATE 
  USING (public.has_role(auth.uid(), 'cashier'))
  WITH CHECK (public.has_role(auth.uid(), 'cashier'));

-- Cashiers can view all children data for order processing
CREATE POLICY "Cashiers can view all children" 
  ON public.children 
  FOR SELECT 
  USING (public.has_role(auth.uid(), 'cashier'));

-- Cashiers can view all order items
CREATE POLICY "Cashiers can view all order items" 
  ON public.order_items 
  FOR SELECT 
  USING (public.has_role(auth.uid(), 'cashier'));

-- Add cash payment table to track cash transactions
CREATE TABLE public.cash_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  cashier_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  received_amount DECIMAL(10,2) NOT NULL,
  change_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on cash_payments
ALTER TABLE public.cash_payments ENABLE ROW LEVEL SECURITY;

-- Policy for cashiers to manage cash payments
CREATE POLICY "Cashiers can manage cash payments" 
  ON public.cash_payments 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'cashier'));

-- Policy for admins to view cash payments
CREATE POLICY "Admins can view cash payments" 
  ON public.cash_payments 
  FOR SELECT 
  USING (public.has_role(auth.uid(), 'admin'));
