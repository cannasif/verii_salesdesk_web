import { useMutation, useQuery, useQueryClient, type UseMutationResult, type UseQueryResult } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';
import { DATA_TABLE_QUERY_OPTIONS } from '@/lib/list-query-options';
import { salesDeskNotesApi } from '../api/salesdesk-notes-api';
import { notifyNoteRecipientsViaBackend } from '../lib/notify-note-recipients';
import type { SalesDeskNoteDto, UpsertSalesDeskNoteInput } from '../types/notes-types';

export const SALESDESK_NOTES_QUERY_KEY = ['salesdesk', 'notes'] as const;

export function useSalesDeskNotesList(): UseQueryResult<SalesDeskNoteDto[]> {
  const userId = useAuthStore((state) => state.user?.id ?? null);

  return useQuery({
    queryKey: [...SALESDESK_NOTES_QUERY_KEY, userId],
    queryFn: () => salesDeskNotesApi.listForUser(userId!),
    enabled: userId != null,
    staleTime: 10_000,
    ...DATA_TABLE_QUERY_OPTIONS,
  });
}

export function useCreateSalesDeskNote(): UseMutationResult<SalesDeskNoteDto, Error, UpsertSalesDeskNoteInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input) => salesDeskNotesApi.create(input),
    onSuccess: (note, input) => {
      void notifyNoteRecipientsViaBackend(note, input.createdByUserId);
      void queryClient.invalidateQueries({ queryKey: SALESDESK_NOTES_QUERY_KEY });
      toast.success('Not kaydedildi ve kullanicilara bildirildi.');
    },
    onError: (error) => toast.error(error.message || 'Not kaydedilemedi.'),
  });
}

export function useUpdateSalesDeskNote(): UseMutationResult<
  SalesDeskNoteDto,
  Error,
  { id: number; input: Omit<UpsertSalesDeskNoteInput, 'createdByUserId' | 'createdByName'> }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }) => salesDeskNotesApi.update(id, input),
    onSuccess: (note) => {
      void notifyNoteRecipientsViaBackend(note, note.createdByUserId);
      void queryClient.invalidateQueries({ queryKey: SALESDESK_NOTES_QUERY_KEY });
      toast.success('Not guncellendi ve kullanicilara bildirildi.');
    },
    onError: (error) => toast.error(error.message || 'Not guncellenemedi.'),
  });
}

export function useDeleteSalesDeskNote(): UseMutationResult<void, Error, number> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => salesDeskNotesApi.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SALESDESK_NOTES_QUERY_KEY });
      toast.success('Not silindi.');
    },
    onError: (error) => toast.error(error.message || 'Not silinemedi.'),
  });
}
