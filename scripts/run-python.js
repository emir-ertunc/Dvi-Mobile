const { spawnSync } = require('node:child_process');
const { existsSync } = require('node:fs');
const { join } = require('node:path');

const script = process.argv[2];
const scriptArgs = process.argv.slice(3);

if (!script) {
  console.error('Python script yolu verilmedi.');
  process.exit(1);
}

const candidates = [
  process.env.DVI_PYTHON,
  'python',
  'python3',
  'py',
].filter(Boolean);

const python = candidates.find((candidate) => {
  if (candidate === 'python' || candidate === 'python3') {
    return true;
  }

  return existsSync(candidate);
});

const result = spawnSync(python, [script, ...scriptArgs], {
  env: {
    ...process.env,
    PYTHONIOENCODING: 'utf-8',
  },
  shell: false,
  stdio: 'inherit',
});

if (result.error) {
  console.error(`Python çalıştırılamadı: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status ?? 1);
