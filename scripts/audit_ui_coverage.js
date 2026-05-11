const { mkdirSync, readFileSync, writeFileSync } = require('node:fs');
const { dirname, join } = require('node:path');

const PHASE = 'Phase 4G-C';
const VERSION = '0.4.8';
const BUILD_ID = 'phase-4g-c-v0.4.8-20260511';
const ROOT = process.cwd();
const OUTPUT_AUDIT = join(ROOT, 'data', 'ui-coverage', 'ui-coverage-audit.json');
const OUTPUT_MATRIX = join(ROOT, 'docs', 'app', 'phase-4g-c-ui-coverage-matrix.md');

const FORM_CONFIGS = [
  {
    formType: 'AM',
    schemaPath: join(ROOT, 'data', 'schema', 'am-schema.json'),
    expectedFields: 1687,
    expectedWidgets: 2006,
  },
  {
    formType: 'PM',
    schemaPath: join(ROOT, 'data', 'schema', 'pm-schema.json'),
    expectedFields: 1693,
    expectedWidgets: 2026,
  },
];

function read(path) {
  return readFileSync(path, 'utf8');
}

function readJson(path) {
  return JSON.parse(read(path));
}

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeText(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, value, 'utf8');
}

function fail(failures, code, message, context = {}) {
  failures.push({ code, message, context });
}

function sorted(values) {
  return [...values].sort((left, right) => String(left).localeCompare(String(right)));
}

function sectionCoverage(schema) {
  const sections = new Map();

  for (const field of schema.fields) {
    const section = field.officialSection;
    const current = sections.get(section.id) || {
      id: section.id,
      title: section.title,
      fieldCount: 0,
      widgetCount: 0,
      controlCounts: {},
      pages: new Set(),
    };

    current.fieldCount += 1;
    current.widgetCount += field.widgetInstances.length;
    current.controlCounts[field.controlType] = (current.controlCounts[field.controlType] || 0) + 1;
    for (const widget of field.widgetInstances) {
      current.pages.add(widget.pageNumber);
    }
    sections.set(section.id, current);
  }

  return [...sections.values()].map((section) => ({
    ...section,
    pages: [...section.pages].sort((left, right) => left - right),
  }));
}

function extractSet(source, constName) {
  const match = source.match(new RegExp(`const\\s+${constName}\\s*=\\s*new Set\\(\\[([\\s\\S]*?)\\]\\)`));
  if (!match) return null;
  return [...match[1].matchAll(/'([^']+)'/g)].map((item) => item[1]);
}

function requireToken(source, token, failures, file) {
  if (!source.includes(token)) {
    fail(failures, 'ui.tokenMissing', `${file} içinde beklenen UI sözleşmesi yok.`, { token });
  }
}

function auditForm(config, editableSectionIds, failures) {
  const schema = readJson(config.schemaPath);
  const sections = sectionCoverage(schema);
  const sectionIds = sections.map((section) => section.id);
  const missingEditableSections = sorted(sectionIds.filter((sectionId) => !editableSectionIds.includes(sectionId)));
  const staleEditableSections = sorted(editableSectionIds.filter((sectionId) => !sectionIds.includes(sectionId)));
  const fieldCount = sections.reduce((sum, section) => sum + section.fieldCount, 0);
  const widgetCount = sections.reduce((sum, section) => sum + section.widgetCount, 0);

  if (schema.formType !== config.formType) {
    fail(failures, 'schema.formType', `${config.formType} schema form tipi hatalı.`, { actual: schema.formType });
  }
  if (fieldCount !== config.expectedFields) {
    fail(failures, 'ui.fieldCount', `${config.formType} UI kapsam field sayısı beklenen değerle uyuşmuyor.`, {
      expected: config.expectedFields,
      actual: fieldCount,
    });
  }
  if (widgetCount !== config.expectedWidgets) {
    fail(failures, 'ui.widgetCount', `${config.formType} UI kapsam widget sayısı beklenen değerle uyuşmuyor.`, {
      expected: config.expectedWidgets,
      actual: widgetCount,
    });
  }
  if (missingEditableSections.length > 0) {
    fail(failures, 'ui.missingEditableSection', `${config.formType} için UI'da açılmamış section var.`, {
      sectionIds: missingEditableSections,
    });
  }
  if (staleEditableSections.length > 0) {
    fail(failures, 'ui.staleEditableSection', `${config.formType} için schema karşılığı olmayan editable section var.`, {
      sectionIds: staleEditableSections,
    });
  }

  return {
    formType: config.formType,
    passed: missingEditableSections.length === 0 && staleEditableSections.length === 0 && fieldCount === config.expectedFields && widgetCount === config.expectedWidgets,
    metrics: {
      sectionCount: sections.length,
      fieldCount,
      widgetCount,
      editableSectionCount: editableSectionIds.length,
      missingEditableSectionCount: missingEditableSections.length,
      staleEditableSectionCount: staleEditableSections.length,
    },
    sections: sections.map((section) => ({
      id: section.id,
      title: section.title,
      fieldCount: section.fieldCount,
      widgetCount: section.widgetCount,
      pages: section.pages,
      controlCounts: section.controlCounts,
      editable: editableSectionIds.includes(section.id),
    })),
  };
}

function matrixMarkdown(audit) {
  const rows = audit.forms
    .flatMap((form) =>
      form.sections.map(
        (section) =>
          `| ${form.formType} | ${section.id} | ${section.title} | ${section.pages.join(', ')} | ${section.fieldCount} | ${section.widgetCount} | ${section.editable ? 'Evet' : 'Hayır'} |`,
      ),
    )
    .join('\n');

  return `# ${PHASE} UI Coverage Matrisi

Bu matris, AM ve PM canonical schema bölümlerinin uygulamadaki form gezgini ve alan kontrol katmanı üzerinden erişilebilir olduğunu denetler.

## Sonuç

- AM section kapsamı: ${audit.forms.find((form) => form.formType === 'AM').metrics.editableSectionCount} / ${audit.forms.find((form) => form.formType === 'AM').metrics.sectionCount}
- PM section kapsamı: ${audit.forms.find((form) => form.formType === 'PM').metrics.editableSectionCount} / ${audit.forms.find((form) => form.formType === 'PM').metrics.sectionCount}
- UI field kapsamı: ${audit.totals.fieldCount} / 3380
- UI widget kapsamı: ${audit.totals.widgetCount} / 4032
- Sonuç: ${audit.passed ? 'Geçti' : 'Kaldı'}

## Bölüm Matrisi

| Form | Section id | Başlık | Sayfalar | Alan | PDF bileşeni | Düzenlenebilir |
| --- | --- | --- | --- | ---: | ---: | --- |
${rows}
`;
}

function run({ write }) {
  const failures = [];
  const workspaceSource = read(join(ROOT, 'src', 'components', 'FormWorkspace.tsx'));
  const fieldControlSource = read(join(ROOT, 'src', 'components', 'FormFieldControl.tsx'));
  const navigatorSource = read(join(ROOT, 'src', 'components', 'FormSectionNavigator.tsx'));
  const buildInfoSource = read(join(ROOT, 'src', 'config', 'buildInfo.ts'));

  const amEditableSectionIds = extractSet(workspaceSource, 'EDITABLE_AM_SECTION_IDS');
  const pmEditableSectionIds = extractSet(workspaceSource, 'EDITABLE_PM_SECTION_IDS');

  if (!amEditableSectionIds) fail(failures, 'ui.amSetMissing', 'AM editable section seti bulunamadı.');
  if (!pmEditableSectionIds) fail(failures, 'ui.pmSetMissing', 'PM editable section seti bulunamadı.');

  requireToken(workspaceSource, 'getSectionFields(formType, activeSection.id)', failures, 'FormWorkspace.tsx');
  requireToken(workspaceSource, 'activeFields.map', failures, 'FormWorkspace.tsx');
  requireToken(workspaceSource, 'FormFieldControl', failures, 'FormWorkspace.tsx');
  requireToken(workspaceSource, 'editable={editableSection}', failures, 'FormWorkspace.tsx');
  requireToken(workspaceSource, 'FIELD_FILTERS', failures, 'FormWorkspace.tsx');
  requireToken(workspaceSource, 'fieldSearch', failures, 'FormWorkspace.tsx');
  requireToken(workspaceSource, 'filteredFieldRows', failures, 'FormWorkspace.tsx');
  requireToken(workspaceSource, 'Bölüm ilerlemesi', failures, 'FormWorkspace.tsx');
  requireToken(workspaceSource, 'Alan bul ve filtrele', failures, 'FormWorkspace.tsx');
  requireToken(fieldControlSource, 'accessibilityLabel={uiText.labelTr}', failures, 'FormFieldControl.tsx');
  requireToken(fieldControlSource, 'getFieldUiText(field, index)', failures, 'FormFieldControl.tsx');
  requireToken(fieldControlSource, 'accessibilityRole="checkbox"', failures, 'FormFieldControl.tsx');
  requireToken(fieldControlSource, 'accessibilityState={{ checked, disabled: !editable }}', failures, 'FormFieldControl.tsx');
  requireToken(fieldControlSource, 'keyboardType={keyboardTypeForField(field)}', failures, 'FormFieldControl.tsx');
  requireToken(fieldControlSource, 'maxLength={maxLengthForField(field)}', failures, 'FormFieldControl.tsx');
  requireToken(fieldControlSource, 'validateSchemaValue', failures, 'FormFieldControl.tsx');
  requireToken(navigatorSource, 'accessibilityLabel={`${section.title}, ${section.fieldCount} alan, ${pageLabel(section)}`}', failures, 'FormSectionNavigator.tsx');
  requireToken(navigatorSource, 'accessibilityState={{ selected: active }}', failures, 'FormSectionNavigator.tsx');
  requireToken(navigatorSource, 'horizontal', failures, 'FormSectionNavigator.tsx');
  requireToken(buildInfoSource, BUILD_ID, failures, 'buildInfo.ts');

  const forms = [
    auditForm(FORM_CONFIGS[0], amEditableSectionIds || [], failures),
    auditForm(FORM_CONFIGS[1], pmEditableSectionIds || [], failures),
  ];

  const audit = {
    phase: PHASE,
    version: VERSION,
    buildId: BUILD_ID,
    passed: failures.length === 0 && forms.every((form) => form.passed),
    failures,
    totals: {
      sectionCount: forms.reduce((sum, form) => sum + form.metrics.sectionCount, 0),
      editableSectionCount: forms.reduce((sum, form) => sum + form.metrics.editableSectionCount, 0),
      fieldCount: forms.reduce((sum, form) => sum + form.metrics.fieldCount, 0),
      widgetCount: forms.reduce((sum, form) => sum + form.metrics.widgetCount, 0),
    },
    forms,
  };

  if (write) {
    writeJson(OUTPUT_AUDIT, audit);
    writeText(OUTPUT_MATRIX, matrixMarkdown(audit));
  }

  if (!audit.passed) {
    console.error(JSON.stringify(audit.failures, null, 2));
    process.exit(1);
  }

  console.log(
    `UI coverage doğrulaması geçti. section=${audit.totals.editableSectionCount}/${audit.totals.sectionCount}, field=${audit.totals.fieldCount}, widget=${audit.totals.widgetCount}`,
  );
}

run({ write: process.argv.includes('--write') });
