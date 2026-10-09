import pandas as pd
from backend.ml.model_loader import get_preprocessor
from backend.models.schemas import PREDICTION_REQUIRED_FIELDS
from backend.utils.logger import get_logger

logger = get_logger(__name__)

def process_features(raw_data: dict):
    missing = [f for f in PREDICTION_REQUIRED_FIELDS if f not in raw_data]
    if missing:
        raise ValueError(f"Missing required fields: {', '.join(missing)}")
    
    preprocessor = get_preprocessor()
    df = pd.DataFrame([{k: raw_data[k] for k in PREDICTION_REQUIRED_FIELDS}])
    try:
        processed_data = preprocessor.transform(df)
        return processed_data
    except Exception as e:
        logger.error(f'Preprocessing error: {e}')
        raise ValueError(f'Invalid feature values: {e}')
