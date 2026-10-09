# EduMentor

EduMentor is a MERN-based early-warning system for estimating student
dropout risk. It combines a React frontend, a Node.js and Express API,
MongoDB student and prediction records, and a Python machine-learning
pipeline with SHAP explanations.

The system is intended to help college management identify at-risk students
early enough to guide supportive intervention. It estimates risk; it does not
guarantee whether a student will drop out.

## Features

- Student profile creation and management
- Readable dropdowns for categorical and yes/no model inputs
- First-semester academic performance capture
- Logistic Regression dropout-risk prediction
- Dropout, enrolled, and graduate class predictions
- Configurable low, medium, and high risk levels
- SHAP-based explanation factors
- Separate prediction history for each student
- Model and preprocessing artifacts stored with version metadata
- Prediction point fixed after the first semester to reduce future-data leakage

## Architecture

```text
React frontend
       |
       v
Node.js + Express API
       |
       +------------------+
       |                  |
       v                  v
    MongoDB        Python ML service
                          |
                          v
              Preprocessing + Logistic Regression
                          |
                          v
                    SHAP explanation
```

## Project structure

```text
.
├── client/                 # React + Vite frontend
│   └── src/
├── backend/                # Express API and ML deployment unit
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── services/
│   └── ml/
│       ├── artifacts/      # Trained model and SHAP artifacts
│       ├── predict.py
│       └── train.py
└── Model.ipynb             # ML exploration notebook
```

## Technology stack

- **Frontend:** React, Vite, CSS
- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB
- **Machine learning:** Python, pandas, scikit-learn, Logistic Regression
- **Explainability:** SHAP
- **Dataset:** UCI Predict Students' Dropout and Academic Success dataset

## Prediction design

The current prediction point is **after the first semester**. The model uses
student information available by that point, including:

- Demographic and family information
- Admission and application information
- Financial and scholarship information
- First-semester curricular-unit counts and grades
- Economic context indicators

The six second-semester academic fields are intentionally excluded because
they would not be available when an early-warning prediction is made after the
first semester:

- Credited units
- Enrolled units
- Evaluations
- Approved units
- Grade
- Units without evaluations

The frontend displays readable labels for categorical options, but submits the
original numeric category codes required by the trained preprocessing
pipeline. The preprocessing pipeline is saved with the model and reused
during inference.

## Prerequisites

- Node.js 18 or newer
- npm
- MongoDB running locally or an accessible MongoDB deployment
- Python 3.10 or newer

## Local setup

### 1. Install backend dependencies

From `backend\`:

```powershell
npm install
Copy-Item .env.example .env
```

Update `backend\.env` if your MongoDB or Python executable is different:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/edumentor
PYTHON_EXECUTABLE=..\.venv\Scripts\python.exe
RISK_MEDIUM_THRESHOLD=0.34
RISK_HIGH_THRESHOLD=0.67
CLIENT_ORIGIN=http://localhost:5173
```

### 2. Install Python dependencies

From the repository root:

```powershell
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
```

The repository includes trained artifacts under
`backend\ml\artifacts\`. To retrain the model from the UCI dataset:

```powershell
.\.venv\Scripts\python.exe backend\ml\train.py
```

Retraining downloads the dataset, validates the feature contract, evaluates
the model, and refreshes the model and SHAP artifacts.

### 3. Install frontend dependencies

From `client\`:

```powershell
npm install
Copy-Item .env.example .env
```

The default frontend API configuration is:

```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Start the application

Start the backend in one terminal:

```powershell
cd backend
npm run dev
```

Start the frontend in another terminal:

```powershell
cd client
npm run dev
```

Open the Vite URL shown in the terminal, normally
`http://localhost:5173`.

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check backend availability |
| POST | `/api/students` | Create a student |
| GET | `/api/students` | List students |
| GET | `/api/students/:id` | Retrieve a student |
| PUT | `/api/students/:id` | Update a student |
| POST | `/api/predictions/:studentId` | Generate and store a prediction |
| GET | `/api/predictions/:studentId` | Retrieve prediction history |
| GET | `/api/predictions/:studentId/latest` | Retrieve the latest prediction |

Student prediction features must exactly match the schema in
`backend\ml\artifacts\feature_schema.json`. The backend validates this
contract before saving a student.

## Risk levels

Risk levels are derived from prediction probabilities using environment
configuration:

- Below the medium threshold: **Low**
- At or above the medium threshold and below the high threshold: **Medium**
- At or above the high threshold: **High**

The default thresholds are application configuration and must be validated
against deployment-specific validation metrics before production use. They
are not guarantees about student outcomes.

## Data and responsible use

This project uses the UCI dataset primarily for development and demonstration.
Its evaluation results should not be assumed to represent every college,
program, or student population.

Use predictions as signals for supportive conversations and intervention, not
as automatic decisions about a student's access to education. Review model
performance, class imbalance, false negatives, calibration, and subgroup
fairness before production deployment.

Do not commit secrets such as MongoDB connection strings, API keys, JWT
secrets, or private deployment credentials. Use environment variables for
deployment-specific configuration.

## Deployment

The backend is self-contained and includes the Node.js API, Python runtime
requirements, trained artifacts, and a Dockerfile. See
`backend\README.md` for Docker and Render deployment instructions.

For a production deployment:

1. Configure a managed MongoDB instance.
2. Set `MONGODB_URI`, `CLIENT_ORIGIN`, and `PYTHON_EXECUTABLE`.
3. Deploy the backend from the `backend\` directory.
4. Build and deploy the React frontend.
5. Set `VITE_API_URL` to the deployed backend API URL.
6. Validate model metrics and risk thresholds on representative data.

## License

No license has been specified yet. Add a license before distributing or
reusing this project.
