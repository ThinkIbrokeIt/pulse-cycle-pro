-- Create user profiles table
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  subscription_tier text NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  stripe_customer_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create subscription plans table
CREATE TABLE public.subscription_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  price_monthly decimal(10,2) NOT NULL,
  price_yearly decimal(10,2),
  features jsonb NOT NULL DEFAULT '{}',
  max_coins integer,
  historical_depth_days integer,
  max_alerts_per_day integer,
  api_access boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create user subscriptions table
CREATE TABLE public.user_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.subscription_plans(id),
  stripe_subscription_id text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'incomplete')),
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create pulse analytics table for storing coin analysis data
CREATE TABLE public.pulse_analytics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coin_symbol text NOT NULL,
  pulse_score integer NOT NULL CHECK (pulse_score >= 0 AND pulse_score <= 100),
  current_phase text NOT NULL CHECK (current_phase IN ('accumulation', 'markup', 'distribution', 'markdown')),
  next_peak_prediction timestamp with time zone,
  confidence_percentage decimal(5,2) NOT NULL CHECK (confidence_percentage >= 0 AND confidence_percentage <= 100),
  historical_similarity jsonb,
  price_usd decimal(20,8),
  volume_24h decimal(20,2),
  market_cap decimal(20,2),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create user alerts table
CREATE TABLE public.user_alerts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coin_symbol text NOT NULL,
  alert_type text NOT NULL CHECK (alert_type IN ('phase_change', 'score_threshold', 'price_target', 'whale_activity')),
  trigger_value decimal(20,8),
  is_active boolean NOT NULL DEFAULT true,
  last_triggered timestamp with time zone,
  notification_channels text[] NOT NULL DEFAULT ARRAY['email'],
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create API usage tracking table
CREATE TABLE public.api_usage (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  request_count integer NOT NULL DEFAULT 1,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, endpoint, date)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pulse_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get user's subscription tier
CREATE OR REPLACE FUNCTION public.get_user_subscription_tier(user_uuid uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(p.subscription_tier, 'free')
  FROM public.profiles p
  WHERE p.user_id = user_uuid;
$$;

-- RLS Policies for profiles table
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for subscription_plans table (public read)
CREATE POLICY "Anyone can view subscription plans" 
ON public.subscription_plans 
FOR SELECT 
USING (true);

-- RLS Policies for user_subscriptions table
CREATE POLICY "Users can view their own subscriptions" 
ON public.user_subscriptions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions" 
ON public.user_subscriptions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" 
ON public.user_subscriptions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for pulse_analytics table (tier-based access)
CREATE POLICY "Free users can view limited analytics" 
ON public.pulse_analytics 
FOR SELECT 
USING (
  public.get_user_subscription_tier(auth.uid()) = 'free' 
  AND created_at >= CURRENT_DATE - INTERVAL '1 day'
);

CREATE POLICY "Pro and Enterprise users can view all analytics" 
ON public.pulse_analytics 
FOR SELECT 
USING (
  public.get_user_subscription_tier(auth.uid()) IN ('pro', 'enterprise')
);

-- RLS Policies for user_alerts table
CREATE POLICY "Users can manage their own alerts" 
ON public.user_alerts 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for api_usage table
CREATE POLICY "Users can view their own API usage" 
ON public.api_usage 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert API usage" 
ON public.api_usage 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create function to handle new user registration
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

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_alerts_updated_at
  BEFORE UPDATE ON public.user_alerts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, price_monthly, price_yearly, features, max_coins, historical_depth_days, max_alerts_per_day, api_access) VALUES
('Free', 0.00, 0.00, '{"basic_analytics": true, "limited_coins": true}', 3, 1, 0, false),
('Pro', 19.99, 199.99, '{"advanced_analytics": true, "all_coins": true, "historical_data": true, "alerts": true}', null, 1825, 5, false),
('Enterprise', 499.00, 4999.00, '{"full_analytics": true, "api_access": true, "custom_models": true, "priority_support": true}', null, 1825, null, true);