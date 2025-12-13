import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'

// Create a custom render function that includes providers
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Test data helpers
export const createMockTokenMetrics = (overrides = {}) => ({
  token_address: '0x2b591e99afe9f32eaa6214f7b7629768c40eeb39',
  timestamp: new Date().toISOString(),
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
  contract_age_days: 180,
  ...overrides
})

export const createMockPredictionResponse = (overrides = {}) => ({
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
  timestamp: new Date().toISOString(),
  model_version: 'beta_v1_20240101',
  ...overrides
})

export const createMockDexScreenerPair = (overrides = {}) => ({
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
  marketCap: 1500000,
  ...overrides
})

// Wait for a specific amount of time
export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Mock environment variables
export const mockEnv = {
  VITE_PULSESCORE_API_URL: 'http://localhost:8000',
  VITE_SUPABASE_URL: 'https://oxgonlrxebsipnxyfvmp.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94Z29ubHJ4ZWJzaXBueHlmdm1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMTIwNDQsImV4cCI6MjA3MDc4ODA0NH0.S1zy8UDqoj5uxzGm7Vrqlg7mmPHm2gv3TYZ13EwS9AA'
}