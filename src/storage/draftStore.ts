import AsyncStorage from '@react-native-async-storage/async-storage';

export type DraftFormType = 'AM' | 'PM';
export type DraftFieldValue = string | boolean | number;
export type DraftFieldValues = Readonly<Record<string, DraftFieldValue>>;

export interface LocalDraft {
  readonly id: string;
  readonly formType: DraftFormType;
  readonly title: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly lastOpenedAt: string | null;
  readonly schemaFieldCount: number;
  readonly widgetBindingCount: number;
  readonly savedFieldCount: number;
  readonly completionPercent: number;
  readonly revision: number;
  readonly fieldValues: DraftFieldValues;
}

export const DRAFT_STORAGE_KEY = '@dvi-mobile/local-drafts/v1';
export const DRAFT_STORAGE_VERSION = 3;

export interface DraftMigrationReport {
  readonly storageVersion: number;
  readonly migrated: boolean;
  readonly draftCount: number;
  readonly invalidRecordCount: number;
  readonly messages: readonly string[];
}

export interface DraftLoadResult {
  readonly drafts: readonly LocalDraft[];
  readonly migrationReport: DraftMigrationReport;
}

interface DraftStorageEnvelope {
  readonly storageVersion: number;
  readonly savedAt: string;
  readonly drafts: readonly LocalDraft[];
}

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

function normalizeFieldValues(value: unknown): DraftFieldValues {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).filter(
      ([fieldId, fieldValue]) =>
        fieldId.length > 0 &&
        (typeof fieldValue === 'string' || typeof fieldValue === 'boolean' || typeof fieldValue === 'number'),
    ),
  ) as DraftFieldValues;
}

function completionPercent(savedFieldCount: number, schemaFieldCount: number): number {
  if (schemaFieldCount <= 0) return 0;
  return Math.min(100, Math.round((savedFieldCount / schemaFieldCount) * 100));
}

function withComputedDraftState(draft: LocalDraft): LocalDraft {
  const fieldValues = normalizeFieldValues(draft.fieldValues);
  const savedFieldCount = Object.keys(fieldValues).length;
  return {
    ...draft,
    fieldValues,
    savedFieldCount,
    completionPercent: completionPercent(savedFieldCount, draft.schemaFieldCount),
  };
}

function normalizeDrafts(value: unknown): { readonly drafts: LocalDraft[]; readonly invalidRecordCount: number } {
  if (!Array.isArray(value)) {
    return { drafts: [], invalidRecordCount: 0 };
  }

  let invalidRecordCount = 0;
  const drafts = value
    .filter((item): item is LocalDraft => {
      if (!item || typeof item !== 'object') {
        invalidRecordCount += 1;
        return false;
      }
      const draft = item as Partial<LocalDraft>;
      const valid =
        typeof draft.id === 'string' &&
        (draft.formType === 'AM' || draft.formType === 'PM') &&
        typeof draft.title === 'string' &&
        typeof draft.createdAt === 'string' &&
        typeof draft.updatedAt === 'string' &&
        typeof draft.schemaFieldCount === 'number' &&
        typeof draft.widgetBindingCount === 'number' &&
        typeof draft.savedFieldCount === 'number' &&
        typeof draft.completionPercent === 'number';
      if (!valid) {
        invalidRecordCount += 1;
      }
      return valid;
    })
    .map((draft) => ({
      ...draft,
      fieldValues: normalizeFieldValues(draft.fieldValues),
      lastOpenedAt: typeof draft.lastOpenedAt === 'string' ? draft.lastOpenedAt : null,
      revision: typeof draft.revision === 'number' ? draft.revision : 1,
    }))
    .map(withComputedDraftState)
    .sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt));

  return { drafts, invalidRecordCount };
}

function readEnvelope(value: unknown): DraftLoadResult {
  if (Array.isArray(value)) {
    const normalized = normalizeDrafts(value);
    return {
      drafts: normalized.drafts,
      migrationReport: {
        storageVersion: DRAFT_STORAGE_VERSION,
        migrated: true,
        draftCount: normalized.drafts.length,
        invalidRecordCount: normalized.invalidRecordCount,
        messages: ['Eski taslak liste formatı sürümlü saklama zarfına yükseltildi.'],
      },
    };
  }

  if (value && typeof value === 'object' && Array.isArray((value as Partial<DraftStorageEnvelope>).drafts)) {
    const envelope = value as Partial<DraftStorageEnvelope>;
    const normalized = normalizeDrafts(envelope.drafts);
    const version = typeof envelope.storageVersion === 'number' ? envelope.storageVersion : 1;
    return {
      drafts: normalized.drafts,
      migrationReport: {
        storageVersion: DRAFT_STORAGE_VERSION,
        migrated: version !== DRAFT_STORAGE_VERSION || normalized.invalidRecordCount > 0,
        draftCount: normalized.drafts.length,
        invalidRecordCount: normalized.invalidRecordCount,
        messages:
          version === DRAFT_STORAGE_VERSION && normalized.invalidRecordCount === 0
            ? ['Taslak saklama zarfı güncel.']
            : [
                version === DRAFT_STORAGE_VERSION
                  ? 'Geçersiz taslak kayıtları temizlendi.'
                  : `Taslak saklama zarfı ${version} sürümünden ${DRAFT_STORAGE_VERSION} sürümüne yükseltildi.`,
              ],
      },
    };
  }

  return {
    drafts: [],
    migrationReport: {
      storageVersion: DRAFT_STORAGE_VERSION,
      migrated: false,
      draftCount: 0,
      invalidRecordCount: 0,
      messages: ['Yerel taslak kaydı bulunmadı.'],
    },
  };
}

export async function loadDrafts(): Promise<LocalDraft[]> {
  const result = await loadDraftState();
  return [...result.drafts];
}

export async function loadDraftState(): Promise<DraftLoadResult> {
  const raw = await AsyncStorage.getItem(DRAFT_STORAGE_KEY);
  if (!raw) {
    return readEnvelope(null);
  }

  try {
    const result = readEnvelope(JSON.parse(raw));
    if (result.migrationReport.migrated) {
      await saveDrafts(result.drafts);
    }
    return result;
  } catch {
    return {
      drafts: [],
      migrationReport: {
        storageVersion: DRAFT_STORAGE_VERSION,
        migrated: false,
        draftCount: 0,
        invalidRecordCount: 1,
        messages: ['Yerel taslak kaydı okunamadı; geçersiz veri yok sayıldı.'],
      },
    };
  }
}

export async function saveDrafts(drafts: readonly LocalDraft[]): Promise<void> {
  const envelope: DraftStorageEnvelope = {
    storageVersion: DRAFT_STORAGE_VERSION,
    savedAt: new Date().toISOString(),
    drafts,
  };
  await AsyncStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(envelope));
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
    lastOpenedAt: null,
    schemaFieldCount: totals.schemaFieldCount,
    widgetBindingCount: totals.widgetBindingCount,
    savedFieldCount: 0,
    completionPercent: 0,
    revision: 1,
    fieldValues: {},
  };
  const nextDrafts = normalizeDrafts([draft, ...existingDrafts]).drafts;
  await saveDrafts(nextDrafts);
  return nextDrafts;
}

export async function resumeDraft(draftId: string, existingDrafts: readonly LocalDraft[]): Promise<LocalDraft[]> {
  const openedAt = new Date().toISOString();
  const nextDrafts = normalizeDrafts(
    existingDrafts.map((draft) =>
      draft.id === draftId
        ? {
            ...draft,
            updatedAt: openedAt,
            lastOpenedAt: openedAt,
            revision: draft.revision + 1,
          }
        : draft,
    ),
  ).drafts;
  await saveDrafts(nextDrafts);
  return nextDrafts;
}

export async function updateDraftTitle(
  draftId: string,
  title: string,
  existingDrafts: readonly LocalDraft[],
): Promise<LocalDraft[]> {
  const updatedAt = new Date().toISOString();
  const cleanTitle = title.trim();
  const nextDrafts = normalizeDrafts(
    existingDrafts.map((draft) =>
      draft.id === draftId
        ? {
            ...draft,
            title: cleanTitle.length > 0 ? cleanTitle : draft.title,
            updatedAt,
            revision: draft.revision + 1,
          }
        : draft,
    ),
  ).drafts;
  await saveDrafts(nextDrafts);
  return nextDrafts;
}

export async function updateDraftFieldValue(
  draftId: string,
  fieldId: string,
  value: DraftFieldValue | null,
  existingDrafts: readonly LocalDraft[],
): Promise<LocalDraft[]> {
  const updatedAt = new Date().toISOString();
  const nextDrafts = normalizeDrafts(
    existingDrafts.map((draft) => {
      if (draft.id !== draftId) return draft;

      const fieldValues: Record<string, DraftFieldValue> = { ...draft.fieldValues };
      const blankString = typeof value === 'string' && value.trim().length === 0;
      const unchecked = value === false;

      if (value === null || blankString || unchecked) {
        delete fieldValues[fieldId];
      } else {
        fieldValues[fieldId] = value;
      }

      return {
        ...draft,
        fieldValues,
        updatedAt,
        revision: draft.revision + 1,
      };
    }),
  ).drafts;
  await saveDrafts(nextDrafts);
  return nextDrafts;
}

export async function duplicateDraft(draftId: string, existingDrafts: readonly LocalDraft[]): Promise<LocalDraft[]> {
  const source = existingDrafts.find((draft) => draft.id === draftId);
  if (!source) {
    return normalizeDrafts(existingDrafts).drafts;
  }

  const createdAt = new Date().toISOString();
  const duplicate: LocalDraft = {
    ...source,
    id: createId(source.formType, createdAt),
    title: `${source.title} - Kopya`,
    createdAt,
    updatedAt: createdAt,
    lastOpenedAt: null,
    revision: 1,
    fieldValues: { ...source.fieldValues },
  };
  const nextDrafts = normalizeDrafts([duplicate, ...existingDrafts]).drafts;
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
