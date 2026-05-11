import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BUILD_INFO } from './src/config/buildInfo';
import { MetricTile } from './src/components/MetricTile';
import { RouteTabs } from './src/components/RouteTabs';
import { StatusPanel } from './src/components/StatusPanel';
import { DASHBOARD_METRICS, FORM_READINESS, WORKFLOW_STEPS } from './src/data/dashboard';
import { APP_ROUTES, type AppRouteId } from './src/navigation/appRoutes';

const statusColor: Record<string, string> = {
  tamamlandı: '#0f766e',
  sürüyor: '#1d4ed8',
  bekliyor: '#64748b',
};

export default function App() {
  const [activeRoute, setActiveRoute] = useState<AppRouteId>('overview');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.shell}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Türkçe DVI mobil iş akışı</Text>
          <Text style={styles.title}>DVI Mobil</Text>
          <Text style={styles.subtitle}>
            Çevrimdışı çalışacak AM ve PM kayıt süreçleri için kurumsal uygulama kabuğu.
          </Text>
        </View>

        <RouteTabs routes={APP_ROUTES} activeRoute={activeRoute} onChange={setActiveRoute} />

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {activeRoute === 'overview' && <OverviewScreen />}
          {activeRoute === 'forms' && <FormsScreen />}
          {activeRoute === 'workflow' && <WorkflowScreen />}
          {activeRoute === 'system' && <SystemScreen />}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function OverviewScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Operasyon Özeti</Text>
        <Text style={styles.sectionDetail}>Şema kapsamı tamamlandı, uygulama kabuğu aktif.</Text>
      </View>

      <View style={styles.metricGrid}>
        {DASHBOARD_METRICS.map((metric) => (
          <MetricTile key={metric.label} label={metric.label} value={metric.value} detail={metric.detail} />
        ))}
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Hızlı Durum</Text>
        <Text style={styles.bodyText}>
          Bu faz, kayıt listesi ve taslak yönetimine geçmeden önce ana ekran düzenini, ekran geçişlerini
          ve sistem görünürlüğünü hazırlar.
        </Text>
      </View>
    </View>
  );
}

function FormsScreen() {
  const [selectedForm, setSelectedForm] = useState<'AM' | 'PM'>('AM');
  const selected = FORM_READINESS.find((form) => form.code === selectedForm) ?? FORM_READINESS[0];

  return (
    <View style={styles.screen}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Form İşlemleri</Text>
        <Text style={styles.sectionDetail}>AM ve PM kayıt akışları ayrı tutulur.</Text>
      </View>

      <View style={styles.formSelector}>
        {FORM_READINESS.map((form) => {
          const active = form.code === selectedForm;
          return (
            <Pressable
              accessibilityRole="button"
              key={form.code}
              onPress={() => setSelectedForm(form.code)}
              style={[styles.formButton, active && styles.activeFormButton]}
            >
              <Text style={[styles.formButtonCode, active && styles.activeFormButtonText]}>{form.code}</Text>
              <Text style={[styles.formButtonTitle, active && styles.activeFormButtonText]}>{form.title}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.panel}>
        <View style={styles.formSummaryHeader}>
          <View style={styles.formBadge}>
            <Text style={styles.formBadgeText}>{selected.code}</Text>
          </View>
          <View style={styles.formSummaryText}>
            <Text style={styles.panelTitle}>{selected.title}</Text>
            <Text style={styles.mutedText}>{selected.status}</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.statText}>{selected.fieldCount} resmi alan</Text>
          <Text style={styles.statText}>{selected.widgetCount} alan bileşeni</Text>
        </View>
        <Text style={styles.bodyText}>{selected.nextAction}</Text>
      </View>
    </View>
  );
}

function WorkflowScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>İş Akışı</Text>
        <Text style={styles.sectionDetail}>Faz kapıları sıralı ve denetlenebilir tutulur.</Text>
      </View>

      <View style={styles.timeline}>
        {WORKFLOW_STEPS.map((step, index) => (
          <View key={step.title} style={styles.timelineItem}>
            <View style={[styles.timelineDot, { backgroundColor: statusColor[step.status] }]} />
            <View style={styles.timelineContent}>
              <View style={styles.timelineTitleRow}>
                <Text style={styles.timelineTitle}>{step.title}</Text>
                <Text style={[styles.statusPill, { color: statusColor[step.status] }]}>{step.status}</Text>
              </View>
              <Text style={styles.mutedText}>{step.detail}</Text>
            </View>
            {index < WORKFLOW_STEPS.length - 1 && <View style={styles.timelineLine} />}
          </View>
        ))}
      </View>
    </View>
  );
}

function SystemScreen() {
  return (
    <View style={styles.screen}>
      <StatusPanel
        title="Derleme Bilgisi"
        rows={[
          ['Faz', BUILD_INFO.phase],
          ['Sürüm', BUILD_INFO.version],
          ['Derleme', BUILD_INFO.buildId],
          ['Android kodu', String(BUILD_INFO.androidVersionCode)],
        ]}
      />

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Kapsam Kapıları</Text>
        <Text style={styles.bodyText}>
          TypeScript, Türkçe arayüz metni, yeniden baz alma, teknik PDF incelemesi, envanter,
          şema ve kapsam denetimleri APK üretiminden önce çalıştırılır.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  shell: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 14,
    gap: 14,
  },
  header: {
    gap: 7,
  },
  eyebrow: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  title: {
    color: '#0f172a',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 0,
  },
  subtitle: {
    color: '#334155',
    fontSize: 15,
    lineHeight: 22,
  },
  content: {
    paddingBottom: 28,
  },
  screen: {
    gap: 16,
  },
  sectionHeader: {
    gap: 4,
  },
  sectionTitle: {
    color: '#111827',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0,
  },
  sectionDetail: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 20,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  panel: {
    backgroundColor: '#ffffff',
    borderColor: '#d8dee8',
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  panelTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '900',
  },
  bodyText: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 21,
  },
  mutedText: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 20,
  },
  formSelector: {
    gap: 10,
  },
  formButton: {
    backgroundColor: '#ffffff',
    borderColor: '#d8dee8',
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 68,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 3,
  },
  activeFormButton: {
    backgroundColor: '#0f766e',
    borderColor: '#0f766e',
  },
  formButtonCode: {
    color: '#0f766e',
    fontSize: 13,
    fontWeight: '900',
  },
  formButtonTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '800',
  },
  activeFormButtonText: {
    color: '#ffffff',
  },
  formSummaryHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  formBadge: {
    alignItems: 'center',
    backgroundColor: '#134e4a',
    borderRadius: 6,
    height: 46,
    justifyContent: 'center',
    width: 56,
  },
  formBadgeText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
  formSummaryText: {
    flex: 1,
    gap: 3,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statText: {
    backgroundColor: '#eef6f5',
    borderColor: '#b8d8d4',
    borderRadius: 6,
    borderWidth: 1,
    color: '#134e4a',
    fontSize: 13,
    fontWeight: '800',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  timeline: {
    gap: 0,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 76,
    position: 'relative',
  },
  timelineDot: {
    borderRadius: 6,
    height: 12,
    marginTop: 6,
    width: 12,
  },
  timelineLine: {
    backgroundColor: '#cbd5e1',
    bottom: 0,
    left: 5,
    position: 'absolute',
    top: 22,
    width: 2,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 18,
    paddingLeft: 12,
  },
  timelineTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 3,
  },
  timelineTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '900',
  },
  statusPill: {
    backgroundColor: '#ffffff',
    borderColor: '#d8dee8',
    borderRadius: 6,
    borderWidth: 1,
    fontSize: 12,
    fontWeight: '900',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
});
