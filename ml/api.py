"""
PulseScore ML API Server

FastAPI backend for cycle phase prediction.
Supports single and batch predictions.

Usage:
    python api.py
    # API available at http://127.0.0.1:8000

Endpoints:
    GET  /health          — Model status
    POST /predict         — Single token prediction
    POST /predict/batch   — Batch predictions
    GET  /model/info      — Model metadata
"""

import os
import json
import joblib
import numpy as np
from pathlib import Path
from typing import Optional
from datetime import datetime

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from features import prepare_features, add_derived_features, FEATURE_COLUMNS

# ── Paths ──
BASE_DIR = Path(__file__).parent
MODEL_DIR = BASE_DIR / "models"
MODEL_FILE = MODEL_DIR / "cycle_model.pkl"
SCALER_FILE = MODEL_DIR / "scaler.pkl"
ENCODER_FILE = MODEL_DIR / "label_encoder.pkl"
METRICS_FILE = MODEL_DIR / "metrics.json"

# ── App ──
app = FastAPI(
    title="PulseScore ML API",
    description="Cycle phase prediction for PulseChain tokens",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load model at startup — graceful fallback if not trained yet ──
MODEL = None
SCALER = None
ENCODER = None
METRICS = None


@app.on_event("startup")
async def load_model():
    """Load ML model, scaler, and label encoder."""
    global MODEL, SCALER, ENCODER, METRICS

    try:
        if MODEL_FILE.exists():
            MODEL = joblib.load(MODEL_FILE)
            print(f"✅ Model loaded: {MODEL_FILE}")
        else:
            print(f"⚠️  Model not found: {MODEL_FILE}")
            print("   Run 'python train.py' to train the model")

        if SCALER_FILE.exists():
            SCALER = joblib.load(SCALER_FILE)
            print(f"✅ Scaler loaded: {SCALER_FILE}")

        if ENCODER_FILE.exists():
            ENCODER = joblib.load(ENCODER_FILE)
            print(f"✅ Encoder loaded: {ENCODER_FILE}")

        if METRICS_FILE.exists():
            with open(METRICS_FILE) as f:
                METRICS = json.load(f)
            print(f"✅ Metrics loaded")

    except Exception as e:
        print(f"❌ Error loading model: {e}")
        print("   API will run in demo mode")


# ── Request/Response schemas ──

class TokenMetrics(BaseModel):
    """Input features for a single token prediction."""
    token_address: str = Field(..., description="Token contract address")
    timestamp: Optional[str] = Field(None, description="ISO timestamp")
    price_usd: float = Field(0.0, description="Current price in USD")
    volume_24h: float = Field(0.0, description="24h volume in USD")
    volume_6h: Optional[float] = Field(None, description="6h volume in USD")
    liquidity_usd: float = Field(0.0, description="Liquidity in USD")
    market_cap: Optional[float] = Field(None, description="Market cap in USD")
    price_change_24h: Optional[float] = Field(None, description="24h price change %")
    price_change_6h: Optional[float] = Field(None, description="6h price change %")
    price_change_1h: Optional[float] = Field(None, description="1h price change %")
    txns_24h_buys: Optional[int] = Field(None, description="24h buy transactions")
    txns_24h_sells: Optional[int] = Field(None, description="24h sell transactions")
    holder_count: Optional[int] = Field(None, description="Number of holders")
    top_10_concentration: Optional[float] = Field(None, description="Top 10 holder concentration %")
    unique_wallets_24h: Optional[int] = Field(None, description="Unique wallets in 24h")
    contract_age_days: Optional[int] = Field(None, description="Contract age in days")


class PredictionResponse(BaseModel):
    """Prediction response."""
    token_address: str
    predicted_phase: str
    confidence: float
    score: int
    probabilities: dict[str, float]
    timestamp: str
    model_version: str


class BatchRequest(BaseModel):
    tokens: list[TokenMetrics]


class BatchResponse(BaseModel):
    predictions: list[PredictionResponse]
    total_processed: int
    timestamp: str


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    model_trained_at: Optional[str]
    features_count: Optional[int]
    api_version: str


class ModelInfoResponse(BaseModel):
    trained_at: Optional[str]
    model_type: str
    features_count: Optional[int]
    classes: list[str]
    n_estimators: Optional[int]
    version: str


# ── Helper functions ──

def compute_features_from_metrics(metrics: TokenMetrics) -> np.ndarray:
    """
    Compute the full 57-feature vector from token metrics.
    This mirrors the feature engineering done during training.
    """
    import math

    price = metrics.price_usd or 0
    vol_24h = metrics.volume_24h or 0
    vol_6h = metrics.volume_6h or (vol_24h * 0.25)
    liquidity = metrics.liquidity_usd or 0
    mcap = metrics.market_cap or 0
    change_1h = metrics.price_change_1h or 0
    change_6h = metrics.price_change_6h or 0
    change_24h = metrics.price_change_24h or 0
    buys = metrics.txns_24h_buys or 0
    sells = metrics.txns_24h_sells or 0
    holders = metrics.holder_count or 0
    unique_wallets = metrics.unique_wallets_24h or 0
    concentration = metrics.top_10_concentration or 0
    age = metrics.contract_age_days or 0

    # Time features
    now = datetime.now()
    hour = now.hour
    day = now.weekday()
    hour_sin = math.sin(2 * math.pi * hour / 24)
    hour_cos = math.cos(2 * math.pi * hour / 24)
    day_sin = math.sin(2 * math.pi * day / 7)
    day_cos = math.cos(2 * math.pi * day / 7)

    # Derived features
    total_txns = buys + sells
    buy_ratio = buys / max(total_txns, 1)
    volume_per_holder = vol_24h / max(holders, 1)
    txn_ratio = buys / max(sells, 1)
    liquidity_ratio = liquidity / max(mcap, 1)
    volume_ratio = vol_24h / max(mcap, 1)

    # Technical indicators (simplified for live data)
    rsi = 50 + change_24h * 2
    rsi = max(0, min(100, rsi))

    bb_position = 0.5 + change_24h / 20
    bb_position = max(0, min(1, bb_position))

    macd = change_6h - change_24h
    macd_signal = macd * 0.8
    macd_histogram = macd - macd_signal

    # Momentum
    momentum_7d = change_24h * 3
    momentum_14d = change_24h * 5
    momentum_30d = change_24h * 10

    # Volatility
    volatility_7d = abs(change_24h) * 1.5
    volatility_14d = abs(change_24h) * 2
    volatility_30d = abs(change_24h) * 3

    # Moving averages (use current price as proxy)
    ma_7 = price * (1 + change_24h / 100 * 0.5)
    ma_14 = price * (1 + change_24h / 100 * 0.3)
    ma_30 = price * (1 + change_24h / 100 * 0.1)
    ma_50 = price

    price_vs_ma7 = (price / max(ma_7, 0.0000001) - 1) * 100
    price_vs_ma14 = (price / max(ma_14, 0.0000001) - 1) * 100
    price_vs_ma30 = (price / max(ma_30, 0.0000001) - 1) * 100

    # ATH/ATL
    ath = price * (1 + max(change_24h, 0) / 100 + 0.1)
    atl = price * (1 - abs(min(change_24h, 0)) / 100 - 0.05)
    pct_from_ath = (price / max(ath, 0.0000001) - 1) * 100
    pct_from_atl = (price / max(atl, 0.0000001) - 1) * 100
    days_since_ath = max(1, int(abs(change_24h) * 2))
    days_since_atl = max(1, int(abs(change_24h) * 3))

    # Bollinger bands
    bb_middle = ma_30
    bb_std = price * volatility_30d / 100
    bb_upper = bb_middle + 2 * bb_std
    bb_lower = bb_middle - 2 * bb_std

    # Derived
    price_momentum_divergence = rsi - 50 - momentum_7d * 2
    volume_price_trend = volume_ratio * change_24h
    market_dominance = mcap / max(mcap, 1)
    fear_greed_proxy = rsi * 0.4 + min(volume_ratio, 3) * 20 * 0.3 + max(-10, min(10, change_24h)) * 3 * 0.3
    cycle_position = (bb_position + rsi / 100) / 2

    # Volume change
    volume_change = (vol_24h / max(vol_6h * 4, 1) - 1) * 100

    # Market cap change
    mcap_change_7d = change_24h * 3
    mcap_change_30d = change_24h * 10

    # Build feature vector (must match FEATURE_COLUMNS order)
    features = np.array([
        # Price action (12)
        price, change_1h, change_6h, change_24h,
        price_vs_ma7, price_vs_ma14, price_vs_ma30,
        (price / max(ma_50, 0.0000001) - 1) * 100,
        pct_from_ath, pct_from_atl, ath, atl,
        # Volume (8)
        vol_24h, vol_6h, vol_24h, volume_ratio, volume_change,
        liquidity, buys, sells,
        # Momentum (6)
        momentum_7d, momentum_14d, momentum_30d, rsi, macd, macd_histogram,
        # Volatility (6)
        volatility_7d, volatility_14d, volatility_30d,
        bb_position, bb_upper, bb_lower,
        # Trend (8)
        ma_7, ma_14, ma_30, ma_50,
        days_since_ath, days_since_atl, mcap, mcap_change_7d,
        # On-chain (7)
        holders, unique_wallets, concentration, buy_ratio, age,
        volume_per_holder, txn_ratio,
        # Time (4)
        hour_sin, hour_cos, day_sin, day_cos,
        # Derived (6)
        price_momentum_divergence, volume_price_trend, liquidity_ratio,
        market_dominance, fear_greed_proxy, cycle_position,
    ])

    return features.reshape(1, -1)


# ── Endpoints ──

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Check API health and model status."""
    return HealthResponse(
        status="healthy" if MODEL is not None else "demo_mode",
        model_loaded=MODEL is not None,
        model_trained_at=METRICS.get("trained_at") if METRICS else None,
        features_count=len(FEATURE_COLUMNS) if MODEL else None,
        api_version="1.0.0",
    )


@app.get("/model/info", response_model=ModelInfoResponse)
async def model_info():
    """Get model information."""
    if METRICS:
        return ModelInfoResponse(
            trained_at=METRICS.get("trained_at"),
            model_type=METRICS.get("model_type", "RandomForestClassifier"),
            features_count=METRICS.get("n_features", len(FEATURE_COLUMNS)),
            classes=METRICS.get("phases", []),
            n_estimators=METRICS.get("n_estimators"),
            version="1.0.0",
        )
    return ModelInfoResponse(
        trained_at=None,
        model_type="RandomForestClassifier",
        features_count=len(FEATURE_COLUMNS),
        classes=["accumulation", "pump", "peak", "dump", "bottom"],
        n_estimators=N_ESTIMATORS,
        version="1.0.0",
    )


@app.post("/predict", response_model=PredictionResponse)
async def predict(metrics: TokenMetrics):
    """Predict cycle phase for a single token."""
    try:
        features = compute_features_from_metrics(metrics)

        if MODEL is not None and SCALER is not None and ENCODER is not None:
            # Real prediction
            features_scaled = SCALER.transform(features)
            prediction = MODEL.predict(features_scaled)[0]
            probabilities = MODEL.predict_proba(features_scaled)[0]
            phase = ENCODER.inverse_transform([prediction])[0]
            confidence = float(probabilities[prediction])
            prob_dict = {
                ENCODER.inverse_transform([i])[0]: float(p)
                for i, p in enumerate(probabilities)
            }
        else:
            # Demo mode — heuristic prediction
            change_24h = metrics.price_change_24h or 0
            rsi = 50 + change_24h * 2
            rsi = max(0, min(100, rsi))

            if change_24h > 5 and rsi > 60:
                phase = "pump"
                confidence = 0.75
            elif change_24h > 2 and rsi > 70:
                phase = "peak"
                confidence = 0.65
            elif change_24h < -5 and rsi < 40:
                phase = "dump"
                confidence = 0.70
            elif change_24h < -2 and rsi < 30:
                phase = "bottom"
                confidence = 0.60
            else:
                phase = "accumulation"
                confidence = 0.55

            prob_dict = {
                "accumulation": 0.2,
                "pump": 0.2,
                "peak": 0.2,
                "dump": 0.2,
                "bottom": 0.2,
            }
            prob_dict[phase] = confidence
            # Normalize
            total = sum(prob_dict.values())
            prob_dict = {k: v / total for k, v in prob_dict.items()}

        # Compute score (0-100)
        score = int(confidence * 100)

        return PredictionResponse(
            token_address=metrics.token_address,
            predicted_phase=phase,
            confidence=round(confidence, 4),
            score=score,
            probabilities={k: round(v, 4) for k, v in prob_dict.items()},
            timestamp=datetime.utcnow().isoformat(),
            model_version="1.0.0",
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@app.post("/predict/batch", response_model=BatchResponse)
async def predict_batch(request: BatchRequest):
    """Predict cycle phases for multiple tokens."""
    predictions = []
    for metrics in request.tokens:
        try:
            result = await predict(metrics)
            predictions.append(result)
        except Exception as e:
            predictions.append(PredictionResponse(
                token_address=metrics.token_address,
                predicted_phase="error",
                confidence=0.0,
                score=0,
                probabilities={},
                timestamp=datetime.utcnow().isoformat(),
                model_version="1.0.0",
            ))

    return BatchResponse(
        predictions=predictions,
        total_processed=len(predictions),
        timestamp=datetime.utcnow().isoformat(),
    )


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", 8000))
    print(f"Starting PulseScore ML API on port {port}...")
    uvicorn.run(app, host="0.0.0.0", port=port)
