const { mkdirSync, readFileSync, writeFileSync } = require('node:fs');
const { dirname, join } = require('node:path');

const PHASE = 'Phase 2D';
const VERSION = '0.2.3';
const BUILD_ID = 'phase-2d-v0.2.3-20260511';
const ROOT = process.cwd();
const OUTPUT_AUDIT = join(ROOT, 'data', 'schema', 'schema-coverage-audit.json');
const SUMMARY_PATH = join(ROOT, 'docs', 'schema', 'phase-2d-summary.md');

const FORM_CONFIGS = [
  {
    formType: 'AM',
    inventoryPath: join(ROOT, 'data', 'form-inventory', 'am-acroform-inventory.json'),
    schemaPath: join(ROOT, 'data', 'schema', 'am-schema.json'),
    expectedFields: 1687,
    expectedWidgets: 2006,
    expectedPages: 18,
  },
  {
    formType: 'PM',
    inventoryPath: join(ROOT, 'data', 'form-inventory', 'pm-acroform-inventory.json'),
    schemaPath: join(ROOT, 'data', 'schema', 'pm-schema.json'),
    expectedFields: 1693,
    expectedWidgets: 2026,
    expectedPages: 19,
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

function writeText(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, value, 'utf8');
}

function countBy(items, keyFn) {
  return items.reduce((acc, item) => {
    const key = keyFn(item);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function sorted(values) {
  return [...values].sort((a, b) => String(a).localeCompare(String(b)));
}

function sameJson(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function setDifference(left, right) {
  const rightSet = new Set(right);
  return sorted(left.filter((value) => !rightSet.has(value)));
}

function datePartRule(fieldName) {
  if (/(^|\.|Hdr)DD\d*$/i.test(fieldName)) return 'datePart.day';
  if (/(^|\.|Hdr)MM\d*$/i.test(fieldName)) return 'datePart.month';
  if (/(^|\.|Hdr)YYYY\d*$/i.test(fieldName)) return 'datePart.year';
  return 'string';
}

function expectedValidationRules(field) {
  const base = ['optional'];
  if (field.valueType === 'boolean') return [...base, 'boolean'];
  if (field.valueType === 'number') return [...base, 'number'];
  if (field.valueType === 'email') return [...base, 'email'];
  if (field.valueType === 'phone') return [...base, 'phone'];
  if (field.valueType === 'datePart') return [...base, datePartRule(field.pdfFieldName)];
  return [...base, 'string'];
}

function expectedDefaultValue(field) {
  if (field.valueType === 'boolean') return false;
  if (field.valueType === 'number') return null;
  return '';
}

function validateDefaultValue(value, field) {
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

function fail(failures, code, message, context = {}) {
  failures.push({ code, message, context });
}

function auditForm(config) {
  const inventory = readJson(config.inventoryPath);
  const schema = readJson(config.schemaPath);
  const failures = [];

  if (inventory.formType !== config.formType) {
    fail(failures, 'inventory.formType', `${config.formType} inventory form tipi hatalı.`, { actual: inventory.formType });
  }
  if (schema.formType !== config.formType) {
    fail(failures, 'schema.formType', `${config.formType} schema form tipi hatalı.`, { actual: schema.formType });
  }
  if (inventory.totals.fieldCount !== config.expectedFields) {
    fail(failures, 'inventory.fieldCount', `${config.formType} inventory field sayısı beklenen değerle uyuşmuyor.`, {
      expected: config.expectedFields,
      actual: inventory.totals.fieldCount,
    });
  }
  if (schema.totals.fieldCount !== config.expectedFields) {
    fail(failures, 'schema.fieldCount', `${config.formType} schema field sayısı beklenen değerle uyuşmuyor.`, {
      expected: config.expectedFields,
      actual: schema.totals.fieldCount,
    });
  }
  if (inventory.totals.widgetInstanceCount !== config.expectedWidgets) {
    fail(failures, 'inventory.widgetCount', `${config.formType} inventory widget sayısı beklenen değerle uyuşmuyor.`, {
      expected: config.expectedWidgets,
      actual: inventory.totals.widgetInstanceCount,
    });
  }
  if (schema.totals.widgetInstanceCount !== config.expectedWidgets) {
    fail(failures, 'schema.widgetCount', `${config.formType} schema widget sayısı beklenen değerle uyuşmuyor.`, {
      expected: config.expectedWidgets,
      actual: schema.totals.widgetInstanceCount,
    });
  }
  if (inventory.totals.pageCount !== config.expectedPages) {
    fail(failures, 'inventory.pageCount', `${config.formType} inventory sayfa sayısı beklenen değerle uyuşmuyor.`, {
      expected: config.expectedPages,
      actual: inventory.totals.pageCount,
    });
  }
  if (inventory.totals.ignoredWidgetCount !== 0 || inventory.totals.needsReviewWidgetCount !== 0 || inventory.totals.unaccountedWidgetCount !== 0) {
    fail(failures, 'inventory.unresolvedWidgets', `${config.formType} inventory içinde çözülmemiş widget var.`, {
      ignoredWidgetCount: inventory.totals.ignoredWidgetCount,
      needsReviewWidgetCount: inventory.totals.needsReviewWidgetCount,
      unaccountedWidgetCount: inventory.totals.unaccountedWidgetCount,
    });
  }

  const inventoryById = new Map(inventory.fields.map((field) => [field.canonicalId, field]));
  const schemaById = new Map(schema.fields.map((field) => [field.schemaFieldId, field]));
  const inventoryIds = inventory.fields.map((field) => field.canonicalId);
  const schemaIds = schema.fields.map((field) => field.schemaFieldId);
  const inventoryDuplicateIds = sorted(inventoryIds.filter((id, index) => inventoryIds.indexOf(id) !== index));
  const schemaDuplicateIds = sorted(schemaIds.filter((id, index) => schemaIds.indexOf(id) !== index));

  if (inventoryDuplicateIds.length > 0) fail(failures, 'inventory.duplicateId', `${config.formType} inventory canonical id tekrarı var.`, { ids: inventoryDuplicateIds.slice(0, 20) });
  if (schemaDuplicateIds.length > 0) fail(failures, 'schema.duplicateId', `${config.formType} schema id tekrarı var.`, { ids: schemaDuplicateIds.slice(0, 20) });

  const missingInSchema = setDifference(inventoryIds, schemaIds);
  const missingInInventory = setDifference(schemaIds, inventoryIds);
  if (missingInSchema.length > 0) fail(failures, 'coverage.missingInSchema', `${config.formType} schema içinde eksik inventory alanı var.`, { ids: missingInSchema.slice(0, 50) });
  if (missingInInventory.length > 0) fail(failures, 'coverage.missingInInventory', `${config.formType} inventory içinde karşılığı olmayan schema alanı var.`, { ids: missingInInventory.slice(0, 50) });

  const widgetKeys = [];
  const checkboxStateIssues = [];
  let defaultValueValidatedCount = 0;
  let exactWidgetBindingCount = 0;
  let exactExportBindingCount = 0;
  let exactValidationRuleCount = 0;

  for (const schemaField of schema.fields) {
    const inventoryField = inventoryById.get(schemaField.schemaFieldId);
    if (!inventoryField) {
      continue;
    }

    const fieldContext = { field: schemaField.schemaFieldId, pdfFieldName: schemaField.pdfFieldName };
    if (schemaField.canonicalId !== inventoryField.canonicalId) fail(failures, 'field.canonicalId', 'Canonical id uyuşmuyor.', fieldContext);
    if (schemaField.canonicalFieldId !== inventoryField.canonicalFieldId) fail(failures, 'field.canonicalFieldId', 'Canonical field id uyuşmuyor.', fieldContext);
    if (schemaField.formType !== config.formType) fail(failures, 'field.formType', 'Schema field form tipi hatalı.', fieldContext);
    if (schemaField.pdfFieldName !== inventoryField.pdfFieldName) fail(failures, 'field.pdfFieldName', 'PDF field name uyuşmuyor.', fieldContext);
    if (schemaField.controlType !== inventoryField.controlType) fail(failures, 'field.controlType', 'Control type uyuşmuyor.', fieldContext);
    if (schemaField.valueType !== inventoryField.valueType) fail(failures, 'field.valueType', 'Value type uyuşmuyor.', fieldContext);
    if (schemaField.readinessRule !== inventoryField.readinessRule) fail(failures, 'field.readinessRule', 'Readiness rule uyuşmuyor.', fieldContext);
    if (schemaField.officialSection?.id !== inventoryField.officialSection?.id) fail(failures, 'field.section', 'Official section uyuşmuyor.', fieldContext);
    if (schemaField.uiLabelTr !== inventoryField.uiLabelTr) fail(failures, 'field.uiLabelTr', 'Türkçe UI label uyuşmuyor.', fieldContext);

    const expectedPrimitive = CONTROL_TO_PRIMITIVE[inventoryField.controlType];
    if (schemaField.primitiveKind !== expectedPrimitive) {
      fail(failures, 'field.primitiveKind', 'Primitive kind control type ile uyuşmuyor.', {
        ...fieldContext,
        expected: expectedPrimitive,
        actual: schemaField.primitiveKind,
      });
    }
    if (!PRIMITIVE_VALUE_TYPES[schemaField.primitiveKind]?.includes(schemaField.valueType)) {
      fail(failures, 'field.primitiveValueType', 'Primitive/value type uyumsuz.', {
        ...fieldContext,
        primitiveKind: schemaField.primitiveKind,
        valueType: schemaField.valueType,
      });
    }

    const expectedDefault = expectedDefaultValue(schemaField);
    if (!sameJson(schemaField.defaultValue, expectedDefault)) {
      fail(failures, 'field.defaultValue', 'Default değer value type ile uyuşmuyor.', {
        ...fieldContext,
        expected: expectedDefault,
        actual: schemaField.defaultValue,
      });
    }

    const defaultIssues = validateDefaultValue(schemaField.defaultValue, schemaField);
    if (defaultIssues.length > 0) {
      fail(failures, 'field.defaultValidation', 'Default değer validasyondan geçmiyor.', {
        ...fieldContext,
        issues: defaultIssues,
      });
    } else {
      defaultValueValidatedCount += 1;
    }

    const expectedRules = expectedValidationRules(schemaField);
    if (!sameJson(schemaField.validationRules, expectedRules)) {
      fail(failures, 'field.validationRules', 'Validation rule seti beklenen standartla uyuşmuyor.', {
        ...fieldContext,
        expected: expectedRules,
        actual: schemaField.validationRules,
      });
    } else {
      exactValidationRuleCount += 1;
    }

    const schemaWidgetKeys = schemaField.widgetInstances.map((widget) => widget.instanceKey);
    const inventoryWidgetKeys = inventoryField.widgetInstances.map((widget) => widget.instanceKey);
    if (!sameJson(schemaWidgetKeys, inventoryWidgetKeys)) {
      fail(failures, 'field.widgetInstances', 'Widget instance sırası veya kimliği inventory ile uyuşmuyor.', {
        ...fieldContext,
        expected: inventoryWidgetKeys,
        actual: schemaWidgetKeys,
      });
    } else {
      exactWidgetBindingCount += 1;
    }

    if (
      schemaField.exportBinding?.strategy !== 'acroformFieldNames' ||
      schemaField.exportBinding?.fieldName !== inventoryField.exportBinding?.fieldName ||
      schemaField.exportBinding?.widgetInstanceCount !== schemaField.widgetInstances.length ||
      schemaField.exportBinding?.widgetInstanceCount !== inventoryField.widgetInstances.length
    ) {
      fail(failures, 'field.exportBinding', 'Export binding AcroForm field name ve widget sayısı ile uyuşmuyor.', fieldContext);
    } else {
      exactExportBindingCount += 1;
    }

    if ((schemaField.repeatGroup?.instanceCount || 1) !== schemaField.widgetInstances.length && schemaField.widgetInstances.length > 1) {
      fail(failures, 'field.repeatGroup', 'Repeat group instance sayısı widget sayısıyla uyuşmuyor.', fieldContext);
    }

    for (const widget of schemaField.widgetInstances) {
      widgetKeys.push(widget.instanceKey);
      if (widget.formType !== config.formType) fail(failures, 'widget.formType', 'Widget form tipi hatalı.', { ...fieldContext, instanceKey: widget.instanceKey });
      if (widget.fieldName !== schemaField.pdfFieldName) fail(failures, 'widget.fieldName', 'Widget fieldName schema pdfFieldName ile uyuşmuyor.', { ...fieldContext, instanceKey: widget.instanceKey });
      if (!Number.isInteger(widget.pageNumber) || widget.pageNumber < 1 || widget.pageNumber > config.expectedPages) {
        fail(failures, 'widget.pageNumber', 'Widget sayfa numarası form aralığı dışında.', { ...fieldContext, instanceKey: widget.instanceKey, pageNumber: widget.pageNumber });
      }
      if (!Array.isArray(widget.rect) || widget.rect.length !== 4 || widget.rect.some((value) => typeof value !== 'number')) {
        fail(failures, 'widget.rect', 'Widget rect dört sayısal koordinat içermiyor.', { ...fieldContext, instanceKey: widget.instanceKey });
      }
      if (schemaField.controlType === 'checkbox') {
        const normalStates = widget.buttonStates?.normal || [];
        const hasOff = normalStates.includes('Off');
        const hasOn = normalStates.some((state) => state !== 'Off');
        if (!hasOff || !hasOn) {
          checkboxStateIssues.push({ field: schemaField.schemaFieldId, instanceKey: widget.instanceKey, normalStates });
        }
      }
    }
  }

  if (checkboxStateIssues.length > 0) {
    fail(failures, 'widget.checkboxStates', `${config.formType} checkbox widget state bilgisi eksik veya yetersiz.`, {
      examples: checkboxStateIssues.slice(0, 20),
      count: checkboxStateIssues.length,
    });
  }

  const duplicateWidgetKeys = sorted(widgetKeys.filter((key, index) => widgetKeys.indexOf(key) !== index));
  if (duplicateWidgetKeys.length > 0) {
    fail(failures, 'widget.duplicateInstanceKey', `${config.formType} schema içinde tekrarlı widget instance key var.`, {
      keys: duplicateWidgetKeys.slice(0, 50),
      count: duplicateWidgetKeys.length,
    });
  }

  const recomputedPrimitiveCounts = countBy(schema.fields, (field) => field.primitiveKind);
  const recomputedValueTypeCounts = countBy(schema.fields, (field) => field.valueType);
  if (!sameJson(schema.totals.primitiveCounts, recomputedPrimitiveCounts)) {
    fail(failures, 'totals.primitiveCounts', `${config.formType} primitive toplamları yeniden hesaplanan değerlerle uyuşmuyor.`, {
      expected: recomputedPrimitiveCounts,
      actual: schema.totals.primitiveCounts,
    });
  }
  if (!sameJson(schema.totals.valueTypeCounts, recomputedValueTypeCounts)) {
    fail(failures, 'totals.valueTypeCounts', `${config.formType} value type toplamları yeniden hesaplanan değerlerle uyuşmüyor.`, {
      expected: recomputedValueTypeCounts,
      actual: schema.totals.valueTypeCounts,
    });
  }

  return {
    formType: config.formType,
    passed: failures.length === 0,
    failures,
    metrics: {
      fieldCount: schema.fields.length,
      inventoryFieldCount: inventory.fields.length,
      widgetInstanceCount: schema.totals.widgetInstanceCount,
      inventoryWidgetInstanceCount: inventory.totals.widgetInstanceCount,
      uniqueSchemaFieldCount: new Set(schemaIds).size,
      uniqueInventoryFieldCount: new Set(inventoryIds).size,
      uniqueWidgetInstanceCount: new Set(widgetKeys).size,
      exactFieldCoverageCount: schema.fields.length - missingInInventory.length,
      exactWidgetBindingCount,
      exactExportBindingCount,
      exactValidationRuleCount,
      defaultValueValidatedCount,
      primitiveCounts: schema.totals.primitiveCounts,
      valueTypeCounts: schema.totals.valueTypeCounts,
      validationRuleCounts: countBy(schema.fields.flatMap((field) => field.validationRules), (rule) => rule),
    },
  };
}

function summaryMarkdown(audit) {
  const rows = audit.forms
    .map(
      (form) =>
        `| ${form.formType} | ${form.metrics.fieldCount} | ${form.metrics.widgetInstanceCount} | ${form.metrics.exactWidgetBindingCount} | ${form.metrics.exactExportBindingCount} | ${form.metrics.defaultValueValidatedCount} | ${form.passed ? 'Geçti' : 'Kaldı'} |`,
    )
    .join('\n');

  return `# Phase 2D Özeti: Schema Coverage Testleri

Phase 2D, AM ve PM canonical schema dosyalarını AcroForm inventory kaynaklarıyla karşılaştıran build gate denetimini ekler.

## Üretilen Dosyalar

- \`scripts/audit_schema_coverage.js\`
- \`data/schema/schema-coverage-audit.json\`
- \`docs/schema/phase-2d-summary.md\`

## Denetlenen Sözleşme

- Inventory içindeki her canonical field schema içinde birebir temsil edilir.
- Schema içinde inventory karşılığı olmayan alan bulunmaz.
- Widget instance key, sayfa, field name, rect ve checkbox state bilgileri kayıpsız taşınır.
- Export binding AcroForm field name ve widget instance sayısıyla tutarlıdır.
- Primitive/value type eşleşmeleri ve validation rule setleri yeniden hesaplanarak doğrulanır.
- Default değerler ilgili validation kurallarından geçer.
- Çözülmemiş, ignore edilmiş veya review bekleyen widget yoktur.

## Sayısal Sonuç

| Form | Schema field | Widget binding | Exact widget field | Exact export binding | Default validasyonu | Sonuç |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
${rows}

## Faz Sınırı

Bu faz veri giriş UI, local persistence ve PDF export motorunu başlatmaz. Çıktı, Phase 3 ve Phase 4 başlamadan önce schema kapsamını CI kapısı haline getirir.
`;
}

function run({ write }) {
  const forms = FORM_CONFIGS.map(auditForm);
  const failures = forms.flatMap((form) => form.failures.map((failure) => ({ formType: form.formType, ...failure })));
  const audit = {
    phase: PHASE,
    version: VERSION,
    buildId: BUILD_ID,
    passed: failures.length === 0,
    failures,
    totals: {
      fieldCount: forms.reduce((sum, form) => sum + form.metrics.fieldCount, 0),
      widgetInstanceCount: forms.reduce((sum, form) => sum + form.metrics.widgetInstanceCount, 0),
      exactWidgetBindingCount: forms.reduce((sum, form) => sum + form.metrics.exactWidgetBindingCount, 0),
      exactExportBindingCount: forms.reduce((sum, form) => sum + form.metrics.exactExportBindingCount, 0),
      defaultValueValidatedCount: forms.reduce((sum, form) => sum + form.metrics.defaultValueValidatedCount, 0),
    },
    forms,
  };

  if (write) {
    writeJson(OUTPUT_AUDIT, audit);
    writeText(SUMMARY_PATH, summaryMarkdown(audit));
  }

  if (!audit.passed) {
    console.error(JSON.stringify(failures, null, 2));
    process.exit(1);
  }

  console.log(
    `Schema coverage doğrulaması geçti. field=${audit.totals.fieldCount}, widget=${audit.totals.widgetInstanceCount}, export=${audit.totals.exactExportBindingCount}`,
  );
}

run({ write: process.argv.includes('--write') });
