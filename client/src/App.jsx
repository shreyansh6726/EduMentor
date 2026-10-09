import React, { useEffect, useMemo, useState } from "react";
import { api } from "./api";
import { emptyFeatures, groups } from "./featureConfig";

const initialStudent = () => ({
  studentId: "",
  name: "",
  email: "",
  predictionFeatures: emptyFeatures()
});

function formatProbability(value) {
  return `${(Number(value) * 100).toFixed(1)}%`;
}

function App() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [history, setHistory] = useState([]);
  const [form, setForm] = useState(initialStudent);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function refreshStudents() {
    try {
      setStudents(await api.getStudents());
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  useEffect(() => {
    refreshStudents();
  }, []);

  const selectedName = useMemo(
    () => selectedStudent?.name || "No student selected",
    [selectedStudent]
  );

  function updateFeature(name, value) {
    setForm((current) => ({
      ...current,
      predictionFeatures: { ...current.predictionFeatures, [name]: value }
    }));
  }

  async function submitStudent(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const numericFeatures = Object.fromEntries(
        Object.entries(form.predictionFeatures).map(([name, value]) => [
          name,
          Number(value)
        ])
      );
      if (Object.values(numericFeatures).some((value) => !Number.isFinite(value))) {
        throw new Error("Complete every model feature before saving the student.");
      }
      const student = await api.createStudent({
        ...form,
        predictionFeatures: numericFeatures
      });
      setStudents((current) => [student, ...current]);
      setSelectedStudent(student);
      setForm(initialStudent());
      setMessage("Student saved. You can now generate an early-warning prediction.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function selectStudent(student) {
    setSelectedStudent(student);
    setPrediction(null);
    setError("");
    try {
      setHistory(await api.getPredictions(student._id));
      setPrediction(await api.getLatestPrediction(student._id));
    } catch (requestError) {
      if (!requestError.message.includes("No predictions")) setError(requestError.message);
      setHistory([]);
    }
  }

  async function generatePrediction() {
    if (!selectedStudent) return;
    setLoading(true);
    setError("");
    try {
      const result = await api.createPrediction(selectedStudent._id);
      setPrediction(result);
      setHistory((current) => [result, ...current]);
      setMessage("Prediction generated with the current Logistic Regression model.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div>
            <strong>EduMentor</strong>
            <span>Early-warning intelligence</span>
          </div>
        </div>
        <div className="model-pill"><span /> Logistic Regression · v1</div>
      </header>

      <main className="content">
        <section className="hero">
          <div>
            <p className="eyebrow">Student success workspace</p>
            <h1>Spot risk early. <em>Support sooner.</em></h1>
            <p className="hero-copy">
              Use first-semester information to understand dropout risk and
              guide the next conversation with a student.
            </p>
          </div>
          <div className="hero-stat"><strong>{students.length}</strong><span>students tracked</span></div>
        </section>

        {error && <div className="alert error">{error}</div>}
        {message && <div className="alert success">{message}</div>}

        <div className="workspace">
          <section className="panel form-panel">
            <div className="panel-heading">
              <div><p className="eyebrow">Add a record</p><h2>Student profile</h2></div>
              <span className="step-badge">01 / 02</span>
            </div>
            <form onSubmit={submitStudent}>
              <div className="identity-grid">
                <label>Student ID<input required value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} placeholder="e.g. STU-1042" /></label>
                <label>Full name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Student name" /></label>
                <label>Email<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="student@college.edu" /></label>
              </div>
              {groups.map((group) => (
                <fieldset key={group.title}>
                  <legend>{group.title}</legend>
                  <div className="feature-grid">
                    {group.fields.map((field) => (
                      <label key={field.name}>{field.label}
                        {field.type === "select" ? (
                          <select required value={form.predictionFeatures[field.name]} onChange={(e) => updateFeature(field.name, e.target.value)}>
                            <option value="">Select an option</option>
                            {field.options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                          </select>
                        ) : (
                          <input
                            required
                            type="number"
                            min={field.min}
                            step={field.step}
                            value={form.predictionFeatures[field.name]}
                            onChange={(e) => updateFeature(field.name, e.target.value)}
                            placeholder="Enter a value"
                          />
                        )}
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
              <button className="primary-button" disabled={loading} type="submit">
                {loading ? "Saving..." : "Save student profile"}
              </button>
            </form>
          </section>

          <aside className="side-column">
            <section className="panel student-panel">
              <div className="panel-heading"><div><p className="eyebrow">Saved records</p><h2>Students</h2></div><span className="count">{students.length}</span></div>
              <div className="student-list">
                {students.length === 0 && <p className="empty">No students yet. Add the first profile to begin.</p>}
                {students.map((student) => (
                  <button className={`student-row ${selectedStudent?._id === student._id ? "active" : ""}`} key={student._id} onClick={() => selectStudent(student)}>
                    <span className="avatar">{student.name.slice(0, 1).toUpperCase()}</span>
                    <span><strong>{student.name}</strong><small>{student.studentId}</small></span>
                    <span className="arrow">→</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="panel result-panel">
              <div className="panel-heading"><div><p className="eyebrow">Step 02 / 02</p><h2>Risk assessment</h2></div></div>
              {!selectedStudent ? <div className="empty result-empty">Select a student to view their assessment.</div> : (
                <>
                  <div className="selected-student"><span className="avatar">{selectedName.slice(0, 1).toUpperCase()}</span><div><strong>{selectedName}</strong><small>{selectedStudent.studentId}</small></div></div>
                  <button className="primary-button predict-button" disabled={loading} onClick={generatePrediction}>{loading ? "Analyzing..." : "Generate prediction"}</button>
                  {prediction && <div className="risk-card">
                    <div className="risk-top"><span className={`risk-dot ${prediction.riskLevel.toLowerCase()}`} /><span>{prediction.riskLevel} risk</span><strong>{formatProbability(prediction.riskProbability)}</strong></div>
                    <p className="prediction-class">Predicted outcome: <b>{prediction.predictedClass}</b></p>
                    <div className="explanation"><p className="eyebrow">Top contributing factors</p>{prediction.shapExplanation.map((item) => <div className="factor" key={`${item.feature}-${item.contribution}`}><span>{item.feature.replace(/^(categorical|numerical)__/, "")}</span><b className={item.direction.toLowerCase()}>{item.contribution > 0 ? "+" : ""}{item.contribution.toFixed(2)}</b></div>)}</div>
                  </div>}
                  <div className="history"><p className="eyebrow">Prediction history</p>{history.length === 0 ? <small>No predictions recorded.</small> : history.slice(0, 4).map((item) => <div className="history-row" key={item._id}><span>{new Date(item.predictedAt).toLocaleDateString()}</span><b className={item.riskLevel.toLowerCase()}>{item.riskLevel}</b><span>{formatProbability(item.riskProbability)}</span></div>)}</div>
                </>
              )}
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default App;
