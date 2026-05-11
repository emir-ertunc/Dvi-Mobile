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
assertContains(join('src', 'components', 'FormWorkspace.tsx'), "EDITABLE_AM_SECTION_IDS");
assertContains(join('src', 'components', 'FormWorkspace.tsx'), "EDITABLE_PM_SECTION_IDS");
assertContains(join('src', 'components', 'FormWorkspace.tsx'), "am.100.kayit-ve-basvuru");
assertContains(join('src', 'components', 'FormWorkspace.tsx'), "am.200.kayip-kisi");
assertContains(join('src', 'components', 'FormWorkspace.tsx'), "am.300.kisisel-esyalar");
assertContains(join('src', 'components', 'FormWorkspace.tsx'), "am.400.fiziksel-tanim");
assertContains(join('src', 'components', 'FormWorkspace.tsx'), "am.500.tibbi");
assertContains(join('src', 'components', 'FormWorkspace.tsx'), "am.600.odontoloji");
assertContains(join('src', 'components', 'FormWorkspace.tsx'), "am.700.destek");
assertContains(join('src', 'components', 'FormWorkspace.tsx'), "am.800.ekler-imza");
assertContains(join('src', 'components', 'FormWorkspace.tsx'), "pm.100.kayit-ve-buluntu");
assertContains(join('src', 'components', 'FormWorkspace.tsx'), "pm.300.esyalar");
assertContains(join('src', 'components', 'FormWorkspace.tsx'), "pm.400.fiziksel-tanim");
assertContains(join('src', 'components', 'FormWorkspace.tsx'), "pm.500.tibbi-patoloji");
assertContains(join('src', 'components', 'FormWorkspace.tsx'), "pm.600.odontoloji");
assertContains(join('src', 'components', 'FormWorkspace.tsx'), "pm.700.destek");
assertContains(join('src', 'components', 'FormWorkspace.tsx'), "pm.800.dna-ekler-imza");
assertContains(join('src', 'components', 'FormWorkspace.tsx'), "pm.other");
assertContains(join('src', 'components', 'FormWorkspace.tsx'), "FormSectionNavigator");
assertContains(join('src', 'components', 'FormWorkspace.tsx'), "FormFieldControl");
assertContains(join('src', 'components', 'FormWorkspace.tsx'), "onFieldValueChange");
assertContains(join('src', 'components', 'FormFieldControl.tsx'), "keyboardType");
assertContains(join('src', 'components', 'FormFieldControl.tsx'), "accessibilityRole=\"checkbox\"");
assertContains(join('src', 'components', 'FormFieldControl.tsx'), "onValueChange");
assertContains(join('src', 'components', 'FormFieldControl.tsx'), "validateSchemaValue");
assertContains(join('App.tsx'), "updateDraftFieldValue");
assertContains(join('src', 'storage', 'draftStore.ts'), "updateDraftFieldValue");
assertContains(join('src', 'config', 'buildInfo.ts'), "phase-4f-v0.4.5-20260511");

console.log('Ortak form renderer doğrulaması geçti.');
