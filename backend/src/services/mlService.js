const path = require("path");
const { spawn } = require("child_process");

const projectRoot = path.resolve(__dirname, "..", "..", "..");
const scriptPath = path.join(projectRoot, "ml", "predict.py");
const pythonExecutable =
  process.env.PYTHON_EXECUTABLE ||
  path.join(projectRoot, ".venv-1", "Scripts", "python.exe");

function runPrediction(features) {
  return new Promise((resolve, reject) => {
    const child = spawn(pythonExecutable, [scriptPath], {
      cwd: projectRoot,
      stdio: ["pipe", "pipe", "pipe"]
    });
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", (error) => {
      reject(new Error(`Unable to start model service: ${error.message}`));
    });
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(stderr.trim() || `Model service exited with code ${code}`));
        return;
      }
      try {
        resolve(JSON.parse(stdout));
      } catch (error) {
        reject(new Error(`Model service returned invalid JSON: ${error.message}`));
      }
    });

    child.stdin.end(JSON.stringify(features));
  });
}

module.exports = { runPrediction };
