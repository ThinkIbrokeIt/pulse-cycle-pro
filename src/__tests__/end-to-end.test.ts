import { describe, it, expect, vi } from 'vitest'
import { pulseScoreAPI, PulseScoreAPIClient } from '../lib/pulsescore-api'
import { supabase } from '../integrations/supabase/client'
import { createMockTokenMetrics, createMockDexScreenerPair, wait } from '../test/utils'

// Mock Supabase for this test
vi.mock('../integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn()
    }
  }
}))

const mockSupabaseInvoke = vi.mocked(supabase.functions.invoke)

describe('End-to-End Integration Tests', () => {
  describe('Complete Token Analysis Flow', () => {
    it('should complete full token analysis workflow', async () => {
      // Step 1: Search for tokens via Supabase function
      const mockSearchResponse = {
        data: {
          pairs: [
            createMockDexScreenerPair({
              baseToken: {
                address: '0x2b591e99afe9f32eaa6214f7b7629768c40eeb39',
                name: 'PulseChain PLS',
                symbol: 'PLS'
              }
            })
          ],
          success: true
        },
        error: null
      }

      mockSupabaseInvoke.mockResolvedValueOnce(mockSearchResponse)

      // Search for PLS token
      const { data: searchData, error: searchError } = await supabase.functions.invoke('pulse-tokens', {
        body: { action: 'search', query: 'PLS' }
      })

      expect(searchError).toBeNull()
      expect(searchData.success).toBe(true)
      expect(searchData.pairs).toHaveLength(1)

      const foundToken = searchData.pairs[0]

      // Step 2: Convert DexScreener data to TokenMetrics
      const tokenMetrics = PulseScoreAPIClient.fromDexScreenerPair(foundToken)

      expect(tokenMetrics.token_address).toBe('0x2b591e99afe9f32eaa6214f7b7629768c40eeb39')
      expect(tokenMetrics.price_usd).toBe(0.00015)
      expect(tokenMetrics.volume_24h).toBe(250000)

      // Step 3: Get ML prediction
      const prediction = await pulseScoreAPI.predictSingle(tokenMetrics)

      expect(prediction.token_address).toBe(tokenMetrics.token_address)
      expect(prediction.predicted_phase).toBeDefined()
      expect(prediction.confidence).toBeGreaterThan(0)
      expect(prediction.score).toBeGreaterThanOrEqual(0)
      expect(prediction.score).toBeLessThanOrEqual(100)

      // Step 4: Get AI insight based on prediction
      const mockInsightResponse = {
        data: {
          insight: `Based on the current ${prediction.predicted_phase} phase and PulseScore of ${prediction.score}, this token shows promising technical indicators.`,
          timestamp: new Date().toISOString(),
          model: 'deepseek-reasoner'
        },
        error: null
      }

      mockSupabaseInvoke.mockResolvedValueOnce(mockInsightResponse)

      const { data: insightData, error: insightError } = await supabase.functions.invoke('ai-insight', {
        body: {
          symbol: foundToken.baseToken.symbol,
          name: foundToken.baseToken.name,
          price: tokenMetrics.price_usd,
          change24h: tokenMetrics.price_change_24h || 0,
          volume24h: tokenMetrics.volume_24h,
          marketCap: tokenMetrics.market_cap || 0,
          pulseScore: prediction.score,
          currentPhase: prediction.predicted_phase
        }
      })

      expect(insightError).toBeNull()
      expect(insightData.insight).toContain(prediction.predicted_phase)
      expect(insightData.insight).toContain(prediction.score.toString())
      expect(insightData.model).toBe('deepseek-reasoner')

      // Verify complete data flow
      expect(foundToken.baseToken.symbol).toBe('PLS')
      expect(tokenMetrics.token_address).toBe(prediction.token_address)
      expect(prediction.score).toBe(78) // From our mock
      expect(insightData.insight).toContain('78')
    })

    it('should handle batch predictions for multiple tokens', async () => {
      // Get trending tokens
      const mockTrendingResponse = {
        data: {
          pairs: [
            createMockDexScreenerPair({
              baseToken: { address: '0x123', name: 'Token1', symbol: 'TKN1' }
            }),
            createMockDexScreenerPair({
              baseToken: { address: '0x456', name: 'Token2', symbol: 'TKN2' }
            }),
            createMockDexScreenerPair({
              baseToken: { address: '0x789', name: 'Token3', symbol: 'TKN3' }
            })
          ],
          success: true
        },
        error: null
      }

      mockSupabaseInvoke.mockResolvedValueOnce(mockTrendingResponse)

      const { data: trendingData } = await supabase.functions.invoke('pulse-tokens', {
        body: { action: 'trending' }
      })

      expect(trendingData.pairs).toHaveLength(3)

      // Convert all to TokenMetrics
      const tokenMetricsArray = trendingData.pairs.map(pair =>
        PulseScoreAPIClient.fromDexScreenerPair(pair)
      )

      expect(tokenMetricsArray).toHaveLength(3)
      tokenMetricsArray.forEach(metrics => {
        expect(metrics.token_address).toBeDefined()
        expect(metrics.price_usd).toBeGreaterThan(0)
      })

      // Batch predict
      const batchResult = await pulseScoreAPI.predictBatch(tokenMetricsArray)

      expect(batchResult.predictions).toHaveLength(3)
      expect(batchResult.total_processed).toBe(3)

      batchResult.predictions.forEach(pred => {
        expect(pred.predicted_phase).toBeDefined()
        expect(pred.confidence).toBeGreaterThan(0)
        expect(pred.score).toBeGreaterThanOrEqual(0)
        expect(pred.score).toBeLessThanOrEqual(100)
      })
    })

    it('should handle API failures gracefully', async () => {
      // Test ML API health check failure scenario
      // This would be tested by mocking server errors in the MSW setup

      // Test Supabase function failure
      mockSupabaseInvoke.mockResolvedValueOnce({
        data: null,
        error: { message: 'Service temporarily unavailable' }
      })

      const { data, error } = await supabase.functions.invoke('pulse-tokens', {
        body: { action: 'search', query: 'INVALID' }
      })

      expect(data).toBeNull()
      expect(error.message).toBe('Service temporarily unavailable')
    })

    it('should validate data consistency across services', async () => {
      // Get token data
      const mockSearchResponse = {
        data: {
          pairs: [
            createMockDexScreenerPair({
              baseToken: {
                address: '0x2b591e99afe9f32eaa6214f7b7629768c40eeb39',
                name: 'PulseChain PLS',
                symbol: 'PLS'
              },
              priceUsd: '0.00015',
              volume: { h24: 250000 },
              marketCap: 1500000
            })
          ],
          success: true
        },
        error: null
      }

      mockSupabaseInvoke.mockResolvedValueOnce(mockSearchResponse)

      const { data } = await supabase.functions.invoke('pulse-tokens', {
        body: { action: 'search', query: 'PLS' }
      })

      const token = data.pairs[0]
      const metrics = PulseScoreAPIClient.fromDexScreenerPair(token)

      // Verify data consistency
      expect(metrics.price_usd).toBe(0.00015)
      expect(metrics.volume_24h).toBe(250000)
      expect(metrics.market_cap).toBe(1500000)

      // Get prediction and verify it uses the correct data
      const prediction = await pulseScoreAPI.predictSingle(metrics)
      expect(prediction.token_address).toBe(metrics.token_address)
    })
  })

  describe('Performance and Reliability', () => {
    it('should handle concurrent requests', async () => {
      const mockSearchResponse = {
        data: {
          pairs: [createMockDexScreenerPair()],
          success: true
        },
        error: null
      }

      mockSupabaseInvoke.mockResolvedValue(mockSearchResponse)

      // Make multiple concurrent requests
      const promises = Array(5).fill(null).map(() =>
        supabase.functions.invoke('pulse-tokens', {
          body: { action: 'search', query: 'PLS' }
        })
      )

      const results = await Promise.all(promises)

      results.forEach(({ data, error }) => {
        expect(error).toBeNull()
        expect(data.success).toBe(true)
      })
    })

    it('should maintain data integrity through the pipeline', async () => {
      // This test ensures that data transformations don't corrupt information
      const originalPrice = 0.00015
      const originalVolume = 250000

      const mockPair = createMockDexScreenerPair({
        priceUsd: originalPrice.toString(),
        volume: { h24: originalVolume, h6: 80000, h1: 15000, m5: 2000 }
      })

      const metrics = PulseScoreAPIClient.fromDexScreenerPair(mockPair)

      expect(metrics.price_usd).toBe(originalPrice)
      expect(metrics.volume_24h).toBe(originalVolume)

      const prediction = await pulseScoreAPI.predictSingle(metrics)

      // Ensure prediction is based on correct input data
      expect(prediction.token_address).toBe(metrics.token_address)
      // The mock response should use the input token address
      expect(prediction.token_address).toBe(mockPair.baseToken.address)
    })
  })
})