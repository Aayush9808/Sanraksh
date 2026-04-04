# ML Models Directory

This directory stores trained machine learning models used by the Sanraksh platform.

## Current Models

### 1. `pricing_model.pkl`
- **Purpose:** Dynamic premium calculation
- **Algorithm:** XGBoost Regressor
- **Training Data:** 5000+ synthetic samples
- **Features:** risk_score, season, historical_claims, tenure, fraud_score
- **Performance:** MAE < ₹3, R² > 0.85
- **Last Trained:** 2026-03-08
- **Update Frequency:** Weekly

### 2. `fraud_model.pkl` (Coming Soon)
- **Purpose:** Fraud detection in claims
- **Algorithm:** Isolation Forest
- **Features:** claim_frequency, amount, location, peer_data

### 3. `risk_model.pkl` (Coming Soon)
- **Purpose:** Risk zone classification
- **Algorithm:** Random Forest
- **Features:** weather_history, traffic_patterns, disruption_frequency

## Model Versioning

Models are versioned with timestamps:
```
pricing_model_v20260308.pkl  # Versioned
pricing_model.pkl            # Symlink to latest
```

## Loading Models

```python
import joblib

# Load pricing model
pricing_model = joblib.load('app/ml_models/pricing_model.pkl')
feature_names = joblib.load('app/ml_models/pricing_features.pkl')

# Make prediction
input_data = pd.DataFrame([{
    'risk_score': 0.6,
    'season_monsoon': 1,
    'historical_claims': 2,
    ...
}])
predicted_premium = pricing_model.predict(input_data)[0]
```

## Training

See `archive/ml-training/notebooks/` for training scripts.

## Model Files

`.pkl` files are stored in Git LFS. To download:
```bash
git lfs pull
```

**Note:** Models are generated during training and should not be manually edited.
