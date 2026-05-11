import { useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { BUILD_INFO } from './src/config/buildInfo';
import { MetricTile } from './src/components/MetricTile';
import { RouteTabs } from './src/components/RouteTabs';
import { StatusPanel } from './src/components/StatusPanel';
import { DASHBOARD_METRICS, FORM_READINESS, WORKFLOW_STEPS } from './src/data/dashboard';
import { useLocalDrafts, type LocalDraftState } from './src/hooks/useLocalDrafts';
import { APP_ROUTES, type AppRouteId } from './src/navigation/appRoutes';
import { formatDraftDate, type LocalDraft } from './src/storage/draftStore';

const statusColor: Record<string, string> = {
  tamamlandı: '#0f766e',
  sürüyor: '#1d4ed8',
  bekliyor: '#64748b',
};

export default function App() {
  const [activeRoute, setActiveRoute] = useState<AppRouteId>('overview');
  const draftState = useLocalDrafts();

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
          {activeRoute === 'overview' && <OverviewScreen draftState={draftState} />}
          {activeRoute === 'forms' && <FormsScreen draftState={draftState} />}
          {activeRoute === 'workflow' && <WorkflowScreen />}
          {activeRoute === 'system' && <SystemScreen draftState={draftState} />}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function OverviewScreen({ draftState }: { readonly draftState: LocalDraftState }) {
  const activeDraft = draftState.drafts.find((draft) => draft.id === draftState.activeDraftId);

  return (
    <View style={styles.screen}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Operasyon Özeti</Text>
        <Text style={styles.sectionDetail}>Şema kapsamı tamamlandı, uygulama kabuğu aktif.</Text>
      </View>

      <View style={styles.metricGrid}>
        <MetricTile
          label="Yerel taslak"
          value={String(draftState.draftCount)}
          detail="Cihazda kalıcı olarak saklanan AM/PM taslakları."
        />
        {DASHBOARD_METRICS.map((metric) => (
          <MetricTile key={metric.label} label={metric.label} value={metric.value} detail={metric.detail} />
        ))}
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Hızlı Durum</Text>
        <Text style={styles.bodyText}>
          Bu faz, taslak oluşturma, devam etme, başlık düzenleme, kopyalama ve onaylı silme akışını
          cihaz üzerinde çalışır hale getirir.
        </Text>
        {activeDraft && <Text style={styles.mutedText}>Aktif taslak: {activeDraft.title}</Text>}
      </View>
    </View>
  );
}

function FormsScreen({ draftState }: { readonly draftState: LocalDraftState }) {
  const [selectedForm, setSelectedForm] = useState<'AM' | 'PM'>('AM');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const selected = FORM_READINESS.find((form) => form.code === selectedForm) ?? FORM_READINESS[0];
  const selectedDrafts = draftState.drafts.filter((draft) => draft.formType === selectedForm);
  const activeDraft = useMemo(
    () => draftState.drafts.find((draft) => draft.id === draftState.activeDraftId) ?? null,
    [draftState.activeDraftId, draftState.drafts],
  );

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
        <View style={styles.actionRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() => void draftState.createDraft('AM')}
            style={[styles.primaryAction, selectedForm === 'AM' && styles.activeAction]}
          >
            <Text style={styles.primaryActionText}>Yeni AM taslağı</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => void draftState.createDraft('PM')}
            style={[styles.primaryAction, selectedForm === 'PM' && styles.activeAction]}
          >
            <Text style={styles.primaryActionText}>Yeni PM taslağı</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Kalıcı taslak listesi</Text>
        {draftState.loading && <Text style={styles.mutedText}>Taslaklar yükleniyor.</Text>}
        {draftState.errorMessage && <Text style={styles.errorText}>{draftState.errorMessage}</Text>}
        {!draftState.loading && selectedDrafts.length === 0 && (
          <Text style={styles.mutedText}>Bu form türü için yerel taslak bulunmuyor.</Text>
        )}
        {selectedDrafts.map((draft) => (
          <DraftRow
            active={draft.id === draftState.activeDraftId}
            draft={draft}
            key={draft.id}
            onDeleteRequest={() => setPendingDeleteId(draft.id)}
            onDuplicate={() => void draftState.duplicateDraft(draft.id)}
            onResume={() => void draftState.resumeDraft(draft.id)}
            onSelect={() => draftState.selectDraft(draft.id)}
          />
        ))}
      </View>

      {activeDraft && (
        <DraftDetailPanel
          draft={activeDraft}
          key={activeDraft.id}
          onClose={() => draftState.selectDraft(null)}
          onTitleChange={(title) => void draftState.updateDraftTitle(activeDraft.id, title)}
        />
      )}

      {pendingDeleteId && (
        <DeleteConfirmation
          onCancel={() => setPendingDeleteId(null)}
          onConfirm={() => {
            void draftState.deleteDraft(pendingDeleteId);
            setPendingDeleteId(null);
          }}
        />
      )}
    </View>
  );
}

function DraftRow({
  active,
  draft,
  onDeleteRequest,
  onDuplicate,
  onResume,
  onSelect,
}: {
  readonly active: boolean;
  readonly draft: LocalDraft;
  readonly onDeleteRequest: () => void;
  readonly onDuplicate: () => void;
  readonly onResume: () => void;
  readonly onSelect: () => void;
}) {
  return (
    <View style={[styles.draftRow, active && styles.activeDraftRow]}>
      <View style={styles.draftMain}>
        <Text style={styles.draftTitle}>{draft.title}</Text>
        <Text style={styles.mutedText}>Son kayıt: {formatDraftDate(draft.updatedAt)}</Text>
        <Text style={styles.mutedText}>
          Son açılış: {draft.lastOpenedAt ? formatDraftDate(draft.lastOpenedAt) : 'Henüz açılmadı'}
        </Text>
        <Text style={styles.mutedText}>
          {draft.savedFieldCount} / {draft.schemaFieldCount} alan kaydedildi · Sürüm {draft.revision}
        </Text>
      </View>
      <View style={styles.draftActions}>
        <Text style={styles.progressText}>%{draft.completionPercent}</Text>
        <Pressable accessibilityRole="button" onPress={onSelect} style={styles.smallButton}>
          <Text style={styles.smallButtonText}>Seç</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onResume} style={styles.smallButton}>
          <Text style={styles.smallButtonText}>Devam</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onDuplicate} style={styles.smallButton}>
          <Text style={styles.smallButtonText}>Kopyala</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onDeleteRequest} style={styles.deleteButton}>
          <Text style={styles.deleteButtonText}>Sil</Text>
        </Pressable>
      </View>
    </View>
  );
}

function DraftDetailPanel({
  draft,
  onClose,
  onTitleChange,
}: {
  readonly draft: LocalDraft;
  readonly onClose: () => void;
  readonly onTitleChange: (title: string) => void;
}) {
  const [title, setTitle] = useState(draft.title);

  return (
    <View style={styles.panel}>
      <View style={styles.detailHeader}>
        <View>
          <Text style={styles.panelTitle}>Taslak Detayı</Text>
          <Text style={styles.mutedText}>{draft.formType} kayıt yaşam döngüsü</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>Kapat</Text>
        </Pressable>
      </View>

      <TextInput
        accessibilityLabel="Taslak başlığı"
        onChangeText={setTitle}
        onEndEditing={() => onTitleChange(title)}
        onSubmitEditing={() => onTitleChange(title)}
        style={styles.titleInput}
        value={title}
      />

      <View style={styles.statsRow}>
        <Text style={styles.statText}>Oluşturma: {formatDraftDate(draft.createdAt)}</Text>
        <Text style={styles.statText}>Güncelleme: {formatDraftDate(draft.updatedAt)}</Text>
      </View>
      <Text style={styles.bodyText}>
        Bu panel, tam alan editörü bağlanmadan önce taslağın seçilmesini, geri dönülmesini ve üst veri
        düzenlemesini doğrular.
      </Text>
    </View>
  );
}

function DeleteConfirmation({
  onCancel,
  onConfirm,
}: {
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
}) {
  return (
    <View style={styles.warningPanel}>
      <Text style={styles.warningTitle}>Silme onayı</Text>
      <Text style={styles.bodyText}>Bu taslak cihazdan kaldırılacak. İşlem geri alınamaz.</Text>
      <View style={styles.actionRow}>
        <Pressable accessibilityRole="button" onPress={onCancel} style={styles.secondaryAction}>
          <Text style={styles.secondaryActionText}>Vazgeç</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onConfirm} style={styles.dangerAction}>
          <Text style={styles.primaryActionText}>Kalıcı Sil</Text>
        </Pressable>
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

function SystemScreen({ draftState }: { readonly draftState: LocalDraftState }) {
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

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Yerel Saklama</Text>
        <Text style={styles.bodyText}>
          AM taslak: {draftState.amDraftCount} · PM taslak: {draftState.pmDraftCount}
        </Text>
        <Text style={styles.mutedText}>
          Taslak üst veri kayıtları cihaz depolamasında tutulur ve uygulama yeniden açıldığında okunur.
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
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  primaryAction: {
    alignItems: 'center',
    backgroundColor: '#134e4a',
    borderRadius: 7,
    flexGrow: 1,
    minHeight: 46,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  activeAction: {
    backgroundColor: '#0f766e',
  },
  primaryActionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
  draftRow: {
    borderColor: '#e2e8f0',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 12,
  },
  activeDraftRow: {
    backgroundColor: '#eef6f5',
    borderColor: '#0f766e',
  },
  draftMain: {
    flex: 1,
    gap: 3,
  },
  draftTitle: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '900',
  },
  draftActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minWidth: 56,
  },
  progressText: {
    color: '#0f766e',
    fontSize: 14,
    fontWeight: '900',
  },
  deleteButton: {
    borderColor: '#b91c1c',
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  deleteButtonText: {
    color: '#b91c1c',
    fontSize: 13,
    fontWeight: '900',
  },
  smallButton: {
    borderColor: '#0f766e',
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  smallButtonText: {
    color: '#0f766e',
    fontSize: 13,
    fontWeight: '900',
  },
  detailHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  closeButton: {
    borderColor: '#64748b',
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  closeButtonText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '900',
  },
  titleInput: {
    backgroundColor: '#ffffff',
    borderColor: '#cbd5e1',
    borderRadius: 8,
    borderWidth: 1,
    color: '#111827',
    fontSize: 16,
    fontWeight: '800',
    minHeight: 48,
    paddingHorizontal: 12,
  },
  warningPanel: {
    backgroundColor: '#fff7ed',
    borderColor: '#fdba74',
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 16,
  },
  warningTitle: {
    color: '#9a3412',
    fontSize: 18,
    fontWeight: '900',
  },
  secondaryAction: {
    alignItems: 'center',
    borderColor: '#64748b',
    borderRadius: 7,
    borderWidth: 1,
    flexGrow: 1,
    minHeight: 46,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  secondaryActionText: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '900',
  },
  dangerAction: {
    alignItems: 'center',
    backgroundColor: '#b91c1c',
    borderRadius: 7,
    flexGrow: 1,
    minHeight: 46,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
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
