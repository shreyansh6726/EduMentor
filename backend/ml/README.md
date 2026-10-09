# EduMentor ML pipeline

This pipeline trains a **Logistic Regression** dropout-risk model and produces
**SHAP explanations** for the prediction point **after the first semester**.
The six second-semester academic variables are excluded because they are not
available at that point in an early-warning workflow.

## Setup

From the project root, create a virtual environment and install the pinned
project dependencies:

```powershell
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

## Train

```powershell
.\.venv\Scripts\python.exe ml\train.py
```

The script:

1. Downloads the UCI dataset through `ucimlrepo`.
2. Validates the feature contract and missing-value state.
3. Splits the data before fitting preprocessing.
4. Fits Logistic Regression with class balancing.
5. Evaluates the model on a held-out stratified test set.
6. Builds a SHAP explainer and saves global feature contributions.
7. Saves the complete preprocessing/model pipeline and metadata in
   `ml\artifacts\`.

The saved `dropout_risk_model.joblib` contains preprocessing and Logistic
Regression together, so inference does not need to duplicate feature encoding
or scaling logic. The separate `shap_explainer.joblib` uses the same transformed
feature space for explanations.
