import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DexScreenerToken {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceNative: string;
  priceUsd: string;
  txns: {
    m5: { buys: number; sells: number };
    h1: { buys: number; sells: number };
    h6: { buys: number; sells: number };
    h24: { buys: number; sells: number };
  };
  volume: {
    h24: number;
    h6: number;
    h1: number;
    m5: number;
  };
  priceChange: {
    m5: number;
    h1: number;
    h6: number;
    h24: number;
  };
  liquidity?: {
    usd?: number;
    base: number;
    quote: number;
  };
  fdv?: number;
  marketCap?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, query } = await req.json();

    if (action === 'search') {
      // Search for specific token
      const searchUrl = `https://api.dexscreener.com/latest/dex/search/?q=${encodeURIComponent(query)}`;
      
      console.log(`Searching for token: ${query}`);
      const response = await fetch(searchUrl);
      
      if (!response.ok) {
        throw new Error(`DexScreener API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Filter for PulseChain pairs only
      const pulseChainPairs = data.pairs?.filter((pair: DexScreenerToken) => 
        pair.chainId === 'pulsechain' || pair.chainId === 'pulse'
      ) || [];
      
      console.log(`Found ${pulseChainPairs.length} PulseChain pairs`);
      
      return new Response(JSON.stringify({ 
        pairs: pulseChainPairs,
        success: true 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
      
    } else if (action === 'trending') {
      // Get trending PulseChain tokens
      const trendingUrl = 'https://api.dexscreener.com/latest/dex/tokens/0x2b591e99afE9f32eAA6214f7B7629768c40Eeb39,0x2fa878Ab3F87CC1C9737Fc071108F904c0B0C95d,0x57fde0a71132198BBeC939B98976993d8D89D225,0x95B303987A60C71504D99Aa1b13B4DA07b0790ab';
      
      const response = await fetch(trendingUrl);
      
      if (!response.ok) {
        throw new Error(`DexScreener API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      return new Response(JSON.stringify({ 
        pairs: data.pairs || [],
        success: true 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in pulse-tokens function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});