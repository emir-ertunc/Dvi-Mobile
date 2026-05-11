const { spawnSync } = require('node:child_process');

const script = process.argv[2];
const scriptArgs = process.argv.slice(3);

if (!script) {
  console.error('Python script yolu verilmedi.');
  process.exit(1);
}

const candidates = [process.env.DVI_PYTHON, 'python3', 'python', 'py'].filter(Boolean);

const python = candidates.find((candidate) => {
  const probe = spawnSync(candidate, ['--version'], {
    shell: false,
    stdio: 'ignore',
  });

  return probe.status === 0;
});

if (!python) {
  console.error('Python çalıştırılamadı: uygun yorumlayıcı bulunamadı.');
  process.exit(1);
}

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
