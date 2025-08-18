import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSubscriptionActions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const createCheckoutSession = async (planType: 'pro' | 'enterprise') => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please sign in to subscribe to a plan.",
      });
      return;
    }

    // Pro plan is now free, just update user profile directly
    if (planType === 'pro') {
      setLoading(true);
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ 
            subscription_tier: 'pro',
            subscription_end: null // No end date for free plan
          })
          .eq('user_id', user.id);

        if (error) throw error;

        toast({
          title: "Welcome to Pro!",
          description: "You now have access to all Pro features.",
        });
      } catch (error) {
        console.error('Error upgrading to Pro:', error);
        toast({
          variant: "destructive",
          title: "Upgrade Error",
          description: "Failed to upgrade to Pro. Please try again.",
        });
      } finally {
        setLoading(false);
      }
      return;
    }

    // Enterprise still requires checkout
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planType }
      });

      if (error) throw error;

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        variant: "destructive",
        title: "Checkout Error",
        description: "Failed to create checkout session. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const openCustomerPortal = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please sign in to manage your subscription.",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) throw error;

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No portal URL received');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        variant: "destructive",
        title: "Portal Error",
        description: "Failed to open customer portal. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkSubscription = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;

      toast({
        title: "Subscription Updated",
        description: "Your subscription status has been refreshed.",
      });

      return data;
    } catch (error) {
      console.error('Error checking subscription:', error);
      toast({
        variant: "destructive",
        title: "Sync Error",
        description: "Failed to sync subscription status.",
      });
    }
  };

  return {
    createCheckoutSession,
    openCustomerPortal,
    checkSubscription,
    loading
  };
};