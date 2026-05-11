import templateManifestJson from '../../data/pdf-templates/pdf-template-manifest.json';

export type PdfTemplateFormType = 'AM' | 'PM';

export type PdfTemplateInfo = {
  formType: PdfTemplateFormType;
  displayNameTr: string;
  sourceFileName: string;
  assetPath: string;
  sha256: string;
  byteLength: number;
  pageCount: number;
  widgetCount: number;
  uniqueFieldNameCount: number;
  hasTextLayer: boolean;
  hasWidgets: boolean;
};

export type PdfTemplateManifest = {
  phase: string;
  version: string;
  buildId: string;
  strategy: string;
  generatedAtPolicy: string;
  templates: PdfTemplateInfo[];
};

export const PDF_TEMPLATE_ASSETS = {
  AM: require('../../assets/pdf-templates/interpol-dvi-2018-am-fillable.pdf') as number,
  PM: require('../../assets/pdf-templates/interpol-dvi-2018-pm-fillable.pdf') as number,
} as const;

export const PDF_TEMPLATE_MANIFEST = templateManifestJson as PdfTemplateManifest;

export function getPdfTemplateInfo(formType: PdfTemplateFormType): PdfTemplateInfo {
  const template = PDF_TEMPLATE_MANIFEST.templates.find((item) => item.formType === formType);
  if (!template) {
    throw new Error(`PDF sablon bilgisi bulunamadi: ${formType}`);
  }
  return template;
}
