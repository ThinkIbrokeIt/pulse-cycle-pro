-- Ecosystem Integration Migration
-- Adds tables for cross-platform integration between TLC, Pulse Cycle Pro, and RugGuard

-- TLC Deployed Locks table
-- Tracks all lock contracts deployed through TLC platform
CREATE TABLE public.tlc_deployed_locks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_address text NOT NULL,
  token_address text NOT NULL,
  deployer_wallet text NOT NULL,
  lock_amount numeric NOT NULL,
  unlock_timestamp bigint NOT NULL,
  token_symbol text,
  token_name text,
  transaction_hash text,
  platform_source text DEFAULT 'TLC',
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Trust Points table
-- Cross-platform trust scoring system
CREATE TABLE public.trust_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text NOT NULL UNIQUE,
  total_points integer DEFAULT 0,
  actions jsonb[] DEFAULT '{}',
  platforms_used text[] DEFAULT '{}',
  last_action_at timestamp,
  airdrop_eligible boolean DEFAULT false,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Scammer Wallets table
-- Shared watchlist across all platforms
CREATE TABLE public.scammer_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text NOT NULL UNIQUE,
  reason text NOT NULL,
  evidence_url text,
  flagged_by text,
  confirmed boolean DEFAULT false,
  risk_score integer DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  platforms_flagged text[] DEFAULT '{}',
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Risk Scores table
-- Token risk assessments from ML model
CREATE TABLE public.token_risk_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_address text NOT NULL UNIQUE,
  risk_score integer NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_level text NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'unknown')),
  ai_summary text,
  last_analyzed timestamp DEFAULT now(),
  analyzed_by text DEFAULT 'pulse-ml',
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Platform Activity table
-- Tracks cross-platform user actions for analytics
CREATE TABLE public.platform_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text NOT NULL,
  action_type text NOT NULL,
  platform_source text NOT NULL,
  points_earned integer DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamp DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.tlc_deployed_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scammer_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_risk_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_activity ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tlc_deployed_locks
CREATE POLICY "Anyone can view deployed locks" ON public.tlc_deployed_locks FOR SELECT USING (true);
CREATE POLICY "TLC platform can insert locks" ON public.tlc_deployed_locks FOR INSERT WITH CHECK (true);
CREATE POLICY "TLC platform can update locks" ON public.tlc_deployed_locks FOR UPDATE USING (true);

-- RLS Policies for trust_points
CREATE POLICY "Users can view their own trust points" ON public.trust_points FOR SELECT USING (auth.uid()::text = wallet_address OR auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Service role can manage trust points" ON public.trust_points FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- RLS Policies for scammer_wallets
CREATE POLICY "Anyone can view confirmed scammers" ON public.scammer_wallets FOR SELECT USING (confirmed = true);
CREATE POLICY "Service role can manage scammer wallets" ON public.scammer_wallets FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- RLS Policies for token_risk_scores
CREATE POLICY "Anyone can view risk scores" ON public.token_risk_scores FOR SELECT USING (true);
CREATE POLICY "Service role can manage risk scores" ON public.token_risk_scores FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- RLS Policies for platform_activity
CREATE POLICY "Users can view their own activity" ON public.platform_activity FOR SELECT USING (auth.uid()::text = wallet_address);
CREATE POLICY "Service role can manage activity" ON public.platform_activity FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Indexes for performance
CREATE INDEX idx_tlc_deployed_locks_deployer ON public.tlc_deployed_locks(deployer_wallet);
CREATE INDEX idx_tlc_deployed_locks_token ON public.tlc_deployed_locks(token_address);
CREATE INDEX idx_tlc_deployed_locks_created ON public.tlc_deployed_locks(created_at DESC);

CREATE INDEX idx_trust_points_wallet ON public.trust_points(wallet_address);
CREATE INDEX idx_trust_points_total ON public.trust_points(total_points DESC);

CREATE INDEX idx_scammer_wallets_address ON public.scammer_wallets(wallet_address);
CREATE INDEX idx_scammer_wallets_risk ON public.scammer_wallets(risk_score DESC);

CREATE INDEX idx_token_risk_scores_address ON public.token_risk_scores(token_address);
CREATE INDEX idx_token_risk_scores_score ON public.token_risk_scores(risk_score DESC);

CREATE INDEX idx_platform_activity_wallet ON public.platform_activity(wallet_address);
CREATE INDEX idx_platform_activity_created ON public.platform_activity(created_at DESC);

-- Function to update trust points
CREATE OR REPLACE FUNCTION public.update_trust_points(wallet_addr text, points_to_add integer, action_type text, platform text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.trust_points (wallet_address, total_points, actions, platforms_used, last_action_at)
  VALUES (wallet_addr, points_to_add, ARRAY[jsonb_build_object('type', action_type, 'points', points_to_add, 'platform', platform, 'timestamp', now())], ARRAY[platform], now())
  ON CONFLICT (wallet_address)
  DO UPDATE SET
    total_points = trust_points.total_points + points_to_add,
    actions = trust_points.actions || jsonb_build_object('type', action_type, 'points', points_to_add, 'platform', platform, 'timestamp', now()),
    platforms_used = array_distinct(trust_points.platforms_used || platform),
    last_action_at = now(),
    airdrop_eligible = (trust_points.total_points + points_to_add) >= 100;

  -- Also log to platform_activity
  INSERT INTO public.platform_activity (wallet_address, action_type, platform_source, points_earned, metadata)
  VALUES (wallet_addr, action_type, platform, points_to_add, jsonb_build_object('total_points', (SELECT total_points FROM public.trust_points WHERE wallet_address = wallet_addr)));
END;
$$;

-- Function to get trust points for a wallet
CREATE OR REPLACE FUNCTION public.get_wallet_trust_points(wallet_addr text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'wallet', wallet_address,
    'totalPoints', total_points,
    'totalActions', array_length(actions, 1),
    'platformsUsed', array_length(platforms_used, 1),
    'lastAction', last_action_at,
    'airdropEligible', airdrop_eligible,
    'breakdown', actions
  ) INTO result
  FROM public.trust_points
  WHERE wallet_address = wallet_addr;

  IF result IS NULL THEN
    RETURN jsonb_build_object(
      'wallet', wallet_addr,
      'totalPoints', 0,
      'totalActions', 0,
      'platformsUsed', 0,
      'airdropEligible', false,
      'breakdown', '[]'::jsonb
    );
  END IF;

  RETURN result;
END;
$$;

-- Function to check if wallet is a scammer
CREATE OR REPLACE FUNCTION public.is_wallet_scammer(wallet_addr text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  scammer_record record;
BEGIN
  SELECT * INTO scammer_record
  FROM public.scammer_wallets
  WHERE wallet_address = wallet_addr AND confirmed = true;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'isScammer', true,
      'reason', scammer_record.reason,
      'riskScore', scammer_record.risk_score,
      'evidenceUrl', scammer_record.evidence_url
    );
  END IF;

  RETURN jsonb_build_object('isScammer', false);
END;
$$;

-- Function to get token risk score
CREATE OR REPLACE FUNCTION public.get_token_risk_score(token_addr text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  risk_record record;
BEGIN
  SELECT * INTO risk_record
  FROM public.token_risk_scores
  WHERE token_address = token_addr;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'address', risk_record.token_address,
      'riskScore', risk_record.risk_score,
      'riskLevel', risk_record.risk_level,
      'aiSummary', risk_record.ai_summary,
      'lastAnalyzed', risk_record.last_analyzed
    );
  END IF;

  RETURN jsonb_build_object(
    'address', token_addr,
    'riskScore', null,
    'riskLevel', 'unknown',
    'message', 'Token not analyzed yet'
  );
END;
$$;