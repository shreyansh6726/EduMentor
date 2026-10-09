"""Train and evaluate the EduMentor dropout-risk model.

The production prediction point for this pipeline is after the first semester.
Second-semester academic features are intentionally excluded because they are
not available at that point.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import joblib
import pandas as pd
import shap
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from ucimlrepo import fetch_ucirepo

RANDOM_STATE = 42
TARGET_NAME = "Target"
CLASS_NAMES = ["Dropout", "Enrolled", "Graduate"]
PREDICTION_POINT = "after_first_semester"

ARTIFACT_DIR = Path(__file__).resolve().parent / "artifacts"

CATEGORICAL_FEATURES = [
    "Marital Status",
    "Application mode",
    "Course",
    "Daytime/evening attendance",
    "Previous qualification",
    "Nacionality",
    "Mother's qualification",
    "Father's qualification",
    "Mother's occupation",
    "Father's occupation",
    "Gender",
    "Displaced",
    "Educational special needs",
    "Debtor",
    "Tuition fees up to date",
    "Scholarship holder",
    "International",
]

NUMERICAL_FEATURES = [
    "Application order",
    "Previous qualification (grade)",
    "Admission grade",
    "Age at enrollment",
    "Curricular units 1st sem (credited)",
    "Curricular units 1st sem (enrolled)",
    "Curricular units 1st sem (evaluations)",
    "Curricular units 1st sem (approved)",
    "Curricular units 1st sem (grade)",
    "Curricular units 1st sem (without evaluations)",
    "Unemployment rate",
    "Inflation rate",
    "GDP",
]

SECOND_SEMESTER_FEATURES = [
    "Curricular units 2nd sem (credited)",
    "Curricular units 2nd sem (enrolled)",
    "Curricular units 2nd sem (evaluations)",
    "Curricular units 2nd sem (approved)",
    "Curricular units 2nd sem (grade)",
    "Curricular units 2nd sem (without evaluations)",
]

FEATURE_NAMES = CATEGORICAL_FEATURES + NUMERICAL_FEATURES


def load_dataset() -> tuple[pd.DataFrame, pd.Series]:
    """Load the UCI dataset and validate the leakage-safe feature contract."""
    dataset = fetch_ucirepo(id=697)
    features = dataset.data.features.copy()
    targets = dataset.data.targets.squeeze("columns").rename(TARGET_NAME)

    missing = sorted(set(FEATURE_NAMES) - set(features.columns))
    if missing:
        raise ValueError(f"Required feature columns are missing: {missing}")

    present_future_features = sorted(
        set(SECOND_SEMESTER_FEATURES).intersection(features.columns)
    )
    if len(present_future_features) != len(SECOND_SEMESTER_FEATURES):
        raise ValueError("The dataset schema does not contain all second-semester fields.")

    X = features[FEATURE_NAMES].copy()
    y = targets.map({name: index for index, name in enumerate(CLASS_NAMES)})
    if y.isna().any():
        raise ValueError("Target contains values outside the configured class mapping.")
    y = y.astype(int)

    if X.isna().any().any() or y.isna().any():
        missing_counts = X.isna().sum()
        missing_counts = missing_counts[missing_counts > 0].to_dict()
        raise ValueError(f"Missing values must be handled before training: {missing_counts}")

    return X, y


def build_preprocessor() -> ColumnTransformer:
    """Build the single preprocessing contract shared by all models."""
    return ColumnTransformer(
        transformers=[
            (
                "categorical",
                OneHotEncoder(handle_unknown="ignore"),
                CATEGORICAL_FEATURES,
            ),
            ("numerical", StandardScaler(), NUMERICAL_FEATURES),
        ],
        remainder="drop",
    )


def build_pipeline() -> Pipeline:
    return Pipeline(
        steps=[
            ("preprocessor", build_preprocessor()),
            (
                "model",
                LogisticRegression(
                    max_iter=2000,
                    class_weight="balanced",
                    random_state=RANDOM_STATE,
                ),
            ),
        ]
    )


def evaluate_model(
    pipeline: Pipeline, X_test: pd.DataFrame, y_test: pd.Series
) -> dict[str, Any]:
    predictions = pipeline.predict(X_test)
    report = classification_report(
        y_test,
        predictions,
        labels=list(range(len(CLASS_NAMES))),
        target_names=CLASS_NAMES,
        output_dict=True,
        zero_division=0,
    )
    return {
        "accuracy": float(accuracy_score(y_test, predictions)),
        "weighted_precision": float(
            precision_score(y_test, predictions, average="weighted", zero_division=0)
        ),
        "weighted_recall": float(
            recall_score(y_test, predictions, average="weighted", zero_division=0)
        ),
        "weighted_f1": float(
            f1_score(y_test, predictions, average="weighted", zero_division=0)
        ),
        "dropout_precision": float(report["Dropout"]["precision"]),
        "dropout_recall": float(report["Dropout"]["recall"]),
        "dropout_f1": float(report["Dropout"]["f1-score"]),
        "classification_report": report,
        "confusion_matrix": confusion_matrix(
            y_test, predictions, labels=list(range(len(CLASS_NAMES)))
        ).tolist(),
    }


def save_shap_artifacts(
    pipeline: Pipeline, X_test: pd.DataFrame, output_dir: Path
) -> None:
    """Persist a SHAP explainer and global feature contributions."""
    preprocessor = pipeline.named_steps["preprocessor"]
    model = pipeline.named_steps["model"]
    transformed_test = preprocessor.transform(X_test)
    feature_names = preprocessor.get_feature_names_out().tolist()
    background = transformed_test[: min(100, transformed_test.shape[0])]
    explainer = shap.Explainer(model, background, feature_names=feature_names)
    shap_values = explainer(transformed_test[: min(100, transformed_test.shape[0])])

    values = shap_values.values
    if values.ndim == 3:
        values = values.mean(axis=2)
    mean_abs_values = abs(values).mean(axis=0)
    ranked_features = sorted(
        (
            {
                "feature": feature_name,
                "mean_abs_shap": float(contribution),
            }
            for feature_name, contribution in zip(feature_names, mean_abs_values)
        ),
        key=lambda item: item["mean_abs_shap"],
        reverse=True,
    )

    joblib.dump(explainer, output_dir / "shap_explainer.joblib")
    save_json(
        output_dir / "shap_global_importance.json",
        {"sample_size": int(len(shap_values)), "features": ranked_features},
    )
    save_json(
        output_dir / "transformed_feature_schema.json",
        {"features": feature_names},
    )


def save_json(path: Path, payload: dict[str, Any]) -> None:
    path.write_text(json.dumps(payload, indent=2), encoding="utf-8")


def main() -> None:
    X, y = load_dataset()
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=RANDOM_STATE,
        stratify=y,
    )

    selected_pipeline = build_pipeline()
    selected_pipeline.fit(X_train, y_train)
    test_metrics = evaluate_model(selected_pipeline, X_test, y_test)

    ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(selected_pipeline, ARTIFACT_DIR / "dropout_risk_model.joblib")
    save_shap_artifacts(selected_pipeline, X_test, ARTIFACT_DIR)
    save_json(
        ARTIFACT_DIR / "test_metrics.json",
        {
            "prediction_point": PREDICTION_POINT,
            "model": "Logistic Regression",
            "random_state": RANDOM_STATE,
            "test_metrics": test_metrics,
        },
    )
    save_json(
        ARTIFACT_DIR / "feature_schema.json",
        {
            "prediction_point": PREDICTION_POINT,
            "features": FEATURE_NAMES,
            "categorical_features": CATEGORICAL_FEATURES,
            "numerical_features": NUMERICAL_FEATURES,
            "excluded_future_features": SECOND_SEMESTER_FEATURES,
            "classes": CLASS_NAMES,
        },
    )

    print("Model: Logistic Regression")
    print(json.dumps(test_metrics, indent=2))
    print(f"\nArtifacts saved to: {ARTIFACT_DIR}")


if __name__ == "__main__":
    main()
