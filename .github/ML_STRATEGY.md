# PulseScore ML Strategy - Backtesting Approach

## Executive Summary

**Goal**: Build cycle prediction ML model using historical PulseChain data  
**Timeline**: 2-4 weeks for proof of concept, 2-3 months for production  
**Accuracy Target**: 75%+ for MVP, 90%+ for production  
**Data Available**: 2.5 years (PulseChain live since May 2023)

## Why Backtesting Works Here

### Available Historical Data
1. **Price Data**: Every token since mainnet launch (May 2023)
2. **Volume Data**: DEX trades, liquidity changes
3. **On-Chain Metrics**: Holder counts, wallet distribution, transaction patterns
4. **Social Sentiment**: Telegram/Twitter activity (can scrape historical)
5. **Market Cap History**: Calculate from price × circulating supply

### Known Cycles to Train On
- **PLS Launch Cycle**: May-July 2023
- **Mid-2023 Accumulation**: July-October 2023
- **Late 2023 Rally**: November 2023-January 2024
- **2024 Consolidation**: February-August 2024
- **Late 2024 Movement**: September-November 2024

## Implementation Phases

### Phase 1: Data Collection (3-5 days)

**Data Sources**:
```typescript
// Primary APIs
const dataSources = {
  prices: 'DexScreener API - https://api.dexscreener.com/latest/dex/tokens/{address}',
  onChain: 'PulseChain RPC - getStorageAt, getLogs for events',
  social: 'Twitter API, Telegram scraping (historical)',
  liquidity: 'DEX contracts - getPair(), getReserves()',
  holders: 'Block explorers - scan.pulsechain.com API'
};
```

**Target Metrics** (50+ features):
- Price: current, 7d high/low, 30d high/low, ATH distance
- Volume: 24h, 7d, 30d, volume/marketcap ratio
- Liquidity: total USD, 24h change, depth analysis
- Holders: count, top 10 concentration, growth rate
- Transactions: buy/sell ratio, unique wallets, avg size
- Social: mentions, sentiment score, engagement rate
- Technical: RSI, MACD, Bollinger Bands, moving averages
- Market: correlation to PLS, dominance, rank

**Storage**:
```sql
-- Supabase table
CREATE TABLE historical_token_data (
  id BIGSERIAL PRIMARY KEY,
  token_address TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  price NUMERIC,
  volume_24h NUMERIC,
  market_cap NUMERIC,
  liquidity_usd NUMERIC,
  holder_count INTEGER,
  tx_count_24h INTEGER,
  metrics JSONB, -- Store all 50+ features
  cycle_label TEXT -- 'bottom', 'accumulation', 'pump', 'peak', 'dump'
);

CREATE INDEX idx_token_time ON historical_token_data(token_address, timestamp);
```

### Phase 2: Feature Engineering (2-3 days)

**Derived Features**:
```python
def engineer_features(df):
    # Trend features
    df['price_7d_change'] = df['price'].pct_change(periods=7)
    df['price_30d_change'] = df['price'].pct_change(periods=30)
    
    # Volume patterns
    df['volume_ma_7'] = df['volume_24h'].rolling(7).mean()
    df['volume_spike'] = df['volume_24h'] / df['volume_ma_7']
    
    # Holder dynamics
    df['holder_growth_7d'] = df['holder_count'].pct_change(periods=7)
    df['whale_concentration'] = df['top_10_holding_pct']
    
    # Cycle indicators
    df['distance_from_ath'] = (df['ath_price'] - df['price']) / df['ath_price']
    df['liquidity_ratio'] = df['liquidity_usd'] / df['market_cap']
    
    # Social momentum
    df['social_growth'] = df['mentions'].pct_change(periods=7)
    df['engagement_rate'] = df['social_engagement'] / df['mentions']
    
    return df
```

**Labeling Strategy**:
```python
def label_cycle_phase(df):
    """
    Manually label historical cycles based on known patterns
    Use hindsight to identify peaks/bottoms
    """
    labels = []
    
    for i, row in df.iterrows():
        # Look ahead/behind 7 days to confirm peak/bottom
        future_7d = df.iloc[i:i+7]['price']
        past_7d = df.iloc[max(0,i-7):i]['price']
        
        if row['price'] == future_7d.max() and row['price'] == past_7d.max():
            labels.append('peak')
        elif row['price'] == future_7d.min() and row['price'] == past_7d.min():
            labels.append('bottom')
        elif row['price_30d_change'] > 0.5:
            labels.append('pump')
        elif row['price_30d_change'] < -0.3:
            labels.append('dump')
        else:
            labels.append('accumulation')
    
    df['cycle_label'] = labels
    return df
```

### Phase 3: Model Training (3-5 days)

**Quick POC Model** (RandomForest):
```python
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import TimeSeriesSplit
import pandas as pd

class PulseScorePOC:
    def __init__(self):
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            min_samples_split=20,
            class_weight='balanced'
        )
        self.feature_cols = None
    
    def train(self, df):
        # Split features/labels
        self.feature_cols = [c for c in df.columns if c not in ['cycle_label', 'timestamp', 'token_address']]
        X = df[self.feature_cols]
        y = df['cycle_label']
        
        # Time series cross-validation (don't use future data)
        tscv = TimeSeriesSplit(n_splits=5)
        scores = []
        
        for train_idx, test_idx in tscv.split(X):
            X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
            y_train, y_test = y.iloc[train_idx], y.iloc[test_idx]
            
            self.model.fit(X_train, y_train)
            score = self.model.score(X_test, y_test)
            scores.append(score)
        
        print(f"Average CV Score: {np.mean(scores):.2%}")
        
        # Final train on all data
        self.model.fit(X, y)
    
    def predict(self, features: dict) -> dict:
        X = pd.DataFrame([features])[self.feature_cols]
        
        phase = self.model.predict(X)[0]
        probabilities = self.model.predict_proba(X)[0]
        confidence = max(probabilities)
        
        return {
            'phase': phase,
            'confidence': confidence,
            'score': int(confidence * 100),
            'probabilities': dict(zip(self.model.classes_, probabilities))
        }
```

**Production Model** (Ensemble):
```python
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.neural_network import MLPClassifier

class PulseScoreProduction:
    def __init__(self):
        # Ensemble of multiple models
        self.models = {
            'rf': RandomForestClassifier(n_estimators=200, max_depth=15),
            'gb': GradientBoostingClassifier(n_estimators=100, learning_rate=0.05),
            'nn': MLPClassifier(hidden_layers=(100, 50), max_iter=500),
            'lr': LogisticRegression(multi_class='multinomial', max_iter=1000)
        }
        self.weights = {'rf': 0.4, 'gb': 0.3, 'nn': 0.2, 'lr': 0.1}
    
    def predict(self, features: dict) -> dict:
        predictions = {}
        
        # Get predictions from all models
        for name, model in self.models.items():
            proba = model.predict_proba([features])[0]
            predictions[name] = proba
        
        # Weighted ensemble
        ensemble_proba = np.zeros_like(predictions['rf'])
        for name, weight in self.weights.items():
            ensemble_proba += weight * predictions[name]
        
        phase = self.model.classes_[np.argmax(ensemble_proba)]
        confidence = max(ensemble_proba)
        
        return {
            'phase': phase,
            'confidence': confidence,
            'score': int(confidence * 100)
        }
```

### Phase 4: Backtesting (2-3 days)

**Validation Strategy**:
```python
def backtest_model(model, test_df):
    """
    Simulate real-time predictions on historical data
    Calculate accuracy of peak/bottom calls
    """
    results = []
    
    for i in range(len(test_df) - 30):
        # Use only data available at time t
        historical = test_df.iloc[:i+1]
        current_features = historical.iloc[-1]
        
        # Make prediction
        pred = model.predict(current_features.to_dict())
        
        # Look ahead 7 days to see if correct
        future_7d = test_df.iloc[i+1:i+8]
        actual_phase = label_actual_phase(current_features, future_7d)
        
        results.append({
            'timestamp': current_features['timestamp'],
            'predicted': pred['phase'],
            'actual': actual_phase,
            'confidence': pred['confidence'],
            'correct': pred['phase'] == actual_phase
        })
    
    accuracy = sum(r['correct'] for r in results) / len(results)
    print(f"Backtest Accuracy: {accuracy:.2%}")
    
    return results

def calculate_trading_performance(backtest_results, price_data):
    """
    Simulate trading based on model signals
    Calculate ROI if you bought at 'bottom' signals
    """
    trades = []
    
    for result in backtest_results:
        if result['predicted'] == 'bottom' and result['confidence'] > 0.7:
            # Simulate buy
            entry_price = price_data.loc[result['timestamp']]['price']
            
            # Hold for 30 days or until 'peak' signal
            exit_signal = find_next_peak_signal(backtest_results, result['timestamp'])
            exit_price = price_data.loc[exit_signal['timestamp']]['price']
            
            roi = (exit_price - entry_price) / entry_price
            trades.append(roi)
    
    avg_roi = np.mean(trades)
    win_rate = sum(1 for t in trades if t > 0) / len(trades)
    
    print(f"Avg ROI per trade: {avg_roi:.2%}")
    print(f"Win Rate: {win_rate:.2%}")
```

### Phase 5: Deployment (2-3 days)

**Supabase Edge Function**:
```typescript
// supabase/functions/pulsescore/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  const { tokenAddress } = await req.json();
  
  // Fetch current features from APIs
  const features = await fetchCurrentFeatures(tokenAddress);
  
  // Call Python ML model API
  const response = await fetch('https://ml-api.yourhost.com/predict', {
    method: 'POST',
    body: JSON.stringify(features)
  });
  
  const prediction = await response.json();
  
  return new Response(
    JSON.stringify({
      tokenAddress,
      score: prediction.score,
      phase: prediction.phase,
      confidence: prediction.confidence,
      timestamp: new Date().toISOString()
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});
```

## Success Metrics

### POC (2-4 weeks)
- ✅ 70%+ accuracy on backtested data
- ✅ Correctly identifies 3+ historical cycles
- ✅ <5 second prediction latency
- ✅ Works for top 20 PulseChain tokens

### Production (2-3 months)
- ✅ 85%+ accuracy on backtested data
- ✅ 75%+ accuracy on live validation (30 days)
- ✅ Profitable if traded (positive avg ROI)
- ✅ <2 second prediction latency
- ✅ Works for all tokens with sufficient data

## Risk Mitigation

### Model Limitations
1. **Small Sample Size**: Only 2.5 years of data
   - Mitigation: Focus on high-confidence predictions, show uncertainty
   
2. **Overfitting Risk**: Easy to overfit on limited cycles
   - Mitigation: Conservative train/test split, regularization
   
3. **Market Regime Changes**: Future may not match past
   - Mitigation: Regular retraining, drift detection

### User Communication
```typescript
// Always show disclaimers
<Alert variant="warning">
  <AlertTitle>Beta Model - Use at Your Own Risk</AlertTitle>
  <AlertDescription>
    PulseScore is trained on {trainingPeriod} of historical data.
    Accuracy: {backtestAccuracy}% (backtested). Past performance
    does not guarantee future results. Always DYOR.
  </AlertDescription>
</Alert>
```

## Decision Point

**Recommended**: Build POC immediately (2-4 weeks)
- Cheapest validation of concept
- Can pivot if accuracy is too low
- Real data better than claims

**Alternative**: Remove PulseScore claims now, revisit later
- Add back when model is proven
- Less exciting but more honest

## Next Steps

1. ✅ **Approved to build?** → Start data collection tomorrow
2. ✅ **Need more details?** → Create detailed technical spec
3. ❌ **Don't want to build?** → Remove accuracy claims, rebrand as "cycle tracker" without prediction
