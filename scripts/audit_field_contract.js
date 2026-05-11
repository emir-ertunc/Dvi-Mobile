const { mkdirSync, readFileSync, writeFileSync } = require('node:fs');
const { dirname, join } = require('node:path');

const PHASE = 'Phase 5A-Fix4';
const VERSION = '0.5.4';
const BUILD_ID = 'phase-5a-fix4-v0.5.4-20260512';
const ROOT = process.cwd();
const OUTPUT_AUDIT = join(ROOT, 'data', 'field-contract', 'field-contract-audit.json');
const OUTPUT_REPORT = join(ROOT, 'docs', 'app', 'phase-5a-fix4-field-contract.md');

const FORM_CONFIGS = [
  {
    formType: 'AM',
    manifestPath: join(ROOT, 'data', 'acroform-forensics', 'generated', 'am-widget-manifest.json'),
    inventoryPath: join(ROOT, 'data', 'form-inventory', 'am-acroform-inventory.json'),
    schemaPath: join(ROOT, 'data', 'schema', 'am-schema.json'),
    expectedFields: 1687,
    expectedWidgets: 2006,
    expectedPages: 18,
  },
  {
    formType: 'PM',
    manifestPath: join(ROOT, 'data', 'acroform-forensics', 'generated', 'pm-widget-manifest.json'),
    inventoryPath: join(ROOT, 'data', 'form-inventory', 'pm-acroform-inventory.json'),
    schemaPath: join(ROOT, 'data', 'schema', 'pm-schema.json'),
    expectedFields: 1693,
    expectedWidgets: 2026,
    expectedPages: 19,
  },
];

const FORBIDDEN_RUNTIME_PATTERNS = [
  { code: 'label.requiredPlaceholder', pattern: /\bgerekli\s+(metin|seçim|e-posta|telefon|sayı)\b/i },
  { code: 'label.formBlockNumber', pattern: /\bnumaralı resmi form bloğu\b/i },
  { code: 'label.rowNumber', pattern: /\b\d+\.\s*(satır|alan)\b/i },
  { code: 'label.infoPiece', pattern: /\bbilgi parçası\b/i },
  { code: 'label.doubleInfoObject', pattern: /\b(bilgisi|seçeneği|adresi|numarası|açıklaması|notu)\s+bilgisini\b/i },
  { code: 'label.rawPdfId', pattern: /\b\d{3}\.\d/ },
  { code: 'label.schemaPlaceholder', pattern: /^(AM|PM) alanı\b/i },
];

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeText(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, value, 'utf8');
}

function sameJson(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function sorted(values) {
  return [...values].sort((left, right) => String(left).localeCompare(String(right)));
}

function fail(failures, code, message, context = {}) {
  failures.push({ code, message, context });
}

function manifestKey(formType, widget) {
  return `${formType}:${widget.pageNumber}:${widget.pageWidgetIndex}:${widget.fieldName}`;
}

function widgetKeysFromFields(fields) {
  return fields.flatMap((field) => field.widgetInstances.map((widget) => widget.instanceKey));
}

function setDifference(left, right) {
  const rightSet = new Set(right);
  return sorted(left.filter((value) => !rightSet.has(value)));
}

function duplicateValues(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) || 0) + 1);
  return sorted([...counts.entries()].filter(([, count]) => count > 1).map(([value]) => value));
}

function labelText(label) {
  return `${label?.labelTr || ''} ${label?.shortLabelTr || ''} ${label?.helpTextTr || ''}`.trim();
}

function auditRuntimeLabel(field, label, failures) {
  const text = labelText(label);
  const lower = text.toLocaleLowerCase('tr-TR');

  if (!label) {
    fail(failures, 'label.missing', 'Alan için Türkçe UI label kaydı yok.', { fieldId: field.schemaFieldId });
    return;
  }
  if (!label.labelTr || label.labelTr.length < 12) {
    fail(failures, 'label.labelTrTooShort', 'Ana alan etiketi boş veya çok kısa.', {
      fieldId: field.schemaFieldId,
      labelTr: label.labelTr,
    });
  }
  if (!label.shortLabelTr || label.shortLabelTr.length < 3) {
    fail(failures, 'label.shortLabelTooShort', 'Kısa alan etiketi boş veya çok kısa.', {
      fieldId: field.schemaFieldId,
      shortLabelTr: label.shortLabelTr,
    });
  }
  if (!label.helpTextTr || label.helpTextTr.length < 24) {
    fail(failures, 'label.helpTooShort', 'Yardım metni boş veya çok kısa.', {
      fieldId: field.schemaFieldId,
      helpTextTr: label.helpTextTr,
    });
  }

  for (const item of FORBIDDEN_RUNTIME_PATTERNS) {
    if (item.pattern.test(text)) {
      fail(failures, item.code, 'Kullanıcıya görünen metinde teknik veya belirsiz kalıp var.', {
        fieldId: field.schemaFieldId,
        text,
      });
    }
  }

  if (field.controlType === 'email' && !lower.includes('e-posta')) {
    fail(failures, 'label.emailMismatch', 'E-posta input tipi e-posta olarak adlandırılmamış.', {
      fieldId: field.schemaFieldId,
      text,
    });
  }
  if (field.controlType === 'phone' && !lower.includes('telefon')) {
    fail(failures, 'label.phoneMismatch', 'Telefon input tipi telefon olarak adlandırılmamış.', {
      fieldId: field.schemaFieldId,
      text,
    });
  }
  if (field.controlType === 'date-part' && !/(tarih|gün|ay|yıl)/i.test(lower)) {
    fail(failures, 'label.datePartMismatch', 'Tarih parçası input tipi tarih/gün/ay/yıl bağlamı taşımıyor.', {
      fieldId: field.schemaFieldId,
      text,
    });
  }
  if (field.controlType === 'checkbox' && !/(işaret|seçenek|evet|hayır|var|yok|uygun)/i.test(lower)) {
    fail(failures, 'label.checkboxMismatch', 'Checkbox alanı seçim/işaretleme bağlamı taşımıyor.', {
      fieldId: field.schemaFieldId,
      text,
    });
  }
}

function auditForm(config, labels) {
  const manifest = readJson(config.manifestPath);
  const inventory = readJson(config.inventoryPath);
  const schema = readJson(config.schemaPath);
  const failures = [];

  const manifestKeys = manifest.map((widget) => manifestKey(config.formType, widget));
  const inventoryKeys = widgetKeysFromFields(inventory.fields);
  const schemaKeys = widgetKeysFromFields(schema.fields);
  const manifestPages = new Set(manifest.map((widget) => widget.pageNumber));
  const manifestFieldNames = new Set(manifest.map((widget) => widget.fieldName));

  if (manifest.length !== config.expectedWidgets) {
    fail(failures, 'manifest.widgetCount', 'PDF manifest widget sayısı beklenen değerle uyuşmuyor.', {
      expected: config.expectedWidgets,
      actual: manifest.length,
    });
  }
  if (manifestFieldNames.size !== config.expectedFields) {
    fail(failures, 'manifest.uniqueFieldCount', 'PDF manifest unique field sayısı beklenen değerle uyuşmuyor.', {
      expected: config.expectedFields,
      actual: manifestFieldNames.size,
    });
  }
  if (manifestPages.size !== config.expectedPages) {
    fail(failures, 'manifest.pageCount', 'PDF manifest sayfa sayısı beklenen değerle uyuşmüyor.', {
      expected: config.expectedPages,
      actual: manifestPages.size,
    });
  }
  if (inventory.totals.fieldCount !== config.expectedFields || schema.totals.fieldCount !== config.expectedFields) {
    fail(failures, 'fieldCount', 'Inventory veya schema field sayısı beklenen değerle uyuşmuyor.', {
      expected: config.expectedFields,
      inventory: inventory.totals.fieldCount,
      schema: schema.totals.fieldCount,
    });
  }
  if (inventory.totals.widgetInstanceCount !== config.expectedWidgets || schema.totals.widgetInstanceCount !== config.expectedWidgets) {
    fail(failures, 'widgetCount', 'Inventory veya schema widget sayısı beklenen değerle uyuşmuyor.', {
      expected: config.expectedWidgets,
      inventory: inventory.totals.widgetInstanceCount,
      schema: schema.totals.widgetInstanceCount,
    });
  }

  const manifestDuplicates = duplicateValues(manifestKeys);
  const inventoryDuplicates = duplicateValues(inventoryKeys);
  const schemaDuplicates = duplicateValues(schemaKeys);
  if (manifestDuplicates.length > 0) fail(failures, 'manifest.duplicateWidgetKey', 'Manifest widget anahtarı tekrar ediyor.', { keys: manifestDuplicates.slice(0, 20) });
  if (inventoryDuplicates.length > 0) fail(failures, 'inventory.duplicateWidgetKey', 'Inventory widget anahtarı tekrar ediyor.', { keys: inventoryDuplicates.slice(0, 20) });
  if (schemaDuplicates.length > 0) fail(failures, 'schema.duplicateWidgetKey', 'Schema widget anahtarı tekrar ediyor.', { keys: schemaDuplicates.slice(0, 20) });

  const missingInventoryKeys = setDifference(manifestKeys, inventoryKeys);
  const extraInventoryKeys = setDifference(inventoryKeys, manifestKeys);
  const missingSchemaKeys = setDifference(manifestKeys, schemaKeys);
  const extraSchemaKeys = setDifference(schemaKeys, manifestKeys);
  if (missingInventoryKeys.length > 0) fail(failures, 'inventory.missingWidget', 'PDF widget için inventory karşılığı yok.', { keys: missingInventoryKeys.slice(0, 50) });
  if (extraInventoryKeys.length > 0) fail(failures, 'inventory.extraWidget', 'Inventory içinde PDF manifest karşılığı olmayan widget var.', { keys: extraInventoryKeys.slice(0, 50) });
  if (missingSchemaKeys.length > 0) fail(failures, 'schema.missingWidget', 'PDF widget için schema karşılığı yok.', { keys: missingSchemaKeys.slice(0, 50) });
  if (extraSchemaKeys.length > 0) fail(failures, 'schema.extraWidget', 'Schema içinde PDF manifest karşılığı olmayan widget var.', { keys: extraSchemaKeys.slice(0, 50) });

  let acroformBindingCount = 0;
  let labelCount = 0;
  let checkboxStateCount = 0;

  for (const field of schema.fields) {
    const label = labels[field.schemaFieldId];
    auditRuntimeLabel(field, label, failures);
    if (label) labelCount += 1;

    if (field.exportBinding?.strategy !== 'acroformFieldNames') {
      fail(failures, 'export.strategy', 'Alan AcroForm field name stratejisine bağlı değil.', {
        fieldId: field.schemaFieldId,
        strategy: field.exportBinding?.strategy,
      });
    } else {
      acroformBindingCount += 1;
    }
    if (field.exportBinding?.fieldName !== field.pdfFieldName) {
      fail(failures, 'export.fieldName', 'Export binding PDF field name ile uyuşmuyor.', {
        fieldId: field.schemaFieldId,
        pdfFieldName: field.pdfFieldName,
        binding: field.exportBinding?.fieldName,
      });
    }
    if (field.exportBinding?.widgetInstanceCount !== field.widgetInstances.length) {
      fail(failures, 'export.widgetCount', 'Export binding widget sayısı schema ile uyuşmuyor.', {
        fieldId: field.schemaFieldId,
        binding: field.exportBinding?.widgetInstanceCount,
        widgetInstances: field.widgetInstances.length,
      });
    }

    if (field.controlType === 'checkbox') {
      const states = field.widgetInstances.flatMap((widget) => widget.buttonStates?.normal || []);
      if (!states.includes('Off') || states.length < 2) {
        fail(failures, 'checkbox.states', 'Checkbox alanında deterministik button state bilgisi eksik.', {
          fieldId: field.schemaFieldId,
          states,
        });
      } else {
        checkboxStateCount += 1;
      }
    }
  }

  return {
    formType: config.formType,
    passed: failures.length === 0,
    metrics: {
      expectedFields: config.expectedFields,
      expectedWidgets: config.expectedWidgets,
      expectedPages: config.expectedPages,
      manifestWidgetCount: manifest.length,
      manifestUniqueFieldCount: manifestFieldNames.size,
      inventoryFieldCount: inventory.totals.fieldCount,
      inventoryWidgetCount: inventory.totals.widgetInstanceCount,
      schemaFieldCount: schema.totals.fieldCount,
      schemaWidgetCount: schema.totals.widgetInstanceCount,
      runtimeLabelCount: labelCount,
      acroformBindingCount,
      checkboxStateCount,
    },
    failures,
  };
}

function reportMarkdown(audit) {
  const rows = audit.forms
    .map(
      (form) =>
        `| ${form.formType} | ${form.metrics.schemaFieldCount} | ${form.metrics.schemaWidgetCount} | ${form.metrics.runtimeLabelCount} | ${form.metrics.acroformBindingCount} | ${form.metrics.checkboxStateCount} | ${form.passed ? 'Geçti' : 'Kaldı'} |`,
    )
    .join('\n');

  return `# ${PHASE} Alan Sözleşmesi Denetimi

Bu rapor, PDF AcroForm widget kapsamı ile uygulamadaki envanter, schema, export binding ve Türkçe alan metinleri arasındaki sözleşmeyi denetler.

## Sonuç

- Toplam PDF widget: ${audit.totals.widgetCount} / 4032
- Toplam canonical alan: ${audit.totals.fieldCount} / 3380
- Türkçe UI label karşılığı: ${audit.totals.runtimeLabelCount} / 3380
- AcroForm export binding: ${audit.totals.acroformBindingCount} / 3380
- Denetim sonucu: ${audit.passed ? 'Geçti' : 'Kaldı'}

| Form | Alan | PDF widget | Türkçe label | AcroForm binding | Checkbox state | Sonuç |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
${rows}

## Gate

- Her PDF widget instance anahtarı inventory ve schema içinde bire bir temsil edilmelidir.
- Her schema alanı Türkçe label, kısa label ve yardım metni taşımalıdır.
- Kullanıcıya görünen metinde teknik PDF field id, sıra numarası, belirsiz blok numarası veya genel placeholder kalıbı bulunmamalıdır.
- E-posta, telefon, tarih parçası ve checkbox alanları kendi input tipini açıkça yansıtmalıdır.
`;
}

function run({ write }) {
  const labelOutput = readJson(join(ROOT, 'data', 'ui-labels', 'field-ui-labels.json'));
  const labels = labelOutput.labels || {};
  const forms = FORM_CONFIGS.map((config) => auditForm(config, labels));
  const failures = forms.flatMap((form) => form.failures.map((failure) => ({ formType: form.formType, ...failure })));
  const totals = forms.reduce(
    (acc, form) => ({
      fieldCount: acc.fieldCount + form.metrics.schemaFieldCount,
      widgetCount: acc.widgetCount + form.metrics.schemaWidgetCount,
      runtimeLabelCount: acc.runtimeLabelCount + form.metrics.runtimeLabelCount,
      acroformBindingCount: acc.acroformBindingCount + form.metrics.acroformBindingCount,
      checkboxStateCount: acc.checkboxStateCount + form.metrics.checkboxStateCount,
    }),
    { fieldCount: 0, widgetCount: 0, runtimeLabelCount: 0, acroformBindingCount: 0, checkboxStateCount: 0 },
  );

  const audit = {
    phase: PHASE,
    version: VERSION,
    buildId: BUILD_ID,
    passed: failures.length === 0,
    totals,
    forms,
    failures,
  };

  if (write) {
    writeJson(OUTPUT_AUDIT, audit);
    writeText(OUTPUT_REPORT, reportMarkdown(audit));
  } else {
    const current = readJson(OUTPUT_AUDIT);
    if (!sameJson(current, audit)) {
      failures.push({ code: 'fieldContract.outputDrift', message: 'Alan sözleşmesi audit çıktısı güncel değil.' });
    }
  }

  if (failures.length > 0) {
    console.error(JSON.stringify(failures.slice(0, 50), null, 2));
    process.exit(1);
  }

  console.log(`Alan sözleşmesi doğrulaması geçti. field=${totals.fieldCount}, widget=${totals.widgetCount}`);
}

run({ write: process.argv.includes('--write') });
