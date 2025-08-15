-- Insert sample subscription plans
INSERT INTO public.subscription_plans (name, price_monthly, price_yearly, features, max_coins, historical_depth_days, max_alerts_per_day, api_access) VALUES
('Free', 0, 0, '["3 coins tracking", "24h data history", "Basic PulseScore", "Community support"]', 3, 1, 0, false),
('Pro', 19.99, 199.99, '["Unlimited coin tracking", "5 years historical data", "Advanced analytics", "5 alerts per day", "CSV/JSON exports", "Priority support"]', null, 1825, 5, true),
('Enterprise', 499, 4999, '["Full API access", "Custom ML models", "Unlimited alerts", "Webhook integrations", "24/7 SLA support", "Custom reporting"]', null, 1825, 999, true);

-- Insert sample pulse analytics data for testing
INSERT INTO public.pulse_analytics (coin_symbol, pulse_score, current_phase, confidence_percentage, price_usd, volume_24h, market_cap) VALUES
('PLS', 87, 'Accumulation', 92.4, 0.00015, 1250000, 850000000),
('PLSX', 92, 'Uptrend', 88.7, 0.00032, 890000, 320000000),
('INC', 65, 'Distribution', 76.2, 0.00028, 420000, 180000000),
('HEX', 34, 'Downtrend', 69.1, 0.00012, 650000, 450000000),
('WPLS', 78, 'Accumulation', 84.5, 0.00016, 340000, 120000000),
('9MM', 56, 'Consolidation', 71.8, 0.00009, 180000, 85000000);

-- Update the trigger for profiles to handle users created before trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create the trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();