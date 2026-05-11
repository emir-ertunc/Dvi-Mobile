import fieldUiLabelsJson from '../../data/ui-labels/field-ui-labels.json';
import type { CanonicalSchemaField } from '../domain/schemaTypes';

export interface FieldUiText {
  readonly labelTr: string;
  readonly shortLabelTr: string;
  readonly helpTextTr: string;
  readonly reviewStatus: string;
}

interface FieldUiLabelDocument {
  readonly labels: Readonly<Record<string, FieldUiText>>;
}

const FIELD_UI_LABELS = fieldUiLabelsJson as FieldUiLabelDocument;

function fallbackSectionTitle(field: CanonicalSchemaField): string {
  return field.officialSection.title.replace(/^\d+\s+serisi\s+-\s+/i, '');
}

export function getFieldUiText(field: CanonicalSchemaField, index: number): FieldUiText {
  const mapped = FIELD_UI_LABELS.labels[field.schemaFieldId];
  if (mapped) return mapped;

  const sectionTitle = fallbackSectionTitle(field);
  return {
    labelTr: `${sectionTitle} - ${index + 1}. alan`,
    shortLabelTr: `${index + 1}. alan`,
    helpTextTr: `${sectionTitle} bölümündeki alanı resmi form karşılığına göre doldurun.`,
    reviewStatus: 'missing_map_fallback',
  };
}
