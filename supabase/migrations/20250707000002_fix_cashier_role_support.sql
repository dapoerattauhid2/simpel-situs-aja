
-- Update user_roles table constraint to include cashier
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_role_check CHECK (role IN ('admin', 'parent', 'cashier'));

-- Update profiles table constraint to include cashier
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'parent', 'cashier'));

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

-- Create updated policies for user_roles
CREATE POLICY "Users can view own role" 
  ON public.user_roles 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Admins can manage all roles including cashier
CREATE POLICY "Admins can manage all roles including cashier" 
  ON public.user_roles 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Update profiles policies to allow cashier role management
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Recreate profiles policies with cashier support
CREATE POLICY "Users can view own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles including cashier role" 
  ON public.profiles 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Update handle_new_user function to properly support cashier role
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
  
  -- Also insert into user_roles table with proper role validation
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    new.id,
    CASE 
      WHEN COALESCE(new.raw_user_meta_data ->> 'role', 'parent') IN ('admin', 'parent', 'cashier') 
      THEN COALESCE(new.raw_user_meta_data ->> 'role', 'parent')
      ELSE 'parent'
    END
  );
  
  RETURN new;
END;
$$;

-- Create function to safely update user role (can be used by admin interface)
CREATE OR REPLACE FUNCTION public.update_user_role(_user_id uuid, _new_role text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the calling user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RETURN false;
  END IF;
  
  -- Validate the new role
  IF _new_role NOT IN ('admin', 'parent', 'cashier') THEN
    RETURN false;
  END IF;
  
  -- Update both tables
  UPDATE public.user_roles 
  SET role = _new_role, updated_at = NOW()
  WHERE user_id = _user_id;
  
  UPDATE public.profiles 
  SET role = _new_role, updated_at = NOW()
  WHERE id = _user_id;
  
  RETURN true;
END;
$$;

-- Grant execute permission on the update function
GRANT EXECUTE ON FUNCTION public.update_user_role(uuid, text) TO authenticated;
