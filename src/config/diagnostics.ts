import { BUILD_INFO } from './buildInfo';
import { PDF_TEMPLATE_MANIFEST } from './pdfTemplates';
import { DRAFT_STORAGE_KEY, DRAFT_STORAGE_VERSION } from '../storage/draftStore';

export const DIAGNOSTICS_INFO = {
  appName: BUILD_INFO.appName,
  buildId: BUILD_INFO.buildId,
  phase: BUILD_INFO.phase,
  version: BUILD_INFO.version,
  androidVersionCode: BUILD_INFO.androidVersionCode,
  draftStorageKey: DRAFT_STORAGE_KEY,
  draftStorageVersion: DRAFT_STORAGE_VERSION,
  schemaCoverage: {
    totalFieldCount: 3380,
    totalWidgetBindingCount: 4032,
    amFieldCount: 1687,
    pmFieldCount: 1693,
  },
  pdfTemplates: {
    templateCount: PDF_TEMPLATE_MANIFEST.templates.length,
    buildId: PDF_TEMPLATE_MANIFEST.buildId,
    forms: PDF_TEMPLATE_MANIFEST.templates.map((template) => ({
      formType: template.formType,
      sha256: template.sha256,
      pageCount: template.pageCount,
      widgetCount: template.widgetCount,
    })),
  },
  qualityGates: [
    'TypeScript kontrolü',
    'Türkçe arayüz metni',
    'Yeniden baz alma',
    'PDF teknik inceleme',
    'AM/PM envanter',
    'AM/PM şema',
    'Şema kapsamı',
    'Taslak saklama',
    'UI kapsamı',
    'Türkçe alan etiketi',
    'PDF şablonları',
  ],
} as const;
