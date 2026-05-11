export type AppRouteId = 'saved' | 'forms' | 'form' | 'status' | 'system';

export interface AppRoute {
  readonly id: AppRouteId;
  readonly label: string;
  readonly shortLabel: string;
}

export const APP_ROUTES: readonly AppRoute[] = [
  {
    id: 'saved',
    label: 'Kayıtlı Taslaklar',
    shortLabel: 'Kayıtlı',
  },
  {
    id: 'forms',
    label: 'Formlar',
    shortLabel: 'Formlar',
  },
  {
    id: 'form',
    label: 'Aktif Form',
    shortLabel: 'Form',
  },
  {
    id: 'status',
    label: 'Durum',
    shortLabel: 'Durum',
  },
  {
    id: 'system',
    label: 'Sistem',
    shortLabel: 'Sistem',
  },
] as const;
