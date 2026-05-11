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
    status: 'AM klinik ve destek blokları düzenlenebilir.',
    nextAction: 'Eşya, fiziksel tanım, tıbbi, odontoloji, destek, ek ve imza alanları yerel taslağa kaydedilir.',
  },
  {
    code: 'PM',
    title: 'Ölüm Sonrası Kaydı',
    fieldCount: 1693,
    widgetCount: 2026,
    status: 'PM buluntu, patoloji ve odontoloji blokları düzenlenebilir.',
    nextAction: 'Buluntu, kalıntı, eşya, fiziksel tanım, patoloji ve odontoloji alanları yerel taslağa kaydedilir.',
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
    detail: 'AM/PM şema kapsamı derleme kapısı haline getirildi.',
  },
  {
    title: 'Uygulama kabuğu',
    status: 'tamamlandı',
    detail: 'Navigasyon ve dashboard temeli kuruldu.',
  },
  {
    title: 'Yerel taslaklar',
    status: 'tamamlandı',
    detail: 'Cihazda kalıcı AM/PM taslak saklama kuruldu.',
  },
  {
    title: 'Taslak yaşam döngüsü',
    status: 'tamamlandı',
    detail: 'Devam etme, başlık düzenleme, kopyalama ve onaylı silme tamamlandı.',
  },
  {
    title: 'Tanılama ve veri geçişi',
    status: 'tamamlandı',
    detail: 'Derleme bilgisi, saklama sürümü ve kalite kapıları görünürdür.',
  },
  {
    title: 'Ortak form gezgini',
    status: 'tamamlandı',
    detail: 'AM/PM şemalarından bölüm gezgini ve alan kontrol iskeleti üretildi.',
  },
  {
    title: 'AM genel bilgi girişi',
    status: 'tamamlandı',
    detail: 'AM kimlik, olay, kişi, iletişim ve genel bilgi alanları yerel taslak değerlerine bağlandı.',
  },
  {
    title: 'AM klinik ve destek blokları',
    status: 'tamamlandı',
    detail: 'AM eşya, fiziksel tanım, tıbbi, odontoloji, destek, ek ve imza blokları düzenlenebilir hale getirildi.',
  },
  {
    title: 'PM buluntu ve patoloji',
    status: 'sürüyor',
    detail: 'PM buluntu, kalıntı, eşya, fiziksel tanım, patoloji ve odontoloji blokları düzenlenebilir hale getirilir.',
  },
] as const;
