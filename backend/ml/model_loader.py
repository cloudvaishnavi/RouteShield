import joblib
import xgboost as xgb
import os
import sys
import sklearn.compose._column_transformer

# Backward compatibility patch for scikit-learn version differences
if not hasattr(sklearn.compose._column_transformer, '_RemainderColsList'):
    class _RemainderColsList(list):
        pass
    sklearn.compose._column_transformer._RemainderColsList = _RemainderColsList

from backend.config.config import Config
from backend.utils.logger import get_logger

logger = get_logger(__name__)

class ModelLoader:
    _instance = None
    def __init__(self):
        self.model = None
        self.preprocessor = None
        self.is_loaded = False
        
    @classmethod
    def get_instance(cls):
        if cls._instance is None: cls._instance = cls()
        return cls._instance
        
    def load(self):
        if self.is_loaded: return
        mp = Config.MODEL_PATH
        pp = Config.PREPROCESSOR_PATH
        if not os.path.exists(mp) or os.path.getsize(mp) == 0:
            raise FileNotFoundError(f'Model file not found or empty: {mp}')
        if not os.path.exists(pp) or os.path.getsize(pp) == 0:
            raise FileNotFoundError(f'Preprocessor file not found or empty: {pp}')
        try:
            self.model = xgb.Booster()
            self.model.load_model(mp)
            self.preprocessor = joblib.load(pp)
            self.is_loaded = True
            logger.info('ML artifacts loaded.')
        except Exception as e:
            logger.error(f'Failed to load ML artifacts: {e}')
            raise

def get_model():
    inst = ModelLoader.get_instance()
    if not inst.is_loaded: inst.load()
    return inst.model

def get_preprocessor():
    inst = ModelLoader.get_instance()
    if not inst.is_loaded: inst.load()
    return inst.preprocessor
