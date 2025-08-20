-- Create lock contracts table
CREATE TABLE public.lock_contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  contract_address TEXT NOT NULL,
  contract_type TEXT NOT NULL DEFAULT 'liquidity_lock',
  token_address TEXT NOT NULL,
  token_symbol TEXT NOT NULL,
  lock_amount NUMERIC NOT NULL,
  lock_duration_days INTEGER NOT NULL,
  unlock_date TIMESTAMP WITH TIME ZONE NOT NULL,
  beneficiary_address TEXT NOT NULL,
  is_multisig BOOLEAN NOT NULL DEFAULT false,
  required_signatures INTEGER DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create token locks table
CREATE TABLE public.token_locks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID NOT NULL REFERENCES public.lock_contracts(id) ON DELETE CASCADE,
  lock_type TEXT NOT NULL, -- 'liquidity', 'team_tokens', 'marketing', 'development'
  amount_locked NUMERIC NOT NULL,
  percentage_of_supply NUMERIC,
  unlock_schedule JSONB, -- array of unlock events with dates and amounts
  is_emergency_unlockable BOOLEAN NOT NULL DEFAULT false,
  community_vote_threshold INTEGER DEFAULT 75,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lock transactions table
CREATE TABLE public.lock_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID NOT NULL REFERENCES public.lock_contracts(id) ON DELETE CASCADE,
  transaction_hash TEXT NOT NULL,
  transaction_type TEXT NOT NULL, -- 'lock', 'unlock', 'extend', 'emergency_unlock'
  amount NUMERIC NOT NULL,
  block_number BIGINT,
  gas_used BIGINT,
  gas_price NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lock templates table
CREATE TABLE public.lock_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  template_type TEXT NOT NULL, -- 'standard', 'vesting', 'team', 'liquidity'
  default_duration_days INTEGER NOT NULL,
  min_duration_days INTEGER NOT NULL,
  max_duration_days INTEGER NOT NULL,
  is_multisig_required BOOLEAN NOT NULL DEFAULT false,
  security_score INTEGER NOT NULL DEFAULT 50,
  features JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lock verifications table for community ratings
CREATE TABLE public.lock_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID NOT NULL REFERENCES public.lock_contracts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  verification_type TEXT NOT NULL, -- 'audit', 'community_review', 'code_review'
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comments TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(contract_id, user_id, verification_type)
);

-- Enable Row Level Security
ALTER TABLE public.lock_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lock_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lock_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lock_verifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for lock_contracts
CREATE POLICY "Users can view all lock contracts" 
ON public.lock_contracts 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own lock contracts" 
ON public.lock_contracts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lock contracts" 
ON public.lock_contracts 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for token_locks
CREATE POLICY "Anyone can view token locks" 
ON public.token_locks 
FOR SELECT 
USING (true);

CREATE POLICY "Contract owners can manage token locks" 
ON public.token_locks 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.lock_contracts 
    WHERE id = contract_id AND user_id = auth.uid()
  )
);

-- Create RLS policies for lock_transactions
CREATE POLICY "Anyone can view lock transactions" 
ON public.lock_transactions 
FOR SELECT 
USING (true);

-- Create RLS policies for lock_templates
CREATE POLICY "Anyone can view active lock templates" 
ON public.lock_templates 
FOR SELECT 
USING (is_active = true);

-- Create RLS policies for lock_verifications
CREATE POLICY "Anyone can view lock verifications" 
ON public.lock_verifications 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own verifications" 
ON public.lock_verifications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own verifications" 
ON public.lock_verifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create triggers for updated_at columns
CREATE TRIGGER update_lock_contracts_updated_at
BEFORE UPDATE ON public.lock_contracts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_lock_contracts_user_id ON public.lock_contracts(user_id);
CREATE INDEX idx_lock_contracts_token_address ON public.lock_contracts(token_address);
CREATE INDEX idx_lock_contracts_status ON public.lock_contracts(status);
CREATE INDEX idx_token_locks_contract_id ON public.token_locks(contract_id);
CREATE INDEX idx_lock_transactions_contract_id ON public.lock_transactions(contract_id);
CREATE INDEX idx_lock_verifications_contract_id ON public.lock_verifications(contract_id);

-- Insert default lock templates
INSERT INTO public.lock_templates (name, description, template_type, default_duration_days, min_duration_days, max_duration_days, is_multisig_required, security_score, features) VALUES
('Standard Liquidity Lock', 'Basic liquidity lock for new token launches', 'liquidity', 365, 30, 1095, false, 70, '{"emergency_unlock": false, "extendable": true, "partial_unlock": false}'),
('Team Token Vesting', 'Linear vesting schedule for team tokens', 'team', 730, 365, 1460, true, 85, '{"emergency_unlock": true, "extendable": false, "partial_unlock": true, "vesting_schedule": "linear"}'),
('Marketing Token Lock', 'Lock for marketing and promotion tokens', 'marketing', 180, 90, 730, false, 60, '{"emergency_unlock": true, "extendable": true, "partial_unlock": true}'),
('Development Fund Lock', 'Long-term development fund protection', 'development', 1095, 730, 2190, true, 90, '{"emergency_unlock": true, "extendable": false, "partial_unlock": true, "community_vote": true}');