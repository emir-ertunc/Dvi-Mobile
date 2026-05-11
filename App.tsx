import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { BUILD_INFO } from './src/config/buildInfo';
import { DIAGNOSTICS_INFO } from './src/config/diagnostics';
import { MetricTile } from './src/components/MetricTile';
import { RouteTabs } from './src/components/RouteTabs';
import { StatusPanel } from './src/components/StatusPanel';
import { FormWorkspace } from './src/components/FormWorkspace';
import { DASHBOARD_METRICS, FORM_READINESS, WORKFLOW_STEPS } from './src/data/dashboard';
import { useLocalDrafts, type LocalDraftState } from './src/hooks/useLocalDrafts';
import { APP_ROUTES, type AppRouteId } from './src/navigation/appRoutes';
import { formatDraftDate, type LocalDraft } from './src/storage/draftStore';

type DraftListFilter = 'all' | 'AM' | 'PM';

const statusColor: Record<string, string> = {
  tamamlandı: '#0f766e',
  sürüyor: '#1d4ed8',
  bekliyor: '#64748b',
};

const DRAFT_LIST_FILTERS: readonly { id: DraftListFilter; label: string }[] = [
  { id: 'all', label: 'Tümü' },
  { id: 'AM', label: 'AM' },
  { id: 'PM', label: 'PM' },
];

export default function App() {
  const [activeRoute, setActiveRoute] = useState<AppRouteId>('saved');
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
          {activeRoute === 'saved' && <SavedScreen draftState={draftState} onNavigate={setActiveRoute} />}
          {activeRoute === 'forms' && <FormsScreen draftState={draftState} onNavigate={setActiveRoute} />}
          {activeRoute === 'form' && <ActiveFormScreen draftState={draftState} onNavigate={setActiveRoute} />}
          {activeRoute === 'status' && <StatusScreen draftState={draftState} />}
          {activeRoute === 'system' && <SystemScreen draftState={draftState} />}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function SavedScreen({
  draftState,
  onNavigate,
}: {
  readonly draftState: LocalDraftState;
  readonly onNavigate: (route: AppRouteId) => void;
}) {
  const [draftFilter, setDraftFilter] = useState<DraftListFilter>('all');
  const [draftSearch, setDraftSearch] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const normalizedSearch = draftSearch.trim().toLocaleLowerCase('tr-TR');
  const filteredDrafts = draftState.drafts.filter((draft) => {
    const matchesType = draftFilter === 'all' || draft.formType === draftFilter;
    const searchableText = [
      draft.title,
      draft.formType,
      formatDraftDate(draft.updatedAt),
      draft.lastOpenedAt ? formatDraftDate(draft.lastOpenedAt) : '',
    ]
      .join(' ')
      .toLocaleLowerCase('tr-TR');
    const matchesSearch = normalizedSearch.length === 0 || searchableText.includes(normalizedSearch);
    return matchesType && matchesSearch;
  });

  return (
    <View style={styles.screen}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Kayıtlı Taslaklar</Text>
        <Text style={styles.sectionDetail}>Cihazda saklanan AM ve PM taslaklarını bulun, açın, kopyalayın veya silin.</Text>
      </View>

      <View style={styles.metricGrid}>
        <MetricTile
          label="Toplam taslak"
          value={String(draftState.draftCount)}
          detail="Cihazda kalıcı olarak saklanan kayıtlar."
        />
        <MetricTile label="AM taslak" value={String(draftState.amDraftCount)} detail="Ölüm öncesi kayıtları." />
        <MetricTile label="PM taslak" value={String(draftState.pmDraftCount)} detail="Ölüm sonrası kayıtları." />
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Taslak Listesi</Text>
        <TextInput
          accessibilityLabel="Taslak arama"
          onChangeText={setDraftSearch}
          placeholder="Başlık, tür veya tarih ara"
          placeholderTextColor="#64748b"
          style={styles.searchInput}
          value={draftSearch}
        />
        <View style={styles.filterRow}>
          {DRAFT_LIST_FILTERS.map((filter) => {
            const active = filter.id === draftFilter;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                key={filter.id}
                onPress={() => setDraftFilter(filter.id)}
                style={[styles.filterButton, active && styles.activeFilterButton]}
              >
                <Text style={[styles.filterButtonText, active && styles.activeFilterButtonText]}>{filter.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.filterResultText}>
          {filteredDrafts.length} taslak gösteriliyor. AM: {draftState.amDraftCount}, PM: {draftState.pmDraftCount}.
        </Text>
        {draftState.loading && <Text style={styles.mutedText}>Taslaklar yükleniyor.</Text>}
        {draftState.errorMessage && <Text style={styles.errorText}>{draftState.errorMessage}</Text>}
        {!draftState.loading && draftState.drafts.length === 0 && (
          <View style={styles.emptyStatePanel}>
            <Text style={styles.emptyStateTitle}>Kayıtlı taslak yok</Text>
            <Text style={styles.mutedText}>Yeni AM veya PM kaydı başlatarak ilk yerel taslağı oluşturun.</Text>
            <Pressable accessibilityRole="button" onPress={() => onNavigate('forms')} style={styles.primaryAction}>
              <Text style={styles.primaryActionText}>Yeni kayıt başlat</Text>
            </Pressable>
          </View>
        )}
        {!draftState.loading && draftState.drafts.length > 0 && filteredDrafts.length === 0 && (
          <View style={styles.emptyStatePanel}>
            <Text style={styles.emptyStateTitle}>Eşleşen taslak yok</Text>
            <Text style={styles.mutedText}>Arama metnini veya AM/PM filtresini değiştirin.</Text>
          </View>
        )}
        {filteredDrafts.map((draft) => (
          <DraftRow
            active={draft.id === draftState.activeDraftId}
            draft={draft}
            key={draft.id}
            onDeleteRequest={() => setPendingDeleteId(draft.id)}
            onDuplicate={() => void draftState.duplicateDraft(draft.id)}
            onResume={() => {
              void draftState.resumeDraft(draft.id);
              onNavigate('form');
            }}
          />
        ))}
        {draftState.drafts.length > 0 && (
          <View style={styles.actionRow}>
            <Pressable accessibilityRole="button" onPress={() => onNavigate('forms')} style={styles.secondaryAction}>
              <Text style={styles.secondaryActionText}>Yeni kayıt başlat</Text>
            </Pressable>
          </View>
        )}
      </View>

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

function ActiveFormScreen({
  draftState,
  onNavigate,
}: {
  readonly draftState: LocalDraftState;
  readonly onNavigate: (route: AppRouteId) => void;
}) {
  const activeDraft = draftState.drafts.find((draft) => draft.id === draftState.activeDraftId);

  if (!activeDraft) {
    return (
      <View style={styles.screen}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Aktif Form</Text>
          <Text style={styles.sectionDetail}>Düzenlemek için bir taslak seçin veya yeni kayıt başlatın.</Text>
        </View>
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Aktif taslak yok</Text>
          <Text style={styles.bodyText}>Form çalışma alanı seçili AM veya PM taslağı üzerinden açılır.</Text>
          <View style={styles.actionRow}>
            <Pressable accessibilityRole="button" onPress={() => onNavigate('saved')} style={styles.secondaryAction}>
              <Text style={styles.secondaryActionText}>Kayıtlı taslaklar</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={() => onNavigate('forms')} style={styles.primaryAction}>
              <Text style={styles.primaryActionText}>Yeni kayıt</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Aktif Form</Text>
        <Text style={styles.sectionDetail}>{activeDraft.title}</Text>
      </View>

      <DraftDetailPanel
        draft={activeDraft}
        key={activeDraft.id}
        onClose={() => draftState.selectDraft(null)}
        onFieldValueChange={(fieldId, value) => void draftState.updateDraftFieldValue(activeDraft.id, fieldId, value)}
        onTitleChange={(title) => void draftState.updateDraftTitle(activeDraft.id, title)}
      />
    </View>
  );
}

function FormsScreen({
  draftState,
  onNavigate,
}: {
  readonly draftState: LocalDraftState;
  readonly onNavigate: (route: AppRouteId) => void;
}) {
  const startDraft = async (formType: 'AM' | 'PM') => {
    const createdDraftId = await draftState.createDraft(formType);
    if (createdDraftId) onNavigate('form');
  };

  return (
    <View style={styles.screen}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Formlar</Text>
        <Text style={styles.sectionDetail}>Yeni kayıt türünü seçin; taslak oluşturulup doğrudan form ekranı açılır.</Text>
      </View>

      {draftState.errorMessage && <Text style={styles.errorText}>{draftState.errorMessage}</Text>}

      <View style={styles.formStartGrid}>
        {FORM_READINESS.map((form) => (
          <Pressable
            accessibilityRole="button"
            key={form.code}
            onPress={() => void startDraft(form.code)}
            style={styles.formStartCard}
          >
            <View style={styles.formSummaryHeader}>
              <View style={styles.formBadge}>
                <Text style={styles.formBadgeText}>{form.code}</Text>
              </View>
              <View style={styles.formSummaryText}>
                <Text style={styles.panelTitle}>
                  {form.code === 'AM' ? 'Ölüm Öncesi Kaydı Başlat' : 'Ölüm Sonrası Kaydı Başlat'}
                </Text>
                <Text style={styles.mutedText}>{form.title}</Text>
              </View>
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.statText}>{form.fieldCount} resmi alan</Text>
              <Text style={styles.statText}>{form.widgetCount} alan bileşeni</Text>
            </View>
            <Text style={styles.bodyText}>{form.nextAction}</Text>
            <Text style={styles.startHintText}>Basınca yeni taslak açılır.</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Kayıtlı taslaklar ayrı ekranda</Text>
        <Text style={styles.bodyText}>
          Önceden oluşturulan AM/PM taslaklarına Kayıtlı sekmesinden devam edilir. Bu ekran yalnızca yeni kayıt
          başlatma kararını gösterir.
        </Text>
      </View>
    </View>
  );
}

function DraftRow({
  active,
  draft,
  onDeleteRequest,
  onDuplicate,
  onResume,
}: {
  readonly active: boolean;
  readonly draft: LocalDraft;
  readonly onDeleteRequest: () => void;
  readonly onDuplicate: () => void;
  readonly onResume: () => void;
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
  onFieldValueChange,
  onTitleChange,
}: {
  readonly draft: LocalDraft;
  readonly onClose: () => void;
  readonly onFieldValueChange: (fieldId: string, value: LocalDraft['fieldValues'][string] | null) => void;
  readonly onTitleChange: (title: string) => void;
}) {
  const [title, setTitle] = useState(draft.title);
  const [activeSectionTitle, setActiveSectionTitle] = useState('İlk bölüm hazırlanıyor');

  return (
    <View style={styles.panel}>
      <View style={styles.activeFormHeader}>
        <View style={styles.formBadge}>
          <Text style={styles.formBadgeText}>{draft.formType}</Text>
        </View>
        <View style={styles.activeFormTitleGroup}>
          <Text style={styles.panelTitle}>{draft.title}</Text>
          <Text style={styles.mutedText}>
            Son kayıt: {formatDraftDate(draft.updatedAt)} · Tamamlanma: %{draft.completionPercent}
          </Text>
        </View>
        <Pressable accessibilityRole="button" onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>Kapat</Text>
        </Pressable>
      </View>

      <View style={styles.activeContextGrid}>
        <View style={styles.contextTile}>
          <Text style={styles.contextLabel}>Kayıt türü</Text>
          <Text style={styles.contextValue}>{draft.formType === 'AM' ? 'Ölüm öncesi' : 'Ölüm sonrası'}</Text>
        </View>
        <View style={styles.contextTile}>
          <Text style={styles.contextLabel}>Aktif bölüm</Text>
          <Text style={styles.contextValue}>{activeSectionTitle}</Text>
        </View>
        <View style={styles.contextTile}>
          <Text style={styles.contextLabel}>Kaydedilen alan</Text>
          <Text style={styles.contextValue}>
            {draft.savedFieldCount} / {draft.schemaFieldCount}
          </Text>
        </View>
      </View>

      <View style={styles.quickActionBar}>
        <Pressable accessibilityRole="button" onPress={onClose} style={styles.secondaryAction}>
          <Text style={styles.secondaryActionText}>Formu kapat</Text>
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
      <FormWorkspace draft={draft} onActiveSectionChange={setActiveSectionTitle} onFieldValueChange={onFieldValueChange} />
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
    <Modal animationType="fade" onRequestClose={onCancel} transparent visible>
      <View style={styles.modalBackdrop}>
        <View accessibilityRole="alert" style={styles.modalPanel}>
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
      </View>
    </Modal>
  );
}

function StatusScreen({ draftState }: { readonly draftState: LocalDraftState }) {
  const activeDraft = draftState.drafts.find((draft) => draft.id === draftState.activeDraftId);

  return (
    <View style={styles.screen}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Durum</Text>
        <Text style={styles.sectionDetail}>Uygulama kapsamı, yerel kayıt durumu ve faz ilerlemesi.</Text>
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
          Üst navigasyon saha kullanımına göre yeniden düzenlendi. Kayıtlı taslaklar, yeni form başlatma,
          aktif form ve sistem tanılaması ayrı başlıklara taşındı.
        </Text>
        {activeDraft && <Text style={styles.mutedText}>Aktif taslak: {activeDraft.title}</Text>}
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
  const migrationReport = draftState.migrationReport;

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
        <Text style={styles.panelTitle}>Tanılama</Text>
        <View style={styles.statsRow}>
          <Text style={styles.statText}>Saklama sürümü: {DIAGNOSTICS_INFO.draftStorageVersion}</Text>
          <Text style={styles.statText}>Alan kapsamı: {DIAGNOSTICS_INFO.schemaCoverage.totalFieldCount}</Text>
          <Text style={styles.statText}>Bileşen: {DIAGNOSTICS_INFO.schemaCoverage.totalWidgetBindingCount}</Text>
        </View>
        <Text style={styles.bodyText}>
          AM taslak: {draftState.amDraftCount} · PM taslak: {draftState.pmDraftCount}
        </Text>
        {migrationReport && (
          <Text style={styles.mutedText}>
            Veri geçişi: {migrationReport.migrated ? 'Uygulandı' : 'Gerekmiyor'} · Geçersiz kayıt:{' '}
            {migrationReport.invalidRecordCount}
          </Text>
        )}
        {migrationReport?.messages.map((message) => (
          <Text key={message} style={styles.mutedText}>
            {message}
          </Text>
        ))}
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Kalite Kapıları</Text>
        {DIAGNOSTICS_INFO.qualityGates.map((gate) => (
          <Text key={gate} style={styles.mutedText}>
            {gate}
          </Text>
        ))}
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
  formStartGrid: {
    gap: 12,
  },
  formStartCard: {
    backgroundColor: '#ffffff',
    borderColor: '#d8dee8',
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    minHeight: 168,
    padding: 16,
  },
  startHintText: {
    color: '#0f766e',
    fontSize: 13,
    fontWeight: '900',
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
  primaryAction: {
    alignItems: 'center',
    backgroundColor: '#134e4a',
    borderRadius: 7,
    flexGrow: 1,
    minHeight: 46,
    justifyContent: 'center',
    paddingHorizontal: 14,
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
  emptyStatePanel: {
    backgroundColor: '#f8fafc',
    borderColor: '#d8dee8',
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 14,
  },
  emptyStateTitle: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '900',
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
  activeFormHeader: {
    alignItems: 'center',
    borderBottomColor: '#e2e8f0',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 12,
  },
  activeFormTitleGroup: {
    flex: 1,
    gap: 3,
  },
  activeContextGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  contextTile: {
    backgroundColor: '#f8fafc',
    borderColor: '#d8dee8',
    borderRadius: 8,
    borderWidth: 1,
    flexGrow: 1,
    gap: 4,
    minWidth: 138,
    padding: 11,
  },
  contextLabel: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '800',
  },
  contextValue: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 19,
  },
  quickActionBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
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
  modalBackdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.46)',
    flex: 1,
    justifyContent: 'center',
    padding: 18,
  },
  modalPanel: {
    backgroundColor: '#fff7ed',
    borderColor: '#fdba74',
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    maxWidth: 520,
    padding: 16,
    width: '100%',
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
