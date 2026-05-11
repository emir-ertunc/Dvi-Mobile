import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import type { CanonicalSchemaField } from '../domain/schemaTypes';
import { validateSchemaValue } from '../domain/validation';
import { fieldPageSummary } from '../data/formSchemaCatalog';
import { getFieldUiText } from '../data/fieldUiLabels';
import type { DraftFieldValue } from '../storage/draftStore';

interface FormFieldControlProps {
  readonly field: CanonicalSchemaField;
  readonly index: number;
  readonly editable: boolean;
  readonly value: DraftFieldValue | undefined;
  readonly onValueChange: (fieldId: string, value: DraftFieldValue | null) => void;
}

const controlTypeLabels: Readonly<Record<string, string>> = {
  checkbox: 'Seçim kutusu',
  'date-part': 'Tarih parçası',
  email: 'E-posta',
  number: 'Sayı',
  phone: 'Telefon',
  text: 'Metin',
};

function placeholderForField(field: CanonicalSchemaField): string {
  if (field.controlType === 'email') return 'ornek@kurum.gov.tr';
  if (field.controlType === 'phone') return '+90 5xx xxx xx xx';
  if (field.controlType === 'number') return 'Sayısal değer';
  if (field.controlType === 'date-part') return 'GG / AA / YYYY';
  return 'İstenen bilgiyi yazın';
}

function keyboardTypeForField(field: CanonicalSchemaField) {
  if (field.controlType === 'email') return 'email-address';
  if (field.controlType === 'number' || field.controlType === 'date-part') return 'numeric';
  if (field.controlType === 'phone') return 'phone-pad';
  return 'default';
}

function maxLengthForField(field: CanonicalSchemaField): number | undefined {
  if (field.validationRules.includes('datePart.day') || field.validationRules.includes('datePart.month')) return 2;
  if (field.validationRules.includes('datePart.year')) return 4;
  return undefined;
}

function normalizeInputValue(field: CanonicalSchemaField, nextValue: string): DraftFieldValue | null {
  const trimmed = nextValue.trim();
  if (trimmed.length === 0) return null;

  if (field.controlType === 'number') {
    const parsed = Number(trimmed.replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : trimmed;
  }

  return nextValue;
}

function checkboxOptionLabel(label: string): string {
  const readableLabel = label
    .replace(/\s*\(\d+\.\s*alan\)$/i, '')
    .replace(/\s+seçim$/i, '')
    .replace(/\s+metin$/i, '')
    .replace(/\s+tarih parçası$/i, '')
    .replace(/\s+e-posta$/i, '')
    .replace(/\s+telefon$/i, '')
    .replace(/\s+sayı$/i, '')
    .trim();
  if (!readableLabel) return 'Bu seçenek';
  return readableLabel.charAt(0).toLocaleUpperCase('tr-TR') + readableLabel.slice(1);
}

export function FormFieldControl({ editable, field, index, onValueChange, value }: FormFieldControlProps) {
  const controlLabel = controlTypeLabels[field.controlType] ?? 'Alan';
  const uiText = getFieldUiText(field, index);
  const checked = value === true;
  const checkboxLabel = checkboxOptionLabel(uiText.shortLabelTr || uiText.labelTr);
  const textValue = typeof value === 'string' || typeof value === 'number' ? String(value) : '';
  const validation = validateSchemaValue(value ?? null, {
    readinessRule: field.readinessRule,
    validationRules: field.validationRules,
    valueType: field.valueType,
  });

  return (
    <View style={[styles.fieldCard, editable && styles.editableFieldCard]}>
      <View style={styles.fieldHeader}>
        <View style={styles.fieldTitleGroup}>
          <Text style={styles.fieldIndex}>{index + 1}</Text>
          <View style={styles.fieldLabelGroup}>
            <Text style={styles.fieldLabel}>{uiText.labelTr}</Text>
            <Text style={styles.fieldHelp}>{uiText.helpTextTr}</Text>
            <Text style={styles.fieldMeta}>Sayfa {fieldPageSummary(field)} · {controlLabel}</Text>
          </View>
        </View>
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>{editable ? controlLabel : 'Sonraki faz'}</Text>
        </View>
      </View>

      {field.controlType === 'checkbox' ? (
        <Pressable
          accessibilityLabel={uiText.labelTr}
          accessibilityRole="checkbox"
          accessibilityState={{ checked, disabled: !editable }}
          disabled={!editable}
          onPress={() => onValueChange(field.schemaFieldId, checked ? null : true)}
          style={[styles.checkboxPreview, editable && styles.editableInput, checked && styles.checkedPreview]}
        >
          <View style={[styles.checkboxBox, checked && styles.checkedBox]}>
            {checked && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <View style={styles.checkboxTextGroup}>
            <Text style={styles.checkboxOptionText}>Seçenek: {checkboxLabel}</Text>
            <Text style={[styles.checkboxStateText, checked && styles.checkedStateText]}>
              {checked ? 'Seçili' : 'Seçili değil'}
            </Text>
          </View>
          {editable && (
            <View style={styles.checkboxActionBadge}>
              <Text style={styles.checkboxActionText}>{checked ? 'Kaldır' : 'Seç'}</Text>
            </View>
          )}
        </Pressable>
      ) : (
        <TextInput
          accessibilityLabel={uiText.labelTr}
          editable={editable}
          keyboardType={keyboardTypeForField(field)}
          maxLength={maxLengthForField(field)}
          onChangeText={(nextValue) => onValueChange(field.schemaFieldId, normalizeInputValue(field, nextValue))}
          placeholder={placeholderForField(field)}
          placeholderTextColor="#64748b"
          style={[styles.inputPreview, editable && styles.editableInput, editable && !validation.valid && styles.invalidInput]}
          value={textValue}
        />
      )}

      {editable &&
        validation.issues.map((issue) => (
          <Text key={issue.code} style={styles.validationText}>
            {issue.messageTr}
          </Text>
        ))}
      {!editable && <Text style={styles.lockedText}>Bu bölüm sonraki alt fazda düzenlemeye açılacak.</Text>}
      <Text style={styles.bindingText}>Resmi form eşleşmesi: {field.exportBinding.widgetInstanceCount} bileşen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fieldCard: {
    backgroundColor: '#ffffff',
    borderColor: '#d8dee8',
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 12,
  },
  editableFieldCard: {
    borderColor: '#0f766e',
  },
  fieldHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  fieldTitleGroup: {
    alignItems: 'flex-start',
    flex: 1,
    flexDirection: 'row',
    gap: 10,
  },
  fieldIndex: {
    backgroundColor: '#eef6f5',
    borderColor: '#b8d8d4',
    borderRadius: 6,
    borderWidth: 1,
    color: '#134e4a',
    fontSize: 12,
    fontWeight: '900',
    minWidth: 32,
    paddingHorizontal: 7,
    paddingVertical: 5,
    textAlign: 'center',
  },
  fieldLabelGroup: {
    flex: 1,
    gap: 3,
  },
  fieldLabel: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 19,
  },
  fieldMeta: {
    color: '#475569',
    fontSize: 12,
    lineHeight: 17,
  },
  fieldHelp: {
    color: '#334155',
    fontSize: 13,
    lineHeight: 18,
  },
  typeBadge: {
    backgroundColor: '#f8fafc',
    borderColor: '#cbd5e1',
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  typeBadgeText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '900',
  },
  inputPreview: {
    backgroundColor: '#f8fafc',
    borderColor: '#cbd5e1',
    borderRadius: 7,
    borderWidth: 1,
    color: '#334155',
    fontSize: 14,
    minHeight: 44,
    paddingHorizontal: 11,
  },
  editableInput: {
    backgroundColor: '#ffffff',
    borderColor: '#0f766e',
  },
  invalidInput: {
    borderColor: '#b91c1c',
  },
  checkboxPreview: {
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderColor: '#cbd5e1',
    borderRadius: 7,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 9,
    justifyContent: 'space-between',
    minHeight: 44,
    paddingHorizontal: 11,
    paddingVertical: 9,
  },
  checkboxBox: {
    alignItems: 'center',
    borderColor: '#0f766e',
    borderRadius: 4,
    borderWidth: 2,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  checkedPreview: {
    backgroundColor: '#eef6f5',
  },
  checkedBox: {
    backgroundColor: '#0f766e',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 16,
  },
  checkboxTextGroup: {
    flex: 1,
    gap: 3,
  },
  checkboxOptionText: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  checkboxStateText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  checkedStateText: {
    color: '#0f766e',
  },
  checkboxActionBadge: {
    backgroundColor: '#eef6f5',
    borderColor: '#b8d8d4',
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  checkboxActionText: {
    color: '#134e4a',
    fontSize: 12,
    fontWeight: '900',
  },
  bindingText: {
    color: '#64748b',
    fontSize: 12,
    lineHeight: 17,
  },
  lockedText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
  validationText: {
    color: '#b91c1c',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 17,
  },
});
