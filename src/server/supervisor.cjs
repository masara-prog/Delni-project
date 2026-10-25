// @ts-check
const { spawn } = require('child_process');
const path = require('path');

const targetScript = path.join(__dirname, 'sqlServerBridge.cjs');

function startProcess() {
  console.log('[Supervisor] Starting DelniDB SQL Server Bridge...');
  const child = spawn(process.execPath, [targetScript], {
    stdio: 'inherit',
    env: process.env,
  });

  child.on('exit', (code, signal) => {
    console.warn(`[Supervisor] DelniDB Bridge exited (code: ${code}, signal: ${signal}). Auto-restarting in 1s...`);
    setTimeout(startProcess, 1000);
  });

  child.on('error', (err) => {
    console.error('[Supervisor] Failed to start DelniDB Bridge:', err);
    setTimeout(startProcess, 2000);
  });
}

startProcess();
