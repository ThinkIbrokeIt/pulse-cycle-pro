# Pulse Cycle Pro - AI Coding Agent Instructions

## Project Overview

**Pulse Cycle Pro** (formerly PulseChain Community Hub) is the **second pillar** of a three-platform ecosystem protecting the PulseChain community. This is the **Community Protection & Cycle Prediction Intelligence Platform** - combining scammer tracking, community coordination, and proprietary market cycle analysis.

**Mission**: Defend decentralization by providing real-time intelligence, community coordination tools, and ML-powered cycle prediction to protect users from scams and help them make informed decisions.

**The Three-Pillar Ecosystem:**
1. **TLC Platform** (Trustless Lock Contract) - Natural language → immutable lock/vest contracts
2. **Pulse Cycle Pro** (THIS PROJECT) - Community protection + PulseScore cycle prediction
3. **RugGuard** - Advanced NLP-powered scam detection + token autopsy system

All platforms **share data** on scammer wallets, rugged projects, and trust scores. Users earn **$TLC token airdrop eligibility** by actively protecting the community across all three platforms.

**Core Value Proposition**: 
- **Zero Rug Month Goal** - Track days since last rug pull
- **Scammer Wallet Database** - Community-maintained watchlist with forensics
- **PulseScore Algorithm** - Proprietary 50+ metric cycle prediction (92% accuracy claimed)
- **Real-Time Token Intelligence** - DexScreener integration for live data
- **Community Coordination** - Organize responses to FUD and attacks
- **Social Sentiment Tracking** - Monitor Twitter/Discord/Telegram for threats

## Architecture

### Tech Stack
- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL database, Edge Functions, Auth, Realtime)
- **APIs**: 
  - DexScreener for real-time token data
  - Custom Supabase Edge Functions for AI insights
  - PulseScore algorithm (proprietary - currently mock data)
- **Deployment**: Lovable platform (managed hosting)
- **Data Sharing**: Cross-platform APIs to sync with TLC and RugGuard

### Key Components Flow

1. **Pulse Insight** (`src/pages/PulseInsight.tsx`)
   - Real-time token search and discovery via DexScreener API
   - Trending tokens with comprehensive analytics
   - Market sentiment tracking
   - Price movements and volume analysis
   - Integrates PulseScore predictions for cycle timing

2. **Community Hub** (`src/pages/Community.tsx`)
   - Social media monitoring dashboard
   - Sentiment analysis (positive/negative discussions)
   - Community defense coordination tools
   - News aggregation and event tracking
   - Discussion forums for organizing responses to FUD

3. **Meme Coin Security Center** (`src/pages/MemeCoins.tsx`)
   - **Days Since Last Rug Counter** - Community accountability metric
   - **Rug Pull Database** - Complete history with forensic details
   - **Scammer Analysis** - Wallet addresses, tactics, colluding wallets
   - **Prevention Education** - Red flag identification training
   - **Wallet Tracker** - Monitor known malicious actors
   - **Active Token Risk Scores** - Real-time assessment of live projects

4. **PulseScore Component** (`src/components/PulseScore.tsx`)
   - Proprietary cycle prediction algorithm (50+ metrics)
   - 92% accuracy claimed for peak/bottom predictions
   - Visual confidence indicators (0-100 score)
   - Phase detection: Accumulation, Uptrend, Distribution, Downtrend
   - **Note**: Currently displays mock data - real algorithm integration pending

5. **Supabase Integration** (`src/integrations/supabase/`)
   - Database tables: `rugged_projects`, `scammer_wallets`, `token_reports`, `community_votes`
   - Edge Functions: `ai-insight`, `pulse-tokens` for ML processing
   - Real-time subscriptions for live scam alerts
   - Auth for user-generated reports and votes

### Data Flow

```
User Searches Token → DexScreener API → Display Live Data
                                    ↓
                            PulseScore Analysis (50+ metrics)
                                    ↓
                            Display: Phase + Confidence Score
                                    ↓
                    Check RugGuard Database for Scam Reports
                                    ↓
                    Check Supabase for Community Votes/Reports
                                    ↓
                Display Comprehensive Risk Assessment

Scam Detected → User Reports via MemeCoins page
                                    ↓
                    Store in Supabase (rugged_projects table)
                                    ↓
                Sync to TLC + RugGuard via shared API
                                    ↓
                Update Scammer Wallet Watchlist
                                    ↓
                Award $TLC Airdrop Points to Reporter
```

## Critical Patterns & Conventions

### Data Fetching Patterns
```typescript
// React Query for API calls
import { useQuery } from '@tanstack/react-query';

// DexScreener token search
const { data: tokenData, isLoading } = useQuery({
  queryKey: ['token', tokenAddress],
  queryFn: async () => {
    const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`);
    return response.json();
  },
});

// Supabase real-time subscriptions
useEffect(() => {
  const channel = supabase
    .channel('rugged_projects')
    .on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'rugged_projects' },
      (payload) => {
        // Update UI with new rug pull alert
        toast.error(`New rug pull detected: ${payload.new.name}`);
      }
    )
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}, []);
```

### Component Patterns
- **UI Components**: Always use shadcn/ui from `@/components/ui/*`
- **Icons**: lucide-react only (e.g., `<Shield />`, `<AlertTriangle />`)
- **Styling**: Tailwind utility classes with design system tokens:
  - `bg-gradient-card` - card backgrounds
  - `border-primary/20` - semi-transparent borders
  - `text-destructive` - error/danger states
  - `shadow-glow` - special effects for important elements

### State Management
- React Query (`@tanstack/react-query`) for server state - configured in `App.tsx`
- Local state with `useState` for UI-only state
- Context API for shared state (if needed for cross-component data)

### Error Handling
```typescript
// User-friendly error messages with toast notifications
import { toast } from 'sonner';

try {
  const result = await fetchTokenData(address);
  toast.success("Token data loaded successfully");
} catch (error) {
  const errorMessage = error.message.includes("404")
    ? "Token not found on PulseChain"
    : error.message.includes("network")
    ? "Network error. Please try again."
    : "Failed to load token data";
  
  toast.error(errorMessage);
}
```

## Development Workflows

### Running the App
```bash
npm run dev          # Start dev server (Vite)
npm run build        # Production build
npm run preview      # Preview production build locally
```

### Environment Setup
Create `.env` file (not tracked in git):
```env
# Supabase (required for database features)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# APIs (optional - features degrade gracefully without them)
VITE_DEXSCREENER_API_KEY=optional_api_key
VITE_OPENAI_API_KEY=sk-...  # For AI-powered insights

# Cross-Platform Integration
VITE_TLC_API_URL=https://tlc-platform-api.com
VITE_RUGGUARD_API_URL=https://rugguard-api.com
```

### Supabase Database Schema

**Core Tables:**
```sql
-- Rugged projects tracking
CREATE TABLE rugged_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  contract_address TEXT UNIQUE NOT NULL,
  launch_date TIMESTAMP,
  rug_date TIMESTAMP NOT NULL,
  launcher_wallet TEXT NOT NULL,
  colluding_wallets TEXT[],
  tactics TEXT[],
  total_loss NUMERIC,
  victim_count INTEGER,
  rug_type TEXT, -- 'liquidity_pull', 'honeypot', 'mint_exploit', 'fake_team'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Scammer wallet watchlist
CREATE TABLE scammer_wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE NOT NULL,
  projects_involved TEXT[], -- Array of rugged project IDs
  total_stolen NUMERIC,
  first_seen TIMESTAMP,
  last_activity TIMESTAMP,
  status TEXT DEFAULT 'active', -- 'active', 'flagged', 'confirmed_scammer'
  community_reports INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Active token monitoring
CREATE TABLE monitored_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_address TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  risk_score INTEGER, -- 0-100
  liquidity_locked BOOLEAN,
  lock_duration INTEGER, -- Days
  contract_verified BOOLEAN,
  team_doxxed BOOLEAN,
  audit_status TEXT, -- 'verified', 'pending', 'none'
  scam_reports INTEGER DEFAULT 0,
  community_votes JSONB, -- {positive: 0, negative: 0}
  status TEXT DEFAULT 'active', -- 'active', 'warning', 'rugged'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Community reports (earns airdrop points)
CREATE TABLE community_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_wallet TEXT NOT NULL,
  target_address TEXT NOT NULL,
  report_type TEXT NOT NULL,
  description TEXT,
  evidence_urls TEXT[],
  status TEXT DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
  airdrop_points_awarded INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Testing on Local Supabase
```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase
supabase start

# Apply migrations
supabase db push

# Run Edge Functions locally
supabase functions serve
```

## Educational Platform Strategy

### Primary Goal: Community Defense + Cycle Prediction
This is a **live intelligence platform** - not just educational. Focus on:

1. **Real-Time Protection** - Active scam detection and community alerts
2. **Predictive Intelligence** - PulseScore gives users timing advantage
3. **Community Coordination** - Organize defense against attacks
4. **Knowledge Sharing** - Educate users to spot red flags themselves
5. **Viral Shareability** - Social media cards showing days without rugs

### PulseScore Algorithm (Proprietary)
**Status**: Currently mock data - real algorithm in development

**Claimed Metrics (50+)**:
- On-chain: Volume, liquidity depth, holder distribution, whale movements
- Technical: RSI, MACD, Bollinger Bands, custom momentum indicators
- Social: Twitter sentiment, Discord activity, Telegram engagement
- Network: Gas prices, transaction count, unique wallet interactions
- Macro: BTC correlation, market cycle phase, fear/greed index
- Historical: Past cycle timing, seasonal patterns, halving cycles

**Accuracy Claims**: 92% for major cycle turning points (peaks/bottoms)

**Implementation TODO**:
- Connect to ML model API endpoint
- Real-time data ingestion pipeline
- Confidence interval calculations
- Backtesting visualization
- Alert system for phase changes

### Airdrop Points System
Users earn **$TLC token airdrop eligibility** by:
- **+5 points**: Submit verified scam report (MemeCoins page)
- **+8 points**: Identify scammer wallet before rug occurs
- **+3 points**: Vote on token safety (helps community)
- **+10 points**: Successful defense coordination (prevent rug)
- **+15 points**: Discover new scam tactic (documented in database)

**Criteria deliberately NOT announced** to prevent gaming the system.

## Common Tasks

### Adding a New Token to Monitoring
```typescript
// In src/pages/PulseInsight.tsx
const addTokenToMonitoring = async (tokenAddress: string) => {
  const { data, error } = await supabase
    .from('monitored_tokens')
    .insert({
      contract_address: tokenAddress,
      name: tokenData.name,
      symbol: tokenData.symbol,
      risk_score: calculateRiskScore(tokenData),
      liquidity_locked: tokenData.liquidityLocked,
      status: 'active'
    });

  if (error) {
    toast.error("Failed to add token to monitoring");
  } else {
    toast.success("Token is now being monitored");
  }
};
```

### Recording a Rug Pull
```typescript
// In src/pages/MemeCoins.tsx
const recordRugPull = async (projectData: RuggedCoin) => {
  // 1. Add to rugged_projects table
  const { data: rugData } = await supabase
    .from('rugged_projects')
    .insert(projectData);

  // 2. Add launcher wallet to scammer watchlist
  await supabase
    .from('scammer_wallets')
    .upsert({
      wallet_address: projectData.launcherWallet,
      projects_involved: [rugData.id],
      total_stolen: projectData.totalLoss,
      status: 'confirmed_scammer'
    });

  // 3. Sync to TLC and RugGuard
  await fetch(`${VITE_TLC_API_URL}/sync/rugged-project`, {
    method: 'POST',
    body: JSON.stringify(rugData)
  });

  // 4. Reset days counter
  setDaysSinceLastRug(0);
};
```

### Integrating PulseScore Real Algorithm
```typescript
// Replace mock data in src/components/PulseScore.tsx
const fetchRealPulseScore = async (tokenSymbol: string) => {
  const response = await fetch(`${PULSESCORE_API_URL}/score`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${API_KEY}` },
    body: JSON.stringify({
      token: tokenSymbol,
      metrics: ['all'], // Use all 50+ metrics
      confidence_threshold: 0.85
    })
  });

  const { score, phase, confidence, next_peak_days } = await response.json();
  
  return {
    score: Math.round(score * 100), // 0-100
    phase, // 'accumulation' | 'uptrend' | 'distribution' | 'downtrend'
    confidence,
    prediction: `Next ${phase === 'accumulation' ? 'peak' : 'bottom'} in ~${next_peak_days} days`
  };
};
```

### Adding Real-Time Scam Alerts
```typescript
// In src/App.tsx or MainLayout.tsx
useEffect(() => {
  const channel = supabase
    .channel('scam_alerts')
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'rugged_projects' },
      (payload) => {
        // Show urgent notification
        toast.error(
          <div>
            <h4 className="font-bold">🚨 RUG PULL ALERT!</h4>
            <p>{payload.new.name} ({payload.new.symbol})</p>
            <p className="text-sm">Total Loss: ${payload.new.total_loss.toLocaleString()}</p>
          </div>,
          { duration: 10000 }
        );

        // Play alert sound (optional)
        new Audio('/alert.mp3').play();
      }
    )
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}, []);
```

## File Organization

- **`src/pages/`** - Route-level components (PulseInsight, Community, MemeCoins)
- **`src/components/`** - Reusable components (PulseScore, EmbedWidget, FeatureCard)
- **`src/components/ui/`** - shadcn/ui base components (don't modify directly)
- **`src/hooks/`** - Custom React hooks (useAnalytics, use-mobile, use-toast)
- **`src/integrations/supabase/`** - Supabase client, types, hooks
- **`src/lib/`** - Utilities and helpers
- **`supabase/functions/`** - Supabase Edge Functions (ai-insight, pulse-tokens)
- **`supabase/migrations/`** - Database schema migrations

## Integration with Other Platforms

### ⚠️ CRITICAL: Shared Backend Architecture

**Current Status**: ❌ NO INTEGRATION EXISTS - Platforms are isolated

**Decision Required**: Pulse Cycle Pro already has Supabase - should this become the shared backend?

**Option A**: Promote Pulse Cycle Pro's Supabase to ecosystem-wide database
- **Pros**: Already exists, migrations in place, Edge Functions ready
- **Cons**: Couples other platforms to Pulse Cycle Pro repo

**Option B**: Create new `tlc-ecosystem-api` repository with shared Supabase
- **Pros**: Clean separation, independent deployment
- **Cons**: Additional infrastructure, data migration needed

**Recommendation**: Option A (faster) → migrate to Option B later if needed

### TLC Platform Integration
- **Share Scammer Wallets**: TLC queries `GET /api/v1/scammer-wallets` before lock deployment
- **Lock Notifications**: TLC sends `POST /api/v1/lock-deployed` → Pulse Cycle Pro adds to monitoring
- **Risk Warnings**: Pulse Cycle Pro rug detection → webhook → TLC shows warning banner
- **⚠️ NOT IMPLEMENTED**: Need shared API endpoints first

### RugGuard Integration
- **Token Autopsy Reports**: RugGuard writes to shared `token_autopsies` table
- **AI Analysis Requests**: Pulse Cycle Pro calls `POST /api/v1/analyze-contract` on RugGuard
- **Scam Reports**: Both platforms write to shared `community_reports` table
- **Wallet Sync**: Bidirectional sync via shared database (no API needed)
- **⚠️ NOT IMPLEMENTED**: Need unified database first

### Shared Database Schema (Expand Existing Supabase)
```sql
-- ALREADY EXISTS in Pulse Cycle Pro
CREATE TABLE rugged_projects (...);
CREATE TABLE scammer_wallets (...);
CREATE TABLE monitored_tokens (...);
CREATE TABLE community_reports (...);

-- ADD FOR CROSS-PLATFORM
CREATE TABLE deployed_locks (
  id UUID PRIMARY KEY,
  contract_address TEXT UNIQUE NOT NULL,
  deployer_wallet TEXT NOT NULL,
  token_address TEXT NOT NULL,
  lock_amount NUMERIC NOT NULL,
  unlock_timestamp TIMESTAMP NOT NULL,
  platform_source TEXT DEFAULT 'TLC',
  rugguard_risk_score INTEGER, -- Link to RugGuard analysis
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE trust_points (
  id UUID PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  points_earned INTEGER DEFAULT 0,
  action_type TEXT NOT NULL, -- 'scam_report', 'lock_deployed', 'vote', etc.
  platform_source TEXT NOT NULL, -- 'TLC', 'PulseCyclePro', 'RugGuard'
  action_reference TEXT, -- Link to specific action
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE token_autopsies (
  id UUID PRIMARY KEY,
  token_address TEXT UNIQUE NOT NULL,
  risk_score INTEGER NOT NULL,
  ai_findings JSONB,
  rugguard_analysis JSONB,
  last_analyzed TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints (To Be Implemented)
```typescript
// Pulse Cycle Pro exposes (or shared API exposes)
GET  /api/v1/scammer-wallets         // TLC checks before deployment
  Returns: { wallets: ScammerWallet[], totalCount: number }

POST /api/v1/scammer-wallets         // RugGuard adds new scammer
  Body: { walletAddress: string, projectsInvolved: string[], evidence: string[] }
  Returns: { success: boolean, walletId: string }

GET  /api/v1/rugged-projects         // Historical rug pull database
  Query: { limit: number, offset: number, dateFrom?: string }
  Returns: { projects: RuggedCoin[], totalCount: number, daysSinceLastRug: number }

POST /api/v1/rug-alert               // RugGuard/community reports new rug
  Body: { projectData: RuggedCoin, reporterWallet: string }
  Returns: { success: boolean, pointsAwarded: number, alertsSent: number }

GET  /api/v1/token-risk/:address     // Combined risk from RugGuard + community votes
  Returns: { riskScore: number, rugguardAnalysis: object, communityVotes: object }

POST /api/v1/trust-points            // Award points cross-platform
  Body: { walletAddress: string, points: number, action: string, platform: string }
  Returns: { totalPoints: number, airdropEligible: boolean }

// WebSocket for real-time updates
WS   /ws/v1/rug-alerts               // Real-time rug pull notifications
  Emits: { type: 'RUG_DETECTED', project: RuggedCoin, daysSinceLastRug: 0 }
```

**Implementation Priority**:
1. **Expand existing Supabase schema** - Add tables above
2. **Create REST API** - Supabase Edge Functions or Express.js backend
3. **Implement WebSocket** - Real-time alerts using Supabase Realtime
4. **Update all platforms** - Connect to shared API

## Known Gotchas

1. **DexScreener Rate Limits**: API has rate limits - implement caching and request throttling
2. **Supabase Realtime**: Requires proper channel cleanup to avoid memory leaks
3. **PulseScore Mock Data**: Currently showing placeholder data - real algorithm integration pending
4. **Days Counter Reset**: Must manually reset `daysSinceLastRug` when new rug occurs
5. **Cross-Platform Sync**: No automated sync yet - requires manual API calls to TLC/RugGuard
6. **Airdrop Points**: Not connected to $TLC smart contract yet - tracking in database only
7. **Social Sentiment**: Twitter/Discord APIs require authentication and proper rate limiting
8. **Mobile Responsiveness**: Some data tables need better mobile layouts

## Resources

- **Project Docs**: `README.md`, `ISSUES_FIXED.md`
- **Supabase Docs**: https://supabase.com/docs
- **DexScreener API**: https://docs.dexscreener.com
- **React Query**: https://tanstack.com/query/latest/docs/react
- **shadcn/ui**: https://ui.shadcn.com

## Security Considerations

### User-Generated Content
- **Validate all wallet addresses** before storing
- **Sanitize text inputs** to prevent XSS
- **Require wallet signatures** for scam reports (prevent spam)
- **Implement report verification** before awarding airdrop points

### API Security
```typescript
// Supabase Row-Level Security (RLS) policies
CREATE POLICY "Anyone can read rugged_projects"
  ON rugged_projects FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert reports"
  ON community_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Only verified reports visible"
  ON community_reports FOR SELECT
  TO public
  USING (status = 'verified');
```

### Data Privacy
- **Never store private keys or seeds**
- **Hash wallet addresses** for airdrop tracking (optional privacy feature)
- **Allow report deletion** by original reporter
- **Anonymous reporting option** for whistleblowers

## Deployment

### Local Development
```bash
npm run dev  # Runs on http://localhost:5173
```

### Staging (Lovable Platform)
- Push to `staging` branch
- Auto-deploys to staging environment
- Run smoke tests before production

### Production (Lovable Platform)
- Merge to `main` branch
- Auto-deploys to production
- Monitor Supabase dashboard for errors
- Check DexScreener API quotas

### Custom Domain Setup
1. Configure DNS CNAME to Lovable platform
2. Update CORS origins in Supabase dashboard
3. Update API URLs in `.env` files

---

**Last Updated**: 2025-11-17 | **Status**: MVP with real-time features + mock PulseScore
**Priority Todos**: Integrate real PulseScore algorithm, implement cross-platform API sync, launch airdrop points smart contract
