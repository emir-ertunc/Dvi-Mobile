import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  createDraft as persistCreatedDraft,
  deleteDraft as persistDeletedDraft,
  duplicateDraft as persistDuplicatedDraft,
  type DraftFormType,
  type DraftMigrationReport,
  type LocalDraft,
  loadDrafts,
  loadDraftState,
  resumeDraft as persistResumedDraft,
  updateDraftTitle as persistUpdatedDraftTitle,
} from '../storage/draftStore';

export interface LocalDraftState {
  readonly drafts: readonly LocalDraft[];
  readonly loading: boolean;
  readonly errorMessage: string | null;
  readonly migrationReport: DraftMigrationReport | null;
  readonly draftCount: number;
  readonly amDraftCount: number;
  readonly pmDraftCount: number;
  readonly activeDraftId: string | null;
  readonly reload: () => Promise<void>;
  readonly createDraft: (formType: DraftFormType) => Promise<void>;
  readonly resumeDraft: (draftId: string) => Promise<void>;
  readonly updateDraftTitle: (draftId: string, title: string) => Promise<void>;
  readonly duplicateDraft: (draftId: string) => Promise<void>;
  readonly deleteDraft: (draftId: string) => Promise<void>;
  readonly selectDraft: (draftId: string | null) => void;
}

export function useLocalDrafts(): LocalDraftState {
  const [drafts, setDrafts] = useState<readonly LocalDraft[]>([]);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [migrationReport, setMigrationReport] = useState<DraftMigrationReport | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const result = await loadDraftState();
      setDrafts(result.drafts);
      setMigrationReport(result.migrationReport);
      setActiveDraftId((current) => (current && result.drafts.some((draft) => draft.id === current) ? current : null));
    } catch {
      setErrorMessage('Yerel taslaklar okunamadı.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const createDraft = useCallback(
    async (formType: DraftFormType) => {
      setErrorMessage(null);
      try {
        const currentDrafts = await loadDrafts();
        const nextDrafts = await persistCreatedDraft(formType, currentDrafts);
        setDrafts(nextDrafts);
        setActiveDraftId(nextDrafts[0]?.id ?? null);
      } catch {
        setErrorMessage('Taslak oluşturulamadı.');
      }
    },
    [],
  );

  const resumeDraft = useCallback(async (draftId: string) => {
    setErrorMessage(null);
    try {
      const currentDrafts = await loadDrafts();
      setDrafts(await persistResumedDraft(draftId, currentDrafts));
      setActiveDraftId(draftId);
    } catch {
      setErrorMessage('Taslağa devam edilemedi.');
    }
  }, []);

  const updateDraftTitle = useCallback(async (draftId: string, title: string) => {
    setErrorMessage(null);
    try {
      const currentDrafts = await loadDrafts();
      setDrafts(await persistUpdatedDraftTitle(draftId, title, currentDrafts));
      setActiveDraftId(draftId);
    } catch {
      setErrorMessage('Taslak başlığı güncellenemedi.');
    }
  }, []);

  const duplicateDraft = useCallback(async (draftId: string) => {
    setErrorMessage(null);
    try {
      const currentDrafts = await loadDrafts();
      const nextDrafts = await persistDuplicatedDraft(draftId, currentDrafts);
      setDrafts(nextDrafts);
      setActiveDraftId(nextDrafts[0]?.id ?? null);
    } catch {
      setErrorMessage('Taslak kopyalanamadı.');
    }
  }, []);

  const deleteDraft = useCallback(
    async (draftId: string) => {
      setErrorMessage(null);
      try {
        const currentDrafts = await loadDrafts();
        const nextDrafts = await persistDeletedDraft(draftId, currentDrafts);
        setDrafts(nextDrafts);
        setActiveDraftId((current) => (current === draftId ? null : current));
      } catch {
        setErrorMessage('Taslak silinemedi.');
      }
    },
    [],
  );

  return useMemo(
    () => ({
      drafts,
      loading,
      errorMessage,
      migrationReport,
      draftCount: drafts.length,
      amDraftCount: drafts.filter((draft) => draft.formType === 'AM').length,
      pmDraftCount: drafts.filter((draft) => draft.formType === 'PM').length,
      activeDraftId,
      reload,
      createDraft,
      resumeDraft,
      updateDraftTitle,
      duplicateDraft,
      deleteDraft,
      selectDraft: setActiveDraftId,
    }),
    [
      activeDraftId,
      createDraft,
      deleteDraft,
      drafts,
      duplicateDraft,
      errorMessage,
      loading,
      migrationReport,
      reload,
      resumeDraft,
      updateDraftTitle,
    ],
  );
}
