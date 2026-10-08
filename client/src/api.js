const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "The request failed");
  }
  return data;
}

export const api = {
  getStudents: () => request("/students"),
  createStudent: (student) =>
    request("/students", { method: "POST", body: JSON.stringify(student) }),
  getLatestPrediction: (studentId) => request(`/predictions/${studentId}/latest`),
  getPredictions: (studentId) => request(`/predictions/${studentId}`),
  createPrediction: (studentId) =>
    request(`/predictions/${studentId}`, { method: "POST" })
};
