from backend.ml.feature_processor import process_features
from backend.ml.predictor import predict

def execute_prediction(raw_data: dict):
    processed = process_features(raw_data)
    return predict(processed)
