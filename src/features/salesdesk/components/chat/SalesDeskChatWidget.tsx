import { type ReactElement, useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle, Search, Send, Users, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { Input } from '@/components/ui/input';
import { useSalesDeskUserOptions } from '../../hooks/useSalesDeskModules';
import { useSalesDeskChatStore } from '../../stores/salesdesk-chat-store';
import { requestHistory, sendDm, sendTyping } from '../../lib/salesdesk-chat-socket';

const AVATAR_TONES = [
  'bg-indigo-500/25 text-indigo-200',
  'bg-emerald-500/25 text-emerald-200',
  'bg-amber-500/25 text-amber-100',
  'bg-sky-500/25 text-sky-200',
  'bg-fuchsia-500/25 text-fuchsia-200',
  'bg-rose-500/25 text-rose-200',
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toLocaleUpperCase('tr');
  return `${parts[0][0]}${parts[1][0]}`.toLocaleUpperCase('tr');
}

function toneFor(id: number): string {
  return AVATAR_TONES[Math.abs(id) % AVATAR_TONES.length];
}

function timeShort(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

/** Dialog / sheet acikken sohbet FAB'inin modal butonlarinin ustune binmesini onler. */
function useBlockingOverlayOpen(): boolean {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sync = (): void => {
      const hasOpenOverlay =
        document.querySelector('[data-slot="dialog-overlay"][data-state="open"]') != null ||
        document.querySelector('[data-slot="sheet-overlay"][data-state="open"]') != null ||
        document.querySelector('[role="alertdialog"][data-state="open"]') != null;
      setOpen(hasOpenOverlay);
    };

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['data-state'] });
    return () => observer.disconnect();
  }, []);

  return open;
}

export function SalesDeskChatWidget(): ReactElement | null {
  const currentUserId = useSalesDeskChatStore((state) => state.currentUserId);
  const isOpen = useSalesDeskChatStore((state) => state.isOpen);
  const setOpen = useSalesDeskChatStore((state) => state.setOpen);
  const selectedUserId = useSalesDeskChatStore((state) => state.selectedUserId);
  const setSelectedUserId = useSalesDeskChatStore((state) => state.setSelectedUserId);
  const onlineUserIds = useSalesDeskChatStore((state) => state.onlineUserIds);
  const messagesByUser = useSalesDeskChatStore((state) => state.messagesByUser);
  const unreadByUser = useSalesDeskChatStore((state) => state.unreadByUser);
  const typingByUser = useSalesDeskChatStore((state) => state.typingByUser);
  const connectionStatus = useSalesDeskChatStore((state) => state.connectionStatus);

  const authUser = useAuthStore((state) => state.user);
  const { data: users } = useSalesDeskUserOptions();
  const blockingOverlayOpen = useBlockingOverlayOpen();

  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);

  const onlineSet = useMemo(() => new Set(onlineUserIds), [onlineUserIds]);

  const contacts = useMemo(() => {
    const list = (users ?? []).filter((user) => user.id !== currentUserId);
    const term = search.trim().toLocaleLowerCase('tr');
    const filtered = term
      ? list.filter((user) => user.name.toLocaleLowerCase('tr').includes(term))
      : list;
    return [...filtered].sort((a, b) => {
      const aOnline = onlineSet.has(a.id) ? 1 : 0;
      const bOnline = onlineSet.has(b.id) ? 1 : 0;
      if (aOnline !== bOnline) return bOnline - aOnline;
      return a.name.localeCompare(b.name, 'tr');
    });
  }, [users, currentUserId, search, onlineSet]);

  const totalUnread = useMemo(
    () => Object.values(unreadByUser).reduce((sum, value) => sum + value, 0),
    [unreadByUser]
  );
  const onlineCount = useMemo(
    () => (users ?? []).filter((user) => user.id !== currentUserId && onlineSet.has(user.id)).length,
    [users, currentUserId, onlineSet]
  );

  const selectedUser = useMemo(
    () => (users ?? []).find((user) => user.id === selectedUserId) ?? null,
    [users, selectedUserId]
  );
  const messages = selectedUserId != null ? messagesByUser[selectedUserId] ?? [] : [];
  const partnerTyping = selectedUserId != null ? typingByUser[selectedUserId] : false;

  useEffect(() => {
    if (isOpen && selectedUserId != null) {
      requestHistory(selectedUserId);
    }
  }, [isOpen, selectedUserId]);

  useEffect(() => {
    if (blockingOverlayOpen && isOpen) {
      setOpen(false);
    }
  }, [blockingOverlayOpen, isOpen, setOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, partnerTyping, selectedUserId]);

  const handleSelect = (id: number): void => {
    setSelectedUserId(id);
    requestHistory(id);
  };

  const handleSend = (): void => {
    if (selectedUserId == null || !draft.trim()) return;
    sendDm(selectedUserId, draft);
    setDraft('');
    sendTyping(selectedUserId, false);
  };

  const handleDraftChange = (value: string): void => {
    setDraft(value);
    if (selectedUserId == null) return;
    sendTyping(selectedUserId, true);
    if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = window.setTimeout(() => {
      if (selectedUserId != null) sendTyping(selectedUserId, false);
    }, 1500);
  };

  if (currentUserId == null || !authUser) return null;

  return (
    <div
      className={cn(
        'fixed bottom-12 right-5 z-40 flex flex-col items-end gap-3 font-sans antialiased transition-opacity duration-200',
        blockingOverlayOpen && 'pointer-events-none opacity-0'
      )}
      aria-hidden={blockingOverlayOpen}
    >
      {isOpen && (
        <div className="flex h-[70vh] max-h-[600px] w-[94vw] max-w-[740px] overflow-hidden rounded-2xl border border-[var(--crm-app-border)] bg-[var(--crm-app-panel)] text-slate-100 shadow-2xl shadow-black/60 ring-1 ring-black/20">
          {/* Sol: kisi listesi */}
          <div className="flex w-[248px] shrink-0 flex-col border-r border-[var(--crm-app-border)] bg-[var(--crm-app-list-card)]">
            <div className="border-b border-[var(--crm-app-border)] px-4 py-3.5">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-[var(--crm-brand-accent)]" />
                <span className="text-[15px] font-bold tracking-tight text-slate-50">Sohbet</span>
                {connectionStatus === 'connected' ? (
                  <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_1px_rgba(52,211,153,0.7)]" />
                    {onlineCount} çevrimiçi
                  </span>
                ) : (
                  <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    {connectionStatus === 'connecting' ? 'Bağlanıyor…' : 'Sunucu yok'}
                  </span>
                )}
              </div>
              <div className="relative mt-3">
                <Search
                  size={14}
                  className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--crm-app-text-muted)]"
                />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Kişi ara..."
                  className="h-9 rounded-lg border-[var(--crm-app-border)] bg-[var(--crm-app-input)] pl-8 text-[13px]"
                />
              </div>
            </div>

            <div className="custom-scrollbar flex-1 overflow-y-auto py-1">
              {contacts.length === 0 ? (
                <div className="px-4 py-8 text-center text-xs text-[var(--crm-app-text-muted)]">
                  Kullanıcı bulunamadı
                </div>
              ) : (
                <ul className="space-y-0.5 px-1.5">
                  {contacts.map((contact) => {
                    const online = onlineSet.has(contact.id);
                    const unread = unreadByUser[contact.id] ?? 0;
                    const conversation = messagesByUser[contact.id];
                    const last = conversation?.[conversation.length - 1];
                    const isActive = selectedUserId === contact.id;
                    return (
                      <li key={contact.id}>
                        <button
                          type="button"
                          onClick={() => handleSelect(contact.id)}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors',
                            isActive
                              ? 'bg-[var(--crm-brand-soft)] ring-1 ring-[var(--crm-brand-primary)]/30'
                              : 'hover:bg-[var(--crm-app-panel-muted)]'
                          )}
                        >
                          <span className="relative shrink-0">
                            <span
                              className={cn(
                                'flex h-10 w-10 items-center justify-center rounded-full text-[13px] font-bold',
                                toneFor(contact.id)
                              )}
                            >
                              {initials(contact.name)}
                            </span>
                            <span
                              className={cn(
                                'absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[var(--crm-app-list-card)]',
                                online
                                  ? 'bg-emerald-400 shadow-[0_0_6px_1px_rgba(52,211,153,0.7)]'
                                  : 'bg-slate-500'
                              )}
                            />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-1.5">
                              <span className="truncate text-[13.5px] font-semibold tracking-tight text-slate-100">
                                {contact.name}
                              </span>
                              {unread > 0 && (
                                <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1.5 text-[11px] font-bold text-white">
                                  {unread}
                                </span>
                              )}
                            </span>
                            <span
                              className={cn(
                                'mt-0.5 block truncate text-xs',
                                typingByUser[contact.id]
                                  ? 'font-medium text-emerald-300'
                                  : 'text-[var(--crm-app-text-muted)]'
                              )}
                            >
                              {typingByUser[contact.id]
                                ? 'yazıyor…'
                                : last?.text || (online ? 'Çevrimiçi' : 'Çevrimdışı')}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* Sag: mesaj alani */}
          <div className="flex min-w-0 flex-1 flex-col bg-[var(--crm-app-panel)]">
            <div className="flex items-center gap-3 border-b border-[var(--crm-app-border)] bg-[var(--crm-app-list-card)] px-4 py-3">
              {selectedUser ? (
                <>
                  <span className="relative shrink-0">
                    <span
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold',
                        toneFor(selectedUser.id)
                      )}
                    >
                      {initials(selectedUser.name)}
                    </span>
                    <span
                      className={cn(
                        'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[var(--crm-app-list-card)]',
                        onlineSet.has(selectedUser.id)
                          ? 'bg-emerald-400 shadow-[0_0_6px_1px_rgba(52,211,153,0.7)]'
                          : 'bg-slate-500'
                      )}
                    />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold tracking-tight text-slate-50">
                      {selectedUser.name}
                    </p>
                    <p
                      className={cn(
                        'text-[11px] font-medium',
                        partnerTyping
                          ? 'text-emerald-300'
                          : onlineSet.has(selectedUser.id)
                            ? 'text-emerald-400/80'
                            : 'text-[var(--crm-app-text-muted)]'
                      )}
                    >
                      {partnerTyping
                        ? 'yazıyor…'
                        : onlineSet.has(selectedUser.id)
                          ? 'Çevrimiçi'
                          : 'Çevrimdışı'}
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-sm font-semibold text-slate-300">Bir kişi seçin</p>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-[var(--crm-app-panel-muted)] hover:text-slate-200"
                aria-label="Kapat"
              >
                <X size={17} />
              </button>
            </div>

            {selectedUser ? (
              <>
                <div className="custom-scrollbar flex-1 space-y-1.5 overflow-y-auto bg-[var(--crm-app-panel-muted)]/30 px-4 py-4">
                  {messages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-500">
                      <MessageCircle size={30} />
                      <p className="text-xs">Henüz mesaj yok. İlk mesajı gönderin.</p>
                    </div>
                  ) : (
                    messages.map((message, index) => {
                      const mine = Number(message.fromUserId) === Number(currentUserId);
                      const prev = messages[index - 1];
                      const grouped = prev && Number(prev.fromUserId) === Number(message.fromUserId);
                      return (
                        <div
                          key={message.id}
                          className={cn(
                            'flex',
                            mine ? 'justify-end' : 'justify-start',
                            grouped ? 'mt-0.5' : 'mt-2.5'
                          )}
                        >
                          <div
                            className={cn(
                              'max-w-[72%] px-3.5 py-2 text-[13.5px] leading-relaxed shadow-sm',
                              mine
                                ? 'rounded-2xl rounded-br-md bg-[var(--crm-brand-primary)] font-medium text-white shadow-md ring-1 ring-[color-mix(in_srgb,var(--crm-brand-accent)_35%,transparent)]'
                                : 'rounded-2xl rounded-bl-md border border-[var(--crm-app-border)] bg-[var(--crm-app-panel-strong)] text-slate-100',
                              message.pending && 'opacity-60'
                            )}
                          >
                            <p className="whitespace-pre-wrap break-words">{message.text}</p>
                            <p
                              className={cn(
                                'mt-0.5 text-right text-[10px]',
                                mine ? 'text-white/70' : 'text-[var(--crm-app-text-muted)]'
                              )}
                            >
                              {timeShort(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  {partnerTyping && (
                    <div className="flex justify-start pt-1">
                      <div className="rounded-2xl rounded-bl-md border border-[var(--crm-app-border)] bg-[var(--crm-app-panel-strong)] px-3.5 py-2.5">
                        <span className="flex gap-1">
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                        </span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="flex items-center gap-2 border-t border-[var(--crm-app-border)] bg-[var(--crm-app-list-card)] p-3">
                  <Input
                    value={draft}
                    onChange={(event) => handleDraftChange(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Mesaj yazın…"
                    className="h-11 rounded-full border-[var(--crm-app-border)] bg-[var(--crm-app-input)] px-4 text-[13.5px]"
                  />
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!draft.trim()}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--crm-brand-primary)] text-white shadow-md ring-1 ring-[color-mix(in_srgb,var(--crm-brand-accent)_40%,transparent)] transition-all hover:brightness-110 active:scale-95 disabled:opacity-40"
                    aria-label="Gönder"
                  >
                    <Send size={17} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-[var(--crm-app-panel-muted)]/30 text-slate-500">
                <MessageCircle size={40} />
                <p className="text-sm">Sohbet başlatmak için soldan bir kişi seçin</p>
              </div>
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen(!isOpen)}
        className={cn(
          'group relative flex h-14 items-center gap-2.5 rounded-full pl-4 pr-5 font-bold tracking-tight text-white shadow-xl shadow-black/40 transition-transform hover:scale-[1.03] active:scale-95',
          'bg-[var(--crm-brand-primary,#c9a227)] ring-1 ring-[color-mix(in_srgb,var(--crm-brand-accent,#e8c547)_35%,transparent)] hover:brightness-110'
        )}
        aria-label="Sohbet"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/15">
          {isOpen ? <X size={18} /> : <MessageCircle size={18} />}
        </span>
        <span className="text-sm">Sohbet</span>
        {!isOpen && totalUnread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[11px] font-bold text-white ring-2 ring-[var(--crm-app-bg,#0c0516)]">
            {totalUnread}
          </span>
        )}
        {!isOpen && connectionStatus === 'disconnected' && (
          <span
            className="absolute -left-1 -top-1 h-3.5 w-3.5 rounded-full bg-amber-500 ring-2 ring-[var(--crm-app-bg,#0c0516)]"
            title="Sohbet sunucusuna bağlanılamadı"
          />
        )}
      </button>
    </div>
  );
}
