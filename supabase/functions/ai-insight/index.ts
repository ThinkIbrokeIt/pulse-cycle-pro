import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CoinInsightRequest {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  pulseScore: number;
  currentPhase: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
    
    if (!deepseekApiKey) {
      throw new Error('DEEPSEEK_API_KEY not configured');
    }

    const { symbol, name, price, change24h, volume24h, marketCap, pulseScore, currentPhase }: CoinInsightRequest = await req.json();

    const prompt = `As an expert crypto analyst specializing in PulseChain, provide a detailed market insight for ${name} (${symbol}). 

Current Data:
- Price: $${price}
- 24h Change: ${change24h}%
- Volume 24h: $${volume24h}
- Market Cap: $${marketCap}
- PulseScore: ${pulseScore}/100
- Current Phase: ${currentPhase}

Provide a concise but comprehensive analysis covering:
1. Technical analysis based on the current phase and PulseScore
2. Market sentiment and momentum indicators
3. Potential price targets and timeline
4. Risk assessment and trading recommendations
5. Historical pattern similarities within PulseChain ecosystem

Keep the response under 200 words but make it actionable and specific to PulseChain dynamics.`;

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-reasoner',
        messages: [
          {
            role: 'system',
            content: 'You are an expert cryptocurrency analyst specializing in PulseChain tokens. Provide precise, actionable insights based on technical analysis and market data.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_completion_tokens: 300,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Deepseek API error:', response.status, errorData);
      throw new Error(`Deepseek API error: ${response.status}`);
    }

    const data = await response.json();
    const aiInsight = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ 
        insight: aiInsight,
        timestamp: new Date().toISOString(),
        model: 'deepseek-reasoner'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in ai-insight function:', error);
    
    // Fallback insight if API fails
    const fallbackInsight = `Technical analysis shows ${req.body?.currentPhase || 'current'} phase characteristics. Monitor volume trends and key support/resistance levels. Consider risk management strategies appropriate for current market conditions.`;
    
    return new Response(
      JSON.stringify({ 
        insight: fallbackInsight,
        timestamp: new Date().toISOString(),
        model: 'fallback',
        error: 'AI service temporarily unavailable'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});