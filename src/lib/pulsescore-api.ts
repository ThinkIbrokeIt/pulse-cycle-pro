/**
 * PulseScore ML API Client
 * Connects to FastAPI backend for cycle phase predictions
 */

const API_BASE_URL = import.meta.env.VITE_PULSESCORE_API_URL || 'http://localhost:8000';

export interface TokenMetrics {
  token_address: string;
  timestamp: string;
  price_usd: number;
  volume_24h: number;
  volume_6h?: number;
  liquidity_usd: number;
  market_cap?: number;
  price_change_24h?: number;
  price_change_6h?: number;
  price_change_1h?: number;
  txns_24h_buys?: number;
  txns_24h_sells?: number;
  holder_count?: number;
  top_10_concentration?: number;
  unique_wallets_24h?: number;
  contract_age_days?: number;
}

export interface PredictionResponse {
  token_address: string;
  predicted_phase: string;
  confidence: number;
  score: number;
  probabilities: Record<string, number>;
  timestamp: string;
  model_version: string;
}

export interface HealthResponse {
  status: string;
  model_loaded: boolean;
  model_trained_at: string | null;
  features_count: number | null;
  api_version: string;
}

class PulseScoreAPIClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Check API health and model status
   */
  async healthCheck(): Promise<HealthResponse> {
    const response = await fetch(`${this.baseUrl}/health`);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Predict cycle phase for a single token
   */
  async predictSingle(metrics: TokenMetrics): Promise<PredictionResponse> {
    const response = await fetch(`${this.baseUrl}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metrics),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(`Prediction failed: ${error.detail || response.statusText}`);
    }

    return response.json();
  }

  /**
   * Predict cycle phases for multiple tokens (batch)
   */
  async predictBatch(tokens: TokenMetrics[]): Promise<{
    predictions: PredictionResponse[];
    total_processed: number;
    timestamp: string;
  }> {
    const response = await fetch(`${this.baseUrl}/predict/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tokens }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(`Batch prediction failed: ${error.detail || response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get model information
   */
  async getModelInfo(): Promise<{
    trained_at: string | null;
    model_type: string;
    features_count: number | null;
    classes: string[];
    n_estimators: number | null;
    version: string;
  }> {
    const response = await fetch(`${this.baseUrl}/model/info`);
    if (!response.ok) {
      throw new Error(`Failed to get model info: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Convert DexScreener pair data to TokenMetrics format
   */
  static fromDexScreenerPair(pair: any): TokenMetrics {
    const contractAge = pair.pairCreatedAt 
      ? Math.floor((Date.now() - pair.pairCreatedAt) / (1000 * 60 * 60 * 24))
      : undefined;

    return {
      token_address: pair.baseToken?.address || pair.pairAddress,
      timestamp: new Date().toISOString(),
      price_usd: parseFloat(pair.priceUsd || '0'),
      volume_24h: pair.volume?.h24 || 0,
      volume_6h: pair.volume?.h6 || undefined,
      liquidity_usd: pair.liquidity?.usd || 0,
      market_cap: pair.marketCap || pair.fdv || undefined,
      price_change_24h: pair.priceChange?.h24 || undefined,
      price_change_6h: pair.priceChange?.h6 || undefined,
      price_change_1h: pair.priceChange?.h1 || undefined,
      txns_24h_buys: pair.txns?.h24?.buys || undefined,
      txns_24h_sells: pair.txns?.h24?.sells || undefined,
      holder_count: undefined, // Would need separate on-chain call
      top_10_concentration: undefined, // Would need separate on-chain call
      unique_wallets_24h: undefined, // Would need separate on-chain call
      contract_age_days: contractAge,
    };
  }

  /**
   * Map ML phase names to UI-friendly names
   */
  static mapPhaseToUI(mlPhase: string): string {
    const phaseMap: Record<string, string> = {
      'accumulation': 'Accumulation',
      'pump': 'Uptrend',
      'peak': 'Distribution',
      'dump': 'Downtrend',
      'bottom': 'Accumulation',
    };
    return phaseMap[mlPhase.toLowerCase()] || mlPhase;
  }
}

// Export class and singleton instance
export { PulseScoreAPIClient };
export const pulseScoreAPI = new PulseScoreAPIClient();
