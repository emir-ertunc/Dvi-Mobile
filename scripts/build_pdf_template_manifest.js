const {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} = require('node:fs');
const { createHash } = require('node:crypto');
const { dirname, join, resolve } = require('node:path');
const os = require('node:os');

const ROOT = process.cwd();
const WRITE = process.argv.includes('--write');
const VERSION = '0.5.0';
const PHASE = 'Phase 5A';
const BUILD_ID = 'phase-5a-v0.5.0-20260511';
const MANIFEST_PATH = join(ROOT, 'data', 'pdf-templates', 'pdf-template-manifest.json');
const FORENSICS_PATH = join(ROOT, 'data', 'acroform-forensics', 'generated', 'phase-1a-pdf-forensics.json');

const TEMPLATE_DEFINITIONS = [
  {
    formType: 'AM',
    displayNameTr: 'Ölüm Öncesi Formu',
    sourceFileName: 'Ante Mortem (yellow) INTERPOL DVI form (2018, fillable) - Missing person.pdf',
    envVar: 'DVI_AM_PDF',
    assetPath: 'assets/pdf-templates/interpol-dvi-2018-am-fillable.pdf',
    sha256: '0a20690e3510ae844a34cee725a80f54817ead3ba385172d3c7b7c5e492fe171',
    byteLength: 2370170,
    pageCount: 18,
    widgetCount: 2006,
    uniqueFieldNameCount: 1687,
    hasTextLayer: true,
    hasWidgets: true,
  },
  {
    formType: 'PM',
    displayNameTr: 'Ölüm Sonrası Formu',
    sourceFileName: 'Post Mortem (pink) INTERPOL DVI form (2018, fillable) - Unidentified human remains.pdf',
    envVar: 'DVI_PM_PDF',
    assetPath: 'assets/pdf-templates/interpol-dvi-2018-pm-fillable.pdf',
    sha256: '203a9d52189f07219b4e64c7c767eaf252d40b2d0d6e8cd9e814b91face83a02',
    byteLength: 2728006,
    pageCount: 19,
    widgetCount: 2026,
    uniqueFieldNameCount: 1693,
    hasTextLayer: true,
    hasWidgets: true,
  },
];

function normalizePath(path) {
  return path.replaceAll('\\', '/');
}

function sha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function stableJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function candidateSourcePaths(definition) {
  const candidates = [];
  if (process.env[definition.envVar]) {
    candidates.push(resolve(process.env[definition.envVar]));
  }
  candidates.push(join(os.homedir(), 'Desktop', definition.sourceFileName));
  candidates.push(join(ROOT, 'pdf-sources', definition.sourceFileName));
  candidates.push(join(ROOT, 'fixtures', 'pdf-sources', definition.sourceFileName));
  return candidates;
}

function findExpectedSource(definition) {
  for (const candidate of candidateSourcePaths(definition)) {
    if (!existsSync(candidate)) {
      continue;
    }
    if (sha256(candidate) === definition.sha256) {
      return candidate;
    }
  }
  return null;
}

function ensureAsset(definition) {
  const assetAbsolutePath = join(ROOT, definition.assetPath);
  if (existsSync(assetAbsolutePath) && sha256(assetAbsolutePath) === definition.sha256) {
    return;
  }

  if (!WRITE) {
    throw new Error(`${definition.formType} PDF sablonu eksik veya hash uyumsuz: ${definition.assetPath}`);
  }

  const source = findExpectedSource(definition);
  if (!source) {
    throw new Error(`${definition.formType} icin beklenen kaynak PDF bulunamadi: ${definition.sourceFileName}`);
  }

  mkdirSync(dirname(assetAbsolutePath), { recursive: true });
  copyFileSync(source, assetAbsolutePath);
}

function validateForensics(definition, forensics) {
  if (!forensics) {
    return;
  }

  const summary = Array.isArray(forensics.forms)
    ? forensics.forms.find((item) => item.formType === definition.formType)
    : forensics.forms?.[definition.formType]?.summary;
  if (!summary) {
    throw new Error(`${definition.formType} forensics ozeti bulunamadi.`);
  }

  const checks = [
    ['sha256', summary.sha256, definition.sha256],
    ['pageCount', summary.pageCount, definition.pageCount],
    ['widgetCount', summary.widgetCount, definition.widgetCount],
    ['uniqueFieldNameCount', summary.uniqueFieldNameCount, definition.uniqueFieldNameCount],
    ['hasTextLayer', summary.hasTextLayer, definition.hasTextLayer],
    ['hasWidgets', summary.hasWidgets, definition.hasWidgets],
  ];

  for (const [label, actual, expected] of checks) {
    if (actual !== expected) {
      throw new Error(`${definition.formType} forensics ${label}: ${actual} yerine ${expected} bekleniyordu.`);
    }
  }
}

function buildTemplateEntry(definition) {
  const assetAbsolutePath = join(ROOT, definition.assetPath);
  const stats = statSync(assetAbsolutePath);
  const actualHash = sha256(assetAbsolutePath);

  if (actualHash !== definition.sha256) {
    throw new Error(`${definition.formType} PDF hash uyumsuz: ${actualHash}`);
  }
  if (stats.size !== definition.byteLength) {
    throw new Error(`${definition.formType} PDF byte uzunlugu uyumsuz: ${stats.size}`);
  }

  return {
    formType: definition.formType,
    displayNameTr: definition.displayNameTr,
    sourceFileName: definition.sourceFileName,
    assetPath: normalizePath(definition.assetPath),
    sha256: definition.sha256,
    byteLength: definition.byteLength,
    pageCount: definition.pageCount,
    widgetCount: definition.widgetCount,
    uniqueFieldNameCount: definition.uniqueFieldNameCount,
    hasTextLayer: definition.hasTextLayer,
    hasWidgets: definition.hasWidgets,
  };
}

function buildManifest() {
  for (const definition of TEMPLATE_DEFINITIONS) {
    ensureAsset(definition);
  }

  const forensics = existsSync(FORENSICS_PATH) ? readJson(FORENSICS_PATH) : null;
  for (const definition of TEMPLATE_DEFINITIONS) {
    validateForensics(definition, forensics);
  }

  return {
    phase: PHASE,
    version: VERSION,
    buildId: BUILD_ID,
    strategy: 'Committed AcroForm template assets with deterministic hash verification.',
    generatedAtPolicy: 'Manifest content is deterministic; regeneration must not depend on wall-clock time.',
    templates: TEMPLATE_DEFINITIONS.map(buildTemplateEntry),
  };
}

function main() {
  const manifest = buildManifest();
  const content = stableJson(manifest);

  if (WRITE) {
    mkdirSync(dirname(MANIFEST_PATH), { recursive: true });
    writeFileSync(MANIFEST_PATH, content);
    console.log(`PDF sablon manifesti yazildi: ${normalizePath(MANIFEST_PATH)}`);
    return;
  }

  if (!existsSync(MANIFEST_PATH)) {
    throw new Error('PDF sablon manifesti eksik.');
  }

  const current = readFileSync(MANIFEST_PATH, 'utf8');
  if (current !== content) {
    throw new Error('PDF sablon manifesti guncel degil. npm run pdf:templates komutunu calistirin.');
  }

  console.log('PDF sablon dogrulamasi gecti.');
}

main();
