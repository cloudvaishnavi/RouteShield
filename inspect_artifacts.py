# inspect_artifacts.py  (read-only; run from logistics-disruption-agent/)
import json, sys, joblib, sklearn, xgboost, pandas as pd

print("python", sys.version.split()[0], "| sklearn", sklearn.__version__,
      "| xgboost", xgboost.__version__, "| pandas", pd.__version__)

# Model JSON
m = json.load(open("model/routesheild_xgboost_model.json"))
lm = m["learner"]
print("\n== MODEL ==")
print("objective:", lm["objective"])
print("learner_model_param:", lm["learner_model_param"])
print("feature_names:", lm.get("feature_names"))
print("feature_types:", lm.get("feature_types"))
print("attributes:", lm.get("attributes"))

import xgboost as xgb
b = xgb.Booster(); b.load_model("model/routesheild_xgboost_model.json")
print("booster.feature_names:", b.feature_names, "| num_features:", b.num_features())

# Preprocessor
print("\n== PREPROCESSOR ==")
p = joblib.load("model/routesheild_preprocessor.joblib")
print("type:", type(p))
print(p)
for a in ("feature_names_in_", "n_features_in_"):
    print(a, getattr(p, a, "n/a"))
try:
    print("output names:", list(p.get_feature_names_out()))
except Exception as e:
    print("get_feature_names_out failed:", e)
for name, t, cols in getattr(p, "transformers_", []):
    print("\ntransformer:", name, "| cols:", cols)
    print(t)
    for a in ("categories_", "mean_", "scale_", "feature_names_in_", "handle_unknown"):
        if hasattr(t, a): print("  ", a, getattr(t, a))
    if hasattr(t, "named_steps"):
        for sn, st in t.named_steps.items():
            print("  step", sn, st)
            for a in ("categories_", "mean_", "scale_", "statistics_"):
                if hasattr(st, a): print("    ", a, getattr(st, a))

# Data
print("\n== DATA ==")
for f in ("data/raw/logistics_weather.csv", "data/processed/prediction_data.csv"):
    d = pd.read_csv(f)
    print("\n", f, d.shape)
    print(d.dtypes)
    print(d.head(3).to_string())