const { mkdirSync, readFileSync, writeFileSync } = require('node:fs');
const { dirname, join } = require('node:path');

const PHASE = 'Phase 5A-Fix4';
const VERSION = '0.5.4';
const BUILD_ID = 'phase-5a-fix4-v0.5.4-20260512';
const ROOT = process.cwd();
const OUTPUT = join(ROOT, 'data', 'ui-labels', 'field-ui-labels.json');
const AUDIT_OUTPUT = join(ROOT, 'data', 'ui-labels', 'field-ui-labels-audit.json');
const REPORT = join(ROOT, 'docs', 'app', 'phase-5a-fix4-label-coverage.md');

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
    partner: 'Eş veya partner',
    'partner:': 'Eş veya partner',
    fingerprinted: 'Parmak izi alındı seçeneği',
    fingerprints: 'Parmak izi kaydı seçeneği',
    'not,': 'Bilgi yok seçeneği',
    not: 'Bilgi yok seçeneği',
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
    items: 'Eşya adı veya tanımı',
    item: 'Eşya adı veya tanımı',
    material: 'Malzeme',
    'brand/make': 'Marka veya üretici',
    brand: 'Marka',
    make: 'Üretici',
    model: 'Model',
    colour: 'Renk',
    color: 'Renk',
    size: 'Beden veya ölçü',
    type: 'Tip',
    style: 'Stil',
    other: 'Diğer açıklama',
    details: 'Ayrıntılı açıklama',
    'details:': 'Ayrıntılı açıklama',
    description: 'Açıklama',
    'description:': 'Açıklama',
    sample: 'Örnek bilgisi',
    reference: 'Referans bilgisi',
    location: 'Konum veya yer bilgisi',
    condition: 'Durum bilgisi',
    notes: 'Notlar',
    comment: 'Açıklama',
    comments: 'Açıklamalar',
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

const COMMON_SERIES_DESCRIPTIONS = {
  305: 'takı ve değerli eşya bilgisi',
  310: 'saat, gözlük ve aksesuar bilgisi',
  315: 'cüzdan, çanta ve belge bilgisi',
  320: 'anahtar ve küçük kişisel eşya bilgisi',
  325: 'elektronik veya teknik cihaz bilgisi',
  330: 'para, kart veya ödeme aracı bilgisi',
  335: 'giysi ve üzerindeki eşya bilgisi',
  404: 'cinsiyet, yaş ve temel fiziksel görünüm bilgisi',
  416: 'saç, sakal veya vücut kılı bilgisi',
  420: 'göz, yüz ve baş bölgesi özellikleri',
  424: 'kulak, burun ve ağız bölgesi özellikleri',
  428: 'kol, el ve parmak özellikleri',
  432: 'gövde ve sırt bölgesi özellikleri',
  436: 'bacak, ayak ve yürüyüş özellikleri',
  444: 'ameliyat izi veya yara izi bilgisi',
  448: 'dövme veya kalıcı işaret bilgisi',
  452: 'doğum lekesi veya cilt izi bilgisi',
  456: 'piercing, takı izi veya vücut modifikasyonu bilgisi',
  460: 'protez, implant veya destek cihazı bilgisi',
  464: 'kırık, deformite veya hareket kısıtlılığı bilgisi',
  468: 'alışkanlık, duruş veya yürüyüş özelliği bilgisi',
  472: 'ek ayırt edici fiziksel özellik bilgisi',
  476: 'fotoğraf, görüntü veya fiziksel belge bilgisi',
  480: 'fiziksel tanım ek açıklaması',
  505: 'tıbbi kurum, doktor veya sağlık kaydı bilgisi',
  515: 'ilaç, hastalık veya tedavi geçmişi bilgisi',
  525: 'ameliyat veya tedavi geçmişi bilgisi',
  530: 'implant, protez veya tıbbi cihaz bilgisi',
  555: 'aşı, laboratuvar veya destekleyici sağlık bilgisi',
  560: 'tıbbi belge ve ek sağlık açıklaması',
  605: 'diş hekimi ve dental kayıt bilgisi',
  615: 'diş tedavisi, protez veya dental özellik bilgisi',
  620: 'diş röntgeni veya dental belge bilgisi',
  625: 'diş röntgeni veya dental belge bilgisi',
  635: 'odontoloji ek inceleme bilgisi',
  640: 'odontoloji karşılaştırma ve sonuç bilgisi',
  645: 'odontoloji uzman iletişim bilgisi',
  705: 'destekleyici kimliklendirme notu',
  805: 'ek belge ve fotoğraf bilgisi',
  815: 'formu tamamlayan kişi veya birim bilgisi',
  820: 'imza ve onay bilgisi',
  825: 'ek belge listesi ve açıklama bilgisi',
  830: 'son kontrol ve tamamlanma bilgisi',
};

Object.assign(SERIES_DESCRIPTIONS.AM, COMMON_SERIES_DESCRIPTIONS, {
  115: 'eş veya partner bilgisi',
  215: 'kayıp kişinin cinsiyet ve medeni durum bilgisi',
  225: 'kaybolma olayına ilişkin ek açıklama',
  240: 'kayıp kişinin adres ve iletişim ayrıntısı',
  245: 'kayıp kişiye ait ek kimlik bilgisi',
});

Object.assign(SERIES_DESCRIPTIONS.PM, COMMON_SERIES_DESCRIPTIONS, {
  488: 'post mortem ek fiziksel bulgu bilgisi',
  492: 'kalıntıya ait özel işaret ve bulgu bilgisi',
  496: 'kimliklendirmeye yardımcı ayrıntılı fiziksel bulgu',
  535: 'otopsi veya dış muayene bulgusu',
  540: 'implant, protez veya tıbbi cihaz bulgusu',
  545: 'patolojik bulgu ve değerlendirme bilgisi',
  550: 'tıbbi inceleme sonucu ve ek not',
  647: 'odontoloji ek onay ve değerlendirme bilgisi',
  852: 'DNA örneği ve laboratuvar bilgisi',
  854: 'DNA örnek alma koşulu bilgisi',
  856: 'DNA gönderim ve teslim bilgisi',
  858: 'DNA analiz sonucu bilgisi',
  860: 'DNA uzman iletişim bilgisi',
  862: 'DNA karşılaştırma notu',
  864: 'DNA ek belge bilgisi',
  866: 'DNA onay ve imza bilgisi',
  868: 'DNA kalite kontrol bilgisi',
  872: 'nihai ek açıklama ve belge bilgisi',
});

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

function fieldNameLastPart(pdfFieldName) {
  const parts = String(pdfFieldName).split('.');
  return parts[parts.length - 1] || '';
}

function semanticTopic(field) {
  const series = seriesFromPdfName(field.pdfFieldName);
  return SERIES_DESCRIPTIONS[field.formType]?.[series] || null;
}

function fallbackTopic(field) {
  if (field.officialSection.id.endsWith('.checklist')) return 'form kontrol listesi';
  if (field.officialSection.id.endsWith('.header')) return 'form üst bilgisi';
  if (field.officialSection.id.includes('kayit')) return 'kayıt ve sorumlu görevli bilgisi';
  if (field.officialSection.id.includes('kisi')) return 'kişi kimlik ve olay bilgisi';
  if (field.officialSection.id.includes('esyalar')) return 'eşya ve bulgu bilgisi';
  if (field.officialSection.id.includes('fiziksel')) return 'fiziksel tanım ve ayırt edici özellik';
  if (field.officialSection.id.includes('tibbi')) return 'tıbbi inceleme ve sağlık bilgisi';
  if (field.officialSection.id.includes('odontoloji')) return 'diş ve odontoloji bilgisi';
  if (field.officialSection.id.includes('destek')) return 'destekleyici kimliklendirme bilgisi';
  if (field.officialSection.id.includes('ekler')) return 'ek belge, iletişim ve imza bilgisi';
  return 'resmi form alanı';
}

function controlHelp(field) {
  if (field.controlType === 'checkbox') return 'Uygunsa bu seçeneği işaretleyin.';
  if (field.controlType === 'email') return 'Geçerli bir e-posta adresi girin.';
  if (field.controlType === 'phone') return 'Telefon numarasını uluslararası biçime yakın girin.';
  if (field.controlType === 'number') return 'Yalnızca sayısal değer girin.';
  if (field.controlType === 'date-part') return 'Tarih alanının ilgili gün, ay veya yıl parçasını girin.';
  return 'Bu alanı resmi formdaki karşılığına göre doldurun.';
}

function actionInstruction(field) {
  if (field.controlType === 'checkbox') return 'uygunsa işaretleyin';
  if (field.controlType === 'email') return 'geçerli e-posta adresi olarak yazın';
  if (field.controlType === 'phone') return 'telefon numarası olarak yazın';
  if (field.controlType === 'number') return 'sayısal değer olarak yazın';
  if (field.controlType === 'date-part') return 'tarihin gün, ay veya yıl parçası olarak yazın';
  return 'açık ve okunur şekilde yazın';
}

function actionObject(text) {
  const value = String(text || '').trim();
  const lower = value.toLocaleLowerCase('tr-TR');
  if (lower.endsWith('bilgisi')) return `${value.slice(0, -7)}bilgisini`;
  if (lower.endsWith('açıklaması')) return `${value.slice(0, -10)}açıklamasını`;
  if (lower.endsWith('seçeneği')) return `${value.slice(0, -8)}seçeneğini`;
  if (lower.endsWith('adresi')) return `${value.slice(0, -6)}adresini`;
  if (lower.endsWith('numarası')) return `${value.slice(0, -8)}numarasını`;
  if (lower.endsWith('tanımı')) return `${value.slice(0, -6)}tanımını`;
  if (lower.endsWith('durumu')) return `${value.slice(0, -6)}durumunu`;
  if (lower.endsWith('tarihi')) return `${value.slice(0, -6)}tarihini`;
  if (lower.endsWith('yeri')) return `${value.slice(0, -4)}yerini`;
  if (lower.endsWith('notu')) return `${value.slice(0, -4)}notunu`;
  if (lower.endsWith('imza')) return 'imzayı';
  return `${value} bilgisini`;
}

function checkboxActionObject(text) {
  const value = String(text || '').trim();
  if (/seçeneği$/i.test(value)) return actionObject(value);
  return `${value} seçeneğini`;
}

function specificFieldLabel(field, visible) {
  const lastPart = fieldNameLastPart(field.pdfFieldName);

  if (field.controlType === 'email') {
    if (lastPart === '306' || lastPart === '308' || /additional/i.test(field.visibleLabel || '')) return 'Ek e-posta adresi';
    return 'E-posta adresi';
  }

  if (field.controlType === 'phone') return 'Telefon numarası';

  if (lastPart === '301') return 'Açık adres satırı 1';
  if (lastPart === '302') return 'Açık adres satırı 2';
  if (lastPart === '303') return 'İl veya ilçe';
  if (lastPart === '304') return 'Posta kodu, ülke veya yer ayrıntısı';
  if (lastPart === '305') return 'Ek iletişim veya adres bilgisi';
  if (lastPart === '306') return 'Ek iletişim bilgisi';
  if (lastPart === '307') return 'Ülke veya e-posta bilgisi';
  if (lastPart === '308') return 'Ek ülke veya e-posta bilgisi';

  return visible;
}

function fullLabel(sectionLabel, topic, specific) {
  if (!specific) return `${sectionLabel} - ${topic}`;
  const normalizedTopic = topic.toLocaleLowerCase('tr-TR');
  const normalizedSpecific = specific.toLocaleLowerCase('tr-TR');
  if (normalizedTopic === normalizedSpecific || normalizedTopic.includes(normalizedSpecific)) {
    return `${sectionLabel} - ${specific}`;
  }
  return `${sectionLabel} - ${topic} - ${specific}`;
}

function buildLabel(field, sectionIndex) {
  const sectionLabel = SECTION_LABELS[field.officialSection.id] || field.officialSection.title || `${field.formType} bölümü`;
  const visible = translatedVisibleLabel(field.visibleLabel);
  const series = seriesFromPdfName(field.pdfFieldName);
  const control = CONTROL_LABELS[field.controlType] || 'alan';
  const topic = semanticTopic(field) || fallbackTopic(field);
  const specific = specificFieldLabel(field, visible);

  if (specific) {
    return {
      labelTr: fullLabel(sectionLabel, topic, specific),
      shortLabelTr: specific,
      helpTextTr: `${sectionLabel} bölümünde ${topic} için ${
        field.controlType === 'checkbox' ? checkboxActionObject(specific).toLocaleLowerCase('tr-TR') : actionObject(specific).toLocaleLowerCase('tr-TR')
      } ${actionInstruction(field)}.`,
      reviewStatus: 'human_readable_contextual',
    };
  }

  const fieldTopic = topic || (series ? `${sectionLabel.toLocaleLowerCase('tr-TR')} ek bilgisi` : 'resmi formdaki ilgili bilgi');
  const shortLabelTr = fieldTopic;

  return {
    labelTr: `${sectionLabel} - ${fieldTopic}`,
    shortLabelTr,
    helpTextTr:
      field.controlType === 'checkbox'
        ? `${sectionLabel} bölümünde ${fieldTopic.toLocaleLowerCase('tr-TR')} için uygun seçeneği işaretleyin.`
        : `${sectionLabel} bölümünde ${actionObject(fieldTopic).toLocaleLowerCase('tr-TR')} ${actionInstruction(field)}.`,
    reviewStatus: topic ? 'contextual_generated' : 'needs_human_review',
  };
}

function hasTechnicalRuntimeLabel(text, formType) {
  if (new RegExp(`^${formType} alanı\\b`, 'i').test(text)) return true;
  if (/\b\d{3}\.\d/.test(text)) return true;
  if (/\b\d+\.\s*satır\b/i.test(text)) return true;
  if (/\bbilgi parçası\b/i.test(text)) return true;
  if (/\bnumaralı resmi form bloğu\b/i.test(text)) return true;
  return false;
}

function hasMismatchedRuntimeLabel(text, field) {
  const lower = text.toLocaleLowerCase('tr-TR');
  if (field.controlType === 'email' && !lower.includes('e-posta')) return true;
  if (field.controlType === 'phone' && !lower.includes('telefon')) return true;
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
      if (hasMismatchedRuntimeLabel(`${label.labelTr} ${label.shortLabelTr}`, field)) {
        failures.push({
          code: 'label.controlTypeMismatch',
          message: 'Kullanıcı etiketi input tipiyle çelişiyor.',
          fieldId: field.schemaFieldId,
          controlType: field.controlType,
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

  const report = `# Phase 5A-Fix4 Label Coverage

Bu rapor, kullanıcıya görünen alan etiketlerinin teknik PDF field id, satır/parça ifadesi, sıra numarası, belirsiz resmi blok numarası ve input tipiyle çelişen adres/e-posta başlıklarından ayrıldığını denetler.

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
