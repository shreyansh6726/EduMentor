# AGENTS.md

## Project Overview

This project is a MERN-based college student dropout-risk prediction system.

The system is designed to help college management identify students who may be at risk of dropping out early enough for intervention. It should reduce the need for manual inspection of every student and provide an explainable risk assessment.

The project has three major parts:

1. React frontend for student/management interfaces.
2. Node.js + Express + MongoDB backend for application data and prediction requests.
3. Python machine-learning pipeline/model for dropout-risk prediction and SHAP-based explanations.

The current ML development dataset is the UCI "Predict Students' Dropout and Academic Success" dataset.

## Core ML Objective

The prediction target in the UCI dataset is:

- Dropout
- Enrolled
- Graduate

The current development direction is:

- Logistic Regression: baseline model.
- XGBoost: primary candidate.
- Random Forest: optional comparison model.
- SHAP: explanation layer, not a predictive model.

Do not claim that XGBoost is empirically the best model without validation on an adequately sized dataset with reliable labels.

For the current UCI experiment, select the final model based on validation metrics rather than assumption.

Important metrics include:

- Recall
- F1-score
- Precision
- Accuracy

Recall is particularly important because failing to identify an at-risk student can prevent timely intervention.

## Early-Warning Requirement

The system is intended to function as an early-warning system.

A prediction must only use information that would genuinely be available at the defined prediction point.

Feature timing means data availability at the prediction point. It does not mean scheduling a prediction for later.

Before productionizing the model, explicitly define the prediction point, such as:

- At enrollment
- After the first semester

Do not use future information or second-semester information if the prediction is supposed to happen before that information exists.

The six second-semester academic variables in the UCI dataset are:

- Curricular units 2nd sem (credited)
- Curricular units 2nd sem (enrolled)
- Curricular units 2nd sem (evaluations)
- Curricular units 2nd sem (approved)
- Curricular units 2nd sem (grade)
- Curricular units 2nd sem (without evaluations)

These must be excluded when they are not available at the selected prediction point.

## Data and Feature Rules

The model input must be consistent between training and production.

Do not invent new numeric encodings for categorical UCI features.

The frontend should preferably collect human-readable values. The backend/preprocessing layer must convert them into the exact representation expected by the trained model.

The preprocessing pipeline used during training should be persisted and reused during inference whenever possible.

Do not manually recreate preprocessing logic in multiple places.

Avoid data leakage.

Do not use target-derived information or information that becomes available only after the prediction point.

## MongoDB Architecture

Use separate collections for students and prediction history.

### Student Collection

The `Student` collection stores the student's profile and the current feature values required for prediction.

Typical groups include:

- Student identification
- Demographic information
- Academic background
- Admission/application information
- Financial information
- Family/parent information
- First-semester academic information
- Other approved contextual features

The database schema should represent the college's actual input data, not blindly mirror every UCI training column.

The student document should contain the feature vector required by the current production model.

### Prediction Collection

Use a separate `Prediction` collection for prediction events.

Each prediction should store:

- student reference
- model name
- model version
- predicted class
- risk probability
- risk level
- SHAP explanation
- prediction timestamp

Prediction history should not be stored as an ever-growing array inside the student document.

Example history:

- October: 32%
- November: 47%
- December: 71%
- January: 64%

This allows the system to track how risk changes over time.

## Prediction Flow

Production prediction flow:

1. Management/frontend selects a student.
2. Backend retrieves the student's current prediction features.
3. Backend validates required fields.
4. Backend applies the same preprocessing used during model training.
5. Backend sends the feature vector to the selected trained model.
6. Model returns the predicted class/probabilities.
7. SHAP generates an explanation for the prediction when supported by the selected model.
8. Backend converts the result into a human-readable risk response.
9. Backend stores the prediction event in the `Prediction` collection.
10. Frontend displays the result and explanation.

Do not run every available ML model for every production request.

Models should be compared during development. Once the final production model is selected, production inference should use that model directly.

## Risk Levels

Risk levels should be derived from the model probability and a documented threshold policy.

Do not invent arbitrary thresholds without documenting and validating them.

A possible application-level representation is:

- Low
- Medium
- High

The exact thresholds should be configurable and validated against the project's validation results.

## SHAP Rules

SHAP is an explanation layer.

It does not improve model accuracy and must not be described as a predictive algorithm.

For each prediction, explanations should identify the features that contributed most to the result.

Backend/API responses should prefer understandable descriptions such as:

- Low academic performance increased risk.
- Poor attendance increased risk.
- Financial difficulty increased risk.

Avoid exposing raw SHAP values as the primary user-facing explanation.

SHAP explanations should correspond to the actual model prediction and model version used for that prediction.

## Model Versioning

Every stored prediction must identify the model version used.

Recommended fields:

- `model`
- `modelVersion`
- `predictedAt`

If the model or preprocessing pipeline changes, create a new model version rather than silently replacing the meaning of previous predictions.

Historical predictions must remain interpretable.

## Backend Rules

Use Node.js + Express for the backend.

Use Mongoose for MongoDB access.

Follow the existing backend project's module style. If the project uses CommonJS, continue using:

```js
const express = require("express");
```

Keep routes, controllers, models, services, and utilities separated when the project structure supports it.

Validate request bodies before making prediction calls.

Do not trust frontend-provided prediction results. Prediction results must be generated by the backend/model service.

Do not expose database credentials, model-service secrets, JWT secrets, or API keys to the frontend.

Use environment variables for secrets and deployment-specific configuration.

## API Design

Keep prediction-related endpoints explicit.

Example structure:

```text
POST /api/students
GET  /api/students
GET  /api/students/:id
PUT  /api/students/:id

POST /api/predictions/:studentId
GET  /api/predictions/:studentId
GET  /api/predictions/:studentId/latest
```

Use appropriate HTTP status codes and return consistent JSON responses.

Prediction responses should contain enough information for the frontend to render:

- predicted class
- risk level
- probability
- model version
- explanation
- prediction timestamp

## Frontend Rules

Use React for the frontend.

The frontend should:

- collect student information
- validate user input
- display student records
- request predictions from the backend
- display risk level and probability
- display explainable factors
- display prediction history

Do not place ML inference logic in the React frontend.

Do not hardcode model predictions.

Do not expose Python model files, database credentials, or backend secrets in the frontend bundle.

## ML Development Rules

Use Python for model training and evaluation.

The UCI dataset is primarily a development/training dataset. Do not assume that its performance automatically represents real-world college performance.

For model evaluation:

- use a stratified train/test split where appropriate
- use validation for model comparison
- report relevant classification metrics
- inspect confusion matrices
- check class imbalance
- avoid leakage
- document preprocessing
- save the final preprocessing/model artifacts

For multiclass evaluation, weighted metrics can be reported, but the dropout class should receive special attention because it is the intervention-critical class.

Do not select a model solely because it has the highest accuracy.

## XGBoost Guidance

When XGBoost is used, prefer a conservative configuration appropriate for an early-warning classification problem.

Avoid unnecessarily deep trees.

Use regularization and class weighting where justified.

Probability calibration may be applied if reliable risk probabilities are required.

Do not assume that a more complex model is automatically better than Logistic Regression.

For the current small/demo dataset, Logistic Regression is a lightweight and valid baseline. XGBoost should be treated as the primary candidate for a stronger production model, subject to actual validation.

## Hardware Expectations

The UCI dataset is small enough for CPU-based training.

GPU is not required for Logistic Regression, Random Forest, or XGBoost on this dataset.

Logistic Regression is generally lighter computationally.

XGBoost may use more CPU during training, but inference should still be fast enough for a normal web application at this project scale.

Do not introduce GPU infrastructure unless actual workload requirements justify it.

## File and Project Organization

A practical structure is:

```text
project-root/
├── client/
│   ├── src/
│   └── package.json
├── server/
│   ├── models/
│   │   ├── Student.js
│   │   └── Prediction.js
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── middleware/
│   ├── utils/
│   ├── server.js
│   └── package.json
├── ml/
│   ├── data/
│   ├── notebooks/
│   ├── training/
│   ├── inference/
│   ├── artifacts/
│   └── requirements.txt
└── README.md
```

The exact structure may be adapted to the existing repository.

Do not reorganize the entire project unnecessarily.

## Database Design Principles

Use stable references between students and predictions.

Recommended relationship:

```text
Student 1 ──────── * Prediction
```

A student can have many prediction records.

Use indexes for fields that are frequently queried, such as:

- student ID
- email
- student reference
- prediction timestamp

Do not duplicate large prediction histories unnecessarily.

## Security

Never commit:

- `.env`
- MongoDB connection strings
- JWT secrets
- API keys
- model-service credentials
- private deployment credentials

Use `.gitignore`.

Validate and sanitize user-controlled input.

Use authentication and authorization for management/admin functionality.

Do not allow arbitrary users to request or modify another student's records.

## Error Handling

Backend errors should be predictable and useful.

Handle:

- missing student
- invalid student data
- missing required features
- model service unavailable
- invalid model response
- database failures
- malformed requests

Do not expose internal stack traces or secrets to production clients.

## Development Workflow

When changing the ML feature set:

1. Update the training data/preprocessing.
2. Retrain the model.
3. Evaluate the new model.
4. Version the model artifact.
5. Update backend feature mapping if necessary.
6. Update MongoDB schema if the required input structure changes.
7. Update frontend forms.
8. Test end-to-end prediction.
9. Verify SHAP explanations.
10. Verify that old prediction records remain interpretable.

When changing only UI behavior, do not modify the ML pipeline unnecessarily.

When changing model behavior, update the model version.

## Testing

At minimum test:

- student creation
- student update
- student retrieval
- prediction request
- prediction storage
- prediction history
- invalid feature handling
- missing student handling
- model-service failure
- SHAP explanation generation
- frontend rendering of risk levels

ML tests should verify that:

- preprocessing produces the expected feature structure
- the model accepts the production feature vector
- prediction probabilities are valid
- the predicted class is valid
- explanations correspond to the prediction

## Important Constraints

Do not:

- claim the model can guarantee whether a student will drop out
- use direct questions about whether a student intends to continue academics as prediction features
- treat marks alone as a measure of seriousness
- use future information in an early-warning prediction
- claim XGBoost is best without validation
- claim SHAP improves prediction accuracy
- run all candidate models on every production request
- put ML inference logic in the frontend
- hardcode categorical encodings independently in the frontend
- store an unbounded prediction history inside every student document
- commit secrets to Git

## Terminology

Use:

- "dropout-risk prediction"
- "early-warning system"
- "at-risk student"
- "prediction probability"
- "risk level"
- "model version"
- "SHAP explanation"
- "prediction history"

Avoid claiming certainty. The model estimates risk; it does not determine a student's future.

## Current Recommended Architecture

```text
React Frontend
      |
      v
Node.js + Express API
      |
      +--------------------+
      |                    |
      v                    v
MongoDB              ML Prediction Service
      |                    |
      |                    v
      |              Preprocessing
      |                    |
      |                    v
      |              Selected Model
      |                    |
      |                    v
      |              SHAP Explanation
      |                    |
      +<-------------------+
             |
             v
      Prediction History
```

The architecture should remain simple enough for a BTech/student project while keeping the ML pipeline separate from the MERN application.

Also, there is a shcema which has been defined at initial stage, it can be modified accordinly as per user request. 

```json
const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },

    gender: {
      type: Number,
      required: true
    },

    ageAtEnrollment: {
      type: Number,
      required: true,
      min: 16
    },

    maritalStatus: {
      type: Number,
      required: true
    },

    nationality: {
      type: Number,
      required: true
    },

    displaced: {
      type: Number,
      required: true
    },

    international: {
      type: Number,
      required: true
    },

    educationalSpecialNeeds: {
      type: Number,
      required: true
    },

    previousQualification: {
      type: Number,
      required: true
    },

    previousQualificationGrade: {
      type: Number,
      required: true
    },

    applicationMode: {
      type: Number,
      required: true
    },

    applicationOrder: {
      type: Number,
      required: true
    },

    course: {
      type: Number,
      required: true
    },

    daytimeEveningAttendance: {
      type: Number,
      required: true
    },

    admissionGrade: {
      type: Number,
      required: true
    },

    tuitionFeesUpToDate: {
      type: Number,
      required: true
    },

    debtor: {
      type: Number,
      required: true
    },

    scholarshipHolder: {
      type: Number,
      required: true
    },

    motherQualification: {
      type: Number,
      required: true
    },

    fatherQualification: {
      type: Number,
      required: true
    },

    motherOccupation: {
      type: Number,
      required: true
    },

    fatherOccupation: {
      type: Number,
      required: true
    },

    firstSemester: {
      credited: {
        type: Number,
        required: true
      },

      enrolled: {
        type: Number,
        required: true
      },

      evaluations: {
        type: Number,
        required: true
      },

      approved: {
        type: Number,
        required: true
      },

      grade: {
        type: Number,
        required: true
      },

      withoutEvaluations: {
        type: Number,
        required: true
      }
    },

    unemploymentRate: {
      type: Number,
      required: true
    },

    inflationRate: {
      type: Number,
      required: true
    },

    gdp: {
      type: Number,
      required: true
    },

    predictions: [
      {
        riskProbability: {
          type: Number,
          required: true
        },

        riskLevel: {
          type: String,
          enum: ["Low", "Medium", "High"],
          required: true
        },

        model: {
          type: String,
          default: "Logistic Regression"
        },

        shapExplanation: [
          {
            feature: {
              type: String,
              required: true
            },

            contribution: {
              type: Number,
              required: true
            },

            direction: {
              type: String,
              enum: ["Positive", "Negative", "Neutral"],
              required: true
            }
          }
        ],

        predictedAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Student", studentSchema);

```