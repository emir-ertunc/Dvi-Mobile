import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { BUILD_INFO } from './src/config/buildInfo';
import { StatusPanel } from './src/components/StatusPanel';

const kaynakDurumlari = [
  {
    title: 'Ölüm Öncesi Formu',
    code: 'AM',
    detail:
      'Yeni resmi kaynak, 2018 INTERPOL fillable formudur. Alan envanteri sonraki fazda AcroForm alanlarından çıkarılacaktır.',
  },
  {
    title: 'Ölüm Sonrası Formu',
    code: 'PM',
    detail:
      'Yeni resmi kaynak, 2018 INTERPOL fillable formudur. PM yapısı 19 sayfalık yeni şablona göre ele alınacaktır.',
  },
];

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Türkçe DVI mobil iş akışı</Text>
          <Text style={styles.title}>DVI Mobil</Text>
          <Text style={styles.subtitle}>
            Uygulama dili Türkçe kalır. Resmi PDF aktarımı, İngilizce fillable INTERPOL DVI
            formlarındaki alan adları üzerinden ilerleyecektir.
          </Text>
        </View>

        <StatusPanel
          title="Derleme durumu"
          rows={[
            ['Faz', BUILD_INFO.phase],
            ['Sürüm', BUILD_INFO.version],
            ['Derleme', BUILD_INFO.buildId],
            ['Android kodu', String(BUILD_INFO.androidVersionCode)],
          ]}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kaynak form kararı</Text>
          {kaynakDurumlari.map((form) => (
            <View key={form.code} style={styles.formRow}>
              <View style={styles.formBadge}>
                <Text style={styles.formBadgeText}>{form.code}</Text>
              </View>
              <View style={styles.formText}>
                <Text style={styles.formTitle}>{form.title}</Text>
                <Text style={styles.formDetail}>{form.detail}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>Faz 0R yeniden baz alma</Text>
          <Text style={styles.noticeBody}>
            Bu derleme proje planını yeni fillable PDF stratejisine göre günceller ve sonraki
            envanter fazları için temiz bir başlangıç sağlar.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f6f7f9',
  },
  container: {
    padding: 20,
    gap: 18,
  },
  header: {
    paddingTop: 12,
    gap: 8,
  },
  eyebrow: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  title: {
    color: '#0f172a',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 0,
  },
  subtitle: {
    color: '#334155',
    fontSize: 16,
    lineHeight: 23,
  },
  section: {
    backgroundColor: '#ffffff',
    borderColor: '#d8dee8',
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  sectionTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '800',
  },
  formRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  formBadge: {
    alignItems: 'center',
    backgroundColor: '#0f766e',
    borderRadius: 6,
    height: 42,
    justifyContent: 'center',
    width: 52,
  },
  formBadgeText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  formText: {
    flex: 1,
    gap: 3,
  },
  formTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
  },
  formDetail: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 20,
  },
  notice: {
    backgroundColor: '#eef6f5',
    borderColor: '#b8d8d4',
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  noticeTitle: {
    color: '#134e4a',
    fontSize: 17,
    fontWeight: '800',
  },
  noticeBody: {
    color: '#164e63',
    fontSize: 14,
    lineHeight: 21,
  },
});
