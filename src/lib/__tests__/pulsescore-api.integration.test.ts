import { describe, it, expect } from 'vitest'
import { pulseScoreAPI } from '../pulsescore-api'
import { createMockTokenMetrics } from '../../test/utils'

describe('PulseScoreAPI Integration Tests', () => {
  describe('healthCheck', () => {
    it('should successfully check API health', async () => {
      const health = await pulseScoreAPI.healthCheck()

      expect(health.status).toBe('healthy')
      expect(health.model_loaded).toBe(true)
      expect(health.api_version).toBe('1.0.0-beta')
      expect(health.features_count).toBe(57)
    })
  })

  describe('predictSingle', () => {
    it('should predict cycle phase for a single token', async () => {
      const tokenMetrics = createMockTokenMetrics()

      const prediction = await pulseScoreAPI.predictSingle(tokenMetrics)

      expect(prediction.token_address).toBe(tokenMetrics.token_address)
      expect(prediction.predicted_phase).toBe('accumulation')
      expect(prediction.confidence).toBe(0.85)
      expect(prediction.score).toBe(78)
      expect(prediction.probabilities).toHaveProperty('accumulation')
      expect(prediction.probabilities).toHaveProperty('pump')
      expect(prediction.model_version).toContain('beta_v1')
    })

    it('should handle different token addresses', async () => {
      const tokenMetrics = createMockTokenMetrics({
        token_address: '0xa1077a294dde1b09bb078844df40758a5d0f9a27'
      })

      const prediction = await pulseScoreAPI.predictSingle(tokenMetrics)

      expect(prediction.token_address).toBe('0xa1077a294dde1b09bb078844df40758a5d0f9a27')
      expect(prediction.predicted_phase).toBeDefined()
    })
  })

  describe('predictBatch', () => {
    it('should predict cycle phases for multiple tokens', async () => {
      const tokens = [
        createMockTokenMetrics({ token_address: '0x123' }),
        createMockTokenMetrics({ token_address: '0x456' }),
        createMockTokenMetrics({ token_address: '0x789' })
      ]

      const result = await pulseScoreAPI.predictBatch(tokens)

      expect(result.predictions).toHaveLength(3)
      expect(result.total_processed).toBe(3)
      expect(result.timestamp).toBeDefined()

      result.predictions.forEach((prediction, index) => {
        expect(prediction.token_address).toBe(tokens[index].token_address)
        expect(prediction.predicted_phase).toBeDefined()
        expect(prediction.confidence).toBeGreaterThan(0)
        expect(prediction.score).toBeGreaterThanOrEqual(0)
        expect(prediction.score).toBeLessThanOrEqual(100)
      })
    })

    it('should handle empty batch', async () => {
      const result = await pulseScoreAPI.predictBatch([])

      expect(result.predictions).toHaveLength(0)
      expect(result.total_processed).toBe(0)
    })
  })

  describe('getModelInfo', () => {
    it('should retrieve model information', async () => {
      const modelInfo = await pulseScoreAPI.getModelInfo()

      expect(modelInfo.model_type).toBe('RandomForestClassifier')
      expect(modelInfo.features_count).toBe(57)
      expect(modelInfo.classes).toContain('accumulation')
      expect(modelInfo.classes).toContain('pump')
      expect(modelInfo.n_estimators).toBe(100)
      expect(modelInfo.version).toBe('1.0.0-beta')
    })
  })

  describe('Phase mapping', () => {
    it('should correctly map all ML phases to UI phases', () => {
      const { PulseScoreAPIClient } = require('../pulsescore-api')
      const phases = ['accumulation', 'pump', 'peak', 'dump', 'bottom']

      phases.forEach(phase => {
        const uiPhase = PulseScoreAPIClient.mapPhaseToUI(phase)
        expect(uiPhase).toBeDefined()
        expect(typeof uiPhase).toBe('string')
        expect(uiPhase.length).toBeGreaterThan(0)
      })
    })
  })

  describe('DexScreener conversion', () => {
    it('should convert DexScreener pair to TokenMetrics', () => {
      const { PulseScoreAPIClient } = require('../pulsescore-api')
      const mockPair = {
        pairAddress: '0x123456789',
        baseToken: { address: '0x2b591e99afe9f32eaa6214f7b7629768c40eeb39' },
        priceUsd: '0.00015',
        volume: { h24: 250000, h6: 80000 },
        liquidity: { usd: 50000 },
        marketCap: 1500000,
        priceChange: { h24: 15.5, h6: 8.2, h1: 2.1 },
        txns: { h24: { buys: 350, sells: 280 } },
        pairCreatedAt: Date.now() - (90 * 24 * 60 * 60 * 1000) // 90 days ago
      }

      const tokenMetrics = PulseScoreAPIClient.fromDexScreenerPair(mockPair)

      expect(tokenMetrics.token_address).toBe('0x2b591e99afe9f32eaa6214f7b7629768c40eeb39')
      expect(tokenMetrics.price_usd).toBe(0.00015)
      expect(tokenMetrics.volume_24h).toBe(250000)
      expect(tokenMetrics.liquidity_usd).toBe(50000)
      expect(tokenMetrics.market_cap).toBe(1500000)
      expect(tokenMetrics.price_change_24h).toBe(15.5)
      expect(tokenMetrics.txns_24h_buys).toBe(350)
      expect(tokenMetrics.contract_age_days).toBeGreaterThan(89) // Approximately 90 days
    })
  })
})