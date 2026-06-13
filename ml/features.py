"""
Feature engineering for PulseScore ML model.

Transforms raw data into 57 features for cycle phase prediction.
Features are grouped into categories:
- Price action (12 features)
- Volume (8 features)
- Momentum (6 features)
- Volatility (6 features)
- Trend (8 features)
- On-chain (10 features)
- Time (4 features)
- Derived (3 features)
"""

import pandas as pd
import numpy as np
from typing import Optional


# All 57 features used by the model
FEATURE_COLUMNS = [
    # Price action (12)
    "price_usd",
    "price_change_1h",
    "price_change_6h",
    "price_change_24h",
    "price_vs_ma7",
    "price_vs_ma14",
    "price_vs_ma30",
    "price_vs_ma50",
    "pct_from_ath",
    "pct_from_atl",
    "ath",
    "atl",

    # Volume (8)
    "volume_24h",
    "volume_6h",
    "volume_ma_7",
    "volume_ratio",
    "volume_change",
    "liquidity_usd",
    "txns_24h_buys",
    "txns_24h_sells",

    # Momentum (6)
    "momentum_7d",
    "momentum_14d",
    "momentum_30d",
    "rsi",
    "macd",
    "macd_histogram",

    # Volatility (6)
    "volatility_7d",
    "volatility_14d",
    "volatility_30d",
    "bb_position",
    "bb_upper",
    "bb_lower",

    # Trend (8)
    "ma_7",
    "ma_14",
    "ma_30",
    "ma_50",
    "days_since_ath",
    "days_since_atl",
    "market_cap",
    "mcap_change_7d",

    # On-chain (7)
    "holder_count",
    "unique_wallets_24h",
    "top_10_concentration",
    "buy_ratio",
    "contract_age_days",
    "volume_per_holder",
    "txn_buy_sell_ratio",

    # Time (4)
    "hour_sin",
    "hour_cos",
    "day_sin",
    "day_cos",

    # Derived (6)
    "price_momentum_divergence",
    "volume_price_trend",
    "liquidity_ratio",
    "market_dominance",
    "fear_greed_proxy",
    "cycle_position",
]


def prepare_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Prepare feature matrix from raw data.
    Handles missing columns, NaN values, and feature scaling.
    """
    # Ensure all required columns exist
    for col in FEATURE_COLUMNS:
        if col not in df.columns:
            df[col] = 0.0

    # Select only the feature columns
    features = df[FEATURE_COLUMNS].copy()

    # Handle NaN/inf values
    features = features.replace([np.inf, -np.inf], np.nan)
    features = features.fillna(0.0)

    # Clip extreme values (beyond 5 standard deviations)
    for col in features.columns:
        mean = features[col].mean()
        std = features[col].std()
        if std > 0:
            features[col] = features[col].clip(mean - 5 * std, mean + 5 * std)

    return features


def add_derived_features(df: pd.DataFrame) -> pd.DataFrame:
    """Add derived features computed from base features."""

    # Price momentum divergence (RSI vs momentum)
    if "rsi" in df.columns and "momentum_7d" in df.columns:
        df["price_momentum_divergence"] = df["rsi"] - 50 - df["momentum_7d"] * 2
    else:
        df["price_momentum_divergence"] = 0.0

    # Volume price trend (volume * price_change)
    if "volume_ratio" in df.columns and "price_change_24h" in df.columns:
        df["volume_price_trend"] = df["volume_ratio"] * df["price_change_24h"]
    else:
        df["volume_price_trend"] = 0.0

    # Liquidity ratio (liquidity / market_cap)
    if "liquidity_usd" in df.columns and "market_cap" in df.columns:
        df["liquidity_ratio"] = df["liquidity_usd"] / df["market_cap"].replace(0, 1)
    else:
        df["liquidity_ratio"] = 0.0

    # Volume per holder
    if "volume_24h" in df.columns and "holder_count" in df.columns:
        df["volume_per_holder"] = df["volume_24h"] / df["holder_count"].replace(0, 1)
    else:
        df["volume_per_holder"] = 0.0

    # Buy/sell transaction ratio
    if "txns_24h_buys" in df.columns and "txns_24h_sells" in df.columns:
        total_txns = df["txns_24h_buys"] + df["txns_24h_sells"]
        df["txn_buy_sell_ratio"] = df["txns_24h_buys"] / total_txns.replace(0, 1)
    else:
        df["txn_buy_sell_ratio"] = 0.5

    # Market dominance (market_cap relative to total)
    if "market_cap" in df.columns:
        total_mcap = df["market_cap"].mean() if len(df) > 0 else 1.0
        df["market_dominance"] = df["market_cap"] / max(total_mcap, 1.0)
    else:
        df["market_dominance"] = 0.0

    # Fear/Greed proxy (composite indicator)
    if all(col in df.columns for col in ["rsi", "volume_ratio", "price_change_24h"]):
        df["fear_greed_proxy"] = (
            df["rsi"] * 0.4
            + df["volume_ratio"].clip(0, 3) * 20 * 0.3
            + df["price_change_24h"].clip(-10, 10) * 3 * 0.3
        )
    else:
        df["fear_greed_proxy"] = 50.0

    # Cycle position (0-1, where 0 = bottom, 1 = top)
    if "bb_position" in df.columns and "rsi" in df.columns:
        df["cycle_position"] = (df["bb_position"] + df["rsi"] / 100) / 2
    else:
        df["cycle_position"] = 0.5

    # Cap change features
    if "mcap_change_30d" not in df.columns:
        df["mcap_change_30d"] = 0.0
    if "momentum_14d" not in df.columns:
        df["momentum_14d"] = 0.0
    if "holder_count" not in df.columns:
        df["holder_count"] = 0.0
    if "unique_wallets_24h" not in df.columns:
        df["unique_wallets_24h"] = 0.0
    if "top_10_concentration" not in df.columns:
        df["top_10_concentration"] = 0.0
    if "contract_age_days" in df.columns and df["contract_age_days"] is not None:
        pass
    else:
        df["contract_age_days"] = 0.0

    return df


def get_feature_importance(model, feature_names):
    """Get feature importance from a trained tree-based model."""
    if hasattr(model, "feature_importances_"):
        importance = model.feature_importances_
        return sorted(
            zip(feature_names, importance),
            key=lambda x: x[1],
            reverse=True,
        )
    return []
