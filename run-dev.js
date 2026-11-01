// ResQ — Universal Local Dev Runner
// Runs both backend and frontend concurrently in a single terminal with colored output.
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

console.log('\x1b[36m%s\x1b[0m', '================================================');
console.log('\x1b[36m%s\x1b[0m', '   ⚡ Starting ResQ Platform (Backend + Frontend) ');
console.log('\x1b[36m%s\x1b[0m', '================================================');
console.log('\x1b[32m%s\x1b[0m', 'Backend:  http://localhost:5000 (API & Health)');
console.log('\x1b[34m%s\x1b[0m', 'Frontend: http://localhost:3000 (Console)');
console.log('\x1b[90m%s\x1b[0m', 'Press Ctrl+C to stop both processes.\n');

const backend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'pipe',
  shell: true,
});

const frontend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'frontend'),
  stdio: 'pipe',
  shell: true,
});

backend.stdout?.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  for (const line of lines) {
    if (line.trim()) console.log(`\x1b[36m[BACKEND]\x1b[0m  ${line}`);
  }
});

backend.stderr?.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  for (const line of lines) {
    if (line.trim()) console.error(`\x1b[31m[BACKEND-ERR]\x1b[0m ${line}`);
  }
});

frontend.stdout?.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  for (const line of lines) {
    if (line.trim()) console.log(`\x1b[35m[FRONTEND]\x1b[0m ${line}`);
  }
});

frontend.stderr?.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  for (const line of lines) {
    if (line.trim()) console.error(`\x1b[31m[FRONTEND-ERR]\x1b[0m ${line}`);
  }
});

const cleanup = () => {
  console.log('\n\x1b[33m%s\x1b[0m', 'Shutting down ResQ processes...');
  if (isWindows) {
    if (backend.pid) spawn('taskkill', ['/pid', backend.pid.toString(), '/f', '/t']);
    if (frontend.pid) spawn('taskkill', ['/pid', frontend.pid.toString(), '/f', '/t']);
  } else {
    backend.kill('SIGINT');
    frontend.kill('SIGINT');
  }
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

