import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import type { CanonicalSchemaField } from '../domain/schemaTypes';
import { fieldPageSummary } from '../data/formSchemaCatalog';
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
  return 'Değer girin';
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

export function FormFieldControl({ editable, field, index, onValueChange, value }: FormFieldControlProps) {
  const controlLabel = controlTypeLabels[field.controlType] ?? 'Alan';
  const checked = value === true;
  const textValue = typeof value === 'string' || typeof value === 'number' ? String(value) : '';

  return (
    <View style={[styles.fieldCard, editable && styles.editableFieldCard]}>
      <View style={styles.fieldHeader}>
        <View style={styles.fieldTitleGroup}>
          <Text style={styles.fieldIndex}>{index + 1}</Text>
          <View style={styles.fieldLabelGroup}>
            <Text style={styles.fieldLabel}>{field.uiLabelTr}</Text>
            <Text style={styles.fieldMeta}>
              {field.schemaFieldId} · Sayfa {fieldPageSummary(field)}
            </Text>
          </View>
        </View>
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>{editable ? controlLabel : 'Sonraki faz'}</Text>
        </View>
      </View>

      {field.controlType === 'checkbox' ? (
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked, disabled: !editable }}
          disabled={!editable}
          onPress={() => onValueChange(field.schemaFieldId, checked ? null : true)}
          style={[styles.checkboxPreview, editable && styles.editableInput, checked && styles.checkedPreview]}
        >
          <View style={[styles.checkboxBox, checked && styles.checkedBox]}>
            {checked && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxText}>{checked ? 'İşaretli' : 'İşaretli değil'}</Text>
        </Pressable>
      ) : (
        <TextInput
          accessibilityLabel={field.uiLabelTr}
          editable={editable}
          keyboardType={keyboardTypeForField(field)}
          maxLength={maxLengthForField(field)}
          onChangeText={(nextValue) => onValueChange(field.schemaFieldId, nextValue)}
          placeholder={placeholderForField(field)}
          placeholderTextColor="#64748b"
          style={[styles.inputPreview, editable && styles.editableInput]}
          value={textValue}
        />
      )}

      {!editable && <Text style={styles.lockedText}>Bu bölüm sonraki AM alt fazında düzenlemeye açılacak.</Text>}
      <Text style={styles.bindingText}>
        PDF bağlantısı: {field.exportBinding.widgetInstanceCount} bileşen · {field.pdfFieldName}
      </Text>
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
  checkboxPreview: {
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderColor: '#cbd5e1',
    borderRadius: 7,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 9,
    minHeight: 44,
    paddingHorizontal: 11,
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
  checkboxText: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '700',
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
});
