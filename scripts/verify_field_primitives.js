const { mkdirSync, readFileSync, writeFileSync } = require('node:fs');
const { dirname, join } = require('node:path');

const PHASE = 'Phase 2A';
const VERSION = '0.2.0';
const BUILD_ID = 'phase-2a-v0.2.0-20260510';
const ROOT = process.cwd();
const OUTPUT_PATH = join(ROOT, 'data', 'schema', 'field-primitive-coverage.json');

const FORMS = [
  {
    formType: 'AM',
    inventoryPath: join(ROOT, 'data', 'form-inventory', 'am-acroform-inventory.json'),
  },
  {
    formType: 'PM',
    inventoryPath: join(ROOT, 'data', 'form-inventory', 'pm-acroform-inventory.json'),
  },
];

const CONTROL_TO_PRIMITIVE = {
  checkbox: 'checkbox',
  'date-part': 'datePart',
  email: 'email',
  number: 'number',
  phone: 'phone',
  text: 'text',
};

const PRIMITIVE_VALUE_TYPES = {
  attachmentReference: ['attachment'],
  bodyChartReference: ['chartReference'],
  checkbox: ['boolean'],
  date: ['date'],
  datePart: ['datePart'],
  decimal: ['decimal'],
  dentalChartReference: ['chartReference'],
  email: ['email'],
  multiChoice: ['enumArray'],
  multilineText: ['string'],
  number: ['number'],
  phone: ['phone'],
  repeatedGroup: ['objectArray'],
  signatureBlock: ['object'],
  singleChoice: ['enum'],
  tableRow: ['object'],
  text: ['string'],
};

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function auditForm(config) {
  const inventory = readJson(config.inventoryPath);
  const failures = [];
  const primitiveCounts = {};
  const valueTypeCounts = {};
  const controlTypeCounts = {};

  if (inventory.formType !== config.formType) {
    failures.push(`${config.formType}: inventory formType hatalı`);
  }

  for (const field of inventory.fields) {
    const primitiveKind = CONTROL_TO_PRIMITIVE[field.controlType];
    controlTypeCounts[field.controlType] = (controlTypeCounts[field.controlType] || 0) + 1;

    if (!primitiveKind) {
      failures.push(`${config.formType}: desteklenmeyen controlType ${field.pdfFieldName}: ${field.controlType}`);
      continue;
    }

    primitiveCounts[primitiveKind] = (primitiveCounts[primitiveKind] || 0) + 1;
    valueTypeCounts[field.valueType] = (valueTypeCounts[field.valueType] || 0) + 1;

    if (!PRIMITIVE_VALUE_TYPES[primitiveKind].includes(field.valueType)) {
      failures.push(
        `${config.formType}: valueType primitive ile uyumsuz ${field.pdfFieldName}: ${primitiveKind}/${field.valueType}`,
      );
    }

    if (!field.canonicalId.startsWith(`${config.formType.toLowerCase()}.`)) {
      failures.push(`${config.formType}: canonicalId form prefix hatalı ${field.canonicalId}`);
    }

    if (field.exportBinding?.strategy !== 'acroformFieldNames') {
      failures.push(`${config.formType}: export strategy hatalı ${field.pdfFieldName}`);
    }

    if (!field.widgetInstances.every((instance) => instance.formType === config.formType)) {
      failures.push(`${config.formType}: widget instance formType hatalı ${field.pdfFieldName}`);
    }
  }

  return {
    formType: config.formType,
    passed: failures.length === 0,
    failures,
    metrics: {
      fieldCount: inventory.fields.length,
      controlTypeCounts,
      primitiveCounts,
      valueTypeCounts,
      exportStrategy: 'acroformFieldNames',
    },
  };
}

function run({ write }) {
  const forms = FORMS.map(auditForm);
  const failures = forms.flatMap((form) => form.failures);
  const report = {
    phase: PHASE,
    version: VERSION,
    buildId: BUILD_ID,
    passed: failures.length === 0,
    failures,
    primitiveRegistry: {
      controlToPrimitive: CONTROL_TO_PRIMITIVE,
      primitiveValueTypes: PRIMITIVE_VALUE_TYPES,
    },
    forms,
  };

  if (write) {
    writeJson(OUTPUT_PATH, report);
  }

  if (!report.passed) {
    console.error(failures.join('\n'));
    process.exit(1);
  }

  console.log('Field primitive coverage doğrulaması geçti.');
}

run({ write: process.argv.includes('--write') });
