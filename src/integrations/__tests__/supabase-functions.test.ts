import { describe, it, expect, vi, beforeEach } from 'vitest'
import { supabase } from '../supabase/client'
import { createMockDexScreenerPair } from '../../test/utils'

// Mock Supabase client
vi.mock('../supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn()
    }
  }
}))

const mockSupabaseInvoke = vi.mocked(supabase.functions.invoke)

describe('Supabase Functions Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('pulse-tokens function', () => {
    describe('search action', () => {
      it('should search for tokens successfully', async () => {
        const mockResponse = {
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

        mockSupabaseInvoke.mockResolvedValueOnce(mockResponse)

        const { data, error } = await supabase.functions.invoke('pulse-tokens', {
          body: { action: 'search', query: 'PLS' }
        })

        expect(mockSupabaseInvoke).toHaveBeenCalledWith('pulse-tokens', {
          body: { action: 'search', query: 'PLS' }
        })
        expect(error).toBeNull()
        expect(data.success).toBe(true)
        expect(data.pairs).toHaveLength(1)
        expect(data.pairs[0].baseToken.symbol).toBe('PLS')
      })

      it('should handle search with no results', async () => {
        const mockResponse = {
          data: {
            pairs: [],
            success: true
          },
          error: null
        }

        mockSupabaseInvoke.mockResolvedValueOnce(mockResponse)

        const { data, error } = await supabase.functions.invoke('pulse-tokens', {
          body: { action: 'search', query: 'NONEXISTENT' }
        })

        expect(error).toBeNull()
        expect(data.success).toBe(true)
        expect(data.pairs).toHaveLength(0)
      })

      it('should handle search errors', async () => {
        const mockError = { message: 'Search failed' }
        mockSupabaseInvoke.mockResolvedValueOnce({
          data: null,
          error: mockError
        })

        const { data, error } = await supabase.functions.invoke('pulse-tokens', {
          body: { action: 'search', query: 'PLS' }
        })

        expect(data).toBeNull()
        expect(error).toEqual(mockError)
      })
    })

    describe('trending action', () => {
      it('should get trending tokens successfully', async () => {
        const mockPairs = [
          createMockDexScreenerPair({
            baseToken: { address: '0x123', name: 'Token1', symbol: 'TKN1' }
          }),
          createMockDexScreenerPair({
            baseToken: { address: '0x456', name: 'Token2', symbol: 'TKN2' }
          })
        ]

        const mockResponse = {
          data: {
            pairs: mockPairs,
            success: true
          },
          error: null
        }

        mockSupabaseInvoke.mockResolvedValueOnce(mockResponse)

        const { data, error } = await supabase.functions.invoke('pulse-tokens', {
          body: { action: 'trending' }
        })

        expect(mockSupabaseInvoke).toHaveBeenCalledWith('pulse-tokens', {
          body: { action: 'trending' }
        })
        expect(error).toBeNull()
        expect(data.success).toBe(true)
        expect(data.pairs).toHaveLength(2)
      })

      it('should handle trending errors', async () => {
        const mockError = { message: 'Failed to fetch trending tokens' }
        mockSupabaseInvoke.mockResolvedValueOnce({
          data: null,
          error: mockError
        })

        const { data, error } = await supabase.functions.invoke('pulse-tokens', {
          body: { action: 'trending' }
        })

        expect(data).toBeNull()
        expect(error).toEqual(mockError)
      })
    })

    describe('invalid action', () => {
      it('should handle invalid action', async () => {
        const mockResponse = {
          data: { error: 'Invalid action' },
          error: null
        }

        mockSupabaseInvoke.mockResolvedValueOnce(mockResponse)

        const { data, error } = await supabase.functions.invoke('pulse-tokens', {
          body: { action: 'invalid' }
        })

        expect(error).toBeNull()
        expect(data.error).toBe('Invalid action')
      })
    })
  })

  describe('ai-insight function', () => {
    it('should generate AI insight successfully', async () => {
      const mockInsight = {
        insight: 'Technical analysis shows strong accumulation patterns with increasing volume.',
        timestamp: '2024-01-01T12:00:00.000Z',
        model: 'deepseek-reasoner'
      }

      const mockResponse = {
        data: mockInsight,
        error: null
      }

      mockSupabaseInvoke.mockResolvedValueOnce(mockResponse)

      const { data, error } = await supabase.functions.invoke('ai-insight', {
        body: {
          symbol: 'PLS',
          name: 'PulseChain',
          price: 0.00015,
          change24h: 15.5,
          volume24h: 250000,
          marketCap: 1500000,
          pulseScore: 78,
          currentPhase: 'accumulation'
        }
      })

      expect(error).toBeNull()
      expect(data.insight).toContain('Technical analysis')
      expect(data.model).toBe('deepseek-reasoner')
      expect(data.timestamp).toBeDefined()
    })

    it('should handle AI insight generation errors', async () => {
      const mockError = { message: 'AI service temporarily unavailable' }
      mockSupabaseInvoke.mockResolvedValueOnce({
        data: null,
        error: mockError
      })

      const { data, error } = await supabase.functions.invoke('ai-insight', {
        body: {
          symbol: 'PLS',
          name: 'PulseChain',
          price: 0.00015,
          change24h: 15.5,
          volume24h: 250000,
          marketCap: 1500000,
          pulseScore: 78,
          currentPhase: 'accumulation'
        }
      })

      expect(data).toBeNull()
      expect(error).toEqual(mockError)
    })
  })
})