import { useEffect } from 'react';

interface AnalyticsEvent {
  event: string;
  data?: Record<string, any>;
}

export const useAnalytics = () => {
  const track = (event: string, data?: Record<string, any>) => {
    try {
      // Simple client-side analytics tracking
      const analyticsData = {
        event,
        data: data || {},
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        sessionId: getSessionId()
      };

      // Store locally for now - could be sent to an analytics service
      const existing = JSON.parse(localStorage.getItem('pulsecycle_analytics') || '[]');
      existing.push(analyticsData);
      
      // Keep only last 100 events
      if (existing.length > 100) {
        existing.splice(0, existing.length - 100);
      }
      
      localStorage.setItem('pulsecycle_analytics', JSON.stringify(existing));
      
      console.log('Analytics Event:', analyticsData);
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  };

  const getSessionId = () => {
    let sessionId = sessionStorage.getItem('pulsecycle_session');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('pulsecycle_session', sessionId);
    }
    return sessionId;
  };

  const getAnalytics = () => {
    try {
      return JSON.parse(localStorage.getItem('pulsecycle_analytics') || '[]');
    } catch {
      return [];
    }
  };

  const getPopularTokens = () => {
    const analytics = getAnalytics();
    const tokenSearches = analytics.filter((event: any) => event.event === 'token_search');
    
    const tokenCounts = tokenSearches.reduce((acc: Record<string, number>, event: any) => {
      const token = event.data?.token?.toUpperCase();
      if (token) {
        acc[token] = (acc[token] || 0) + 1;
      }
      return acc;
    }, {});

    return Object.entries(tokenCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 10)
      .map(([token, count]) => ({ token, count }));
  };

  // Track page views automatically
  useEffect(() => {
    track('page_view', { 
      path: window.location.pathname,
      referrer: document.referrer 
    });
  }, []);

  return {
    track,
    getAnalytics,
    getPopularTokens
  };
};
