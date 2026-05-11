const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const ROOT = process.cwd();
const EXPECTED_VISIBLE_COUNTS = { AM: 1243, PM: 1246 };
const FORBIDDEN_VISIBLE_LABEL_PATTERNS = [
  /\bVeri mevcut de[gğ]il se[cç]ene[gğ]i\b/i,
  /\bEk belge var se[cç]ene[gğ]i\b/i,
  /\bEk bilgi sayfas[ıi]nda devam se[cç]ene[gğ]i\b/i,
  /\bdevam[ıi]\b/i,
];

function read(path) {
  return readFileSync(path, 'utf8');
}

function readJson(path) {
  return JSON.parse(read(path));
}

function isHiddenFormEntryField(field) {
  if (/\.[ABC]$/.test(field.pdfFieldName)) return true;
  return /\.(302|304|306)$/.test(field.pdfFieldName);
}

function fail(failures, code, message, context = {}) {
  failures.push({ code, message, context });
}

function labelText(labels, field) {
  const label = labels[field.schemaFieldId];
  return `${label?.labelTr || ''} ${label?.shortLabelTr || ''} ${label?.helpTextTr || ''}`.trim();
}

function auditForm(formType, labels) {
  const failures = [];
  const schema = readJson(join(ROOT, 'data', 'schema', `${formType.toLowerCase()}-schema.json`));
  const visibleFields = schema.fields.filter((field) => !isHiddenFormEntryField(field));
  const hiddenFields = schema.fields.filter((field) => isHiddenFormEntryField(field));

  if (visibleFields.length !== EXPECTED_VISIBLE_COUNTS[formType]) {
    fail(failures, 'visible.count', `${formType} görünür alan sayısı beklenen değerle uyuşmuyor.`, {
      expected: EXPECTED_VISIBLE_COUNTS[formType],
      actual: visibleFields.length,
    });
  }

  for (const field of visibleFields) {
    if (/\.[ABC]$/.test(field.pdfFieldName)) {
      fail(failures, 'visible.abcOption', 'A/B/C teknik seçim alanı UI görünür listesinde kaldı.', {
        fieldId: field.schemaFieldId,
        pdfFieldName: field.pdfFieldName,
      });
    }
    if (/\.(302|304|306)$/.test(field.pdfFieldName)) {
      fail(failures, 'visible.continuationField', 'Devam alanı UI görünür listesinde kaldı.', {
        fieldId: field.schemaFieldId,
        pdfFieldName: field.pdfFieldName,
      });
    }

    const text = labelText(labels, field);
    for (const pattern of FORBIDDEN_VISIBLE_LABEL_PATTERNS) {
      if (pattern.test(text)) {
        fail(failures, 'visible.forbiddenLabel', 'Görünür kullanıcı alanında kaldırılması gereken etiket kaldı.', {
          fieldId: field.schemaFieldId,
          pdfFieldName: field.pdfFieldName,
          text,
        });
      }
    }
  }

  return {
    formType,
    visibleFieldCount: visibleFields.length,
    hiddenFieldCount: hiddenFields.length,
    failures,
  };
}

const labelOutput = readJson(join(ROOT, 'data', 'ui-labels', 'field-ui-labels.json'));
const labels = labelOutput.labels || {};
const catalogSource = read(join(ROOT, 'src', 'data', 'formSchemaCatalog.ts'));

const failures = [];
if (!catalogSource.includes('isHiddenFormEntryField')) {
  fail(failures, 'catalog.hiddenPredicateMissing', 'Form schema catalog içinde görünür alan filtresi yok.');
}
if (!catalogSource.includes('visibleFormEntryFields')) {
  fail(failures, 'catalog.visibleFilterMissing', 'Form schema catalog içinde görünür alan listesi yok.');
}

const forms = [auditForm('AM', labels), auditForm('PM', labels)];
for (const form of forms) failures.push(...form.failures.map((failure) => ({ formType: form.formType, ...failure })));

if (failures.length > 0) {
  console.error(JSON.stringify(failures.slice(0, 50), null, 2));
  process.exit(1);
}

const visibleTotal = forms.reduce((sum, form) => sum + form.visibleFieldCount, 0);
const hiddenTotal = forms.reduce((sum, form) => sum + form.hiddenFieldCount, 0);
console.log(`Görünür form girişi doğrulaması geçti. visible=${visibleTotal}, hidden=${hiddenTotal}`);
