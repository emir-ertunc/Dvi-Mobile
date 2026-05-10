const { existsSync, readdirSync, readFileSync, statSync } = require('node:fs');
const { join, relative } = require('node:path');

const root = process.cwd();
const ignoredDirs = new Set(['.git', 'android', 'artifacts', 'node_modules']);
const ignoredFiles = new Set(['package-lock.json']);
const requiredFiles = ['docs/project-plan.md', 'README.md', 'src/config/buildInfo.ts'];
const removedPaths = [
  'data/form-forensics',
  'docs/form-forensics',
];
const forbiddenTokens = [
  ['DVI-', 'Ölüm'].join(' '),
  ['DVI-', 'Ölüm'].join(' '),
  ['görüntü', 'PDF'].join(' '),
  ['AcroForm', 'alanı yok'].join(' '),
  ['phase', '1d', 'v0.1.3'].join('-'),
  ['am', 'field', 'inventory.json'].join('-'),
  ['pm', 'field', 'inventory.json'].join('-'),
];

const failures = [];

for (const file of requiredFiles) {
  if (!existsSync(join(root, file))) {
    failures.push(`Gerekli dosya eksik: ${file}`);
  }
}

for (const oldPath of removedPaths) {
  if (existsSync(join(root, oldPath))) {
    failures.push(`Eski kaynak artefaktı hâlâ mevcut: ${oldPath}`);
  }
}

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (ignoredDirs.has(entry)) {
      continue;
    }
    const path = join(dir, entry);
    const stats = statSync(path);
    if (stats.isDirectory()) {
      walk(path);
      continue;
    }
    const rel = relative(root, path).replaceAll('\\', '/');
    if (ignoredFiles.has(rel) || /\.(png|jpg|jpeg|gif|webp|pdf|apk|keystore)$/i.test(entry)) {
      continue;
    }
    const content = readFileSync(path, 'utf8');
    for (const token of forbiddenTokens) {
      if (content.includes(token)) {
        failures.push(`${rel}: eski kaynak izi bulundu: ${token}`);
      }
    }
  }
}

walk(root);

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('Yeniden baz alma kontrolü geçti.');
