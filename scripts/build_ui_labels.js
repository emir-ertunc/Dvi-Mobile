const { mkdirSync, readFileSync, writeFileSync } = require('node:fs');
const { dirname, join } = require('node:path');

const PHASE = 'Phase 4G-C';
const VERSION = '0.4.8';
const BUILD_ID = 'phase-4g-c-v0.4.8-20260511';
const ROOT = process.cwd();
const OUTPUT = join(ROOT, 'data', 'ui-labels', 'field-ui-labels.json');
const AUDIT_OUTPUT = join(ROOT, 'data', 'ui-labels', 'field-ui-labels-audit.json');
const REPORT = join(ROOT, 'docs', 'app', 'phase-4g-c-label-coverage.md');

const SCHEMAS = [
  { formType: 'AM', path: join(ROOT, 'data', 'schema', 'am-schema.json'), expectedFields: 1687 },
  { formType: 'PM', path: join(ROOT, 'data', 'schema', 'pm-schema.json'), expectedFields: 1693 },
];

const SECTION_LABELS = {
  'am.header': 'AM üst bilgi',
  'am.checklist': 'AM kontrol listesi',
  'am.100.kayit-ve-basvuru': 'Kayıt, başvuru ve ilk temas',
  'am.200.kayip-kisi': 'Kayıp kişi kimlik ve olay bilgileri',
  'am.300.kisisel-esyalar': 'Kişisel eşyalar ve etkiler',
  'am.400.fiziksel-tanim': 'Fiziksel tanım ve ayırt edici özellikler',
  'am.500.tibbi': 'Tıbbi bilgiler',
  'am.600.odontoloji': 'Odontoloji bilgileri',
  'am.700.destek': 'Destekleyici bilgiler',
  'am.800.ekler-imza': 'Ekler, iletişim ve imza',
  'am.other': 'Diğer AM alanları',
  'pm.header': 'PM üst bilgi',
  'pm.checklist': 'PM kontrol listesi',
  'pm.100.kayit-ve-buluntu': 'Kayıt, buluntu ve ilk inceleme',
  'pm.300.esyalar': 'Eşyalar, giysiler ve bulgular',
  'pm.400.fiziksel-tanim': 'Fiziksel tanım ve ayırt edici özellikler',
  'pm.500.tibbi-patoloji': 'Tıbbi inceleme ve patoloji',
  'pm.600.odontoloji': 'Odontoloji bilgileri',
  'pm.700.destek': 'Destekleyici kimliklendirme bilgileri',
  'pm.800.dna-ekler-imza': 'DNA, ekler, iletişim ve imza',
  'pm.other': 'Diğer PM alanları',
};

const CONTROL_LABELS = {
  checkbox: 'seçim',
  'date-part': 'tarih parçası',
  email: 'e-posta',
  number: 'sayı',
  phone: 'telefon',
  text: 'metin',
};

const VISIBLE_LABEL_TRANSLATIONS = new Map(
  Object.entries({
    agency: 'Kurum',
    town: 'İl veya ilçe',
    country: 'Ülke',
    interpol: 'INTERPOL referansı',
    'no:': 'Numara',
    'no.': 'Numara',
    date: 'Tarih',
    'date:': 'Tarih',
    email: 'E-posta',
    by: 'Kaydeden kişi',
    'by:': 'Kaydeden kişi',
    relationship: 'Yakınlık ilişkisi',
    name: 'Ad soyad',
    report: 'Rapor bilgisi',
    yes: 'Evet seçeneği',
    no: 'Hayır seçeneği',
    '(specify):': 'Açıklama',
    specify: 'Açıklama',
    'mortuary)': 'Morg bilgisi',
    ncb: 'Ulusal merkez bürosu',
    'ncb:': 'Ulusal merkez bürosu',
  }),
);

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

function normalizeVisibleLabel(label) {
  return String(label || '')
    .trim()
    .replace(/\s+/g, ' ');
}

function isTechnicalLabel(label) {
  const normalized = normalizeVisibleLabel(label);
  if (!normalized) return true;
  if (/^\d+(\.\d+)*[A-Z]?$/i.test(normalized)) return true;
  if (/^\d+$/.test(normalized)) return true;
  if (/^[a-z]$/i.test(normalized)) return true;
  if (/^\d+\.[A-Z]$/i.test(normalized)) return true;
  return false;
}

function translatedVisibleLabel(label) {
  const normalized = normalizeVisibleLabel(label);
  if (!normalized || isTechnicalLabel(normalized)) return null;
  const key = normalized.toLowerCase().replace(/\.$/, '');
  return VISIBLE_LABEL_TRANSLATIONS.get(key) || VISIBLE_LABEL_TRANSLATIONS.get(normalized.toLowerCase()) || null;
}

function seriesFromPdfName(pdfFieldName) {
  const match = String(pdfFieldName).match(/^(\d+)/);
  return match ? match[1] : null;
}

function rowHint(pdfFieldName) {
  const parts = String(pdfFieldName).split('.');
  if (parts.length >= 2 && /^\d+$/.test(parts[1])) return `${parts[1]}. satır`;
  return null;
}

function controlHelp(field) {
  if (field.controlType === 'checkbox') return 'Uygunsa bu seçeneği işaretleyin.';
  if (field.controlType === 'email') return 'Geçerli bir e-posta adresi girin.';
  if (field.controlType === 'phone') return 'Telefon numarasını uluslararası biçime yakın girin.';
  if (field.controlType === 'number') return 'Yalnızca sayısal değer girin.';
  if (field.controlType === 'date-part') return 'Tarih alanının ilgili gün, ay veya yıl parçasını girin.';
  return 'Bu alanı resmi formdaki karşılığına göre doldurun.';
}

function buildLabel(field, sectionIndex) {
  const sectionLabel = SECTION_LABELS[field.officialSection.id] || field.officialSection.title || `${field.formType} bölümü`;
  const visible = translatedVisibleLabel(field.visibleLabel);
  const series = seriesFromPdfName(field.pdfFieldName);
  const row = rowHint(field.pdfFieldName);
  const control = CONTROL_LABELS[field.controlType] || 'alan';

  if (visible) {
    const sequence = `${sectionIndex + 1}. alan`;
    return {
      labelTr: `${sectionLabel} - ${visible} (${sequence})`,
      shortLabelTr: `${visible} (${sequence})`,
      helpTextTr: `${sectionLabel} bölümünde ${visible.toLocaleLowerCase('tr-TR')} bilgisini girin.`,
      reviewStatus: 'generated_from_visible_label',
    };
  }

  const seriesPart = series ? `${series} serisi` : `${sectionIndex + 1}. alan`;
  const rowPart = row ? `, ${row}` : '';
  const shortLabelTr = `${seriesPart} ${control}`;

  return {
    labelTr: `${sectionLabel} - ${seriesPart} ${control}${rowPart}`,
    shortLabelTr,
    helpTextTr: `${sectionLabel} bölümündeki ${seriesPart.toLocaleLowerCase('tr-TR')} ${control} alanını doldurun.`,
    reviewStatus: 'needs_human_review',
  };
}

function hasTechnicalRuntimeLabel(text, formType) {
  if (new RegExp(`^${formType} alanı\\b`, 'i').test(text)) return true;
  if (/\b\d{3}\.\d/.test(text)) return true;
  return false;
}

function build({ write }) {
  const failures = [];
  const forms = [];
  const labels = {};
  const auditLabels = {};
  let totalFieldCount = 0;
  let generatedCount = 0;
  let needsReviewCount = 0;

  for (const config of SCHEMAS) {
    const schema = readJson(config.path);
    const sectionCounters = new Map();
    let formNeedsReview = 0;
    let formGenerated = 0;

    if (schema.formType !== config.formType) {
      failures.push({ code: 'schema.formType', message: `${config.formType} schema form tipi hatalı.` });
    }
    if (schema.fields.length !== config.expectedFields) {
      failures.push({
        code: 'schema.fieldCount',
        message: `${config.formType} schema alan sayısı beklenen değerle uyuşmuyor.`,
        expected: config.expectedFields,
        actual: schema.fields.length,
      });
    }

    for (const field of schema.fields) {
      const sectionIndex = sectionCounters.get(field.officialSection.id) || 0;
      sectionCounters.set(field.officialSection.id, sectionIndex + 1);
      const label = buildLabel(field, sectionIndex);

      if (hasTechnicalRuntimeLabel(label.labelTr, config.formType) || hasTechnicalRuntimeLabel(label.shortLabelTr, config.formType)) {
        failures.push({
          code: 'label.technicalRuntimeText',
          message: 'Kullanıcı etiketi teknik PDF alanı gibi görünüyor.',
          fieldId: field.schemaFieldId,
          labelTr: label.labelTr,
        });
      }
      if (!label.helpTextTr || label.helpTextTr.length < 20) {
        failures.push({
          code: 'label.helpTextMissing',
          message: 'Yardım metni eksik veya çok kısa.',
          fieldId: field.schemaFieldId,
        });
      }

      const runtimeLabel = {
        labelTr: label.labelTr,
        shortLabelTr: label.shortLabelTr,
        helpTextTr: label.helpTextTr,
        reviewStatus: label.reviewStatus,
      };

      labels[field.schemaFieldId] = runtimeLabel;
      auditLabels[field.schemaFieldId] = {
        schemaFieldId: field.schemaFieldId,
        formType: field.formType,
        ...runtimeLabel,
        controlType: field.controlType,
        sectionId: field.officialSection.id,
        source: {
          pdfFieldName: field.pdfFieldName,
          visibleLabel: field.visibleLabel || '',
        },
      };

      totalFieldCount += 1;
      if (label.reviewStatus === 'needs_human_review') {
        needsReviewCount += 1;
        formNeedsReview += 1;
      } else {
        generatedCount += 1;
        formGenerated += 1;
      }
    }

    forms.push({
      formType: config.formType,
      fieldCount: schema.fields.length,
      generatedFromVisibleLabelCount: formGenerated,
      needsHumanReviewCount: formNeedsReview,
      sectionCount: sectionCounters.size,
    });
  }

  const output = {
    phase: PHASE,
    version: VERSION,
    buildId: BUILD_ID,
    passed: failures.length === 0,
    totals: {
      fieldCount: totalFieldCount,
      generatedFromVisibleLabelCount: generatedCount,
      needsHumanReviewCount: needsReviewCount,
    },
    forms,
    labels,
    failures,
  };

  const reportRows = forms
    .map(
      (form) =>
        `| ${form.formType} | ${form.fieldCount} | ${form.generatedFromVisibleLabelCount} | ${form.needsHumanReviewCount} | ${form.sectionCount} |`,
    )
    .join('\n');

  const report = `# Phase 4G-B Label Coverage

Bu rapor, kullanıcıya görünen alan etiketlerinin teknik PDF field id değerlerinden ayrıldığını denetler.

## Sonuç

- Toplam alan: ${output.totals.fieldCount}
- Görünür label'dan türetilen etiket: ${output.totals.generatedFromVisibleLabelCount}
- İnsan gözden geçirmesi gereken otomatik etiket: ${output.totals.needsHumanReviewCount}
- Teknik runtime label hatası: ${failures.length}

| Form | Alan | Görünür label kaynaklı | Gözden geçirme bekleyen | Bölüm |
| --- | ---: | ---: | ---: | ---: |
${reportRows}

## Faz Sınırı

Bu faz teknik etiketlerin kullanıcı ekranından kaldırılması ve label/help map katmanının build kapısına bağlanması içindir. Bütün alanların nihai adli terminolojiyle elden düzeltilmesi Phase 4G-C ve sonraki UI metin iyileştirme çalışmalarında sürdürülecektir.
`;

  if (write) {
    writeJson(OUTPUT, output);
    writeJson(AUDIT_OUTPUT, { ...output, labels: auditLabels });
    writeText(REPORT, report);
  } else {
    const current = readJson(OUTPUT);
    if (!sameJson(current, output)) {
      failures.push({ code: 'label.outputDrift', message: 'Runtime label çıktısı güncel değil.' });
    }
    const currentAudit = readJson(AUDIT_OUTPUT);
    if (!sameJson(currentAudit, { ...output, labels: auditLabels })) {
      failures.push({ code: 'label.auditOutputDrift', message: 'Label audit çıktısı güncel değil.' });
    }
  }

  if (failures.length > 0) {
    console.error(JSON.stringify(failures.slice(0, 50), null, 2));
    process.exit(1);
  }

  console.log(
    `UI label doğrulaması geçti. field=${output.totals.fieldCount}, review=${output.totals.needsHumanReviewCount}`,
  );
}

build({ write: process.argv.includes('--write') });
