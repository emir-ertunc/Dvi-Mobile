const { existsSync, mkdirSync, readFileSync, writeFileSync } = require('node:fs');
const { dirname, join } = require('node:path');

const PHASE = 'Phase 1D';
const VERSION = '0.1.8';
const BUILD_ID = 'phase-1d-v0.1.8-20260510';
const ROOT = process.cwd();
const OUTPUT_JSON = join(ROOT, 'data', 'form-inventory', 'inventory-audit.json');
const OUTPUT_MD = join(ROOT, 'docs', 'acroform-forensics', 'phase-1d-inventory-audit.md');
const SUMMARY_MD = join(ROOT, 'docs', 'acroform-forensics', 'phase-1d-summary.md');

const FORMS = [
  {
    formType: 'AM',
    inventoryPath: join(ROOT, 'data', 'form-inventory', 'am-acroform-inventory.json'),
    manifestPath: join(ROOT, 'data', 'acroform-forensics', 'generated', 'am-widget-manifest.json'),
    previousAuditPath: join(ROOT, 'data', 'form-inventory', 'am-acroform-audit.json'),
    expected: {
      pages: 18,
      widgets: 2006,
      fields: 1687,
      checkboxWidgets: 718,
      textWidgets: 1288,
      duplicateGroups: 57,
    },
  },
  {
    formType: 'PM',
    inventoryPath: join(ROOT, 'data', 'form-inventory', 'pm-acroform-inventory.json'),
    manifestPath: join(ROOT, 'data', 'acroform-forensics', 'generated', 'pm-widget-manifest.json'),
    previousAuditPath: join(ROOT, 'data', 'form-inventory', 'pm-acroform-audit.json'),
    expected: {
      pages: 19,
      widgets: 2026,
      fields: 1693,
      checkboxWidgets: 883,
      textWidgets: 1143,
      duplicateGroups: 72,
    },
  },
];

const REQUIRED_SUMMARIES = [
  'docs/acroform-forensics/phase-1a-summary.md',
  'docs/acroform-forensics/phase-1b-summary.md',
  'docs/acroform-forensics/phase-1c-summary.md',
];

const OLD_PATHS = [
  'docs/form-forensics',
  'data/form-forensics',
  'scripts/verify_turkish_forms.py',
  'scripts/inventory_audit.js',
  'scripts/verify_inventory.js',
];

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function assert(condition, failures, message) {
  if (!condition) failures.push(message);
}

function instanceKey(instance) {
  return `${instance.pageNumber}:${instance.pageWidgetIndex}:${instance.fieldName}`;
}

function manifestKey(widget) {
  return `${widget.pageNumber}:${widget.pageWidgetIndex}:${widget.fieldName}`;
}

function auditForm(config) {
  const failures = [];
  const inventory = readJson(config.inventoryPath);
  const manifest = readJson(config.manifestPath);
  const previousAudit = readJson(config.previousAuditPath);

  const manifestByKey = new Map(manifest.map((widget) => [manifestKey(widget), widget]));
  const inventoryInstanceKeys = new Set();
  const canonicalIds = new Set();
  const pdfFieldNames = new Set();
  const checkboxWidgets = manifest.filter((widget) => widget.fieldType === 'CheckBox');
  const textWidgets = manifest.filter((widget) => widget.fieldType === 'Text');

  assert(inventory.formType === config.formType, failures, `${config.formType}: inventory formType hatalı`);
  assert(inventory.fields.length === config.expected.fields, failures, `${config.formType}: field sayısı beklenen değerle eşleşmiyor`);
  assert(manifest.length === config.expected.widgets, failures, `${config.formType}: widget sayısı beklenen değerle eşleşmiyor`);
  assert(inventory.totals.pageCount === config.expected.pages, failures, `${config.formType}: sayfa sayısı beklenen değerle eşleşmiyor`);
  assert(checkboxWidgets.length === config.expected.checkboxWidgets, failures, `${config.formType}: checkbox widget sayısı beklenen değerle eşleşmiyor`);
  assert(textWidgets.length === config.expected.textWidgets, failures, `${config.formType}: text widget sayısı beklenen değerle eşleşmiyor`);
  assert(previousAudit.passed === true, failures, `${config.formType}: önceki form audit sonucu başarısız`);
  assert(inventory.totals.duplicateFieldNameCount === config.expected.duplicateGroups, failures, `${config.formType}: duplicate group sayısı beklenen değerle eşleşmiyor`);

  for (const field of inventory.fields) {
    assert(!canonicalIds.has(field.canonicalFieldId), failures, `${config.formType}: duplicate canonical id ${field.canonicalFieldId}`);
    canonicalIds.add(field.canonicalFieldId);
    pdfFieldNames.add(field.pdfFieldName);

    assert(field.status === 'mapped', failures, `${config.formType}: mapped olmayan field ${field.pdfFieldName}`);
    assert(Boolean(field.uiLabelTr), failures, `${config.formType}: uiLabelTr eksik ${field.pdfFieldName}`);
    assert(Boolean(field.visibleLabel), failures, `${config.formType}: visibleLabel eksik ${field.pdfFieldName}`);
    assert(Boolean(field.controlType), failures, `${config.formType}: controlType eksik ${field.pdfFieldName}`);
    assert(Boolean(field.valueType), failures, `${config.formType}: valueType eksik ${field.pdfFieldName}`);
    assert(Boolean(field.readinessRule), failures, `${config.formType}: readinessRule eksik ${field.pdfFieldName}`);
    assert(Boolean(field.exportBinding?.fieldName), failures, `${config.formType}: exportBinding eksik ${field.pdfFieldName}`);
    assert(Boolean(field.officialSection?.id), failures, `${config.formType}: officialSection eksik ${field.pdfFieldName}`);
    assert(Array.isArray(field.widgetInstances) && field.widgetInstances.length > 0, failures, `${config.formType}: widgetInstances eksik ${field.pdfFieldName}`);

    if (field.controlType === 'checkbox') {
      assert(field.checkboxButtonStates.length > 0, failures, `${config.formType}: checkboxButtonStates eksik ${field.pdfFieldName}`);
    }

    for (const instance of field.widgetInstances) {
      const key = instanceKey(instance);
      assert(!inventoryInstanceKeys.has(key), failures, `${config.formType}: duplicate widget instance ${key}`);
      inventoryInstanceKeys.add(key);
      const manifestWidget = manifestByKey.get(key);
      assert(Boolean(manifestWidget), failures, `${config.formType}: manifest karşılığı olmayan widget instance ${key}`);
      if (manifestWidget) {
        assert(JSON.stringify(manifestWidget.rect) === JSON.stringify(instance.rect), failures, `${config.formType}: rect uyuşmazlığı ${key}`);
        assert(manifestWidget.fieldType === instance.fieldType, failures, `${config.formType}: fieldType uyuşmazlığı ${key}`);
      }
    }
  }

  for (const widget of manifest) {
    const key = manifestKey(widget);
    assert(inventoryInstanceKeys.has(key), failures, `${config.formType}: inventory tarafından kapsanmayan widget ${key}`);
  }

  const pageCoverage = previousAudit.pageCoverage || [];
  assert(pageCoverage.length === config.expected.pages, failures, `${config.formType}: pageCoverage sayısı hatalı`);
  for (const page of pageCoverage) {
    assert(page.unaccounted === 0, failures, `${config.formType}: sayfa ${page.pageNumber} unaccounted=${page.unaccounted}`);
    assert(page.mapped === page.widgetTotal, failures, `${config.formType}: sayfa ${page.pageNumber} mapped/widget uyumsuz`);
  }

  const metrics = {
    formType: config.formType,
    inventoryPath: config.inventoryPath.replace(ROOT, '').replace(/^[/\\]/, '').replaceAll('\\', '/'),
    manifestPath: config.manifestPath.replace(ROOT, '').replace(/^[/\\]/, '').replaceAll('\\', '/'),
    pageCount: inventory.totals.pageCount,
    manifestWidgetCount: manifest.length,
    inventoryFieldCount: inventory.fields.length,
    coveredWidgetCount: inventoryInstanceKeys.size,
    canonicalFieldIdCount: canonicalIds.size,
    uniquePdfFieldNameCount: pdfFieldNames.size,
    checkboxWidgetCount: checkboxWidgets.length,
    textWidgetCount: textWidgets.length,
    checkboxWidgetsWithButtonStates: checkboxWidgets.filter((widget) => widget.buttonStates).length,
    textWidgetsWithNullButtonStates: textWidgets.filter((widget) => !widget.buttonStates).length,
    repeatedFieldCount: inventory.totals.repeatedFieldCount,
    duplicateFieldNameCount: inventory.totals.duplicateFieldNameCount,
    sectionCount: inventory.sections.length,
    missingUiLabelTrCount: inventory.fields.filter((field) => !field.uiLabelTr).length,
    missingExportBindingCount: inventory.fields.filter((field) => !field.exportBinding?.fieldName).length,
    missingReadinessRuleCount: inventory.fields.filter((field) => !field.readinessRule).length,
    missingOfficialSectionCount: inventory.fields.filter((field) => !field.officialSection?.id).length,
    labelEvidenceCoveragePct: previousAudit.metrics.labelEvidenceCoveragePct,
    emptyNearbyLabelCandidates: previousAudit.metrics.emptyNearbyLabelCandidates,
  };

  return {
    formType: config.formType,
    passed: failures.length === 0,
    failures,
    metrics,
  };
}

function auditRepository() {
  const failures = [];
  for (const summary of REQUIRED_SUMMARIES) {
    assert(existsSync(join(ROOT, summary)), failures, `Summary dosyası eksik: ${summary}`);
  }
  for (const oldPath of OLD_PATHS) {
    assert(!existsSync(join(ROOT, oldPath)), failures, `Eski artefakt hâlâ mevcut: ${oldPath}`);
  }
  return failures;
}

function markdown(audit) {
  const lines = [
    '# Phase 1D Envanter Denetim Raporu',
    '',
    `Faz: ${PHASE}`,
    `Sürüm: ${VERSION}`,
    `Build: ${BUILD_ID}`,
    '',
    '| Form | Field | Widget | Covered | Checkbox state | Text state | Repeated | Label evidence |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
  ];

  for (const form of audit.forms) {
    const m = form.metrics;
    lines.push(
      `| ${form.formType} | ${m.inventoryFieldCount} | ${m.manifestWidgetCount} | ${m.coveredWidgetCount} | ${m.checkboxWidgetsWithButtonStates}/${m.checkboxWidgetCount} | ${m.textWidgetsWithNullButtonStates}/${m.textWidgetCount} | ${m.repeatedFieldCount} | ${m.labelEvidenceCoveragePct}% |`,
    );
  }

  lines.push('', '## Sertleştirilen Kurallar', '');
  lines.push('- Her manifest widget instance bir inventory kaydı tarafından kapsanır.');
  lines.push('- Widget identity `pageNumber + pageWidgetIndex + fieldName + rect` düzeyinde doğrulanır.');
  lines.push('- Her canonical id benzersizdir.');
  lines.push('- Her field için Türkçe UI label, readiness rule, official section ve export binding zorunludur.');
  lines.push('- Checkbox widgetlarının button state bilgisi eksiksizdir.');
  lines.push('- Text widgetlarında button state beklenmez.');
  lines.push('- Eski form forensics dizinleri ve eski inventory scriptleri geri gelmemiştir.');
  lines.push('- Phase 1A, Phase 1B ve Phase 1C summary dosyaları korunur.');

  lines.push('', '## Sonuç', '');
  lines.push(audit.passed ? 'AM/PM envanter denetimi geçti.' : 'AM/PM envanter denetimi başarısız.');

  if (!audit.passed) {
    lines.push('', '## Hatalar', '');
    for (const failure of audit.failures) {
      lines.push(`- ${failure}`);
    }
  }

  return `${lines.join('\n')}\n`;
}

function summary(audit) {
  return `# Phase 1D Özeti: Coverage ve Envanter Denetim Sertleştirmesi

Phase 1D, AM ve PM AcroForm envanterlerinin birlikte denetlenmesini sağlar. Bu faz yeni alan envanteri çıkarmaz; Phase 1B ve Phase 1C çıktılarının Phase 2 için güvenilir kaynak olmasını garanti eden ortak kalite kapısını ekler.

## Korunan Summary Dosyaları

- \`docs/acroform-forensics/phase-1a-summary.md\`
- \`docs/acroform-forensics/phase-1b-summary.md\`
- \`docs/acroform-forensics/phase-1c-summary.md\`
- \`docs/acroform-forensics/phase-1d-summary.md\`

## Üretilen Dosyalar

- \`data/form-inventory/inventory-audit.json\`
- \`docs/acroform-forensics/phase-1d-inventory-audit.md\`

## Sayısal Sonuç

| Form | Field | Widget | Covered | Eksik binding | Eksik label | Eksik section |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
${audit.forms
  .map(
    (form) =>
      `| ${form.formType} | ${form.metrics.inventoryFieldCount} | ${form.metrics.manifestWidgetCount} | ${form.metrics.coveredWidgetCount} | ${form.metrics.missingExportBindingCount} | ${form.metrics.missingUiLabelTrCount} | ${form.metrics.missingOfficialSectionCount} |`,
  )
  .join('\n')}

## Faz Sınırı

Bu faz schema, validation, veri giriş UI veya PDF export motorunu başlatmaz.
`;
}

function run({ write }) {
  const formAudits = FORMS.map(auditForm);
  const repoFailures = auditRepository();
  const failures = [...repoFailures, ...formAudits.flatMap((form) => form.failures)];
  const audit = {
    phase: PHASE,
    version: VERSION,
    buildId: BUILD_ID,
    passed: failures.length === 0,
    failures,
    forms: formAudits,
  };

  if (write) {
    writeJson(OUTPUT_JSON, audit);
    mkdirSync(dirname(OUTPUT_MD), { recursive: true });
    writeFileSync(OUTPUT_MD, markdown(audit), 'utf8');
    writeFileSync(SUMMARY_MD, summary(audit), 'utf8');
  }

  if (!audit.passed) {
    console.error(audit.failures.join('\n'));
    process.exit(1);
  }

  console.log('AM/PM envanter denetimi geçti.');
}

run({ write: process.argv.includes('--write') });
