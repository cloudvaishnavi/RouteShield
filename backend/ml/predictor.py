import xgboost as xgb
from backend.ml.model_loader import get_model, get_preprocessor
from backend.utils.logger import get_logger

logger = get_logger(__name__)

def predict(processed_features):
    model = get_model()
    dmatrix = xgb.DMatrix(processed_features)
    
    raw_output = model.predict(dmatrix)
    risk_score = float(raw_output[0])
    prediction = 1 if risk_score > 0.5 else 0
    
    contribs = model.predict(dmatrix, pred_contribs=True)
    feature_contribs = contribs[0][:-1].tolist()
    
    preprocessor = get_preprocessor()
    try:
        feature_names = list(preprocessor.get_feature_names_out())
    except Exception:
        feature_names = [f'feature_{i}' for i in range(len(feature_contribs))]
        
    contrib_dict = []
    for name, score in zip(feature_names, feature_contribs):
        if score != 0:
            contrib_dict.append({
                'feature': name,
                'contribution': float(score),
                'direction': 'increases_risk' if score > 0 else 'decreases_risk'
            })
            
    contrib_dict.sort(key=lambda x: abs(x['contribution']), reverse=True)
    
    return {
        'prediction': prediction,
        'risk_score': risk_score,
        'confidence': max(risk_score, 1 - risk_score),
        'raw_output': raw_output.tolist(),
        'contributions': contrib_dict
    }
