"""
Train the PulseScore ML model.

Uses historical PLS price data + engineered features to train
a Random Forest classifier for cycle phase prediction.

Phases: accumulation, pump, peak, dump, bottom

Usage:
    python train.py
"""

import json
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import classification_report, confusion_matrix

from data.collector import collect_training_data
from features import prepare_features, add_derived_features, FEATURE_COLUMNS

DATA_DIR = Path(__file__).parent / "data"
MODEL_DIR = Path(__file__).parent / "models"
DATA_FILE = DATA_DIR / "training_data.csv"
MODEL_FILE = MODEL_DIR / "cycle_model.pkl"
SCALER_FILE = MODEL_DIR / "scaler.pkl"
ENCODER_FILE = MODEL_DIR / "label_encoder.pkl"
METRICS_FILE = MODEL_DIR / "metrics.json"

# Training params
TEST_SIZE = 0.2
RANDOM_STATE = 42
N_ESTIMATORS = 200
MAX_DEPTH = 15


def train_model():
    """Train the cycle phase prediction model."""

    print("=" * 60)
    print("PulseScore ML — Model Training")
    print("=" * 60)

    # Step 1: Collect or load data
    print("\n[1/5] Loading training data...")
    if DATA_FILE.exists():
        df = pd.read_csv(DATA_FILE)
        print(f"  Loaded {len(df)} records from cache")
    else:
        print("  No cached data. Collecting...")
        df = collect_training_data()
        if df is None or df.empty:
            print("ERROR: Could not collect training data")
            return None

    # Step 2: Add derived features
    print("\n[2/5] Engineering features...")
    df = add_derived_features(df)
    feature_df = prepare_features(df)

    # Drop rows with missing labels
    df = df.dropna(subset=["phase"])
    feature_df = feature_df.loc[df.index]

    print(f"  Feature matrix: {feature_df.shape}")
    print(f"  Features: {len(FEATURE_COLUMNS)}")

    # Step 3: Encode labels
    print("\n[3/5] Encoding labels...")
    le = LabelEncoder()
    y = le.fit_transform(df["phase"])
    phase_names = list(le.classes_)
    print(f"  Phases: {phase_names}")
    print(f"  Distribution: {dict(zip(phase_names, np.bincount(y)))}")

    X = feature_df.values

    # Step 4: Train/test split
    print(f"\n[4/5] Training model (test_size={TEST_SIZE})...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y
    )
    print(f"  Train: {len(X_train)} | Test: {len(X_test)}")

    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Train Random Forest
    print(f"\n  Training RandomForest (n_estimators={N_ESTIMATORS})...")
    model = RandomForestClassifier(
        n_estimators=N_ESTIMATORS,
        max_depth=MAX_DEPTH,
        min_samples_split=5,
        min_samples_leaf=2,
        max_features="sqrt",
        class_weight="balanced",
        random_state=RANDOM_STATE,
        n_jobs=-1,
    )
    model.fit(X_train_scaled, y_train)

    # Cross-validation
    cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=5, scoring="accuracy")
    print(f"  CV Accuracy: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")

    # Test set evaluation
    test_accuracy = model.score(X_test_scaled, y_test)
    print(f"  Test Accuracy: {test_accuracy:.4f}")

    # Classification report
    y_pred = model.predict(X_test_scaled)
    report = classification_report(y_test, y_pred, target_names=phase_names, output_dict=True)
    print(f"\n  Classification Report:")
    print(classification_report(y_test, y_pred, target_names=phase_names))

    # Feature importance
    importance = model.feature_importances_
    feature_ranking = sorted(
        zip(FEATURE_COLUMNS, importance),
        key=lambda x: x[1],
        reverse=True,
    )
    print(f"\n  Top 10 Features:")
    for name, imp in feature_ranking[:10]:
        print(f"    {name}: {imp:.4f}")

    # Step 5: Save
    print(f"\n[5/5] Saving model...")
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    joblib.dump(model, MODEL_FILE)
    joblib.dump(scaler, SCALER_FILE)
    joblib.dump(le, ENCODER_FILE)

    metrics = {
        "accuracy": test_accuracy,
        "cv_mean": cv_scores.mean(),
        "cv_std": cv_scores.std(),
        "n_train": len(X_train),
        "n_test": len(X_test),
        "n_features": len(FEATURE_COLUMNS),
        "phases": phase_names,
        "classification_report": report,
        "feature_importance": {name: float(imp) for name, imp in feature_ranking[:20]},
        "model_type": "RandomForestClassifier",
        "n_estimators": N_ESTIMATORS,
        "max_depth": MAX_DEPTH,
    }
    with open(METRICS_FILE, "w") as f:
        json.dump(metrics, f, indent=2, default=str)

    print(f"  Model saved: {MODEL_FILE}")
    print(f"  Scaler saved: {SCALER_FILE}")
    print(f"  Encoder saved: {ENCODER_FILE}")
    print(f"  Metrics saved: {METRICS_FILE}")

    print("\n" + "=" * 60)
    print(f"Training complete! Accuracy: {test_accuracy:.4f}")
    print("=" * 60)

    return model, scaler, le


if __name__ == "__main__":
    train_model()
