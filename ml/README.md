# PulseScore ML Pipeline

Machine learning backend for PulseChain cycle phase prediction.
Trained on historical PulseChain data with 57 features.

## Project Structure

```
ml/
├── api.py              # FastAPI server
├── train.py            # Model training script
├── features.py         # Feature engineering
├── data/
│   ├── collector.py    # Data collection from DexScreener/PulseChain
│   └── pulsechain.csv  # Historical data cache
├── models/
│   └── cycle_model.pkl # Trained model
├── requirements.txt
└── README.md
```

## Setup

```bash
cd ml
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Train

```bash
python train.py
```

## Run API

```bash
python api.py
# API available at http://127.0.0.1:8000
```

## API Endpoints

- `GET /health` — Model status
- `POST /predict` — Single token prediction
- `POST /predict/batch` — Batch predictions
- `GET /model/info` — Model metadata
