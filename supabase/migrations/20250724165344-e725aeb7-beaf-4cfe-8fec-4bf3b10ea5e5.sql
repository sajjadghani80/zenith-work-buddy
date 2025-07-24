-- Fix subscription table RLS policy - replace overly permissive policy
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;

-- Create restrictive policy that only allows users to update their own records
CREATE POLICY "update_own_subscription" ON public.subscribers
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Fix function search path mutability
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;