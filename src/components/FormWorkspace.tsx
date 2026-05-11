import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import {
  getFormSchema,
  getFormSections,
  getFormTitleTr,
  getInitialSectionId,
  getSectionFields,
  isHiddenFormEntryField,
  type FormSectionSummary,
} from '../data/formSchemaCatalog';
import { getFieldUiText } from '../data/fieldUiLabels';
import type { FormType } from '../domain/fieldPrimitives';
import type { CanonicalSchemaField } from '../domain/schemaTypes';
import { validateSchemaValue } from '../domain/validation';
import type { DraftFieldValue, LocalDraft } from '../storage/draftStore';
import { FormFieldControl } from './FormFieldControl';
import { FormSectionNavigator } from './FormSectionNavigator';

interface FormWorkspaceProps {
  readonly draft: LocalDraft;
  readonly onActiveSectionChange?: (sectionTitle: string) => void;
  readonly onFieldValueChange: (fieldId: string, value: DraftFieldValue | null) => void;
}

const EDITABLE_AM_SECTION_IDS = new Set([
  'am.header',
  'am.checklist',
  'am.100.kayit-ve-basvuru',
  'am.200.kayip-kisi',
  'am.300.kisisel-esyalar',
  'am.400.fiziksel-tanim',
  'am.500.tibbi',
  'am.600.odontoloji',
  'am.700.destek',
  'am.800.ekler-imza',
  'am.other',
]);

const EDITABLE_PM_SECTION_IDS = new Set([
  'pm.header',
  'pm.checklist',
  'pm.100.kayit-ve-buluntu',
  'pm.300.esyalar',
  'pm.400.fiziksel-tanim',
  'pm.500.tibbi-patoloji',
  'pm.600.odontoloji',
  'pm.700.destek',
  'pm.800.dna-ekler-imza',
  'pm.other',
]);

type FieldFilterId = 'all' | 'empty' | 'filled' | 'issues';

const FIELD_FILTERS: readonly { id: FieldFilterId; label: string }[] = [
  { id: 'all', label: 'Tümü' },
  { id: 'empty', label: 'Boş' },
  { id: 'filled', label: 'Dolu' },
  { id: 'issues', label: 'Uyarı' },
];

function sectionStatusText(section: FormSectionSummary): string {
  return `${section.fieldCount} alan ve ${section.widgetCount} PDF bileşeni bu bölümde temsil edilir.`;
}

function isEditableInPhase4E(formType: FormType, sectionId: string): boolean {
  if (formType === 'AM') return EDITABLE_AM_SECTION_IDS.has(sectionId);
  return EDITABLE_PM_SECTION_IDS.has(sectionId);
}

function workspaceDetailText(formType: FormType): string {
  if (formType === 'AM') {
    return 'AM genel, klinik, destek, ek ve imza blokları çevrimdışı taslak kaydına bağlıdır.';
  }
  return 'PM buluntu, patoloji, odontoloji, destek, DNA, ek ve imza blokları çevrimdışı taslak kaydına bağlıdır.';
}

function sectionStateText(formType: FormType, editable: boolean): string {
  if (editable) return `Bu ${formType} bölümünde alan girişi aktiftir.`;
  return 'Bu bölüm sonraki alt fazlarda düzenlemeye açılacak.';
}

function hasDraftValue(value: DraftFieldValue | undefined): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'boolean') return value;
  return true;
}

function fieldHasIssue(field: CanonicalSchemaField, value: DraftFieldValue | undefined): boolean {
  const validation = validateSchemaValue(value ?? null, {
    readinessRule: field.readinessRule,
    validationRules: field.validationRules,
    valueType: field.valueType,
  });
  return !validation.valid;
}

export function FormWorkspace({ draft, onActiveSectionChange, onFieldValueChange }: FormWorkspaceProps) {
  const formType = draft.formType as FormType;
  const sections = useMemo(() => getFormSections(formType), [formType]);
  const [activeSectionId, setActiveSectionId] = useState(getInitialSectionId(formType));
  const [fieldFilter, setFieldFilter] = useState<FieldFilterId>('all');
  const [fieldSearch, setFieldSearch] = useState('');
  const schema = getFormSchema(formType);
  const visibleFieldCount = schema.fields.filter((field) => !isHiddenFormEntryField(field)).length;
  const visibleWidgetCount = schema.fields
    .filter((field) => !isHiddenFormEntryField(field))
    .reduce((sum, field) => sum + field.widgetInstances.length, 0);

  useEffect(() => {
    setActiveSectionId(getInitialSectionId(formType));
    setFieldFilter('all');
    setFieldSearch('');
  }, [formType, draft.id]);

  useEffect(() => {
    setFieldFilter('all');
    setFieldSearch('');
  }, [activeSectionId]);

  const activeSection = sections.find((section) => section.id === activeSectionId) ?? sections[0];
  const activeFields = activeSection ? getSectionFields(formType, activeSection.id) : [];
  const editableSection = activeSection ? isEditableInPhase4E(formType, activeSection.id) : false;
  const activeSectionIndex = sections.findIndex((section) => section.id === activeSection?.id);
  const previousSection = activeSectionIndex > 0 ? sections[activeSectionIndex - 1] : null;
  const nextSection = activeSectionIndex >= 0 && activeSectionIndex < sections.length - 1 ? sections[activeSectionIndex + 1] : null;
  const activeFieldRows = activeFields.map((field, index) => ({ field, index, uiText: getFieldUiText(field, index) }));
  const sectionFilledCount = activeFieldRows.filter(({ field }) => hasDraftValue(draft.fieldValues[field.schemaFieldId])).length;
  const sectionIssueCount = activeFieldRows.filter(({ field }) =>
    fieldHasIssue(field, draft.fieldValues[field.schemaFieldId]),
  ).length;
  const normalizedSearch = fieldSearch.trim().toLocaleLowerCase('tr-TR');
  const filteredFieldRows = activeFieldRows.filter(({ field, uiText }) => {
    const value = draft.fieldValues[field.schemaFieldId];
    const filled = hasDraftValue(value);
    const issue = fieldHasIssue(field, value);
    const searchableText = `${uiText.labelTr} ${uiText.helpTextTr} ${field.controlType}`.toLocaleLowerCase('tr-TR');
    const matchesSearch = normalizedSearch.length === 0 || searchableText.includes(normalizedSearch);
    if (!matchesSearch) return false;
    if (fieldFilter === 'empty') return !filled;
    if (fieldFilter === 'filled') return filled;
    if (fieldFilter === 'issues') return issue;
    return true;
  });

  useEffect(() => {
    if (activeSection) onActiveSectionChange?.(activeSection.title);
  }, [activeSection, onActiveSectionChange]);

  return (
    <View style={styles.workspace}>
      <View style={styles.workspaceHeader}>
        <View style={styles.formMark}>
          <Text style={styles.formMarkText}>{formType}</Text>
        </View>
        <View style={styles.workspaceTitleGroup}>
          <Text style={styles.workspaceTitle}>{getFormTitleTr(formType)}</Text>
          <Text style={styles.workspaceDetail}>{workspaceDetailText(formType)}</Text>
        </View>
      </View>

      <View style={styles.summaryGrid}>
        <View style={styles.summaryTile}>
          <Text style={styles.summaryValue}>{visibleFieldCount}</Text>
          <Text style={styles.summaryLabel}>Giriş alanı</Text>
        </View>
        <View style={styles.summaryTile}>
          <Text style={styles.summaryValue}>{visibleWidgetCount}</Text>
          <Text style={styles.summaryLabel}>Doldurulacak bileşen</Text>
        </View>
        <View style={styles.summaryTile}>
          <Text style={styles.summaryValue}>{sections.length}</Text>
          <Text style={styles.summaryLabel}>Bölüm</Text>
        </View>
      </View>

      <FormSectionNavigator activeSectionId={activeSection?.id ?? ''} onChange={setActiveSectionId} sections={sections} />

      {activeSection && (
        <View style={styles.sectionPanel}>
          <Text style={styles.sectionTitle}>{activeSection.title}</Text>
          <Text style={styles.sectionDetail}>{sectionStatusText(activeSection)}</Text>
          <Text style={[styles.sectionStateText, editableSection ? styles.editableStateText : styles.lockedStateText]}>
            {sectionStateText(formType, editableSection)}
          </Text>
          <View style={styles.progressPanel}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Bölüm ilerlemesi</Text>
              <Text style={styles.progressValue}>
                {sectionFilledCount} / {activeFieldRows.length}
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${activeFieldRows.length > 0 ? Math.round((sectionFilledCount / activeFieldRows.length) * 100) : 0}%` },
                ]}
              />
            </View>
            <Text style={styles.progressDetail}>
              {sectionIssueCount > 0 ? `${sectionIssueCount} alan uyarı veriyor.` : 'Bu bölümde geçerli olmayan değer görünmüyor.'}
            </Text>
          </View>
          <View style={styles.sectionActions}>
            <Pressable
              accessibilityRole="button"
              disabled={!previousSection}
              onPress={() => previousSection && setActiveSectionId(previousSection.id)}
              style={[styles.secondaryButton, !previousSection && styles.disabledButton]}
            >
              <Text style={[styles.secondaryButtonText, !previousSection && styles.disabledButtonText]}>Önceki Bölüm</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={!nextSection}
              onPress={() => nextSection && setActiveSectionId(nextSection.id)}
              style={[styles.secondaryButton, !nextSection && styles.disabledButton]}
            >
              <Text style={[styles.secondaryButtonText, !nextSection && styles.disabledButtonText]}>Sonraki Bölüm</Text>
            </Pressable>
          </View>
        </View>
      )}

      <View style={styles.fieldToolsPanel}>
        <Text style={styles.toolsTitle}>Alan bul ve filtrele</Text>
        <TextInput
          accessibilityLabel="Alan arama"
          onChangeText={setFieldSearch}
          placeholder="Alan adı veya yardım metni ara"
          placeholderTextColor="#64748b"
          style={styles.searchInput}
          value={fieldSearch}
        />
        <View style={styles.filterRow}>
          {FIELD_FILTERS.map((filter) => {
            const active = filter.id === fieldFilter;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                key={filter.id}
                onPress={() => setFieldFilter(filter.id)}
                style={[styles.filterButton, active && styles.activeFilterButton]}
              >
                <Text style={[styles.filterButtonText, active && styles.activeFilterButtonText]}>{filter.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.filterResultText}>
          {filteredFieldRows.length} alan gösteriliyor. Boş: {activeFieldRows.length - sectionFilledCount}, dolu: {sectionFilledCount}.
        </Text>
      </View>

      <View style={styles.fieldList}>
        {filteredFieldRows.map(({ field, index }) => (
          <FormFieldControl
            editable={editableSection}
            field={field}
            index={index}
            key={field.schemaFieldId}
            onValueChange={(fieldId, value) => onFieldValueChange(fieldId, value)}
            value={draft.fieldValues[field.schemaFieldId]}
          />
        ))}
        {filteredFieldRows.length === 0 && (
          <View style={styles.emptyFilterPanel}>
            <Text style={styles.emptyFilterTitle}>Eşleşen alan yok</Text>
            <Text style={styles.emptyFilterText}>Arama metnini veya filtre seçimini değiştirin.</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  workspace: {
    gap: 14,
  },
  workspaceHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  formMark: {
    alignItems: 'center',
    backgroundColor: '#134e4a',
    borderRadius: 8,
    height: 52,
    justifyContent: 'center',
    width: 62,
  },
  formMarkText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
  workspaceTitleGroup: {
    flex: 1,
    gap: 4,
  },
  workspaceTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '900',
  },
  workspaceDetail: {
    color: '#475569',
    fontSize: 13,
    lineHeight: 19,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  summaryTile: {
    backgroundColor: '#eef6f5',
    borderColor: '#b8d8d4',
    borderRadius: 8,
    borderWidth: 1,
    flexGrow: 1,
    minWidth: 96,
    padding: 11,
  },
  summaryValue: {
    color: '#134e4a',
    fontSize: 19,
    fontWeight: '900',
  },
  summaryLabel: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  sectionPanel: {
    backgroundColor: '#f8fafc',
    borderColor: '#d8dee8',
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 13,
  },
  sectionTitle: {
    color: '#111827',
    fontSize: 17,
    fontWeight: '900',
    lineHeight: 22,
  },
  sectionDetail: {
    color: '#475569',
    fontSize: 13,
    lineHeight: 19,
  },
  sectionStateText: {
    borderRadius: 6,
    borderWidth: 1,
    fontSize: 13,
    fontWeight: '900',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  editableStateText: {
    backgroundColor: '#eef6f5',
    borderColor: '#b8d8d4',
    color: '#134e4a',
  },
  lockedStateText: {
    backgroundColor: '#f8fafc',
    borderColor: '#cbd5e1',
    color: '#475569',
  },
  sectionActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  progressPanel: {
    backgroundColor: '#ffffff',
    borderColor: '#d8dee8',
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 11,
  },
  progressHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  progressTitle: {
    color: '#111827',
    fontSize: 13,
    fontWeight: '900',
  },
  progressValue: {
    color: '#134e4a',
    fontSize: 13,
    fontWeight: '900',
  },
  progressTrack: {
    backgroundColor: '#e2e8f0',
    borderRadius: 999,
    height: 8,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: '#0f766e',
    height: 8,
  },
  progressDetail: {
    color: '#475569',
    fontSize: 12,
    lineHeight: 17,
  },
  fieldToolsPanel: {
    backgroundColor: '#ffffff',
    borderColor: '#d8dee8',
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 13,
  },
  toolsTitle: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '900',
  },
  searchInput: {
    backgroundColor: '#f8fafc',
    borderColor: '#cbd5e1',
    borderRadius: 8,
    borderWidth: 1,
    color: '#111827',
    fontSize: 14,
    minHeight: 44,
    paddingHorizontal: 11,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    borderColor: '#cbd5e1',
    borderRadius: 7,
    borderWidth: 1,
    minHeight: 38,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  activeFilterButton: {
    backgroundColor: '#0f766e',
    borderColor: '#0f766e',
  },
  filterButtonText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '900',
  },
  activeFilterButtonText: {
    color: '#ffffff',
  },
  filterResultText: {
    color: '#475569',
    fontSize: 12,
    lineHeight: 17,
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: '#0f766e',
    borderRadius: 7,
    borderWidth: 1,
    flexGrow: 1,
    minHeight: 42,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  secondaryButtonText: {
    color: '#0f766e',
    fontSize: 13,
    fontWeight: '900',
  },
  disabledButton: {
    borderColor: '#cbd5e1',
  },
  disabledButtonText: {
    color: '#94a3b8',
  },
  fieldList: {
    gap: 10,
  },
  emptyFilterPanel: {
    backgroundColor: '#f8fafc',
    borderColor: '#d8dee8',
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    padding: 14,
  },
  emptyFilterTitle: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '900',
  },
  emptyFilterText: {
    color: '#475569',
    fontSize: 13,
    lineHeight: 18,
  },
});
