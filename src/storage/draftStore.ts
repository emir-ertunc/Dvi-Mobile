import AsyncStorage from '@react-native-async-storage/async-storage';

export type DraftFormType = 'AM' | 'PM';

export interface LocalDraft {
  readonly id: string;
  readonly formType: DraftFormType;
  readonly title: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly schemaFieldCount: number;
  readonly widgetBindingCount: number;
  readonly savedFieldCount: number;
  readonly completionPercent: number;
}

export const DRAFT_STORAGE_KEY = '@dvi-mobile/local-drafts/v1';

const FORM_TOTALS: Record<DraftFormType, { readonly schemaFieldCount: number; readonly widgetBindingCount: number }> = {
  AM: {
    schemaFieldCount: 1687,
    widgetBindingCount: 2006,
  },
  PM: {
    schemaFieldCount: 1693,
    widgetBindingCount: 2026,
  },
};

function draftTitle(formType: DraftFormType, createdAt: string): string {
  const prefix = formType === 'AM' ? 'Ölüm Öncesi Taslağı' : 'Ölüm Sonrası Taslağı';
  const timestamp = new Date(createdAt).toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${prefix} - ${timestamp}`;
}

function createId(formType: DraftFormType, createdAt: string): string {
  const randomPart = Math.random().toString(36).slice(2, 10);
  return `${formType.toLowerCase()}-${Date.parse(createdAt)}-${randomPart}`;
}

function normalizeDrafts(value: unknown): LocalDraft[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is LocalDraft => {
      if (!item || typeof item !== 'object') return false;
      const draft = item as Partial<LocalDraft>;
      return (
        typeof draft.id === 'string' &&
        (draft.formType === 'AM' || draft.formType === 'PM') &&
        typeof draft.title === 'string' &&
        typeof draft.createdAt === 'string' &&
        typeof draft.updatedAt === 'string' &&
        typeof draft.schemaFieldCount === 'number' &&
        typeof draft.widgetBindingCount === 'number' &&
        typeof draft.savedFieldCount === 'number' &&
        typeof draft.completionPercent === 'number'
      );
    })
    .sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt));
}

export async function loadDrafts(): Promise<LocalDraft[]> {
  const raw = await AsyncStorage.getItem(DRAFT_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    return normalizeDrafts(JSON.parse(raw));
  } catch {
    return [];
  }
}

export async function saveDrafts(drafts: readonly LocalDraft[]): Promise<void> {
  await AsyncStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(drafts));
}

export async function createDraft(formType: DraftFormType, existingDrafts: readonly LocalDraft[]): Promise<LocalDraft[]> {
  const createdAt = new Date().toISOString();
  const totals = FORM_TOTALS[formType];
  const draft: LocalDraft = {
    id: createId(formType, createdAt),
    formType,
    title: draftTitle(formType, createdAt),
    createdAt,
    updatedAt: createdAt,
    schemaFieldCount: totals.schemaFieldCount,
    widgetBindingCount: totals.widgetBindingCount,
    savedFieldCount: 0,
    completionPercent: 0,
  };
  const nextDrafts = normalizeDrafts([draft, ...existingDrafts]);
  await saveDrafts(nextDrafts);
  return nextDrafts;
}

export async function deleteDraft(draftId: string, existingDrafts: readonly LocalDraft[]): Promise<LocalDraft[]> {
  const nextDrafts = existingDrafts.filter((draft) => draft.id !== draftId);
  await saveDrafts(nextDrafts);
  return nextDrafts;
}

export function formatDraftDate(value: string): string {
  return new Date(value).toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
