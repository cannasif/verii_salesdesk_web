import { type ReactElement, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, NotebookPen, NotebookText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { useQueryClient } from '@tanstack/react-query';
import { useSalesDeskNotesList, SALESDESK_NOTES_QUERY_KEY } from '../../hooks/useSalesDeskNotes';
import type { SalesDeskNoteDto } from '../../types/notes-types';
import {
  countUnreadSharedNotes,
  isNoteReadByUser,
  markNoteReadForUser,
} from '../../lib/salesdesk-notes-read-storage';

const AVATAR_TONES = [
  'bg-violet-500/20 text-violet-300',
  'bg-indigo-500/20 text-indigo-300',
  'bg-sky-500/20 text-sky-300',
  'bg-fuchsia-500/20 text-fuchsia-300',
  'bg-purple-500/20 text-purple-300',
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toLocaleUpperCase('tr');
  return `${parts[0][0]}${parts[1][0]}`.toLocaleUpperCase('tr');
}

function toneForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = (hash + name.charCodeAt(i)) % AVATAR_TONES.length;
  return AVATAR_TONES[hash];
}

function relativeTime(value: string): string {
  const date = new Date(value).getTime();
  if (Number.isNaN(date)) return '';
  const diff = Date.now() - date;
  const min = Math.round(diff / 60000);
  if (min < 1) return 'az once';
  if (min < 60) return `${min} dk once`;
  const hours = Math.round(min / 60);
  if (hours < 24) return `${hours} sa once`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} gun once`;
  return new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: 'short' }).format(new Date(value));
}

function notePreview(content: string): string {
  const trimmed = content.trim().replace(/\s+/g, ' ');
  if (!trimmed) return 'Icerik yok';
  return trimmed.length > 80 ? `${trimmed.slice(0, 80)}…` : trimmed;
}

function filterSharedNotes(notes: SalesDeskNoteDto[], userId: number): SalesDeskNoteDto[] {
  return notes
    .filter((note) => note.recipientUserIds.includes(userId) && note.createdByUserId !== userId)
    .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
}

export function SalesDeskNotesDashboardCard(): ReactElement {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const { data: notes = [], isLoading } = useSalesDeskNotesList();

  useEffect(() => {
    const handleChange = (): void => {
      void queryClient.invalidateQueries({ queryKey: SALESDESK_NOTES_QUERY_KEY });
    };

    window.addEventListener('salesdesk-notes-changed', handleChange);
    return () => window.removeEventListener('salesdesk-notes-changed', handleChange);
  }, [queryClient]);

  const sharedNotes = useMemo(
    () => (userId != null ? filterSharedNotes(notes, userId).slice(0, 5) : []),
    [notes, userId]
  );

  const unreadCount = useMemo(() => {
    if (userId == null) return 0;
    const allShared = filterSharedNotes(notes, userId);
    return countUnreadSharedNotes(
      userId,
      allShared.map((note) => note.id)
    );
  }, [notes, userId]);

  const handleOpenNote = (note: SalesDeskNoteDto): void => {
    if (userId != null) {
      markNoteReadForUser(userId, note.id);
    }
    navigate(`/salesdesk/notes?note=${note.id}`);
  };

  return (
    <section className="group relative overflow-hidden rounded-2xl border border-[var(--crm-app-border)] bg-[var(--crm-app-list-card)] shadow-lg shadow-black/10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-violet-500/10 to-transparent" />

      <div className="relative flex items-center gap-3 border-b border-[var(--crm-app-border)] px-5 py-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/25 to-violet-500/5 text-violet-300 ring-1 ring-violet-500/25">
          <NotebookPen size={21} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-bold text-slate-50">Paylasilan Notlar</h2>
            {unreadCount > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-500 px-1.5 text-[11px] font-bold text-white shadow-sm shadow-violet-500/40">
                {unreadCount}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-[var(--crm-app-text-muted)]">
            Size gonderilen notlar ve bildirimler
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/salesdesk/notes')}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--crm-brand-accent)] transition-colors hover:bg-[var(--crm-brand-soft)]"
          aria-label="Tumunu gor"
        >
          <ArrowUpRight size={17} />
        </button>
      </div>

      <div className="relative p-3">
        {isLoading ? (
          <div className="space-y-2">
            {[0, 1, 2].map((index) => (
              <div key={index} className="flex items-center gap-3 rounded-xl px-2 py-2.5">
                <div className="h-9 w-9 shrink-0 animate-pulse rounded-lg bg-[var(--crm-app-panel-muted)]" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-2/3 animate-pulse rounded bg-[var(--crm-app-panel-muted)]" />
                  <div className="h-2.5 w-1/3 animate-pulse rounded bg-[var(--crm-app-panel-muted)]" />
                </div>
              </div>
            ))}
          </div>
        ) : sharedNotes.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-9 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--crm-app-panel-muted)] text-slate-500">
              <NotebookText size={22} />
            </div>
            <p className="text-sm font-medium text-slate-300">Paylasilan not yok</p>
            <p className="max-w-[240px] text-xs text-[var(--crm-app-text-muted)]">
              Bir kullanici size not paylastiginda burada gorunecek ve bildirim alacaksiniz.
            </p>
            <button
              type="button"
              onClick={() => navigate('/salesdesk/notes')}
              className="mt-1 text-xs font-semibold text-[var(--crm-brand-accent)] underline"
            >
              Not olustur
            </button>
          </div>
        ) : (
          <ul className="space-y-1">
            {sharedNotes.map((note) => {
              const unread = userId != null && !isNoteReadByUser(userId, note.id);
              const sender = note.createdByName || 'Kullanici';

              return (
                <li key={note.id}>
                  <button
                    type="button"
                    onClick={() => handleOpenNote(note)}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors',
                      'hover:bg-[var(--crm-brand-soft)]',
                      unread && 'bg-violet-500/8 ring-1 ring-violet-500/20'
                    )}
                  >
                    <span
                      className={cn(
                        'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold',
                        toneForName(sender)
                      )}
                    >
                      {initials(sender)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold text-slate-100">{note.title}</span>
                        {unread && (
                          <span className="shrink-0 rounded-full bg-violet-500/20 px-1.5 py-0.5 text-[10px] font-bold text-violet-300">
                            Yeni
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 block line-clamp-2 text-xs text-[var(--crm-app-text-muted)]">
                        {notePreview(note.content)}
                      </span>
                      <span className="mt-1 block text-[10px] text-[var(--crm-app-text-muted)]">
                        {sender} · {relativeTime(note.updatedAt)}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {sharedNotes.length > 0 && (
        <button
          type="button"
          onClick={() => navigate('/salesdesk/notes')}
          className="relative flex w-full items-center justify-center gap-1.5 border-t border-[var(--crm-app-border)] py-2.5 text-xs font-semibold text-[var(--crm-brand-accent)] transition-colors hover:bg-[var(--crm-brand-soft)]"
        >
          Tum notlari gor
          <ArrowUpRight size={13} />
        </button>
      )}
    </section>
  );
}
