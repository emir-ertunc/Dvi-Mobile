const { mkdirSync, readFileSync, writeFileSync } = require('node:fs');
const { dirname, join } = require('node:path');

const PHASE = 'Phase 2B';
const VERSION = '0.2.1';
const BUILD_ID = 'phase-2b-v0.2.1-20260510';
const ROOT = process.cwd();
const INVENTORY_PATH = join(ROOT, 'data', 'form-inventory', 'am-acroform-inventory.json');
const OUTPUT_SCHEMA = join(ROOT, 'data', 'schema', 'am-schema.json');
const OUTPUT_AUDIT = join(ROOT, 'data', 'schema', 'am-schema-audit.json');
const SUMMARY_PATH = join(ROOT, 'docs', 'schema', 'phase-2b-summary.md');

const EXPECTED = {
  fields: 1687,
  widgets: 2006,
};

const CONTROL_TO_PRIMITIVE = {
  checkbox: 'checkbox',
  'date-part': 'datePart',
  email: 'email',
  number: 'number',
  phone: 'phone',
  text: 'text',
};

const PRIMITIVE_VALUE_TYPES = {
  checkbox: ['boolean'],
  datePart: ['datePart'],
  email: ['email'],
  number: ['number'],
  phone: ['phone'],
  text: ['string'],
};

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function countBy(items, keyFn) {
  return items.reduce((acc, item) => {
    const key = keyFn(item);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function datePartRule(fieldName) {
  if (/(^|\.|Hdr)DD\d*$/i.test(fieldName)) return 'datePart.day';
  if (/(^|\.|Hdr)MM\d*$/i.test(fieldName)) return 'datePart.month';
  if (/(^|\.|Hdr)YYYY\d*$/i.test(fieldName)) return 'datePart.year';
  return 'string';
}

function validationRules(field) {
  const base = ['optional'];
  if (field.valueType === 'boolean') return [...base, 'boolean'];
  if (field.valueType === 'number') return [...base, 'number'];
  if (field.valueType === 'email') return [...base, 'email'];
  if (field.valueType === 'phone') return [...base, 'phone'];
  if (field.valueType === 'datePart') return [...base, datePartRule(field.pdfFieldName)];
  return [...base, 'string'];
}

function defaultValue(field) {
  if (field.valueType === 'boolean') return false;
  if (field.valueType === 'number') return null;
  return '';
}

function buildSchema() {
  const inventory = readJson(INVENTORY_PATH);
  const fields = inventory.fields.map((field) => {
    const primitiveKind = CONTROL_TO_PRIMITIVE[field.controlType];
    return {
      schemaFieldId: field.canonicalId,
      canonicalId: field.canonicalId,
      canonicalFieldId: field.canonicalFieldId,
      formType: 'AM',
      pdfFieldName: field.pdfFieldName,
      officialSection: field.officialSection,
      visibleLabel: field.visibleLabel,
      uiLabelTr: field.uiLabelTr,
      controlType: field.controlType,
      primitiveKind,
      valueType: field.valueType,
      defaultValue: defaultValue(field),
      validationRules: validationRules(field),
      readinessRule: field.readinessRule,
      repeatGroup: field.repeatGroup,
      dependencies: field.dependencies,
      exportBinding: field.exportBinding,
      widgetInstances: field.widgetInstances,
    };
  });

  return {
    schemaVersion: 'phase-2b-am-v1',
    phase: PHASE,
    version: VERSION,
    buildId: BUILD_ID,
    formType: 'AM',
    sourceInventory: 'data/form-inventory/am-acroform-inventory.json',
    totals: {
      fieldCount: fields.length,
      widgetInstanceCount: fields.reduce((sum, field) => sum + field.widgetInstances.length, 0),
      requiredFieldCount: fields.filter((field) => field.readinessRule === 'readiness.required').length,
      optionalFieldCount: fields.filter((field) => field.readinessRule !== 'readiness.required').length,
      primitiveCounts: countBy(fields, (field) => field.primitiveKind),
      valueTypeCounts: countBy(fields, (field) => field.valueType),
    },
    fields,
  };
}

function validateSchemaValue(value, field) {
  const issues = [];
  const isBlank = value === null || value === '';
  const required = field.readinessRule === 'readiness.required' || field.validationRules.includes('required');

  if (required && isBlank) {
    issues.push('required');
  }
  if (isBlank) {
    return issues;
  }

  for (const rule of field.validationRules) {
    if (rule === 'optional' || rule === 'required') continue;
    if (rule === 'string' && typeof value !== 'string') issues.push(rule);
    if (rule === 'boolean' && typeof value !== 'boolean') issues.push(rule);
    if (rule === 'number' && (typeof value !== 'number' || !Number.isFinite(value))) issues.push(rule);
    if (rule === 'email' && (typeof value !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))) issues.push(rule);
    if (rule === 'phone' && (typeof value !== 'string' || !/^[+()\d\s.-]{6,32}$/.test(value))) issues.push(rule);
    if (rule === 'datePart.day' && (typeof value !== 'string' || !/^\d+$/.test(value) || Number(value) < 1 || Number(value) > 31)) {
      issues.push(rule);
    }
    if (rule === 'datePart.month' && (typeof value !== 'string' || !/^\d+$/.test(value) || Number(value) < 1 || Number(value) > 12)) {
      issues.push(rule);
    }
    if (
      rule === 'datePart.year' &&
      (typeof value !== 'string' || !/^\d+$/.test(value) || Number(value) < 1800 || Number(value) > 2200)
    ) {
      issues.push(rule);
    }
  }

  return issues;
}

function auditSchema(schema) {
  const failures = [];
  const ids = new Set();
  const inventory = readJson(INVENTORY_PATH);
  const inventoryIds = new Set(inventory.fields.map((field) => field.canonicalId));

  if (schema.fields.length !== EXPECTED.fields) failures.push(`AM schema field sayısı hatalı: ${schema.fields.length}`);
  if (schema.totals.widgetInstanceCount !== EXPECTED.widgets) failures.push(`AM schema widget sayısı hatalı: ${schema.totals.widgetInstanceCount}`);

  for (const field of schema.fields) {
    if (ids.has(field.schemaFieldId)) failures.push(`Tekrarlı schemaFieldId: ${field.schemaFieldId}`);
    ids.add(field.schemaFieldId);

    if (!inventoryIds.has(field.canonicalId)) failures.push(`Inventory karşılığı olmayan schema field: ${field.canonicalId}`);
    if (field.formType !== 'AM') failures.push(`AM dışı schema field: ${field.schemaFieldId}`);
    if (!field.primitiveKind || !PRIMITIVE_VALUE_TYPES[field.primitiveKind]) failures.push(`Primitive eksik: ${field.schemaFieldId}`);
    if (!PRIMITIVE_VALUE_TYPES[field.primitiveKind]?.includes(field.valueType)) {
      failures.push(`Primitive/value uyumsuz: ${field.schemaFieldId}`);
    }
    if (!field.validationRules.length) failures.push(`Validation rule eksik: ${field.schemaFieldId}`);
    if (!field.exportBinding?.fieldName) failures.push(`Export binding eksik: ${field.schemaFieldId}`);
    if (!field.widgetInstances.length) failures.push(`Widget binding eksik: ${field.schemaFieldId}`);

    const defaultIssues = validateSchemaValue(field.defaultValue, field);
    if (defaultIssues.length > 0) {
      failures.push(`Default değer validasyon hatası: ${field.schemaFieldId} ${defaultIssues.join(',')}`);
    }
  }

  for (const inventoryId of inventoryIds) {
    if (!ids.has(inventoryId)) failures.push(`Schema içinde eksik inventory alanı: ${inventoryId}`);
  }

  return {
    phase: PHASE,
    version: VERSION,
    buildId: BUILD_ID,
    formType: 'AM',
    passed: failures.length === 0,
    failures,
    metrics: {
      fieldCount: schema.fields.length,
      widgetInstanceCount: schema.totals.widgetInstanceCount,
      requiredFieldCount: schema.totals.requiredFieldCount,
      optionalFieldCount: schema.totals.optionalFieldCount,
      primitiveCounts: schema.totals.primitiveCounts,
      valueTypeCounts: schema.totals.valueTypeCounts,
      validationRuleCounts: countBy(schema.fields.flatMap((field) => field.validationRules), (rule) => rule),
      defaultValueValidatedCount: schema.fields.length - failures.filter((failure) => failure.startsWith('Default değer')).length,
    },
  };
}

function summaryMarkdown(schema, audit) {
  return `# Phase 2B Özeti: AM Schema ve Validasyon

Phase 2B, AM AcroForm envanterindeki ${schema.fields.length} alanı canonical AM schema kaydına dönüştürür ve temel validasyon kurallarını bağlar.

## Üretilen Dosyalar

- \`data/schema/am-schema.json\`
- \`data/schema/am-schema-audit.json\`
- \`src/domain/schemaTypes.ts\`
- \`src/domain/validation.ts\`
- \`scripts/build_am_schema.js\`

## Doğrulanan Sözleşme

- Her AM inventory alanının schema karşılığı vardır.
- Her schema field benzersiz \`schemaFieldId\` taşır.
- Primitive ve value type eşleşmeleri doğrulanır.
- Her field export binding ve widget binding taşır.
- Default değerler ilgili validasyon kurallarından geçer.

## Sayısal Sonuç

| Metrik | Değer |
| --- | ---: |
| AM schema field | ${audit.metrics.fieldCount} |
| Widget binding | ${audit.metrics.widgetInstanceCount} |
| Required field | ${audit.metrics.requiredFieldCount} |
| Optional field | ${audit.metrics.optionalFieldCount} |
| Default validasyonu geçen field | ${audit.metrics.defaultValueValidatedCount} |

## Faz Sınırı

Bu faz PM schema dosyasını, UI veri giriş ekranlarını, local persistence veya PDF export motorunu başlatmaz.
`;
}

function run({ write }) {
  const schema = buildSchema();
  const audit = auditSchema(schema);

  if (write) {
    writeJson(OUTPUT_SCHEMA, schema);
    writeJson(OUTPUT_AUDIT, audit);
    mkdirSync(dirname(SUMMARY_PATH), { recursive: true });
    writeFileSync(SUMMARY_PATH, summaryMarkdown(schema, audit), 'utf8');
  }

  if (!audit.passed) {
    console.error(audit.failures.join('\n'));
    process.exit(1);
  }

  console.log(`AM schema doğrulaması geçti. field=${audit.metrics.fieldCount}, widget=${audit.metrics.widgetInstanceCount}`);
}

run({ write: process.argv.includes('--write') });
