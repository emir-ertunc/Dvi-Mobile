import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import type { CanonicalSchemaField } from '../domain/schemaTypes';
import { fieldPageSummary } from '../data/formSchemaCatalog';

interface FormFieldControlProps {
  readonly field: CanonicalSchemaField;
  readonly index: number;
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
  return 'Değer girişi sonraki alt fazda bağlanacak';
}

export function FormFieldControl({ field, index }: FormFieldControlProps) {
  const controlLabel = controlTypeLabels[field.controlType] ?? 'Alan';

  return (
    <View style={styles.fieldCard}>
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
          <Text style={styles.typeBadgeText}>{controlLabel}</Text>
        </View>
      </View>

      {field.controlType === 'checkbox' ? (
        <Pressable accessibilityRole="checkbox" disabled style={styles.checkboxPreview}>
          <View style={styles.checkboxBox} />
          <Text style={styles.checkboxText}>İşaretlenebilir resmi alan</Text>
        </Pressable>
      ) : (
        <TextInput
          accessibilityLabel={field.uiLabelTr}
          editable={false}
          keyboardType={field.controlType === 'number' ? 'numeric' : field.controlType === 'phone' ? 'phone-pad' : 'default'}
          placeholder={placeholderForField(field)}
          placeholderTextColor="#64748b"
          style={styles.inputPreview}
          value=""
        />
      )}

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
    borderColor: '#0f766e',
    borderRadius: 4,
    borderWidth: 2,
    height: 20,
    width: 20,
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
});
