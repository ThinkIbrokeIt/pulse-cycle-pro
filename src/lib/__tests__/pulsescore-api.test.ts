import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PulseScoreAPIClient } from '../pulsescore-api'
import { createMockTokenMetrics, createMockPredictionResponse } from '../../test/utils'

// Mock fetch globally
const fetchMock = vi.fn()
global.fetch = fetchMock

describe('PulseScoreAPIClient', () => {
  let client: PulseScoreAPIClient

  beforeEach(() => {
    client = new PulseScoreAPIClient('http://localhost:8000')
    vi.clearAllMocks()
  })

  describe('healthCheck', () => {
    it('should return health status when API is healthy', async () => {
      const mockResponse = {
        status: 'healthy',
        model_loaded: true,
        model_trained_at: '2024-01-01T00:00:00.000Z',
        features_count: 57,
        api_version: '1.0.0-beta'
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await client.healthCheck()

      expect(fetchMock).toHaveBeenCalledWith('http://localhost:8000/health')
      expect(result).toEqual(mockResponse)
    })

    it('should throw error when API is unhealthy', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error'
      })

      await expect(client.healthCheck()).rejects.toThrow('Health check failed: Internal Server Error')
    })
  })

  describe('predictSingle', () => {
    it('should return prediction for valid token metrics', async () => {
      const mockMetrics = createMockTokenMetrics()
      const mockPrediction = createMockPredictionResponse()

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPrediction)
      })

      const result = await client.predictSingle(mockMetrics)

      expect(fetchMock).toHaveBeenCalledWith('http://localhost:8000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockMetrics),
      })
      expect(result).toEqual(mockPrediction)
    })

    it('should throw error when prediction fails', async () => {
      const mockMetrics = createMockTokenMetrics()

      fetchMock.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ detail: 'Model not loaded' })
      })

      await expect(client.predictSingle(mockMetrics)).rejects.toThrow('Prediction failed: Model not loaded')
    })
  })

  describe('predictBatch', () => {
    it('should return batch predictions for multiple tokens', async () => {
      const mockTokens = [createMockTokenMetrics(), createMockTokenMetrics({ token_address: '0x456' })]
      const mockResponse = {
        predictions: [
          createMockPredictionResponse(),
          createMockPredictionResponse({ token_address: '0x456' })
        ],
        total_processed: 2,
        timestamp: '2024-01-01T12:00:00.000Z'
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await client.predictBatch(mockTokens)

      expect(fetchMock).toHaveBeenCalledWith('http://localhost:8000/predict/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tokens: mockTokens }),
      })
      expect(result).toEqual(mockResponse)
    })

    it('should throw error when batch prediction fails', async () => {
      const mockTokens = [createMockTokenMetrics()]

      fetchMock.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ detail: 'Batch processing failed' })
      })

      await expect(client.predictBatch(mockTokens)).rejects.toThrow('Batch prediction failed: Batch processing failed')
    })
  })

  describe('getModelInfo', () => {
    it('should return model information', async () => {
      const mockModelInfo = {
        trained_at: '2024-01-01T00:00:00.000Z',
        model_type: 'RandomForestClassifier',
        features_count: 57,
        classes: ['accumulation', 'pump', 'peak', 'dump', 'bottom'],
        n_estimators: 100,
        version: '1.0.0-beta'
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockModelInfo)
      })

      const result = await client.getModelInfo()

      expect(fetchMock).toHaveBeenCalledWith('http://localhost:8000/model/info')
      expect(result).toEqual(mockModelInfo)
    })

    it('should throw error when model info request fails', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found'
      })

      await expect(client.getModelInfo()).rejects.toThrow('Failed to get model info: Not Found')
    })
  })

  describe('fromDexScreenerPair', () => {
    it('should convert DexScreener pair data to TokenMetrics format', () => {
      const mockPair = {
        pairAddress: '0x123456789',
        baseToken: { address: '0x2b591e99afe9f32eaa6214f7b7629768c40eeb39' },
        priceUsd: '0.00015',
        volume: { h24: 250000, h6: 80000 },
        liquidity: { usd: 50000 },
        marketCap: 1500000,
        priceChange: { h24: 15.5, h6: 8.2, h1: 2.1 },
        txns: { h24: { buys: 350, sells: 280 } },
        pairCreatedAt: Date.now() - (180 * 24 * 60 * 60 * 1000) // 180 days ago
      }

      const result = PulseScoreAPIClient.fromDexScreenerPair(mockPair)

      expect(result.token_address).toBe('0x2b591e99afe9f32eaa6214f7b7629768c40eeb39')
      expect(result.price_usd).toBe(0.00015)
      expect(result.volume_24h).toBe(250000)
      expect(result.liquidity_usd).toBe(50000)
      expect(result.contract_age_days).toBeGreaterThan(179) // Approximately 180 days
    })
  })

  describe('mapPhaseToUI', () => {
    it('should map ML phases to user-friendly names', () => {
      expect(PulseScoreAPIClient.mapPhaseToUI('accumulation')).toBe('Accumulation')
      expect(PulseScoreAPIClient.mapPhaseToUI('pump')).toBe('Uptrend')
      expect(PulseScoreAPIClient.mapPhaseToUI('peak')).toBe('Distribution')
      expect(PulseScoreAPIClient.mapPhaseToUI('dump')).toBe('Downtrend')
      expect(PulseScoreAPIClient.mapPhaseToUI('bottom')).toBe('Accumulation')
      expect(PulseScoreAPIClient.mapPhaseToUI('unknown')).toBe('unknown')
    })
  })
})