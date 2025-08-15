import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface PulseAnalytics {
  id: string;
  coin_symbol: string;
  pulse_score: number;
  current_phase: string;
  confidence_percentage: number;
  price_usd?: number;
  volume_24h?: number;
  market_cap?: number;
  next_peak_prediction?: string;
  historical_similarity?: any;
  created_at: string;
}

export const usePulseAnalytics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<PulseAnalytics[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchAnalytics = async () => {
    if (!user) return;

    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('pulse_analytics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (fetchError) throw fetchError;
      setAnalytics(data || []);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const getLatestByCoin = (symbol: string) => {
    return analytics.find(a => a.coin_symbol === symbol);
  };

  const getTopPerformers = () => {
    const uniqueCoins = new Map();
    analytics.forEach(item => {
      if (!uniqueCoins.has(item.coin_symbol) || 
          new Date(item.created_at) > new Date(uniqueCoins.get(item.coin_symbol).created_at)) {
        uniqueCoins.set(item.coin_symbol, item);
      }
    });
    
    return Array.from(uniqueCoins.values())
      .sort((a, b) => b.pulse_score - a.pulse_score)
      .slice(0, 4);
  };

  return {
    loading,
    analytics,
    error,
    refetch: fetchAnalytics,
    getLatestByCoin,
    getTopPerformers
  };
};