export interface DashboardMetric {
  readonly label: string;
  readonly value: string;
  readonly detail: string;
}

export interface FormReadiness {
  readonly code: 'AM' | 'PM';
  readonly title: string;
  readonly fieldCount: number;
  readonly widgetCount: number;
  readonly status: string;
  readonly nextAction: string;
}

export interface WorkflowStep {
  readonly title: string;
  readonly status: 'tamamlandı' | 'sürüyor' | 'bekliyor';
  readonly detail: string;
}

export const DASHBOARD_METRICS: readonly DashboardMetric[] = [
  {
    label: 'Resmi alan',
    value: '3380',
    detail: 'AM ve PM şemalarında birebir temsil edilir.',
  },
  {
    label: 'Alan bileşeni',
    value: '4032',
    detail: 'PDF alan bağlantıları kayıpsız korunur.',
  },
  {
    label: 'AM kapsamı',
    value: '1687 / 1687',
    detail: 'Ölüm öncesi şema denetimi geçer.',
  },
  {
    label: 'PM kapsamı',
    value: '1693 / 1693',
    detail: 'Ölüm sonrası şema denetimi geçer.',
  },
] as const;

export const FORM_READINESS: readonly FormReadiness[] = [
  {
    code: 'AM',
    title: 'Ölüm Öncesi Kaydı',
    fieldCount: 1687,
    widgetCount: 2006,
    status: 'Şema hazır, veri giriş ekranı bekliyor.',
    nextAction: 'Taslak oluşturma Phase 3B kapsamındadır.',
  },
  {
    code: 'PM',
    title: 'Ölüm Sonrası Kaydı',
    fieldCount: 1693,
    widgetCount: 2026,
    status: 'Şema hazır, veri giriş ekranı bekliyor.',
    nextAction: 'Taslak oluşturma Phase 3B kapsamındadır.',
  },
] as const;

export const WORKFLOW_STEPS: readonly WorkflowStep[] = [
  {
    title: 'Form kaynakları',
    status: 'tamamlandı',
    detail: 'Fillable AM ve PM PDF kaynakları doğrulandı.',
  },
  {
    title: 'Alan envanteri',
    status: 'tamamlandı',
    detail: 'Her alan ve alan bileşeni canonical envantere bağlandı.',
  },
  {
    title: 'Şema doğrulaması',
    status: 'tamamlandı',
    detail: 'AM/PM şema kapsamı build kapısı haline getirildi.',
  },
  {
    title: 'Uygulama kabuğu',
    status: 'sürüyor',
    detail: 'Navigasyon ve dashboard temeli bu fazda kuruluyor.',
  },
  {
    title: 'Yerel taslaklar',
    status: 'bekliyor',
    detail: 'Çevrimdışı kayıt yaşam döngüsü Phase 3B kapsamındadır.',
  },
] as const;
