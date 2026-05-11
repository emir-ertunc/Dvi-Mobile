export type AppRouteId = 'overview' | 'forms' | 'workflow' | 'system';

export interface AppRoute {
  readonly id: AppRouteId;
  readonly label: string;
  readonly shortLabel: string;
}

export const APP_ROUTES: readonly AppRoute[] = [
  {
    id: 'overview',
    label: 'Genel Bakış',
    shortLabel: 'Genel',
  },
  {
    id: 'forms',
    label: 'Formlar',
    shortLabel: 'Formlar',
  },
  {
    id: 'workflow',
    label: 'İş Akışı',
    shortLabel: 'Akış',
  },
  {
    id: 'system',
    label: 'Sistem',
    shortLabel: 'Sistem',
  },
] as const;
