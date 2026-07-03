import { execSync, spawn } from 'node:child_process';
import net from 'node:net';

const isWindows = process.platform === 'win32';
const LOCAL_SERVER_PORT = Number(process.env.SERVER_PORT || process.env.GMAIL_BRIDGE_PORT || 8787);
const LOCAL_SERVER_URL = `http://127.0.0.1:${LOCAL_SERVER_PORT}`;
const VITE_PORT = Number(process.env.VITE_PORT || 5174);

/** @type {import('node:child_process').ChildProcess[]} */
const children = [];
let shuttingDown = false;

function run(command, args, label) {
  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: isWindows,
    env: process.env,
  });

  child.on('exit', (code) => {
    if (shuttingDown) return;
    if (code && code !== 0) {
      console.error(`[dev] ${label} durdu (kod ${code}).`);
    }
    shutdown(code ?? 0);
  });

  children.push(child);
  return child;
}

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  for (const child of children) {
    if (!child.killed) {
      child.kill(isWindows ? undefined : 'SIGINT');
    }
  }

  process.exit(code);
}

async function isLocalServerHealthy() {
  try {
    const response = await fetch(`${LOCAL_SERVER_URL}/health`, { signal: AbortSignal.timeout(1500) });
    return response.ok;
  } catch {
    return false;
  }
}

function isPortInUse(port) {
  return new Promise((resolve) => {
    const probe = net.createServer();
    probe.once('error', (error) => {
      resolve(error.code === 'EADDRINUSE');
    });
    probe.once('listening', () => {
      probe.close(() => resolve(false));
    });
    probe.listen(port, '127.0.0.1');
  });
}

function killProcessesOnPort(port) {
  if (!isWindows) return false;

  try {
    const output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
    const pids = new Set();

    for (const line of output.split('\n')) {
      if (!line.includes('LISTENING')) continue;
      const parts = line.trim().split(/\s+/);
      const pid = parts.at(-1);
      if (pid && pid !== '0') pids.add(pid);
    }

    for (const pid of pids) {
      execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
      console.log(`[dev] Port ${port} uzerindeki eski surec sonlandirildi (PID ${pid}).`);
    }

    return pids.size > 0;
  } catch {
    return false;
  }
}

async function waitForLocalServer(maxAttempts = 40) {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    if (await isLocalServerHealthy()) return true;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return false;
}

async function ensureLocalServer() {
  if (await isLocalServerHealthy()) {
    console.log(`[dev] Yerel sunucu zaten calisiyor: ${LOCAL_SERVER_URL}`);
    return;
  }

  if (await isPortInUse(LOCAL_SERVER_PORT)) {
    console.warn(`[dev] Port ${LOCAL_SERVER_PORT} dolu; eski surec temizleniyor...`);
    killProcessesOnPort(LOCAL_SERVER_PORT);
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (await isLocalServerHealthy()) {
      console.log(`[dev] Yerel sunucu hazir: ${LOCAL_SERVER_URL}`);
      return;
    }
  }

  run('node', ['server/index.mjs'], 'yerel-sunucu');

  const ready = await waitForLocalServer();
  if (!ready) {
    console.error(`[dev] Yerel sunucu ${LOCAL_SERVER_URL} adresinde hazir olmadi.`);
    if (await isPortInUse(LOCAL_SERVER_PORT)) {
      console.error(
        `[dev] Port ${LOCAL_SERVER_PORT} hala kullanimda. Eski terminali kapatip tekrar deneyin.`
      );
    }
    shutdown(1);
  }
}

console.log('[dev] SalesDesk baslatiliyor...');
console.log(`  - Frontend:  http://localhost:${VITE_PORT}`);
console.log(`  - Yerel API: ${LOCAL_SERVER_URL} (Gmail + Sohbet + Gruplar)`);

await ensureLocalServer();

if (await isPortInUse(VITE_PORT)) {
  console.warn(`[dev] Port ${VITE_PORT} dolu; eski Vite oturumu kapatiliyor...`);
  killProcessesOnPort(VITE_PORT);
  await new Promise((resolve) => setTimeout(resolve, 500));
}

console.log('[dev] Yerel sunucu hazir, Vite baslatiliyor...');
run(isWindows ? 'npm.cmd' : 'npm', ['run', 'dev:web'], 'vite');

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
