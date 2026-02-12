const { spawn } = require("child_process");

const port = Number(process.env.PORT) || 7860;

console.log("Starting OpenCode on port:", port);

const opencode = spawn("opencode", [
  "web",
  "--hostname",
  "0.0.0.0",
  "--port",
  String(port),
  "--print-logs",
  "--log-level",
  "INFO"
]);

opencode.stdout.on("data", (data) => {
  process.stdout.write(data);
});

opencode.stderr.on("data", (data) => {
  process.stderr.write(data);
});

opencode.on("close", (code) => {
  console.log(`OpenCode exited with code ${code}`);
  process.exit(code);
});