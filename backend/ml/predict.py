"""Run one prediction from JSON on stdin for the Express API."""

from __future__ import annotations

import json
import sys
from pathlib import Path

import joblib
import pandas as pd

ROOT = Path(__file__).resolve().parent
ARTIFACTS = ROOT / "artifacts"
MODEL_VERSION = "logistic-regression-after-first-semester-v1"
CLASS_NAMES = ["Dropout", "Enrolled", "Graduate"]


def main() -> None:
    features = json.load(sys.stdin)
    schema = json.loads((ARTIFACTS / "feature_schema.json").read_text())
    missing = [name for name in schema["features"] if name not in features]
    if missing:
        raise ValueError(f"Missing model features: {missing}")

    model = joblib.load(ARTIFACTS / "dropout_risk_model.joblib")
    explainer = joblib.load(ARTIFACTS / "shap_explainer.joblib")
    row = pd.DataFrame([{name: features[name] for name in schema["features"]}])
    probabilities = model.predict_proba(row)[0]
    predicted_index = int(probabilities.argmax())
    transformed = model.named_steps["preprocessor"].transform(row)
    shap_values = explainer(transformed).values
    contributions = shap_values[0, :, predicted_index]
    transformed_schema = json.loads(
        (ARTIFACTS / "transformed_feature_schema.json").read_text()
    )

    ranked = sorted(
        zip(transformed_schema["features"], contributions),
        key=lambda item: abs(float(item[1])),
        reverse=True,
    )[:5]
    explanation = [
        {
            "feature": feature,
            "contribution": float(value),
            "direction": (
                "Positive" if value > 0 else "Negative" if value < 0 else "Neutral"
            ),
        }
        for feature, value in ranked
    ]
    print(
        json.dumps(
            {
                "model": "Logistic Regression",
                "modelVersion": MODEL_VERSION,
                "predictedClass": CLASS_NAMES[predicted_index],
                "riskProbability": float(probabilities[0]),
                "shapExplanation": explanation,
            }
        )
    )


if __name__ == "__main__":
    main()