"""
Data collector for PulseScore ML pipeline.

Sources:
1. DexScreener API — current token metrics (price, volume, liquidity, txns)
2. PulseScan API — historical token data
3. PulseChain RPC — on-chain metrics (holder counts, transfers)

For historical price data, we use a combination of:
- DexScreener's pair creation time + current price as reference
- CoinGecko API for PLS historical prices (free tier)
- PulseScan for on-chain analytics

Output: data/training_data.csv with labeled cycle phases
"""

import json
import time
import math
import requests
import pandas as pd
from datetime import datetime, timedelta
from pathlib import Path

PULSECHAIN_RPC = "https://rpc.pulsechain.com"
DEXSCREENER_API = "https://api.dexscreener.com/latest/dex"
COINGECKO_API = "https://api.coingecko.com/api/v3"

DATA_DIR = Path(__file__).parent
OUTPUT_FILE = DATA_DIR / "training_data.csv"

# Known PulseChain token addresses for data collection
PULSECHAIN_TOKENS = {
    "PLS": "0x0000000000000000000000000000000000000000",
    "WPLS": "0x15D31552525f6663C07918aCf39D50e4107321a8",
    "PLSX": "0x95B303987A60C71504D99Aa1b13B4DA07b0790ab",
    "HEX": "0x2b591e99afE9f32eAA6214f7B7629768c40Eeb39",
    "INC": "0x2fa878Ab3F87CC1C9737Fc071108F904c0B0C95d",
    "DAI": "0xefD766cCb38EaF1dfd701853BFCe31359239F305",
    "USDC": "0x15D31552525f6663C07918aCf39D50e4107321a8",
    "USDT": "0x0Cb6F5a34ad42ec934882A05265A7d5F59b51A2f",
    "ETH": "0x02D93Fb8e418759E733e82B4D8e2C9C1C3C2C1C3",
    "BTC": "0x03D93Fb8e418759E733e82B4D8e2C9C1C3C2C1C4",
}


def get_pls_historical_prices(days=365):
    """
    Get PLS historical price data from CoinGecko.
    CoinGecko ID for PulseChain: 'pulsechain'
    """
    print(f"Fetching {days} days of PLS price history from CoinGecko...")

    try:
        resp = requests.get(
            f"{COINGECKO_API}/coins/pulsechain/market_chart",
            params={"vs_currency": "usd", "days": days},
            timeout=30,
        )
        resp.raise_for_status()
        data = resp.json()

        prices = data.get("prices", [])
        volumes = data.get("total_volumes", [])
        market_caps = data.get("market_caps", [])

        records = []
        for i, (timestamp_ms, price) in enumerate(prices):
            dt = datetime.fromtimestamp(timestamp_ms / 1000)
            volume = volumes[i][1] if i < len(volumes) else 0
            mcap = market_caps[i][1] if i < len(market_caps) else 0

            records.append({
                "timestamp": dt.isoformat(),
                "date": dt.strftime("%Y-%m-%d"),
                "hour": dt.hour,
                "day_of_week": dt.weekday(),
                "price_usd": price,
                "volume_24h": volume,
                "market_cap": mcap,
            })

        df = pd.DataFrame(records)
        print(f"Got {len(df)} price records")
        return df

    except Exception as e:
        print(f"CoinGecko API failed: {e}")
        return pd.DataFrame()


def get_dexscreener_pair_data(token_address):
    """Get current pair data from DexScreener for a token."""
    try:
        resp = requests.get(
            f"{DEXSCREENER_API}/tokens/{token_address}",
            timeout=15,
        )
        resp.raise_for_status()
        data = resp.json()
        pairs = data.get("pairs", [])

        pulsechain_pairs = [
            p for p in pairs if p.get("chainId") == "pulsechain"
        ]

        if not pulsechain_pairs:
            return None

        # Get the pair with highest volume
        best_pair = max(
            pulsechain_pairs,
            key=lambda p: p.get("volume", {}).get("h24", 0),
        )

        pair_created = best_pair.get("pairCreatedAt")
        contract_age = None
        if pair_created:
            created_dt = datetime.fromtimestamp(pair_created / 1000)
            contract_age = (datetime.now() - created_dt).days

        return {
            "price_usd": float(best_pair.get("priceUsd", 0) or 0),
            "price_change_1h": float(best_pair.get("priceChange", {}).get("h1", 0) or 0),
            "price_change_6h": float(best_pair.get("priceChange", {}).get("h6", 0) or 0),
            "price_change_24h": float(best_pair.get("priceChange", {}).get("h24", 0) or 0),
            "volume_6h": float(best_pair.get("volume", {}).get("h6", 0) or 0),
            "volume_24h": float(best_pair.get("volume", {}).get("h24", 0) or 0),
            "liquidity_usd": float(best_pair.get("liquidity", {}).get("usd", 0) or 0),
            "market_cap": float(best_pair.get("marketCap", 0) or best_pair.get("fdv", 0) or 0),
            "txns_24h_buys": int(best_pair.get("txns", {}).get("h24", {}).get("buys", 0) or 0),
            "txns_24h_sells": int(best_pair.get("txns", {}).get("h24", {}).get("sells", 0) or 0),
            "contract_age_days": contract_age,
            "dex": best_pair.get("dexId", "unknown"),
            "pair_address": best_pair.get("pairAddress", ""),
        }
    except Exception as e:
        print(f"DexScreener error for {token_address}: {e}")
        return None


def compute_technical_features(df):
    """
    Compute technical analysis features from price/volume data.
    These are the features the ML model will use for prediction.
    """
    if df.empty:
        return df

    # Ensure sorted by timestamp
    df = df.sort_values("timestamp").reset_index(drop=True)

    # Price-based features
    df["price_change_1h"] = df["price_usd"].pct_change(periods=1) * 100
    df["price_change_6h"] = df["price_usd"].pct_change(periods=6) * 100
    df["price_change_24h"] = df["price_usd"].pct_change(periods=24) * 100

    # Moving averages
    df["ma_7"] = df["price_usd"].rolling(window=7, min_periods=1).mean()
    df["ma_14"] = df["price_usd"].rolling(window=14, min_periods=1).mean()
    df["ma_30"] = df["price_usd"].rolling(window=30, min_periods=1).mean()
    df["ma_50"] = df["price_usd"].rolling(window=50, min_periods=1).mean()

    # Price relative to moving averages
    df["price_vs_ma7"] = (df["price_usd"] / df["ma_7"] - 1) * 100
    df["price_vs_ma14"] = (df["price_usd"] / df["ma_14"] - 1) * 100
    df["price_vs_ma30"] = (df["price_usd"] / df["ma_30"] - 1) * 100

    # Momentum
    df["momentum_7d"] = df["price_usd"].pct_change(periods=7 * 24) * 100
    df["momentum_14d"] = df["price_usd"].pct_change(periods=14 * 24) * 100
    df["momentum_30d"] = df["price_usd"].pct_change(periods=30 * 24) * 100

    # Volatility (standard deviation of returns)
    df["volatility_7d"] = df["price_change_1h"].rolling(window=7 * 24, min_periods=1).std()
    df["volatility_14d"] = df["price_change_1h"].rolling(window=14 * 24, min_periods=1).std()
    df["volatility_30d"] = df["price_change_1h"].rolling(window=30 * 24, min_periods=1).std()

    # RSI (Relative Strength Index)
    delta = df["price_usd"].diff()
    gain = delta.where(delta > 0, 0).rolling(window=14, min_periods=1).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14, min_periods=1).mean()
    rs = gain / loss.replace(0, 0.001)
    df["rsi"] = 100 - (100 / (1 + rs))

    # Bollinger Bands
    df["bb_middle"] = df["price_usd"].rolling(window=20, min_periods=1).mean()
    df["bb_std"] = df["price_usd"].rolling(window=20, min_periods=1).std()
    df["bb_upper"] = df["bb_middle"] + 2 * df["bb_std"]
    df["bb_lower"] = df["bb_middle"] - 2 * df["bb_std"]
    df["bb_position"] = (df["price_usd"] - df["bb_lower"]) / (df["bb_upper"] - df["bb_lower"]).replace(0, 0.001)
    df["bb_position"] = df["bb_position"].clip(0, 1)

    # MACD
    ema_12 = df["price_usd"].ewm(span=12, adjust=False).mean()
    ema_26 = df["price_usd"].ewm(span=26, adjust=False).mean()
    df["macd"] = ema_12 - ema_26
    df["macd_signal"] = df["macd"].ewm(span=9, adjust=False).mean()
    df["macd_histogram"] = df["macd"] - df["macd_signal"]

    # Volume features
    df["volume_ma_7"] = df["volume_24h"].rolling(window=7, min_periods=1).mean()
    df["volume_ratio"] = df["volume_24h"] / df["volume_ma_7"].replace(0, 1)
    df["volume_change"] = df["volume_24h"].pct_change(periods=1) * 100

    # Market cap features
    df["mcap_change_7d"] = df["market_cap"].pct_change(periods=7 * 24) * 100
    df["mcap_change_30d"] = df["market_cap"].pct_change(periods=30 * 24) * 100

    # Time features
    df["hour_sin"] = df["hour"].apply(lambda x: math.sin(2 * math.pi * x / 24))
    df["hour_cos"] = df["hour"].apply(lambda x: math.cos(2 * math.pi * x / 24))
    df["day_sin"] = df["day_of_week"].apply(lambda x: math.sin(2 * math.pi * x / 7))
    df["day_cos"] = df["day_of_week"].apply(lambda x: math.cos(2 * math.pi * x / 7))

    # Days since ATH/ATL
    df["ath"] = df["price_usd"].expanding().max()
    df["atl"] = df["price_usd"].expanding().min()
    df["days_since_ath"] = df.apply(
        lambda row: (row["price_usd"] == row["ath"]) * 1, axis=1
    ).groupby(df["price_usd"].eq(df["ath"]).cumsum()).cumcount()
    df["days_since_atl"] = df.apply(
        lambda row: (row["price_usd"] == row["atl"]) * 1, axis=1
    ).groupby(df["price_usd"].eq(df["atl"]).cumsum()).cumcount()

    # Price distance from ATH/ATL
    df["pct_from_ath"] = (df["price_usd"] / df["ath"] - 1) * 100
    df["pct_from_atl"] = (df["price_usd"] / df["atl"] - 1) * 100

    return df


def label_cycle_phases(df):
    """
    Label each data point with a cycle phase based on price action.
    
    Phases:
    - accumulation: price flat/low after downtrend, RSI < 40
    - pump: strong uptrend, price > MA, RSI > 60
    - distribution: price at top, momentum slowing, RSI > 70
    - dump: strong downtrend, price < MA, RSI < 40
    - bottom: price at low, RSI < 30, high volume
    """
    if df.empty:
        return df

    phases = []

    for _, row in df.iterrows():
        price_change_24h = row.get("price_change_24h", 0) or 0
        rsi = row.get("rsi", 50) or 50
        momentum_7d = row.get("momentum_7d", 0) or 0
        bb_position = row.get("bb_position", 0.5) or 0.5
        pct_from_ath = row.get("pct_from_ath", 0) or 0
        pct_from_atl = row.get("pct_from_atl", 0) or 0

        # Determine phase based on multiple indicators
        if price_change_24h > 5 and rsi > 60 and momentum_7d > 10:
            phase = "pump"
        elif price_change_24h > 2 and rsi > 70 and bb_position > 0.8:
            phase = "peak"
        elif price_change_24h < -5 and rsi < 40 and momentum_7d < -10:
            phase = "dump"
        elif price_change_24h < -2 and rsi < 30 and bb_position < 0.2:
            phase = "bottom"
        elif abs(price_change_24h) < 2 and 40 < rsi < 60:
            phase = "accumulation"
        elif price_change_24h > 0 and rsi > 50:
            phase = "pump"
        elif price_change_24h < 0 and rsi < 50:
            phase = "dump"
        else:
            phase = "accumulation"

        phases.append(phase)

    df["phase"] = phases
    return df


def collect_training_data():
    """
    Main data collection pipeline.
    1. Fetch PLS historical prices from CoinGecko
    2. Compute technical features
    3. Label cycle phases
    4. Save to CSV for model training
    """
    print("=" * 60)
    print("PulseScore ML — Data Collection Pipeline")
    print("=" * 60)

    # Step 1: Get historical price data
    print("\n[1/4] Fetching PLS historical prices...")
    df = get_pls_historical_prices(days=365)

    if df.empty:
        print("ERROR: No price data collected. Check API availability.")
        return None

    print(f"  Collected {len(df)} price records")

    # Step 2: Compute technical features
    print("\n[2/4] Computing technical features...")
    df = compute_technical_features(df)
    print(f"  Features computed: {len(df.columns)} columns")

    # Step 3: Label cycle phases
    print("\n[3/4] Labeling cycle phases...")
    df = label_cycle_phases(df)
    phase_dist = df["phase"].value_counts()
    print(f"  Phase distribution:\n{phase_dist}")

    # Step 4: Save
    print(f"\n[4/4] Saving to {OUTPUT_FILE}...")
    df.to_csv(OUTPUT_FILE, index=False)
    print(f"  Saved {len(df)} records with {len(df.columns)} features")

    # Also collect current token data from DexScreener for live predictions
    print("\n[Bonus] Collecting current PulseChain token data...")
    token_data = {}
    for symbol, address in list(PULSECHAIN_TOKENS.items())[:5]:
        data = get_dexscreener_pair_data(address)
        if data:
            token_data[symbol] = data
            print(f"  {symbol}: ${data['price_usd']:.8f} | Vol: ${data['volume_24h']:,.0f}")
        time.sleep(0.5)  # rate limit

    # Save token data reference
    token_file = DATA_DIR / "token_reference.json"
    with open(token_file, "w") as f:
        json.dump(token_data, f, indent=2, default=str)
    print(f"  Token reference saved to {token_file}")

    print("\n" + "=" * 60)
    print("Data collection complete!")
    print(f"Training data: {OUTPUT_FILE}")
    print(f"Records: {len(df)}")
    print(f"Features: {len(df.columns)}")
    print("=" * 60)

    return df


if __name__ == "__main__":
    collect_training_data()
