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
assertContains(join('src', 'components', 'FormWorkspace.tsx'), "FormSectionNavigator");
assertContains(join('src', 'components', 'FormWorkspace.tsx'), "FormFieldControl");
assertContains(join('src', 'components', 'FormFieldControl.tsx'), "keyboardType");
assertContains(join('src', 'components', 'FormFieldControl.tsx'), "accessibilityRole=\"checkbox\"");
assertContains(join('App.tsx'), "<FormWorkspace draft={draft} />");
assertContains(join('src', 'config', 'buildInfo.ts'), "phase-4a-v0.4.0-20260511");

console.log('Ortak form renderer doğrulaması geçti.');
