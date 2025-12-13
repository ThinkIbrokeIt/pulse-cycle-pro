// TLC Ecosystem - Shared API Client
// Use across all three platforms (TLC, Pulse Cycle Pro, RugGuard)

export interface APIConfig {
  baseURL: string;
  anonKey: string;
  timeout: number;
}

export interface TokenRiskScore {
  address: string;
  riskScore: number | null;
  riskLevel: 'low' | 'medium' | 'high' | 'unknown';
  lastAnalyzed?: string;
  stale?: boolean;
  aiSummary?: string;
  message?: string;
}

export interface LockDeployment {
  contractAddress: string;
  deployerWallet: string;
  tokenAddress: string;
  tokenName?: string;
  tokenSymbol?: string;
  lockAmount: string;
  unlockTimestamp: string;
  transactionHash?: string;
  platformSource?: string;
}

export interface TrustPoints {
  wallet: string;
  totalPoints: number;
  totalActions: number;
  platformsUsed: number;
  lastAction?: string;
  airdropEligible: boolean;
  breakdown: TrustPointAction[];
}

export interface TrustPointAction {
  platform_source: string;
  action_type: string;
  points_earned: number;
  created_at: string;
}

export interface ScammerWallet {
  wallet_address: string;
  projects_involved: string[];
  total_stolen: number;
  first_seen: string;
  last_activity: string;
  status: 'active' | 'flagged' | 'confirmed_scammer';
  community_reports: number;
}

export class TLCEcosystemAPI {
  private config: APIConfig;
  private cache: Map<string, { data: any; timestamp: number }>;
  private readonly CACHE_TTL = 60 * 60 * 1000; // 1 hour

  constructor(config: APIConfig) {
    this.config = config;
    this.cache = new Map();
  }

  /**
   * Check token risk score from RugGuard analysis
   * Used by TLC before allowing lock deployment
   */
  async getTokenRiskScore(tokenAddress: string): Promise<TokenRiskScore> {
    const cacheKey = `risk-${tokenAddress.toLowerCase()}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(
        `${this.config.baseURL}/risk-score/${tokenAddress}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.anonKey}`,
            'Content-Type': 'application/json'
          },
          signal: AbortSignal.timeout(this.config.timeout)
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Failed to fetch token risk score:', error);
      // Return unknown if API fails (don't block user flow)
      return {
        address: tokenAddress,
        riskScore: null,
        riskLevel: 'unknown',
        message: 'Unable to verify token safety. Proceed with caution.'
      };
    }
  }

  /**
   * Notify shared backend of new lock deployment from TLC
   */
  async notifyLockDeployed(lockData: LockDeployment): Promise<{
    success: boolean;
    lockId?: string;
    pointsAwarded?: number;
    error?: string;
  }> {
    try {
      const response = await fetch(
        `${this.config.baseURL}/lock-deployed`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.anonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...lockData,
            platformSource: lockData.platformSource || 'TLC'
          }),
          signal: AbortSignal.timeout(this.config.timeout)
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to notify lock deployment:', error);
      // Don't throw - logging is nice-to-have, not critical
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get trust points for a wallet address
   * Shows combined score from all three platforms
   */
  async getTrustPoints(walletAddress: string): Promise<TrustPoints> {
    const cacheKey = `trust-${walletAddress.toLowerCase()}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(
        `${this.config.baseURL}/trust-points?wallet=${walletAddress}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.anonKey}`,
            'Content-Type': 'application/json'
          },
          signal: AbortSignal.timeout(this.config.timeout)
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      this.setCache(cacheKey, data, 5 * 60 * 1000); // Cache for 5 minutes only
      return data;
    } catch (error) {
      console.error('Failed to fetch trust points:', error);
      // Return zero points if API fails
      return {
        wallet: walletAddress,
        totalPoints: 0,
        totalActions: 0,
        platformsUsed: 0,
        airdropEligible: false,
        breakdown: []
      };
    }
  }

  /**
   * Get list of known scammer wallets
   * Used by TLC to block deployments from known scammers
   */
  async getScammerWallets(): Promise<ScammerWallet[]> {
    const cacheKey = 'scammer-wallets';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(
        `${this.config.baseURL}/scammer-wallets`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.anonKey}`,
            'Content-Type': 'application/json'
          },
          signal: AbortSignal.timeout(this.config.timeout)
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      this.setCache(cacheKey, data.wallets || [], 30 * 60 * 1000); // Cache for 30 minutes
      return data.wallets || [];
    } catch (error) {
      console.error('Failed to fetch scammer wallets:', error);
      return [];
    }
  }

  /**
   * Check if a wallet or token is associated with known scammers
   */
  async checkScammerStatus(address: string): Promise<{
    isScammer: boolean;
    reason?: string;
    projectsInvolved?: string[];
  }> {
    try {
      const scammers = await this.getScammerWallets();
      const found = scammers.find(
        s => s.wallet_address.toLowerCase() === address.toLowerCase()
      );

      if (found) {
        return {
          isScammer: true,
          reason: `Wallet flagged: ${found.status}`,
          projectsInvolved: found.projects_involved
        };
      }

      return { isScammer: false };
    } catch (error) {
      console.error('Failed to check scammer status:', error);
      // If check fails, don't block (false negative better than false positive)
      return { isScammer: false };
    }
  }

  /**
   * Clear cache for specific key or all cache
   */
  clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Check if API is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseURL}/health`, {
        headers: { 'Authorization': `Bearer ${this.config.anonKey}` },
        signal: AbortSignal.timeout(5000)
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  // Private cache helpers
  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const age = Date.now() - cached.timestamp;
    if (age > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCache(key: string, data: any, ttl: number = this.CACHE_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });

    // Auto-cleanup after TTL
    setTimeout(() => this.cache.delete(key), ttl);
  }
}

// Singleton instance factory
let apiInstance: TLCEcosystemAPI | null = null;

export function initTLCAPI(config: APIConfig): TLCEcosystemAPI {
  apiInstance = new TLCEcosystemAPI(config);
  return apiInstance;
}

export function getTLCAPI(): TLCEcosystemAPI {
  if (!apiInstance) {
    throw new Error(
      'TLC API not initialized. Call initTLCAPI() first with your config.'
    );
  }
  return apiInstance;
}

// Convenience functions for common operations
export async function checkTokenSafety(tokenAddress: string): Promise<{
  canDeploy: boolean;
  requireConfirmation: boolean;
  warning?: string;
  riskScore?: number;
}> {
  const api = getTLCAPI();
  const risk = await api.getTokenRiskScore(tokenAddress);

  if (risk.riskScore === null) {
    return {
      canDeploy: true,
      requireConfirmation: true,
      warning: risk.message || 'Unable to verify token safety'
    };
  }

  if (risk.riskScore > 70) {
    return {
      canDeploy: false,
      requireConfirmation: false,
      warning: `⚠️ HIGH RISK TOKEN (Score: ${risk.riskScore}/100). Deployment blocked for safety.`,
      riskScore: risk.riskScore
    };
  }

  if (risk.riskScore > 40) {
    return {
      canDeploy: true,
      requireConfirmation: true,
      warning: `⚠️ Medium risk detected (Score: ${risk.riskScore}/100). Proceed with caution.`,
      riskScore: risk.riskScore
    };
  }

  return {
    canDeploy: true,
    requireConfirmation: false,
    riskScore: risk.riskScore
  };
}
