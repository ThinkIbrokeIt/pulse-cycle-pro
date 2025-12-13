import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

// Mock data
export const mockTokenMetrics = {
  token_address: '0x2b591e99afe9f32eaa6214f7b7629768c40eeb39',
  timestamp: '2024-01-01T12:00:00.000Z',
  price_usd: 0.00015,
  volume_24h: 250000,
  volume_6h: 80000,
  liquidity_usd: 50000,
  market_cap: 1500000,
  price_change_24h: 15.5,
  price_change_6h: 8.2,
  price_change_1h: 2.1,
  txns_24h_buys: 350,
  txns_24h_sells: 280,
  holder_count: 1250,
  top_10_concentration: 35.5,
  unique_wallets_24h: 420,
  contract_age_days: 180
}

export const mockPredictionResponse = {
  token_address: '0x2b591e99afe9f32eaa6214f7b7629768c40eeb39',
  predicted_phase: 'accumulation',
  confidence: 0.85,
  score: 78,
  probabilities: {
    accumulation: 0.45,
    pump: 0.25,
    peak: 0.15,
    dump: 0.10,
    bottom: 0.05
  },
  timestamp: '2024-01-01T12:00:00.000Z',
  model_version: 'beta_v1_20240101'
}

export const mockHealthResponse = {
  status: 'healthy',
  model_loaded: true,
  model_trained_at: '2024-01-01T00:00:00.000Z',
  features_count: 57,
  api_version: '1.0.0-beta'
}

export const mockAIInsightResponse = {
  insight: 'Technical analysis shows strong accumulation patterns with increasing volume. The PulseScore of 78 indicates favorable market conditions for long-term holding.',
  timestamp: '2024-01-01T12:00:00.000Z',
  model: 'deepseek-reasoner'
}

export const mockDexScreenerResponse = {
  pairs: [
    {
      chainId: 'pulsechain',
      dexId: 'pulsex',
      url: 'https://dexscreener.com/pulsechain/0x123',
      pairAddress: '0x123456789',
      baseToken: {
        address: '0x2b591e99afe9f32eaa6214f7b7629768c40eeb39',
        name: 'PulseChain PLS',
        symbol: 'PLS'
      },
      quoteToken: {
        address: '0xA1077a294dDE1B09bB078844df40758a5D0f9a27',
        name: 'Wrapped Pulse',
        symbol: 'WPLS'
      },
      priceNative: '1.0',
      priceUsd: '0.00015',
      txns: {
        m5: { buys: 10, sells: 5 },
        h1: { buys: 50, sells: 30 },
        h6: { buys: 200, sells: 150 },
        h24: { buys: 350, sells: 280 }
      },
      volume: {
        h24: 250000,
        h6: 80000,
        h1: 15000,
        m5: 2000
      },
      priceChange: {
        m5: 2.1,
        h1: 5.5,
        h6: 8.2,
        h24: 15.5
      },
      liquidity: {
        usd: 50000,
        base: 100000,
        quote: 200000
      },
      fdv: 1500000,
      marketCap: 1500000
    }
  ]
}

// Define request handlers
export const handlers = [
  // ML API handlers
  http.get('http://localhost:8000/health', () => {
    return HttpResponse.json(mockHealthResponse)
  }),

  http.post('http://localhost:8000/predict', async ({ request }) => {
    const body = await request.json() as any
    return HttpResponse.json({
      ...mockPredictionResponse,
      token_address: body.token_address
    })
  }),

  http.post('http://localhost:8000/predict/batch', async ({ request }) => {
    const body = await request.json() as any
    const predictions = body.tokens.map((token: any) => ({
      ...mockPredictionResponse,
      token_address: token.token_address
    }))

    return HttpResponse.json({
      predictions,
      total_processed: predictions.length,
      timestamp: '2024-01-01T12:00:00.000Z'
    })
  }),

  http.get('http://localhost:8000/model/info', () => {
    return HttpResponse.json({
      trained_at: '2024-01-01T00:00:00.000Z',
      model_type: 'RandomForestClassifier',
      features_count: 57,
      classes: ['accumulation', 'pump', 'peak', 'dump', 'bottom'],
      n_estimators: 100,
      version: '1.0.0-beta'
    })
  }),

  // Supabase function handlers
  http.post('https://oxgonlrxebsipnxyfvmp.supabase.co/functions/v1/ai-insight', () => {
    return HttpResponse.json(mockAIInsightResponse)
  }),

  http.post('https://oxgonlrxebsipnxyfvmp.supabase.co/functions/v1/pulse-tokens', async ({ request }) => {
    const body = await request.json() as any

    if (body.action === 'search') {
      return HttpResponse.json({
        pairs: mockDexScreenerResponse.pairs.filter(pair =>
          pair.baseToken.symbol.toLowerCase().includes(body.query.toLowerCase()) ||
          pair.baseToken.name.toLowerCase().includes(body.query.toLowerCase())
        ),
        success: true
      })
    } else if (body.action === 'trending') {
      return HttpResponse.json({
        pairs: mockDexScreenerResponse.pairs,
        success: true
      })
    }

    return HttpResponse.json({ error: 'Invalid action' }, { status: 400 })
  }),

  // DexScreener API fallback (for direct calls)
  http.get('https://api.dexscreener.com/latest/dex/search', () => {
    return HttpResponse.json(mockDexScreenerResponse)
  }),

  http.get('https://api.dexscreener.com/latest/dex/tokens/*', () => {
    return HttpResponse.json(mockDexScreenerResponse)
  })
]

// Setup server
export const server = setupServer(...handlers)