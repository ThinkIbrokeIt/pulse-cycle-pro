-- Fix security warnings by updating functions with proper search_path

-- Update get_user_subscription_tier function
CREATE OR REPLACE FUNCTION public.get_user_subscription_tier(user_uuid uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(p.subscription_tier, 'free')
  FROM public.profiles p
  WHERE p.user_id = user_uuid;
$$;

-- Update handle_new_user function (already has search_path but ensuring it's correct)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;