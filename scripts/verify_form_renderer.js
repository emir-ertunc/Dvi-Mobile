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
assertContains(join('src', 'components', 'FormWorkspace.tsx'), "FIELD_FILTERS");
assertContains(join('src', 'components', 'FormWorkspace.tsx'), "fieldSearch");
assertContains(join('src', 'components', 'FormWorkspace.tsx'), "Bölüm ilerlemesi");
assertContains(join('src', 'components', 'FormWorkspace.tsx'), "Alan bul ve filtrele");
assertContains(join('src', 'components', 'FormWorkspace.tsx'), "filteredFieldRows");
assertContains(join('src', 'components', 'FormFieldControl.tsx'), "keyboardType");
assertContains(join('src', 'components', 'FormFieldControl.tsx'), "accessibilityRole=\"checkbox\"");
assertContains(join('src', 'components', 'FormFieldControl.tsx'), "onValueChange");
assertContains(join('src', 'components', 'FormFieldControl.tsx'), "validateSchemaValue");
assertContains(join('src', 'components', 'FormFieldControl.tsx'), "getFieldUiText");
assertContains(join('src', 'components', 'FormFieldControl.tsx'), "uiText.labelTr");
assertContains(join('src', 'components', 'FormFieldControl.tsx'), "uiText.helpTextTr");
assertContains(join('App.tsx'), "Modal");
assertContains(join('App.tsx'), "animationType=\"fade\"");
assertContains(join('App.tsx'), "accessibilityRole=\"alert\"");
assertContains(join('App.tsx'), "updateDraftFieldValue");
assertContains(join('src', 'storage', 'draftStore.ts'), "updateDraftFieldValue");
assertContains(join('src', 'config', 'buildInfo.ts'), "phase-5a-fix5-v0.5.5-20260512");
assertContains(join('src', 'config', 'pdfTemplates.ts'), "PDF_TEMPLATE_MANIFEST");
assertContains(join('src', 'config', 'diagnostics.ts'), "PDF şablonları");
assertContains(join('src', 'navigation', 'appRoutes.ts'), "'saved' | 'forms' | 'form' | 'status' | 'system'");
assertContains(join('src', 'navigation', 'appRoutes.ts'), "Kayıtlı Taslaklar");
assertContains(join('src', 'components', 'RouteTabs.tsx'), "ScrollView");
assertContains(join('src', 'components', 'RouteTabs.tsx'), "horizontal");
assertContains(join('App.tsx'), "SavedScreen");
assertContains(join('App.tsx'), "ActiveFormScreen");
assertContains(join('App.tsx'), "StatusScreen");
assertContains(join('App.tsx'), "DRAFT_LIST_FILTERS");
assertContains(join('App.tsx'), "Taslak Listesi");
assertContains(join('App.tsx'), "Taslak arama");
assertContains(join('App.tsx'), "onNavigate('form')");
assertContains(join('App.tsx'), "Kayıtlı taslaklar ayrı ekranda");
assertContains(join('App.tsx'), "Ölüm Öncesi Kaydı Başlat");
assertContains(join('App.tsx'), "Ölüm Sonrası Kaydı Başlat");
assertContains(join('App.tsx'), "startDraft");
assertContains(join('App.tsx'), "const createdDraftId = await draftState.createDraft(formType);");
assertContains(join('src', 'hooks', 'useLocalDrafts.ts'), "Promise<string | null>");
assertContains(join('App.tsx'), "activeContextGrid");
assertContains(join('App.tsx'), "Aktif bölüm");
assertContains(join('App.tsx'), "Tamamlanma: %");
assertContains(join('App.tsx'), "Formu kapat");
assertContains(join('src', 'components', 'FormWorkspace.tsx'), "onActiveSectionChange");
assertContains(join('src', 'components', 'FormWorkspace.tsx'), "onValueChange={(fieldId, value) => onFieldValueChange(fieldId, value)}");
assertContains(join('src', 'components', 'FormFieldControl.tsx'), "İstenen bilgiyi yazın");
assertContains(join('src', 'components', 'FormFieldControl.tsx'), "Resmi form eşleşmesi");
assertContains(join('src', 'components', 'FormFieldControl.tsx'), "fieldHelp");
assertContains(join('src', 'components', 'FormFieldControl.tsx'), "checkboxOptionLabel");
assertContains(join('src', 'components', 'FormFieldControl.tsx'), "Seçenek: {checkboxLabel}");
assertContains(join('src', 'components', 'FormFieldControl.tsx'), "Seçili değil");
assertContains(join('src', 'components', 'FormFieldControl.tsx'), "Kaldır");
assertContains(join('src', 'components', 'FormFieldControl.tsx'), "replace(/\\s+seçim$/i");
assertContains(join('scripts', 'build_ui_labels.js'), "numaralı resmi form bloğu");
assertContains(join('scripts', 'build_ui_labels.js'), "bilgi parçası");
assertContains(join('scripts', 'build_ui_labels.js'), "eş veya partner bilgisi");
assertContains(join('scripts', 'build_ui_labels.js'), "specificFieldLabel");
assertContains(join('scripts', 'build_ui_labels.js'), "label.controlTypeMismatch");
assertContains(join('scripts', 'build_ui_labels.js'), "Ek e-posta adresi");
assertContains(join('scripts', 'build_ui_labels.js'), "İşlemi yapan görevli veya memur");
assertContains(join('scripts', 'build_ui_labels.js'), "SERIES_DESCRIPTIONS");
assertContains(join('scripts', 'audit_field_contract.js'), "Alan sözleşmesi doğrulaması geçti");

console.log('Ortak form renderer doğrulaması geçti.');
