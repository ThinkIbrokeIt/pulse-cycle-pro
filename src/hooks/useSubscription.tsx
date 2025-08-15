import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price_monthly: number;
  price_yearly?: number;
  features: any; // Using any to match the Json type from Supabase
  max_coins?: number;
  historical_depth_days?: number;
  max_alerts_per_day?: number;
  api_access: boolean;
}

export interface UserSubscription {
  id: string;
  plan_id: string;
  status: string;
  current_period_start?: string;
  current_period_end?: string;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [userTier, setUserTier] = useState<string>('free');

  useEffect(() => {
    if (user) {
      fetchUserSubscription();
      fetchSubscriptionPlans();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchUserSubscription = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;
      setUserSubscription(data);

      // Get user's subscription tier
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('user_id', user.id)
        .single();

      setUserTier(profile?.subscription_tier || 'free');
    } catch (error) {
      console.error('Error fetching user subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptionPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price_monthly', { ascending: true });

      if (error) throw error;
      setSubscriptionPlans(data || []);
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
    }
  };

  return {
    loading,
    userSubscription,
    subscriptionPlans,
    userTier,
    refetch: fetchUserSubscription
  };
};