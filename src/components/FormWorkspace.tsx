import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  getFormSchema,
  getFormSections,
  getFormTitleTr,
  getInitialSectionId,
  getSectionFields,
  type FormSectionSummary,
} from '../data/formSchemaCatalog';
import type { FormType } from '../domain/fieldPrimitives';
import type { LocalDraft } from '../storage/draftStore';
import { FormFieldControl } from './FormFieldControl';
import { FormSectionNavigator } from './FormSectionNavigator';

interface FormWorkspaceProps {
  readonly draft: LocalDraft;
}

function sectionStatusText(section: FormSectionSummary): string {
  return `${section.fieldCount} alan ve ${section.widgetCount} PDF bileşeni bu bölümde temsil edilir.`;
}

export function FormWorkspace({ draft }: FormWorkspaceProps) {
  const formType = draft.formType as FormType;
  const sections = useMemo(() => getFormSections(formType), [formType]);
  const [activeSectionId, setActiveSectionId] = useState(getInitialSectionId(formType));
  const schema = getFormSchema(formType);

  useEffect(() => {
    setActiveSectionId(getInitialSectionId(formType));
  }, [formType, draft.id]);

  const activeSection = sections.find((section) => section.id === activeSectionId) ?? sections[0];
  const activeFields = activeSection ? getSectionFields(formType, activeSection.id) : [];
  const activeSectionIndex = sections.findIndex((section) => section.id === activeSection?.id);
  const previousSection = activeSectionIndex > 0 ? sections[activeSectionIndex - 1] : null;
  const nextSection = activeSectionIndex >= 0 && activeSectionIndex < sections.length - 1 ? sections[activeSectionIndex + 1] : null;

  return (
    <View style={styles.workspace}>
      <View style={styles.workspaceHeader}>
        <View style={styles.formMark}>
          <Text style={styles.formMarkText}>{formType}</Text>
        </View>
        <View style={styles.workspaceTitleGroup}>
          <Text style={styles.workspaceTitle}>{getFormTitleTr(formType)}</Text>
          <Text style={styles.workspaceDetail}>
            Ortak form gezgini aktif. Alan değerlerinin kalıcı kaydı sonraki alt fazlarda bağlanacak.
          </Text>
        </View>
      </View>

      <View style={styles.summaryGrid}>
        <View style={styles.summaryTile}>
          <Text style={styles.summaryValue}>{schema.totals.fieldCount}</Text>
          <Text style={styles.summaryLabel}>Resmi alan</Text>
        </View>
        <View style={styles.summaryTile}>
          <Text style={styles.summaryValue}>{schema.totals.widgetInstanceCount}</Text>
          <Text style={styles.summaryLabel}>PDF bileşeni</Text>
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

      <View style={styles.fieldList}>
        {activeFields.map((field, index) => (
          <FormFieldControl field={field} index={index} key={field.schemaFieldId} />
        ))}
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
  sectionActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
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
});
