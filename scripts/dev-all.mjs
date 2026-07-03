import { spawn } from 'node:child_process';

const isWindows = process.platform === 'win32';
const LOCAL_SERVER_PORT = Number(process.env.SERVER_PORT || process.env.GMAIL_BRIDGE_PORT || 8787);
const LOCAL_SERVER_URL = `http://127.0.0.1:${LOCAL_SERVER_PORT}`;

/** @type {import('node:child_process').ChildProcess[]} */
const children = [];

function run(command, args, label) {
  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: isWindows,
    env: process.env,
  });

  child.on('exit', (code) => {
    if (code && code !== 0) {
      console.error(`[dev] ${label} durdu (kod ${code}).`);
    }
    shutdown(code ?? 0);
  });

  children.push(child);
  return child;
}

function shutdown(code = 0) {
  for (const child of children) {
    if (!child.killed) {
      child.kill(isWindows ? undefined : 'SIGINT');
    }
  }
  process.exit(code);
}

async function waitForLocalServer(maxAttempts = 40) {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      const response = await fetch(`${LOCAL_SERVER_URL}/health`);
      if (response.ok) return true;
    } catch {
      // Server still booting
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return false;
}

console.log('[dev] SalesDesk baslatiliyor...');
console.log(`  - Frontend:  http://localhost:5174`);
console.log(`  - Yerel API: ${LOCAL_SERVER_URL} (Gmail + Sohbet + Gruplar)`);

run('node', ['server/index.mjs'], 'yerel-sunucu');

const ready = await waitForLocalServer();
if (!ready) {
  console.error(`[dev] Yerel sunucu ${LOCAL_SERVER_URL} adresinde hazir olmadi.`);
  shutdown(1);
}

console.log('[dev] Yerel sunucu hazir, Vite baslatiliyor...');
run(isWindows ? 'npm.cmd' : 'npm', ['run', 'dev:web'], 'vite');

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
