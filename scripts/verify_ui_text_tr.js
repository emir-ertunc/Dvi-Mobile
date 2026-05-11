const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const files = [
  'App.tsx',
  join('src', 'components', 'MetricTile.tsx'),
  join('src', 'components', 'FormFieldControl.tsx'),
  join('src', 'components', 'FormSectionNavigator.tsx'),
  join('src', 'components', 'FormWorkspace.tsx'),
  join('src', 'components', 'RouteTabs.tsx'),
  join('src', 'components', 'StatusPanel.tsx'),
  join('src', 'config', 'buildInfo.ts'),
  join('src', 'config', 'diagnostics.ts'),
  join('src', 'data', 'dashboard.ts'),
  join('src', 'hooks', 'useLocalDrafts.ts'),
];

const forbiddenRuntimeText = [
  'Missing person',
  'Unidentified human remains',
  'export ready',
  'draft',
  'settings',
  'about',
  'build status',
  'source form',
  'metadata',
  'build kapısı',
  'build kimliği',
];

function stringLiterals(content) {
  const literals = [];
  const regex = /(['"`])((?:\\.|(?!\1)[\s\S])*?)\1/g;
  let match = regex.exec(content);
  while (match) {
    const value = match[2];
    if (!value.startsWith('.') && !value.startsWith('/') && !value.includes('\\')) {
      literals.push(value);
    }
    match = regex.exec(content);
  }
  return literals;
}

const failures = [];

for (const file of files) {
  const content = readFileSync(file, 'utf8');
  for (const literal of stringLiterals(content)) {
    for (const token of forbiddenRuntimeText) {
      if (literal.toLocaleLowerCase('tr-TR').includes(token.toLocaleLowerCase('tr-TR'))) {
        failures.push(`${file}: kullanıcı arayüzünde İngilizce ifade bulundu: ${token}`);
      }
    }
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('Türkçe kullanıcı arayüzü metin kontrolü geçti.');
