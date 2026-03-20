# GigArmor ML Training

This folder contains Jupyter notebooks for training machine learning models used in the GigArmor platform.

## Notebooks

### 1. `pricing_model.ipynb`
- **Purpose:** Train dynamic pricing model
- **Algorithm:** XGBoost Regressor
- **Features:** Risk score, season, historical claims, tenure, fraud score
- **Output:** `pricing_model.pkl`

### 2. `fraud_detection.ipynb` (To be created)
- **Purpose:** Train fraud detection model
- **Algorithm:** Isolation Forest
- **Features:** Claim frequency, amount, location, peer data
- **Output:** `fraud_model.pkl`

### 3. `risk_assessment.ipynb` (To be created)
- **Purpose:** Train risk zone classification
- **Algorithm:** Random Forest
- **Features:** Weather history, traffic patterns, disruption frequency
- **Output:** `risk_model.pkl`

## Setup

```bash
# Install dependencies
pip install jupyter pandas numpy scikit-learn xgboost matplotlib seaborn joblib

# Start Jupyter
jupyter notebook
```

## Data

The `data/` folder contains:
- `synthetic_users.csv` - Synthetic user data for training
- `historical_weather.csv` - Weather pattern data
- `mumbai_zones.geojson` - Geographic zone boundaries

## Model Outputs

Trained models are saved to `../backend/app/ml_models/` for use by the API.

## Training Process

1. Generate synthetic data (until we have real data)
2. Feature engineering
3. Train/test split
4. Model training with hyperparameter tuning
5. Evaluation and validation
6. Save model artifacts

## Model Versioning

Models are versioned with timestamps:
- `pricing_model_v1.pkl`
- `pricing_model_v2.pkl`

Latest version is symlinked as `pricing_model.pkl`.
