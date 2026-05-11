import amSchemaJson from '../../data/schema/am-schema.json';
import pmSchemaJson from '../../data/schema/pm-schema.json';
import type { CanonicalSchemaDocument, CanonicalSchemaField } from '../domain/schemaTypes';
import type { FormType } from '../domain/fieldPrimitives';

export interface FormSectionSummary {
  readonly id: string;
  readonly title: string;
  readonly from?: number;
  readonly to?: number;
  readonly fieldCount: number;
  readonly widgetCount: number;
  readonly pageNumbers: readonly number[];
}

const SCHEMAS: Readonly<Record<FormType, CanonicalSchemaDocument>> = {
  AM: amSchemaJson as unknown as CanonicalSchemaDocument,
  PM: pmSchemaJson as unknown as CanonicalSchemaDocument,
};

export function isHiddenFormEntryField(field: CanonicalSchemaField): boolean {
  if (/\.[ABC]$/.test(field.pdfFieldName)) return true;
  return /\.(302|304|306)$/.test(field.pdfFieldName);
}

function visibleFormEntryFields(fields: readonly CanonicalSchemaField[]): readonly CanonicalSchemaField[] {
  return fields.filter((field) => !isHiddenFormEntryField(field));
}

export function getFormSchema(formType: FormType): CanonicalSchemaDocument {
  return SCHEMAS[formType];
}

export function getFormTitleTr(formType: FormType): string {
  return formType === 'AM' ? 'Ölüm Öncesi Kaydı' : 'Ölüm Sonrası Kaydı';
}

export function getFormSections(formType: FormType): readonly FormSectionSummary[] {
  const schema = getFormSchema(formType);
  const sections = new Map<string, FormSectionSummary>();

  for (const field of visibleFormEntryFields(schema.fields)) {
    const current = sections.get(field.officialSection.id);
    const fieldPages = field.widgetInstances.map((widget) => widget.pageNumber);
    const mergedPages = new Set([...(current?.pageNumbers ?? []), ...fieldPages]);

    sections.set(field.officialSection.id, {
      id: field.officialSection.id,
      title: field.officialSection.title,
      from: field.officialSection.from,
      to: field.officialSection.to,
      fieldCount: (current?.fieldCount ?? 0) + 1,
      widgetCount: (current?.widgetCount ?? 0) + field.widgetInstances.length,
      pageNumbers: [...mergedPages].sort((left, right) => left - right),
    });
  }

  return [...sections.values()];
}

export function getInitialSectionId(formType: FormType): string {
  return getFormSections(formType)[0]?.id ?? '';
}

export function getSectionFields(formType: FormType, sectionId: string): readonly CanonicalSchemaField[] {
  return visibleFormEntryFields(getFormSchema(formType).fields)
    .filter((field) => field.officialSection.id === sectionId)
    .sort((left, right) => {
      const leftWidget = left.widgetInstances[0];
      const rightWidget = right.widgetInstances[0];
      if (!leftWidget || !rightWidget) return left.schemaFieldId.localeCompare(right.schemaFieldId);
      return (
        leftWidget.pageNumber - rightWidget.pageNumber ||
        leftWidget.rect[1] - rightWidget.rect[1] ||
        leftWidget.rect[0] - rightWidget.rect[0] ||
        left.schemaFieldId.localeCompare(right.schemaFieldId)
      );
    });
}

export function fieldPageSummary(field: CanonicalSchemaField): string {
  const pageNumbers = [...new Set(field.widgetInstances.map((widget) => widget.pageNumber))].sort(
    (left, right) => left - right,
  );
  return pageNumbers.length > 0 ? pageNumbers.join(', ') : 'Sayfa yok';
}
