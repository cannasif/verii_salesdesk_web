import { type ReactElement, useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Loader2,
  NotebookPen,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { SalesDeskGroupMemberSelect } from '../groups/SalesDeskGroupMemberSelect';
import {
  useCreateSalesDeskNote,
  useDeleteSalesDeskNote,
  useSalesDeskNotesList,
  useUpdateSalesDeskNote,
} from '../../hooks/useSalesDeskNotes';
import type { SalesDeskNoteDto } from '../../types/notes-types';
import {
  salesDeskPageShellClass,
  salesDeskPageSubtitleClass,
  salesDeskPageTitleClass,
  surfaceClass,
} from '../../lib/salesdesk-shared';
import {
  SD_ADD_BUTTON,
  SD_FORM_INPUT,
  SD_FORM_LABEL,
  SD_PAGE_ICON_BOX,
  SD_SECONDARY_BUTTON,
  SD_SURFACE_DIALOG,
} from '../../lib/salesdesk-popup-styles';
import { markNoteReadForUser } from '../../lib/salesdesk-notes-read-storage';

function formatNoteDate(value?: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function notePreview(content: string): string {
  const trimmed = content.trim().replace(/\s+/g, ' ');
  if (!trimmed) return 'Icerik yok';
  return trimmed.length > 72 ? `${trimmed.slice(0, 72)}…` : trimmed;
}

export function SalesDeskNotesPage(): ReactElement {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id ?? null;
  const userName = user?.name || user?.email || 'Kullanici';
  const [searchParams, setSearchParams] = useSearchParams();
  const noteIdParam = searchParams.get('note');

  const { data: notes = [], isLoading, isError, error, refetch, isFetching } = useSalesDeskNotesList();
  const createNote = useCreateSalesDeskNote();
  const updateNote = useUpdateSalesDeskNote();
  const deleteNote = useDeleteSalesDeskNote();

  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<number | 'new' | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [recipientUserIds, setRecipientUserIds] = useState<number[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<SalesDeskNoteDto | null>(null);
  const [showRecipients, setShowRecipients] = useState(true);

  const filteredNotes = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('tr-TR');
    if (!term) return notes;
    return notes.filter(
      (note) =>
        note.title.toLocaleLowerCase('tr-TR').includes(term) ||
        note.content.toLocaleLowerCase('tr-TR').includes(term) ||
        note.createdByName.toLocaleLowerCase('tr-TR').includes(term)
    );
  }, [notes, search]);

  const selectedNote = useMemo(
    () => (typeof selectedId === 'number' ? notes.find((note) => note.id === selectedId) ?? null : null),
    [notes, selectedId]
  );

  const isOwner = selectedNote ? selectedNote.createdByUserId === userId : true;
  const isSaving = createNote.isPending || updateNote.isPending;
  const canSave = title.trim().length > 0 && !isSaving;

  const resetDraft = useCallback((): void => {
    setTitle('');
    setContent('');
    setRecipientUserIds([]);
  }, []);

  const startNewNote = useCallback((): void => {
    setSelectedId('new');
    resetDraft();
    setShowRecipients(true);
  }, [resetDraft]);

  const loadNoteIntoDraft = useCallback((note: SalesDeskNoteDto): void => {
    setSelectedId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setRecipientUserIds(note.recipientUserIds ?? []);
    setShowRecipients(true);
  }, []);

  useEffect(() => {
    if (selectedId === null && notes.length > 0 && !isLoading && !noteIdParam) {
      loadNoteIntoDraft(notes[0]);
    }
  }, [isLoading, loadNoteIntoDraft, noteIdParam, notes, selectedId]);

  useEffect(() => {
    if (!noteIdParam || !userId || isLoading) return;
    const noteId = Number(noteIdParam);
    if (!Number.isFinite(noteId)) return;

    const note = notes.find((item) => item.id === noteId);
    if (!note) return;

    loadNoteIntoDraft(note);
    markNoteReadForUser(userId, noteId);
    setSearchParams({}, { replace: true });
  }, [isLoading, loadNoteIntoDraft, noteIdParam, notes, setSearchParams, userId]);

  const handleSave = async (): Promise<void> => {
    if (!userId || !canSave) return;

    if (selectedId === 'new' || selectedId === null) {
      const created = await createNote.mutateAsync({
        title: title.trim(),
        content: content.trim(),
        recipientUserIds,
        createdByUserId: userId,
        createdByName: userName,
      });
      loadNoteIntoDraft(created);
      return;
    }

    await updateNote.mutateAsync({
      id: selectedId,
      input: {
        title: title.trim(),
        content: content.trim(),
        recipientUserIds,
        notifyRecipients: true,
      },
    });
  };

  const handleDelete = async (): Promise<void> => {
    if (!deleteTarget) return;
    await deleteNote.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
    if (selectedId === deleteTarget.id) {
      setSelectedId(null);
      resetDraft();
    }
  };

  return (
    <div className={salesDeskPageShellClass}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <div className={SD_PAGE_ICON_BOX}>
            <NotebookPen size={22} />
          </div>
          <div>
            <h1 className={salesDeskPageTitleClass}>Notlar</h1>
            <p className={salesDeskPageSubtitleClass}>
              Not olusturun, kaydedin ve eklediginiz kullanicilara bildirim gonderin
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className={SD_SECONDARY_BUTTON}
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
            Yenile
          </Button>
          <Button type="button" className={SD_ADD_BUTTON} onClick={startNewNote}>
            <Plus className="h-4 w-4" />
            Yeni Not
          </Button>
        </div>
      </div>

      <div
        className={cn(
          'grid min-h-[min(72vh,720px)] overflow-hidden rounded-2xl',
          surfaceClass,
          'lg:grid-cols-[300px_minmax(0,1fr)]'
        )}
      >
        {/* Sol: not listesi */}
        <aside className="flex flex-col border-b border-[var(--crm-app-border)] lg:border-b-0 lg:border-r">
          <div className="border-b border-[var(--crm-app-border)] p-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--crm-app-text-muted)]" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Notlarda ara..."
                className={cn(SD_FORM_INPUT, 'h-10 pl-9')}
              />
            </div>
            <p className="mt-3 text-xs text-[var(--crm-app-text-muted)]">
              {filteredNotes.length} kayitli not
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-12 text-sm text-[var(--crm-app-text-muted)]">
                <Loader2 className="h-4 w-4 animate-spin" />
                Notlar yukleniyor...
              </div>
            ) : isError ? (
              <div className="space-y-3 px-2 py-8 text-center">
                <p className="text-sm text-red-400">{(error as Error)?.message || 'Notlar yuklenemedi.'}</p>
                <Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
                  Tekrar dene
                </Button>
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="px-3 py-10 text-center">
                <p className="text-sm text-[var(--crm-app-text-muted)]">
                  {search.trim() ? 'Aramaya uygun not bulunamadi.' : 'Henuz not yok. Yeni not ekleyin.'}
                </p>
                {!search.trim() && (
                  <Button type="button" className={cn(SD_ADD_BUTTON, 'mt-4')} size="sm" onClick={startNewNote}>
                    <Plus className="h-4 w-4" />
                    Ilk Notu Olustur
                  </Button>
                )}
              </div>
            ) : (
              <ul className="space-y-1">
                {filteredNotes.map((note) => {
                  const active = selectedId === note.id;
                  const owned = note.createdByUserId === userId;
                  return (
                    <li key={note.id}>
                      <button
                        type="button"
                        onClick={() => loadNoteIntoDraft(note)}
                        className={cn(
                          'w-full rounded-xl border px-3 py-3 text-left transition-colors',
                          active
                            ? 'border-[var(--crm-brand-primary)] bg-[var(--crm-brand-soft)]/40'
                            : 'border-transparent hover:border-[var(--crm-app-border)] hover:bg-[var(--crm-app-panel-muted)]/50'
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="line-clamp-1 text-sm font-semibold text-slate-100">{note.title}</span>
                          {owned && (
                            <span className="shrink-0 rounded-md bg-violet-500/15 px-1.5 py-0.5 text-[10px] font-medium text-violet-300">
                              Benim
                            </span>
                          )}
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs text-[var(--crm-app-text-muted)]">
                          {notePreview(note.content)}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-[var(--crm-app-text-muted)]">
                          <span>{formatNoteDate(note.updatedAt)}</span>
                          {note.recipientUserIds.length > 0 && (
                            <span className="inline-flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {note.recipientUserIds.length} kisi
                            </span>
                          )}
                          {!owned && note.createdByName && (
                            <span className="truncate">{note.createdByName}</span>
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>

        {/* Sag: editor */}
        <section className="flex min-h-0 flex-col">
          {selectedId === null && !isLoading ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--crm-app-border)] bg-[var(--crm-app-panel-muted)]/60 text-[var(--crm-brand-primary)]">
                <NotebookPen size={28} />
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-100">Not secin veya yeni olusturun</p>
                <p className="mt-1 max-w-md text-sm text-[var(--crm-app-text-muted)]">
                  Soldan bir not secerek duzenleyebilir veya yeni not ekleyerek baslayabilirsiniz.
                </p>
              </div>
              <Button type="button" className={SD_ADD_BUTTON} onClick={startNewNote}>
                <Plus className="h-4 w-4" />
                Yeni Not Olustur
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--crm-app-border)] px-5 py-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--crm-app-text-muted)]">
                    {selectedId === 'new' ? 'Yeni Not' : isOwner ? 'Not Duzenle' : 'Paylasilan Not'}
                  </p>
                  {selectedNote && !isOwner && (
                    <p className="mt-0.5 text-xs text-[var(--crm-app-text-muted)]">
                      {selectedNote.createdByName} tarafindan paylasildi
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {selectedNote && isOwner && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-red-500/30 text-red-300 hover:bg-red-500/10 hover:text-red-200"
                      onClick={() => setDeleteTarget(selectedNote)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Sil
                    </Button>
                  )}
                  <Button type="button" className={SD_ADD_BUTTON} disabled={!canSave} onClick={() => void handleSave()}>
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {selectedId === 'new' ? 'Kaydet ve Bildir' : 'Guncelle ve Bildir'}
                  </Button>
                </div>
              </div>

              <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5">
                <div>
                  <label htmlFor="note-title" className={SD_FORM_LABEL}>
                    Baslik
                  </label>
                  <Input
                    id="note-title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Not basligi..."
                    className={cn(SD_FORM_INPUT, 'h-11 text-base font-medium')}
                    disabled={!isOwner && selectedId !== 'new'}
                  />
                </div>

                <div className="flex min-h-[200px] flex-1 flex-col">
                  <label htmlFor="note-content" className={SD_FORM_LABEL}>
                    Not Icerigi
                  </label>
                  <Textarea
                    id="note-content"
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    placeholder="Notunuzu buraya yazin..."
                    className={cn(
                      SD_FORM_INPUT,
                      'min-h-[220px] flex-1 resize-none py-3 leading-relaxed'
                    )}
                    disabled={!isOwner && selectedId !== 'new'}
                  />
                </div>

                {(selectedId === 'new' || isOwner) && (
                  <div className="rounded-xl border border-[var(--crm-app-border)] bg-[var(--crm-app-panel-muted)]/30">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between px-4 py-3 text-left"
                      onClick={() => setShowRecipients((value) => !value)}
                    >
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-100">
                        <UserPlus className="h-4 w-4 text-[var(--crm-brand-primary)]" />
                        Kullanici Ekle
                        {recipientUserIds.length > 0 && (
                          <span className="rounded-full bg-[var(--crm-brand-soft)] px-2 py-0.5 text-xs font-medium text-[var(--crm-brand-text)]">
                            {recipientUserIds.length} secili
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-[var(--crm-app-text-muted)]">
                        {showRecipients ? 'Gizle' : 'Goster'}
                      </span>
                    </button>
                    {showRecipients && (
                      <div className="border-t border-[var(--crm-app-border)] p-4">
                        <p className="mb-3 text-xs text-[var(--crm-app-text-muted)]">
                          Secilen kullanicilar kaydettiginizde bildirim alir.
                        </p>
                        <SalesDeskGroupMemberSelect
                          value={recipientUserIds}
                          onChange={setRecipientUserIds}
                        />
                      </div>
                    )}
                  </div>
                )}

                {selectedNote && !isOwner && selectedNote.recipientUserIds.length > 0 && (
                  <div className="rounded-xl border border-[var(--crm-app-border)] bg-[var(--crm-app-panel-muted)]/30 px-4 py-3 text-sm text-[var(--crm-app-text-muted)]">
                    Bu not {selectedNote.recipientUserIds.length} kullaniciya paylasilmis.
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </div>

      <AlertDialog open={deleteTarget != null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className={`w-[90%] max-w-md gap-0 overflow-hidden rounded-2xl p-0 sm:w-full ${SD_SURFACE_DIALOG}`}>
          <AlertDialogHeader className="px-6 pb-4 pt-8 text-center sm:text-left">
            <AlertDialogTitle className="text-lg font-semibold text-slate-900 dark:text-white">Notu sil</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-[var(--crm-app-text-muted)]">
              &quot;{deleteTarget?.title}&quot; kalici olarak silinecek. Bu islem geri alinamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row justify-end gap-2 border-t border-[var(--crm-app-border)] bg-[var(--crm-app-dialog-footer)] px-6 py-4">
            <AlertDialogCancel className={SD_SECONDARY_BUTTON}>Vazgec</AlertDialogCancel>
            <AlertDialogAction
              className="h-10 rounded-lg bg-rose-600 px-5 text-sm font-semibold text-white hover:bg-rose-500"
              onClick={() => void handleDelete()}
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
