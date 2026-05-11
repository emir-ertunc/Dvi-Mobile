const { mkdirSync, readFileSync, writeFileSync } = require('node:fs');
const { dirname, join } = require('node:path');

const PHASE = 'Phase 5A';
const VERSION = '0.5.0';
const BUILD_ID = 'phase-5a-v0.5.0-20260511';
const ROOT = process.cwd();
const OUTPUT = join(ROOT, 'data', 'ui-labels', 'field-ui-labels.json');
const AUDIT_OUTPUT = join(ROOT, 'data', 'ui-labels', 'field-ui-labels-audit.json');
const REPORT = join(ROOT, 'docs', 'app', 'phase-5a-label-coverage.md');

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
    agency: 'İşlemi yürüten kurum veya birim',
    town: 'İl, ilçe veya yerleşim yeri',
    country: 'Ülke',
    interpol: 'INTERPOL referansı',
    'no:': 'Resmi kayıt numarası',
    'no.': 'Resmi kayıt numarası',
    no: 'Resmi kayıt numarası',
    date: 'Tarih',
    'date:': 'Tarih',
    '(date)': 'Tarih',
    email: 'E-posta adresi',
    'email:': 'E-posta adresi',
    by: 'İşlemi yapan görevli veya memur',
    'by:': 'İşlemi yapan görevli veya memur',
    relationship: 'Bilgiyi veren kişiyle yakınlık ilişkisi',
    name: 'Ad soyad',
    'name:': 'Ad soyad',
    nicknames: 'Lakap veya bilinen diğer adlar',
    report: 'Rapor bilgisi',
    yes: 'Evet seçeneği',
    no: 'Hayır seçeneği',
    '(specify):': 'Ayrıntılı açıklama',
    specify: 'Ayrıntılı açıklama',
    'mortuary)': 'Morg bilgisi',
    ncb: 'Ulusal merkez bürosu',
    'ncb:': 'Ulusal merkez bürosu',
    address: 'Açık adres',
    'address:': 'Açık adres',
    'address,': 'Açık adres',
    addresses: 'Adres geçmişi',
    phone: 'Telefon numarası',
    telephone: 'Telefon numarası',
    signature: 'İmza',
    'signature:': 'İmza',
    birthplace: 'Doğum yeri',
    place: 'Yer bilgisi',
    'place:': 'Yer bilgisi',
    sex: 'Cinsiyet',
    gender: 'Cinsiyet',
    age: 'Yaş',
    weight: 'Kilo',
    height: 'Boy',
    'residence/workplace/': 'İkamet veya iş yeri bilgisi',
  }),
);

const SERIES_DESCRIPTIONS = {
  AM: {
    100: 'başvuru kaydını alan kurum ve referans bilgisi',
    105: 'işlemi yapan görevli, memur ve ilk kayıt bilgisi',
    110: 'bilgiyi veren kişi ve yakınlık bilgisi',
    120: 'formun düzenlenme tarihi ve kayıt durumu',
    125: 'ikamet, iş yeri ve iletişim adresi',
    200: 'kayıp kişinin temel kimlik bilgisi',
    205: 'kayıp kişinin diğer adları ve lakapları',
    210: 'kayıp kişinin doğum, vatandaşlık ve aile bilgisi',
    220: 'kaybolma olayı, tarih ve yer bilgisi',
    230: 'son görülme ve kayıp bildirimi bilgisi',
    235: 'kayıp kişinin adres bilgisi',
    238: 'kayıp kişinin iletişim ve adres ayrıntısı',
    241: 'kayıp kişiye ait telefon bilgisi',
    243: 'kayıp kişinin adres geçmişi',
    300: 'kişisel eşya kayıt bilgisi',
    340: 'giysi ve aksesuar bilgisi',
    345: 'kişisel belge, ajanda ve taşınan eşya bilgisi',
    350: 'elektronik cihaz ve telefon bilgisi',
    400: 'fiziksel tanım bilgisi',
    402: 'bedensel görünüm ve ayırt edici özellik bilgisi',
    408: 'kilo bilgisi',
    412: 'boy veya kilo karşılaştırma bilgisi',
    440: 'yara izi, dövme veya ayırt edici iz bilgisi',
    484: 'destekleyici fiziksel özellik bilgisi',
    500: 'tıbbi geçmiş ve sağlık bilgisi',
    510: 'tıbbi belge veya muayene bilgisi',
    520: 'ameliyat, implant veya tedavi bilgisi',
    600: 'diş ve odontoloji bilgisi',
    610: 'diş kaydı ve dental bulgu bilgisi',
    630: 'odontoloji destek belgesi bilgisi',
    650: 'odontoloji uzmanı onayı ve imza bilgisi',
    700: 'destekleyici kimliklendirme bilgisi',
    800: 'ek belge, iletişim ve imza bilgisi',
    810: 'formu tamamlayan kişi iletişim bilgisi',
    870: 'ek görüntü, belge ve açıklama bilgisi',
  },
  PM: {
    150: 'buluntu kaydı ve morg kabul bilgisi',
    155: 'buluntu kaydını yapan görevli bilgisi',
    160: 'olay yeri veya inceleme görevlisi bilgisi',
    165: 'ceset veya kalıntıya ilişkin ilk inceleme bilgisi',
    170: 'buluntu yeri, rapor ve sorumlu kişi bilgisi',
    175: 'kalıntının sevk, teslim ve kurum bilgisi',
    300: 'cesetle bulunan eşya kayıt bilgisi',
    340: 'giysi, aksesuar ve kişisel eşya bilgisi',
    345: 'kişisel belge, ajanda ve taşınan eşya bilgisi',
    350: 'elektronik cihaz ve telefon bilgisi',
    400: 'post mortem fiziksel tanım bilgisi',
    402: 'bedensel görünüm ve ayırt edici özellik bilgisi',
    408: 'kilo bilgisi',
    412: 'boy veya kilo karşılaştırma bilgisi',
    440: 'yara izi, dövme veya ayırt edici iz bilgisi',
    484: 'destekleyici fiziksel özellik bilgisi',
    500: 'tıbbi ve patolojik inceleme bilgisi',
    510: 'patoloji kayıt ve bulgu bilgisi',
    520: 'otopsi, implant veya tedavi bulgusu bilgisi',
    600: 'post mortem diş ve odontoloji bilgisi',
    610: 'diş kaydı ve dental bulgu bilgisi',
    630: 'odontoloji destek belgesi bilgisi',
    650: 'odontoloji uzmanı onayı ve imza bilgisi',
    700: 'destekleyici kimliklendirme bilgisi',
    800: 'DNA, ek belge, iletişim ve imza bilgisi',
    810: 'formu tamamlayan kişi iletişim bilgisi',
    870: 'ek görüntü, belge ve açıklama bilgisi',
  },
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
  const key = normalized.toLowerCase().replace(/\.$/, '').trim();
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

function subFieldHint(pdfFieldName) {
  const parts = String(pdfFieldName).split('.');
  const last = parts[parts.length - 1];
  const hints = {
    1: 'birinci bilgi parçası',
    2: 'ikinci bilgi parçası',
    3: 'üçüncü bilgi parçası',
    4: 'dördüncü bilgi parçası',
    5: 'beşinci bilgi parçası',
    6: 'altıncı bilgi parçası',
    7: 'yedinci bilgi parçası',
    8: 'sekizinci bilgi parçası',
    300: 'ad, kurum veya ana satır bilgisi',
    301: 'adres veya yer satırı',
    302: 'adres devam satırı',
    303: 'il veya ilçe',
    304: 'posta kodu veya yer ayrıntısı',
    305: 'telefon veya iletişim satırı',
    306: 'ek iletişim satırı',
    307: 'e-posta veya ülke bilgisi',
    308: 'ek e-posta veya ülke bilgisi',
  };
  return hints[last] || null;
}

function semanticTopic(field) {
  const series = seriesFromPdfName(field.pdfFieldName);
  return SERIES_DESCRIPTIONS[field.formType]?.[series] || null;
}

function controlHelp(field) {
  if (field.controlType === 'checkbox') return 'Uygunsa bu seçeneği işaretleyin.';
  if (field.controlType === 'email') return 'Geçerli bir e-posta adresi girin.';
  if (field.controlType === 'phone') return 'Telefon numarasını uluslararası biçime yakın girin.';
  if (field.controlType === 'number') return 'Yalnızca sayısal değer girin.';
  if (field.controlType === 'date-part') return 'Tarih alanının ilgili gün, ay veya yıl parçasını girin.';
  return 'Bu alanı resmi formdaki karşılığına göre doldurun.';
}

function actionVerb(field) {
  if (field.controlType === 'checkbox') return 'uygunsa işaretleyin';
  if (field.controlType === 'email') return 'e-posta adresini yazın';
  if (field.controlType === 'phone') return 'telefon numarasını yazın';
  if (field.controlType === 'number') return 'sayısal değeri yazın';
  if (field.controlType === 'date-part') return 'tarihin ilgili parçasını yazın';
  return 'bilgiyi açık ve okunur şekilde yazın';
}

function buildLabel(field, sectionIndex) {
  const sectionLabel = SECTION_LABELS[field.officialSection.id] || field.officialSection.title || `${field.formType} bölümü`;
  const visible = translatedVisibleLabel(field.visibleLabel);
  const series = seriesFromPdfName(field.pdfFieldName);
  const row = rowHint(field.pdfFieldName);
  const control = CONTROL_LABELS[field.controlType] || 'alan';

  if (visible) {
    const sequence = `${sectionIndex + 1}. alan`;
    const topic = semanticTopic(field);
    const row = rowHint(field.pdfFieldName);
    const subField = subFieldHint(field.pdfFieldName);
    const contextParts = [topic, row, subField].filter(Boolean).join(', ');
    const helpContext = contextParts ? `${contextParts} için ` : '';
    return {
      labelTr: `${sectionLabel} - ${visible}`,
      shortLabelTr: `${visible} (${sequence})`,
      helpTextTr: `${sectionLabel} bölümünde ${helpContext}${visible.toLocaleLowerCase('tr-TR')} bilgisini ${actionVerb(field)}.`,
      reviewStatus: 'human_readable_contextual',
    };
  }

  const topic = semanticTopic(field);
  const seriesPart = topic || (series ? `${series} numaralı resmi form bloğu` : `${sectionIndex + 1}. alan`);
  const rowPart = row ? `, ${row}` : '';
  const subField = subFieldHint(field.pdfFieldName);
  const subFieldPart = subField ? `, ${subField}` : '';
  const shortLabelTr = `${seriesPart} ${control}`;

  return {
    labelTr: `${sectionLabel} - ${seriesPart}${rowPart}${subFieldPart}`,
    shortLabelTr,
    helpTextTr: `${sectionLabel} bölümünde ${seriesPart.toLocaleLowerCase('tr-TR')}${rowPart}${subFieldPart} alanına istenen ${control} bilgisini ${actionVerb(field)}.`,
    reviewStatus: topic ? 'contextual_generated' : 'needs_human_review',
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

  const report = `# Phase 5A Label Coverage

Bu rapor, kullanıcıya görünen alan etiketlerinin teknik PDF field id değerlerinden ayrıldığını ve görevli-dostu Türkçe doldurma rehberine bağlandığını denetler.

## Sonuç

- Toplam alan: ${output.totals.fieldCount}
- İnsan-okur bağlamlı etiket: ${output.totals.generatedFromVisibleLabelCount}
- İnsan gözden geçirmesi gereken kalan otomatik etiket: ${output.totals.needsHumanReviewCount}
- Teknik runtime label hatası: ${failures.length}

| Form | Alan | İnsan-okur bağlamlı | Gözden geçirme bekleyen | Bölüm |
| --- | ---: | ---: | ---: | ---: |
${reportRows}

## Faz Sınırı

Bu faz PDF export motoruna başlamaz. Amaç, belgeyi bilmeyen kullanıcının her alan için ne istenildiğini daha net görmesini sağlamaktır.
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
