# EduMentor backend

This directory is the self-contained Node.js + Express API and ML deployment
unit for EduMentor. It includes the Logistic Regression + SHAP artifacts in
`ml\artifacts\`, so it can be uploaded to Render independently from the React
frontend.

## Setup

From `backend\`:

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Set `PYTHON_EXECUTABLE` in `.env` to the Python executable that has the ML
dependencies installed. From the repository root, install them with:

```text
.\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
```

When running locally on Windows, the service also falls back to
`..\.venv\Scripts\python.exe`. On Render, set `PYTHON_EXECUTABLE` to
`/opt/venv/bin/python` when using the included Dockerfile.

## Docker

Build the combined Express + Python ML image from this directory:

```powershell
cd backend
docker build -t edumentor-api .
```

Run it with MongoDB available on the host:

```powershell
docker run --rm --name edumentor-api -p 5000:5000 `
  -e MONGODB_URI=mongodb://host.docker.internal:27017/edumentor `
  -e CLIENT_ORIGIN=http://localhost:5173 `
  edumentor-api
```

The image contains the Express API, Python runtime, trained Logistic Regression
pipeline, and SHAP explainer. The MongoDB database remains external and is
configured through `MONGODB_URI`.

## Endpoints

```text
GET  /api/health
POST /api/students
GET  /api/students
GET  /api/students/:id
PUT  /api/students/:id
POST /api/predictions/:studentId
GET  /api/predictions/:studentId
GET  /api/predictions/:studentId/latest
```

`student.predictionFeatures` must contain the exact 29 feature names from
`ml\artifacts\feature_schema.json`. Second-semester fields are rejected by the
API because the configured prediction point is after the first semester.

Prediction records are stored separately from students. Risk thresholds are
environment configuration only and are not model claims; they must be
validated against deployment metrics before production use.

## Render deployment

Use `backend` as the Render service's **Root Directory**. The included
`Dockerfile` installs both Node.js dependencies and Python ML dependencies, then
starts the API. Configure these environment variables in Render:

```text
MONGODB_URI=<your MongoDB connection string>
CLIENT_ORIGIN=<deployed frontend URL>
PYTHON_EXECUTABLE=/opt/venv/bin/python
```

The health check path is `/api/health`. Render provides the `PORT` variable;
the server uses it automatically.
