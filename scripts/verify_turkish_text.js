const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const files = ['App.tsx', join('src', 'components', 'StatusPanel.tsx'), join('src', 'config', 'buildInfo.ts')];
const forbidden = [
  'Missing person',
  'Unidentified human remains',
  'export ready',
  'draft',
  'settings',
  'about',
];

const failures = [];

for (const file of files) {
  const content = readFileSync(file, 'utf8');
  for (const token of forbidden) {
    if (content.includes(token)) {
      failures.push(`${file}: kullanıcı arayüzünde İngilizce ifade bulundu: ${token}`);
    }
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('Türkçe kullanıcı arayüzü metin kontrolü geçti.');
