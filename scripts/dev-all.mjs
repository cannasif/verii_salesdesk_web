import { spawn } from 'node:child_process';

const isWindows = process.platform === 'win32';

function run(command, args, label) {
  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: isWindows,
    env: process.env,
  });

  child.on('exit', (code) => {
    if (code && code !== 0) {
      console.error(`[dev:all] ${label} cikti (kod ${code}).`);
    }
    process.exit(code ?? 0);
  });

  return child;
}

console.log('[dev:all] Vite + yerel sunucu baslatiliyor...');
console.log('  - Frontend: http://localhost:5174');
console.log('  - Gruplar/Sohbet: http://localhost:8787');

const server = run('node', ['server/index.mjs'], 'server');
run(isWindows ? 'npm.cmd' : 'npm', ['run', 'dev'], 'vite');

process.on('SIGINT', () => {
  server.kill('SIGINT');
  process.exit(0);
});
