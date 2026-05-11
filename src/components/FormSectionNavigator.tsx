import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { FormSectionSummary } from '../data/formSchemaCatalog';

interface FormSectionNavigatorProps {
  readonly sections: readonly FormSectionSummary[];
  readonly activeSectionId: string;
  readonly onChange: (sectionId: string) => void;
}

function pageLabel(section: FormSectionSummary): string {
  if (section.pageNumbers.length === 0) return 'Sayfa yok';
  if (section.pageNumbers.length === 1) return `Sayfa ${section.pageNumbers[0]}`;
  return `Sayfa ${section.pageNumbers[0]}-${section.pageNumbers[section.pageNumbers.length - 1]}`;
}

export function FormSectionNavigator({ activeSectionId, onChange, sections }: FormSectionNavigatorProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.navigatorTitle}>Bölüm Gezgini</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.sectionRail}>
          {sections.map((section) => {
            const active = section.id === activeSectionId;
            return (
              <Pressable
                accessibilityRole="button"
                key={section.id}
                onPress={() => onChange(section.id)}
                style={[styles.sectionButton, active && styles.activeSectionButton]}
              >
                <Text style={[styles.sectionTitle, active && styles.activeSectionText]}>{section.title}</Text>
                <Text style={[styles.sectionDetail, active && styles.activeSectionText]}>
                  {section.fieldCount} alan · {section.widgetCount} bileşen
                </Text>
                <Text style={[styles.sectionDetail, active && styles.activeSectionText]}>{pageLabel(section)}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 9,
  },
  navigatorTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '900',
  },
  sectionRail: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 2,
  },
  sectionButton: {
    backgroundColor: '#ffffff',
    borderColor: '#d8dee8',
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 90,
    padding: 11,
    width: 230,
  },
  activeSectionButton: {
    backgroundColor: '#0f766e',
    borderColor: '#0f766e',
  },
  sectionTitle: {
    color: '#111827',
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 18,
  },
  sectionDetail: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
    marginTop: 3,
  },
  activeSectionText: {
    color: '#ffffff',
  },
});
