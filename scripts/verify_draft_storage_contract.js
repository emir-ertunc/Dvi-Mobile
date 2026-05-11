const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const root = process.cwd();
const store = readFileSync(join(root, 'src', 'storage', 'draftStore.ts'), 'utf8');
const hook = readFileSync(join(root, 'src', 'hooks', 'useLocalDrafts.ts'), 'utf8');
const app = readFileSync(join(root, 'App.tsx'), 'utf8');

const requiredStoreTokens = [
  '@dvi-mobile/local-drafts/v1',
  'AsyncStorage.getItem',
  'AsyncStorage.setItem',
  'createDraft',
  'deleteDraft',
  'schemaFieldCount: 1687',
  'schemaFieldCount: 1693',
];

const requiredHookTokens = [
  'loadDrafts',
  'const currentDrafts = await loadDrafts();',
  'persistCreatedDraft',
  'persistDeletedDraft',
  'Yerel taslaklar okunamadı.',
  'Taslak oluşturulamadı.',
  'Taslak silinemedi.',
];

const requiredAppTokens = ['useLocalDrafts', 'Yeni AM taslağı', 'Yeni PM taslağı', 'Kalıcı taslak listesi'];
const failures = [];

for (const token of requiredStoreTokens) {
  if (!store.includes(token)) failures.push(`draftStore.ts içinde eksik sözleşme parçası: ${token}`);
}

for (const token of requiredHookTokens) {
  if (!hook.includes(token)) failures.push(`useLocalDrafts.ts içinde eksik sözleşme parçası: ${token}`);
}

for (const token of requiredAppTokens) {
  if (!app.includes(token)) failures.push(`App.tsx içinde eksik taslak arayüz parçası: ${token}`);
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('Yerel taslak saklama sözleşmesi doğrulaması geçti.');
