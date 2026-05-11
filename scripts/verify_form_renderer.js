const { readFileSync } = require('node:fs');
const { join } = require('node:path');

function read(path) {
  return readFileSync(path, 'utf8');
}

function assertContains(file, token) {
  const content = read(file);
  if (!content.includes(token)) {
    throw new Error(`${file} içinde beklenen yapı bulunamadı: ${token}`);
  }
}

const amSchema = JSON.parse(read(join('data', 'schema', 'am-schema.json')));
const pmSchema = JSON.parse(read(join('data', 'schema', 'pm-schema.json')));

const checks = [
  ['AM field count', amSchema.totals.fieldCount, 1687],
  ['AM widget count', amSchema.totals.widgetInstanceCount, 2006],
  ['PM field count', pmSchema.totals.fieldCount, 1693],
  ['PM widget count', pmSchema.totals.widgetInstanceCount, 2026],
];

for (const [label, actual, expected] of checks) {
  if (actual !== expected) {
    throw new Error(`${label}: ${actual} yerine ${expected} bekleniyordu.`);
  }
}

assertContains(join('src', 'data', 'formSchemaCatalog.ts'), "getFormSections");
assertContains(join('src', 'components', 'FormWorkspace.tsx'), "PHASE_4B_AM_SECTION_IDS");
assertContains(join('src', 'components', 'FormWorkspace.tsx'), "am.100.kayit-ve-basvuru");
assertContains(join('src', 'components', 'FormWorkspace.tsx'), "am.200.kayip-kisi");
assertContains(join('src', 'components', 'FormWorkspace.tsx'), "FormSectionNavigator");
assertContains(join('src', 'components', 'FormWorkspace.tsx'), "FormFieldControl");
assertContains(join('src', 'components', 'FormWorkspace.tsx'), "onFieldValueChange");
assertContains(join('src', 'components', 'FormFieldControl.tsx'), "keyboardType");
assertContains(join('src', 'components', 'FormFieldControl.tsx'), "accessibilityRole=\"checkbox\"");
assertContains(join('src', 'components', 'FormFieldControl.tsx'), "onValueChange");
assertContains(join('App.tsx'), "updateDraftFieldValue");
assertContains(join('src', 'storage', 'draftStore.ts'), "updateDraftFieldValue");
assertContains(join('src', 'config', 'buildInfo.ts'), "phase-4b-v0.4.1-20260511");

console.log('Ortak form renderer doğrulaması geçti.');
