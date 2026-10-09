# EduMentor Express backend

This is the root-level Node.js + Express API for EduMentor. It uses CommonJS,
Mongoose, and the Logistic Regression + SHAP artifact in `ml\artifacts\`.

## Setup

From `server\`:

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Set `PYTHON_EXECUTABLE` in `.env` to the Python executable that has the ML
dependencies installed. The default development environment created for this
workspace is:

```text
..\ .venv-1\Scripts\python.exe
```

Remove the space after `..\` when entering the actual path.

## Docker

Build the combined Express + Python ML image from the project root:

```powershell
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
