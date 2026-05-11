const { mkdirSync, readFileSync, writeFileSync } = require('node:fs');
const { dirname, join } = require('node:path');

const VERSION = '0.1.6';
const PHASE = 'Phase 1B';
const BUILD_ID = 'phase-1b-v0.1.6-20260510';
const ROOT = process.cwd();
const MANIFEST_PATH = join(ROOT, 'data', 'acroform-forensics', 'generated', 'am-widget-manifest.json');
const INVENTORY_PATH = join(ROOT, 'data', 'form-inventory', 'am-acroform-inventory.json');
const AUDIT_PATH = join(ROOT, 'data', 'form-inventory', 'am-acroform-audit.json');
const COVERAGE_PATH = join(ROOT, 'docs', 'acroform-forensics', 'am-coverage-matrix.md');
const SUMMARY_PATH = join(ROOT, 'docs', 'acroform-forensics', 'phase-1b-summary.md');

const EXPECTED = {
  widgetCount: 2006,
  uniqueFieldNameCount: 1687,
  pageCount: 18,
  checkboxWidgetCount: 718,
  textWidgetCount: 1288,
};

const SECTION_RANGES = [
  { from: 100, to: 199, id: 'am.100.kayit-ve-basvuru', title: '100 serisi - kayıt, başvuru ve ilk temas bilgileri' },
  { from: 200, to: 299, id: 'am.200.kayip-kisi', title: '200 serisi - kayıp kişi kimlik ve olay bilgileri' },
  { from: 300, to: 399, id: 'am.300.kisisel-esyalar', title: '300 serisi - kişisel eşyalar ve etkiler' },
  { from: 400, to: 499, id: 'am.400.fiziksel-tanim', title: '400 serisi - fiziksel tanım ve ayırt edici özellikler' },
  { from: 500, to: 599, id: 'am.500.tibbi', title: '500 serisi - tıbbi bilgiler' },
  { from: 600, to: 699, id: 'am.600.odontoloji', title: '600 serisi - diş ve odontoloji bilgileri' },
  { from: 700, to: 799, id: 'am.700.destek', title: '700 serisi - ek kayıt ve destek bilgileri' },
  { from: 800, to: 899, id: 'am.800.ekler-imza', title: '800 serisi - ekler, temas ve imza bilgileri' },
];

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function fieldPrefix(fieldName) {
  const match = fieldName.match(/^\d+/);
  return match ? Number(match[0]) : null;
}

function fieldBase(fieldName) {
  if (fieldName.startsWith('HdrCkb')) return 'HdrCkb';
  if (fieldName.startsWith('Hdr')) return fieldName;
  if (fieldName.startsWith('Ckl')) return fieldName;
  const alphaOption = fieldName.match(/^(\d+)\.([A-Z])$/);
  if (alphaOption) return alphaOption[1];
  const numeric = fieldName.match(/^(\d+(?:\.\d+)?)/);
  return numeric ? numeric[1] : fieldName;
}

function slug(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function sectionFor(fieldName) {
  if (fieldName.startsWith('Hdr')) {
    return { id: 'am.header', title: 'Sayfa üst bilgisi' };
  }
  if (fieldName.startsWith('Ckl')) {
    return { id: 'am.checklist', title: 'Sayfa 1 bölüm kontrol listesi' };
  }
  const prefix = fieldPrefix(fieldName);
  const range = SECTION_RANGES.find((item) => prefix >= item.from && prefix <= item.to);
  return range ?? { id: 'am.other', title: 'Diğer AM alanları' };
}

function labelsFor(widgets) {
  const labels = [];
  const seen = new Set();
  for (const widget of widgets) {
    for (const item of widget.nearbyLabelCandidates || []) {
      const text = item.text.trim();
      if (!text || seen.has(text)) continue;
      seen.add(text);
      labels.push(text);
      if (labels.length === 12) return labels;
    }
  }
  return labels;
}

function inputKind(fieldName, widgets) {
  const first = widgets[0];
  if (first.fieldType === 'CheckBox') return 'checkbox';
  if (/(^|\.)(DD|MM|YYYY)\d*$/i.test(fieldName) || /Hdr(DD|MM|YYYY)/.test(fieldName)) return 'date-part';
  if (/Age/i.test(fieldName)) return 'number';

  const labels = labelsFor(widgets).join(' ').toLowerCase();
  const suffix = fieldName.split('.').pop();
  if ((suffix === '305' || suffix === '306') && /country|state|town|postcode/.test(labels)) return 'text';
  if (suffix === '307' && labels.includes('phone')) return 'phone';
  if (suffix === '308' && (labels.includes('email') || labels.includes('e-mail'))) return 'email';
  if (labels.includes('phone') && (labels.includes('email') || labels.includes('e-mail'))) {
    if (suffix === '307') return 'phone';
    if (suffix === '308') return 'email';
    return 'text';
  }
  if (labels.includes('email') || labels.includes('e-mail')) return 'email';
  if (labels.includes('phone') || labels.includes('telephone') || labels.includes('mobile') || labels.includes('fax')) {
    return 'phone';
  }
  return 'text';
}

function valueType(input) {
  switch (input) {
    case 'checkbox':
      return 'boolean';
    case 'date-part':
      return 'datePart';
    case 'number':
      return 'number';
    case 'email':
      return 'email';
    case 'phone':
      return 'phone';
    default:
      return 'string';
  }
}

function auditClass(fieldName) {
  if (fieldName.startsWith('Hdr')) return 'header';
  if (fieldName.startsWith('Ckl')) return 'section-checklist';
  if (/^\d+/.test(fieldName)) return 'user-field';
  return 'technical-review';
}

function repeatInfo(widgets) {
  const pages = [...new Set(widgets.map((widget) => widget.pageNumber))].sort((a, b) => a - b);
  return {
    isRepeated: widgets.length > 1,
    instanceCount: widgets.length,
    pages,
    reason:
      widgets.length > 1
        ? widgets[0].fieldName.startsWith('Hdr')
          ? 'Sayfa üst bilgisi her AM sayfasında tekrar eder.'
          : 'Aynı PDF field name birden fazla widget instance içinde kullanılmıştır.'
        : null,
  };
}

function buttonStates(widgets) {
  const states = [];
  const seen = new Set();
  for (const widget of widgets) {
    const value = widget.buttonStates;
    if (!value) continue;
    const key = JSON.stringify(value);
    if (seen.has(key)) continue;
    seen.add(key);
    states.push(value);
  }
  return states;
}

function buildInventory() {
  const manifest = readJson(MANIFEST_PATH);
  const groups = new Map();
  for (const widget of manifest) {
    const list = groups.get(widget.fieldName) ?? [];
    list.push(widget);
    groups.set(widget.fieldName, list);
  }

  const fields = [...groups.entries()]
    .sort(([left], [right]) => left.localeCompare(right, undefined, { numeric: true }))
    .map(([fieldName, widgets]) => {
      const section = sectionFor(fieldName);
      const input = inputKind(fieldName, widgets);
      const labels = labelsFor(widgets);
      const klass = auditClass(fieldName);
      const canonicalFieldId = `am.${klass === 'header' ? 'header' : klass === 'section-checklist' ? 'checklist' : 'field'}.${slug(fieldName)}`;
      const choiceGroupId = input === 'checkbox' ? `am.choice.${slug(fieldBase(fieldName))}` : null;
      const widgetInstances = widgets.map((widget) => ({
        formType: 'AM',
        pageNumber: widget.pageNumber,
        pageWidgetIndex: widget.pageWidgetIndex,
        instanceKey: `AM:${widget.pageNumber}:${widget.pageWidgetIndex}:${widget.fieldName}`,
        fieldName: widget.fieldName,
        fieldType: widget.fieldType,
        fieldTypeCode: widget.fieldTypeCode,
        rect: widget.rect,
        fieldFlags: widget.fieldFlags,
        buttonStates: widget.buttonStates,
      }));
      const visibleLabel = labels[0] ?? fieldName;
      const uiLabelTr = `AM alanı ${fieldName}`;
      const repeat = repeatInfo(widgets);

      return {
        schemaVersion: 'phase-1b-am-v1',
        canonicalId: canonicalFieldId,
        canonicalFieldId,
        status: 'mapped',
        formType: 'AM',
        pdfFieldName: fieldName,
        officialSection: section,
        visibleLabel,
        uiLabelTr,
        auditClass: klass,
        visibleLabelCandidates: labels,
        turkishUiLabel: uiLabelTr,
        turkishUiLabelStatus: labels.length > 0 ? 'aday-etiket-var' : 'pdf-alan-adindan-turetildi',
        controlType: input,
        valueType: valueType(input),
        requiredRule: 'readiness.optional',
        readinessRule: 'readiness.optional',
        repeatGroup: repeat.isRepeated
          ? {
              instanceCount: repeat.instanceCount,
              pages: repeat.pages,
              reason: repeat.reason,
            }
          : null,
        repeated: repeat,
        dependencies: [],
        choiceGroupId,
        checkboxButtonStates: buttonStates(widgets),
        exportBinding: {
          strategy: 'acroformFieldNames',
          fieldName,
          widgetInstanceCount: widgets.length,
        },
        widgetInstances,
        labelEvidence: {
          nearbyLabelCandidates: labels,
          source: labels.length > 0 ? 'nearby-pdf-text' : 'pdf-field-name',
        },
        pdfBinding: {
          fieldName,
          widgetInstanceCount: widgets.length,
          widgetInstances,
        },
        audit: {
          status: labels.length > 0 ? 'mapped' : 'mapped-with-generated-label',
          notes: [],
        },
      };
    });

  const sectionSummary = new Map();
  for (const field of fields) {
    const key = field.officialSection.id;
    const item = sectionSummary.get(key) ?? {
      sectionId: key,
      title: field.officialSection.title,
      fieldCount: 0,
      widgetCount: 0,
    };
    item.fieldCount += 1;
    item.widgetCount += field.pdfBinding.widgetInstanceCount;
    sectionSummary.set(key, item);
  }

  const inventory = {
    schemaVersion: 'phase-1b-am-v1',
    phase: PHASE,
    version: VERSION,
    buildId: BUILD_ID,
    formType: 'AM',
    formName: 'Ölüm Öncesi Formu',
    sourceStrategy: 'fillable INTERPOL AcroForm PDF',
    sourceManifest: 'data/acroform-forensics/generated/am-widget-manifest.json',
    inventoryStandard:
      'Her unique PDF field name canonical AM alan kaydına bağlanır; her widget instance pdfBinding içinde korunur.',
    totals: {
      fieldCount: fields.length,
      widgetInstanceCount: manifest.length,
      pageCount: new Set(manifest.map((widget) => widget.pageNumber)).size,
      checkboxFieldCount: fields.filter((field) => field.controlType === 'checkbox').length,
      textFieldCount: fields.filter((field) => field.controlType !== 'checkbox').length,
      repeatedFieldCount: fields.filter((field) => field.repeated.isRepeated).length,
      duplicateFieldNameCount: fields.filter((field) => field.repeated.isRepeated).length,
      ignoredWidgetCount: 0,
      needsReviewWidgetCount: 0,
      unaccountedWidgetCount: 0,
    },
    sections: [...sectionSummary.values()],
    ignoredWidgets: [],
    fields,
  };

  return { inventory, manifest };
}

function auditInventory(inventory, manifest) {
  const failures = [];
  const manifestFieldNames = new Set(manifest.map((widget) => widget.fieldName));
  const inventoryFieldNames = new Set(inventory.fields.map((field) => field.pdfFieldName));
  const canonicalIds = new Set();

  if (manifest.length !== EXPECTED.widgetCount) {
    failures.push(`AM widget sayısı hatalı: beklenen=${EXPECTED.widgetCount}, mevcut=${manifest.length}`);
  }
  if (manifestFieldNames.size !== EXPECTED.uniqueFieldNameCount) {
    failures.push(`AM unique field sayısı hatalı: beklenen=${EXPECTED.uniqueFieldNameCount}, mevcut=${manifestFieldNames.size}`);
  }
  if (inventory.totals.pageCount !== EXPECTED.pageCount) {
    failures.push(`AM sayfa sayısı hatalı: beklenen=${EXPECTED.pageCount}, mevcut=${inventory.totals.pageCount}`);
  }
  if (inventory.fields.length !== EXPECTED.uniqueFieldNameCount) {
    failures.push(`Inventory field sayısı hatalı: beklenen=${EXPECTED.uniqueFieldNameCount}, mevcut=${inventory.fields.length}`);
  }

  const checkboxWidgets = manifest.filter((widget) => widget.fieldType === 'CheckBox');
  const textWidgets = manifest.filter((widget) => widget.fieldType === 'Text');
  if (checkboxWidgets.length !== EXPECTED.checkboxWidgetCount) {
    failures.push(`AM checkbox widget sayısı hatalı: beklenen=${EXPECTED.checkboxWidgetCount}, mevcut=${checkboxWidgets.length}`);
  }
  if (textWidgets.length !== EXPECTED.textWidgetCount) {
    failures.push(`AM text widget sayısı hatalı: beklenen=${EXPECTED.textWidgetCount}, mevcut=${textWidgets.length}`);
  }
  const checkboxesWithoutButtonStates = checkboxWidgets.filter((widget) => !widget.buttonStates).length;
  const textWithButtonStates = textWidgets.filter((widget) => widget.buttonStates).length;
  if (checkboxesWithoutButtonStates > 0) {
    failures.push(`Button state eksik checkbox widget sayısı: ${checkboxesWithoutButtonStates}`);
  }
  if (textWithButtonStates > 0) {
    failures.push(`Button state taşıyan text widget sayısı: ${textWithButtonStates}`);
  }

  for (const fieldName of manifestFieldNames) {
    if (!inventoryFieldNames.has(fieldName)) {
      failures.push(`Manifest alanı inventory içinde yok: ${fieldName}`);
    }
  }

  for (const field of inventory.fields) {
    if (canonicalIds.has(field.canonicalFieldId)) {
      failures.push(`Tekrarlı canonicalFieldId: ${field.canonicalFieldId}`);
    }
    canonicalIds.add(field.canonicalFieldId);

    if (!field.canonicalId || !field.status || !field.uiLabelTr || !field.controlType || !field.valueType || !field.officialSection?.id) {
      failures.push(`Eksik inventory alanı: ${field.pdfFieldName}`);
    }

    if (field.controlType === 'checkbox' && field.checkboxButtonStates.length === 0) {
      failures.push(`Checkbox button state eksik: ${field.pdfFieldName}`);
    }
    for (const instance of field.widgetInstances) {
      const key = `${instance.pageNumber}:${instance.pageWidgetIndex}`;
      const expectedWidget = manifest.find((widget) => widget.pageNumber === instance.pageNumber && widget.pageWidgetIndex === instance.pageWidgetIndex);
      if (!expectedWidget || expectedWidget.fieldName !== instance.fieldName) {
        failures.push(`Widget instance identity hatalı: ${field.pdfFieldName} ${key}`);
      }
    }
  }

  const pageCoverage = [...new Set(manifest.map((widget) => widget.pageNumber))]
    .sort((a, b) => a - b)
    .map((pageNumber) => {
      const pageWidgets = manifest.filter((widget) => widget.pageNumber === pageNumber);
      const mapped = inventory.fields.reduce(
        (sum, field) => sum + field.widgetInstances.filter((instance) => instance.pageNumber === pageNumber).length,
        0,
      );
      const labelEvidenceCount = pageWidgets.filter((widget) => (widget.nearbyLabelCandidates || []).length > 0).length;
      return {
        pageNumber,
        widgetTotal: pageWidgets.length,
        mapped,
        ignored: 0,
        needsReview: 0,
        unaccounted: pageWidgets.length - mapped,
        text: pageWidgets.filter((widget) => widget.fieldType === 'Text').length,
        checkbox: pageWidgets.filter((widget) => widget.fieldType === 'CheckBox').length,
        labelEvidenceCoveragePct: Number(((labelEvidenceCount / pageWidgets.length) * 100).toFixed(2)),
      };
    });

  return {
    phase: PHASE,
    version: VERSION,
    buildId: BUILD_ID,
    formType: 'AM',
    passed: failures.length === 0,
    failures,
    metrics: {
      manifestWidgetCount: manifest.length,
      inventoryFieldCount: inventory.fields.length,
      coveredWidgetCount: inventory.fields.reduce((sum, field) => sum + field.pdfBinding.widgetInstanceCount, 0),
      canonicalFieldIdCount: canonicalIds.size,
      checkboxFieldCount: inventory.totals.checkboxFieldCount,
      repeatedFieldCount: inventory.totals.repeatedFieldCount,
      sectionCount: inventory.sections.length,
      checkboxWidgetsWithButtonStates: EXPECTED.checkboxWidgetCount - checkboxesWithoutButtonStates,
      checkboxWidgetCount: EXPECTED.checkboxWidgetCount,
      textWidgetsWithNullButtonStates: EXPECTED.textWidgetCount - textWithButtonStates,
      textWidgetCount: EXPECTED.textWidgetCount,
      missingUiLabelTrCount: inventory.fields.filter((field) => !field.uiLabelTr).length,
      missingExportBindingCount: inventory.fields.filter((field) => !field.exportBinding?.fieldName).length,
      missingReadinessRuleCount: inventory.fields.filter((field) => !field.readinessRule).length,
      missingOfficialSectionCount: inventory.fields.filter((field) => !field.officialSection?.id).length,
      labelEvidenceCoveragePct: Number(
        ((manifest.filter((widget) => (widget.nearbyLabelCandidates || []).length > 0).length / manifest.length) * 100).toFixed(2),
      ),
      emptyNearbyLabelCandidates: manifest.filter((widget) => (widget.nearbyLabelCandidates || []).length === 0).length,
    },
    pageCoverage,
  };
}

function coverageMarkdown(inventory, audit) {
  const lines = [
    '# AM AcroForm Coverage Matrisi',
    '',
    `Faz: ${PHASE}`,
    `Sürüm: ${VERSION}`,
    `Build: ${BUILD_ID}`,
    '',
    '| Metrik | Değer |',
    '| --- | ---: |',
    `| PDF widget instance | ${audit.metrics.manifestWidgetCount} |`,
    `| Inventory field | ${audit.metrics.inventoryFieldCount} |`,
    `| Covered widget | ${audit.metrics.coveredWidgetCount} |`,
    `| Canonical field id | ${audit.metrics.canonicalFieldIdCount} |`,
    `| Checkbox field | ${audit.metrics.checkboxFieldCount} |`,
    `| Repeated field | ${audit.metrics.repeatedFieldCount} |`,
    `| Checkbox button state coverage | ${audit.metrics.checkboxWidgetsWithButtonStates}/${audit.metrics.checkboxWidgetCount} |`,
    `| Text button state null coverage | ${audit.metrics.textWidgetsWithNullButtonStates}/${audit.metrics.textWidgetCount} |`,
    `| Label evidence coverage | ${audit.metrics.labelEvidenceCoveragePct}% |`,
    '',
    '| Bölüm | Field | Widget |',
    '| --- | ---: | ---: |',
  ];

  for (const section of inventory.sections) {
    lines.push(`| ${section.title} | ${section.fieldCount} | ${section.widgetCount} |`);
  }

  lines.push('', '## Sayfa Bazlı Coverage', '', '| Sayfa | Widget | Mapped | Unaccounted | Text | Checkbox | Label evidence |', '| ---: | ---: | ---: | ---: | ---: | ---: | ---: |');
  for (const page of audit.pageCoverage) {
    lines.push(
      `| ${page.pageNumber} | ${page.widgetTotal} | ${page.mapped} | ${page.unaccounted} | ${page.text} | ${page.checkbox} | ${page.labelEvidenceCoveragePct}% |`,
    );
  }

  lines.push('', '## Denetim Sonucu', '', audit.passed ? 'AM envanter coverage denetimi geçti.' : 'AM envanter coverage denetimi başarısız.');
  return `${lines.join('\n')}\n`;
}

function summaryMarkdown(inventory, audit) {
  return `# Phase 1B Özeti: AM AcroForm Tam Alan Envanteri

Phase 1B, AM fillable PDF içindeki ${audit.metrics.manifestWidgetCount} widget instance ve ${audit.metrics.inventoryFieldCount} unique PDF field name değerini canonical AM inventory kaydına bağlar.

## Üretilen Dosyalar

- \`data/form-inventory/am-acroform-inventory.json\`
- \`data/form-inventory/am-acroform-audit.json\`
- \`docs/acroform-forensics/am-coverage-matrix.md\`

## Inventory Standardı

- Her unique PDF field name için bir canonical field kaydı vardır.
- Her widget instance \`pdfBinding.widgetInstances\` içinde sayfa, sıra, rect ve button state bilgisiyle korunur.
- Header ve checklist alanları kullanıcı alanlarından ayrı audit class ile işaretlenir.
- Checkbox alanlarında button state değerleri export hazırlığı için saklanır.
- Türkçe UI etiketi Phase 1B düzeyinde alan kimliğinden üretilir; resmi ekran metni Phase 4 içinde kesinleştirilecektir.

## Sayısal Sonuç

| Metrik | Değer |
| --- | ---: |
| Widget instance | ${audit.metrics.manifestWidgetCount} |
| Inventory field | ${audit.metrics.inventoryFieldCount} |
| Covered widget | ${audit.metrics.coveredWidgetCount} |
| Checkbox field | ${audit.metrics.checkboxFieldCount} |
| Repeated field | ${audit.metrics.repeatedFieldCount} |
| Bölüm sayısı | ${audit.metrics.sectionCount} |

## Faz Sınırı

Bu faz PM envanterini, canonical schema katmanını, uygulama veri giriş ekranlarını veya PDF export motorunu başlatmaz.
`;
}

function run({ write }) {
  const { inventory, manifest } = buildInventory();
  const audit = auditInventory(inventory, manifest);

  if (write) {
    writeJson(INVENTORY_PATH, inventory);
    writeJson(AUDIT_PATH, audit);
    mkdirSync(dirname(COVERAGE_PATH), { recursive: true });
    writeFileSync(COVERAGE_PATH, coverageMarkdown(inventory, audit), 'utf8');
    writeFileSync(SUMMARY_PATH, summaryMarkdown(inventory, audit), 'utf8');
  }

  if (!audit.passed) {
    console.error(audit.failures.join('\n'));
    process.exit(1);
  }

  console.log(
    `AM inventory denetimi geçti. field=${audit.metrics.inventoryFieldCount}, widget=${audit.metrics.manifestWidgetCount}, covered=${audit.metrics.coveredWidgetCount}`,
  );
}

const write = process.argv.includes('--write');
run({ write });
