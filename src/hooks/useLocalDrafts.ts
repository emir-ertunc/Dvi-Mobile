import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  createDraft as persistCreatedDraft,
  deleteDraft as persistDeletedDraft,
  type DraftFormType,
  type LocalDraft,
  loadDrafts,
} from '../storage/draftStore';

export interface LocalDraftState {
  readonly drafts: readonly LocalDraft[];
  readonly loading: boolean;
  readonly errorMessage: string | null;
  readonly draftCount: number;
  readonly amDraftCount: number;
  readonly pmDraftCount: number;
  readonly reload: () => Promise<void>;
  readonly createDraft: (formType: DraftFormType) => Promise<void>;
  readonly deleteDraft: (draftId: string) => Promise<void>;
}

export function useLocalDrafts(): LocalDraftState {
  const [drafts, setDrafts] = useState<readonly LocalDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      setDrafts(await loadDrafts());
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
        setDrafts(await persistCreatedDraft(formType, drafts));
      } catch {
        setErrorMessage('Taslak oluşturulamadı.');
      }
    },
    [drafts],
  );

  const deleteDraft = useCallback(
    async (draftId: string) => {
      setErrorMessage(null);
      try {
        setDrafts(await persistDeletedDraft(draftId, drafts));
      } catch {
        setErrorMessage('Taslak silinemedi.');
      }
    },
    [drafts],
  );

  return useMemo(
    () => ({
      drafts,
      loading,
      errorMessage,
      draftCount: drafts.length,
      amDraftCount: drafts.filter((draft) => draft.formType === 'AM').length,
      pmDraftCount: drafts.filter((draft) => draft.formType === 'PM').length,
      reload,
      createDraft,
      deleteDraft,
    }),
    [createDraft, deleteDraft, drafts, errorMessage, loading, reload],
  );
}
