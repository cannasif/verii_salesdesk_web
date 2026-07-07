import { type ReactElement, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  CalendarClock,
  CheckCheck,
  Inbox,
  Mail,
  MailOpen,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { buildSalesDeskDeleteDescription, SalesDeskDeleteDialog } from '../SalesDeskDeleteDialog';
import { cn } from '@/lib/utils';
import type { SalesDeskGmailMessageDto } from '../../api/salesdesk-api';
import { SalesDeskEntityForm } from '../SalesDeskEntityForm';
import {
  useCreateSalesDeskGmail,
  useDeleteSalesDeskGmail,
  useSalesDeskGmailList,
  useUpdateSalesDeskGmail,
} from '../../hooks/useSalesDeskModules';
import { useGmailInbox } from '../../hooks/useSalesDeskGmailBridge';
import { formatDate, formatTime } from '../../lib/salesdesk-shared';
import {
  gmailFormSchema,
  toGmailFormValues,
  type GmailFormValues,
} from '../../types/salesdesk-schemas';
import {
  SD_ADD_BUTTON,
  SD_PAGE_ICON_BOX,
  SD_SECONDARY_BUTTON,
} from '../../lib/salesdesk-popup-styles';
import { useSalesDeskGmailConnectionStore } from '../../stores/salesdesk-gmail-connection-store';
import { useSalesDeskMeetingStore } from '../../stores/salesdesk-meeting-store';
import { SalesDeskGmailConnectPanel } from './SalesDeskGmailConnectPanel';

type InboxTab = 'all' | 'unread' | 'meeting';

interface InboxItem {
  key: string;
  sender: string;
  subject: string;
  preview: string;
  receivedAt: string;
  isUnread: boolean;
  isMeeting: boolean;
  source: 'gmail' | 'record';
  threadId?: string;
  record?: SalesDeskGmailMessageDto;
}

const TABS: Array<{ id: InboxTab; label: string }> = [
  { id: 'all', label: 'Tumu' },
  { id: 'unread', label: 'Okunmamis' },
  { id: 'meeting', label: 'Toplantilar' },
];

const AVATAR_TONES = [
  'bg-indigo-500/20 text-indigo-300',
  'bg-emerald-500/20 text-emerald-300',
  'bg-amber-500/20 text-amber-300',
  'bg-sky-500/20 text-sky-300',
  'bg-fuchsia-500/20 text-fuchsia-300',
  'bg-rose-500/20 text-rose-300',
];

function senderName(sender: string): string {
  const match = sender.match(/^\s*"?([^"<]+?)"?\s*</);
  return (match?.[1] ?? sender).trim();
}

function initials(sender: string): string {
  const name = senderName(sender);
  const parts = name.replace(/[<>@].*$/, '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return name.charAt(0).toLocaleUpperCase('tr') || '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toLocaleUpperCase('tr');
  return `${parts[0][0]}${parts[1][0]}`.toLocaleUpperCase('tr');
}

function toneForSender(sender: string): string {
  let hash = 0;
  for (let i = 0; i < sender.length; i += 1) hash = (hash + sender.charCodeAt(i)) % AVATAR_TONES.length;
  return AVATAR_TONES[hash];
}

export function SalesDeskGmailInbox(): ReactElement {
  const [activeTab, setActiveTab] = useState<InboxTab>('all');
  const [search, setSearch] = useState('');
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SalesDeskGmailMessageDto | null>(null);
  const [deleting, setDeleting] = useState<SalesDeskGmailMessageDto | null>(null);
  const [connectOpen, setConnectOpen] = useState(false);

  const connection = useSalesDeskGmailConnectionStore();
  const connected = connection.connected;
  const markAllSeen = useSalesDeskMeetingStore((state) => state.markAllSeen);
  const queryClient = useQueryClient();

  const gmailInbox = useGmailInbox();
  const recordList = useSalesDeskGmailList({
    pageNumber: 1,
    pageSize: 100,
    sortBy: 'ReceivedAt',
    sortDirection: 'desc',
  });
  const createGmail = useCreateSalesDeskGmail();
  const updateGmail = useUpdateSalesDeskGmail();
  const deleteGmail = useDeleteSalesDeskGmail();

  useEffect(() => {
    markAllSeen();
  }, [markAllSeen]);

  const items = useMemo<InboxItem[]>(() => {
    if (connected) {
      return (gmailInbox.data ?? []).map((message) => ({
        key: `g-${message.id}`,
        sender: message.sender,
        subject: message.subject,
        preview: message.preview,
        receivedAt: message.receivedAt,
        isUnread: message.isUnread,
        isMeeting: message.isMeeting,
        source: 'gmail' as const,
        threadId: message.threadId,
      }));
    }
    return (recordList.data?.data ?? []).map((record) => ({
      key: `record-${record.id}`,
      sender: record.sender,
      subject: record.subject,
      preview: record.preview ?? '',
      receivedAt: record.receivedAt,
      isUnread: record.isUnread,
      isMeeting: record.isMeeting,
      source: 'record' as const,
      threadId: record.threadId ?? undefined,
      record,
    }));
  }, [connected, gmailInbox.data, recordList.data?.data]);

  const isLoading = connected ? gmailInbox.isLoading : recordList.isLoading;
  const isFetching = connected ? gmailInbox.isFetching : recordList.isFetching;
  const activeError = connected ? gmailInbox.error : recordList.error;
  const refetch = connected ? gmailInbox.refetch : recordList.refetch;

  const totalCount = items.length;
  const unreadCount = items.filter((item) => item.isUnread).length;
  const meetingCount = items.filter((item) => item.isMeeting).length;

  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('tr');
    return items.filter((message) => {
      if (activeTab === 'unread' && !message.isUnread) return false;
      if (activeTab === 'meeting' && !message.isMeeting) return false;
      if (!term) return true;
      return (
        message.subject.toLocaleLowerCase('tr').includes(term) ||
        message.sender.toLocaleLowerCase('tr').includes(term) ||
        message.preview.toLocaleLowerCase('tr').includes(term)
      );
    });
  }, [items, activeTab, search]);

  const selected = useMemo(
    () => items.find((message) => message.key === selectedKey) ?? null,
    [items, selectedKey]
  );

  const handleSubmit = async (values: GmailFormValues): Promise<void> => {
    if (editing) {
      await updateGmail.mutateAsync({ id: editing.id, values });
    } else {
      await createGmail.mutateAsync(values);
    }
    await queryClient.invalidateQueries({ queryKey: ['salesdesk', 'gmail', 'meeting-watch'] });
  };

  const handleMarkRead = async (record: SalesDeskGmailMessageDto): Promise<void> => {
    await updateGmail.mutateAsync({
      id: record.id,
      values: { ...toGmailFormValues(record), isUnread: false },
    });
  };

  return (
    <div className="space-y-5 text-slate-100">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <div className={SD_PAGE_ICON_BOX}>
            <Mail size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-50">Gmail</h1>
            <p className="mt-1 text-sm text-slate-400">
              {connected
                ? 'Gerçek gelen kutunuz · yeni toplantilar otomatik bildirilir'
                : 'Hesabinizi baglayin, gerçek gelen kutunuzu goruntuleyin'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setConnectOpen(true)}
            className={cn(
              SD_SECONDARY_BUTTON,
              'inline-flex items-center gap-2',
              connected && 'text-emerald-300'
            )}
          >
            <span className={cn('h-2 w-2 rounded-full', connected ? 'bg-emerald-400' : 'bg-slate-500')} />
            {connected ? connection.email || 'Bagli' : 'Gmail Bagla'}
          </button>
          {!connected && (
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
              className={SD_ADD_BUTTON}
            >
              <Plus size={16} />
              Kayit Ekle
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <KpiChip icon={<Inbox size={14} />} label="Toplam" value={totalCount} />
        <KpiChip icon={<Mail size={14} />} label="Okunmamis" value={unreadCount} tone="amber" />
        <KpiChip icon={<CalendarClock size={14} />} label="Toplanti" value={meetingCount} tone="emerald" />
      </div>

      {activeError && (
        <div className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {(activeError as Error)?.message || 'Mesajlar yuklenemedi.'}
          {connected && ' Baglantiyi yenilemek icin "Gmail Bagla" ile tekrar giris yapin.'}
        </div>
      )}

      <div className="grid h-[calc(100vh-320px)] min-h-[520px] grid-cols-1 gap-4 lg:grid-cols-[minmax(0,400px)_1fr]">
        <div className="flex flex-col overflow-hidden rounded-2xl border border-[var(--crm-app-border)] bg-[var(--crm-app-list-card)]">
          <div className="border-b border-[var(--crm-app-border)] p-3">
            <div className="relative">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--crm-app-text-muted)]"
              />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Mesajlarda ara..."
                className="h-10 rounded-lg border-[var(--crm-app-border)] bg-[var(--crm-app-input)] pl-9 text-sm"
              />
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
                    activeTab === tab.id
                      ? 'bg-[var(--crm-brand-soft)] text-[var(--crm-brand-accent)] ring-1 ring-[color-mix(in_srgb,var(--crm-brand-primary)_30%,transparent)]'
                      : 'text-slate-400 hover:bg-[var(--crm-app-panel-muted)] hover:text-slate-200'
                  )}
                >
                  {tab.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => refetch()}
                className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-[var(--crm-app-panel-muted)] hover:text-slate-200"
                aria-label="Yenile"
              >
                <RefreshCw size={15} className={isFetching ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          <div className="custom-scrollbar flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex h-full items-center justify-center py-16 text-sm text-slate-400">
                Yukleniyor...
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 py-16 text-slate-500">
                <Inbox size={32} />
                <p className="text-sm">Mesaj bulunamadi</p>
                {!connected && (
                  <button
                    type="button"
                    onClick={() => setConnectOpen(true)}
                    className="mt-1 text-xs font-semibold text-[var(--crm-brand-accent)] underline"
                  >
                    Gmail hesabinizi baglayin
                  </button>
                )}
              </div>
            ) : (
              <ul className="divide-y divide-[var(--crm-app-border)]">
                {filtered.map((message) => (
                  <li key={message.key}>
                    <button
                      type="button"
                      onClick={() => setSelectedKey(message.key)}
                      className={cn(
                        'flex w-full items-start gap-3 px-3.5 py-3 text-left transition-colors',
                        selectedKey === message.key
                          ? 'bg-[var(--crm-brand-soft)]'
                          : 'hover:bg-[var(--crm-app-panel-muted)]'
                      )}
                    >
                      <span
                        className={cn(
                          'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                          toneForSender(message.sender)
                        )}
                      >
                        {initials(message.sender)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span
                            className={cn(
                              'truncate text-sm',
                              message.isUnread ? 'font-bold text-slate-50' : 'font-medium text-slate-300'
                            )}
                          >
                            {senderName(message.sender)}
                          </span>
                          <span className="ml-auto shrink-0 text-[11px] text-[var(--crm-app-text-muted)]">
                            {formatDate(message.receivedAt)}
                          </span>
                        </span>
                        <span
                          className={cn(
                            'mt-0.5 block truncate text-[13px]',
                            message.isUnread ? 'font-semibold text-slate-200' : 'text-slate-400'
                          )}
                        >
                          {message.subject}
                        </span>
                        <span className="mt-0.5 flex items-center gap-2">
                          <span className="truncate text-xs text-[var(--crm-app-text-muted)]">
                            {message.preview.slice(0, 60) || '-'}
                          </span>
                          {message.isMeeting && (
                            <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/12 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 ring-1 ring-emerald-500/30">
                              <CalendarClock size={11} />
                              Toplanti
                            </span>
                          )}
                          {message.isUnread && !message.isMeeting && (
                            <span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-[var(--crm-brand-primary)]" />
                          )}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="hidden flex-col overflow-hidden rounded-2xl border border-[var(--crm-app-border)] bg-[var(--crm-app-list-card)] lg:flex">
          {selected ? (
            <>
              <div className="border-b border-[var(--crm-app-border)] p-5">
                {selected.isMeeting && (
                  <div className="mb-3 inline-flex items-center gap-2 rounded-lg bg-emerald-500/12 px-3 py-1.5 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-500/30">
                    <CalendarClock size={14} />
                    Toplanti daveti
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      'flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                      toneForSender(selected.sender)
                    )}
                  >
                    {initials(selected.sender)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-semibold text-slate-50">{selected.subject}</h2>
                    <p className="mt-0.5 truncate text-sm text-slate-400">{selected.sender}</p>
                    <p className="mt-0.5 text-xs text-[var(--crm-app-text-muted)]">
                      {formatDate(selected.receivedAt)} · {formatTime(selected.receivedAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {selected.source === 'gmail' ? (
                      <span className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[var(--crm-app-border)] px-3 text-xs text-[var(--crm-app-text-muted)]">
                        <Mail size={14} />
                        Salt okunur
                      </span>
                    ) : (
                      <>
                        {selected.isUnread && selected.record && (
                          <Button
                            type="button"
                            variant="outline"
                            className="h-9 rounded-lg px-3 text-xs"
                            disabled={updateGmail.isPending}
                            onClick={() => handleMarkRead(selected.record!)}
                          >
                            <CheckCheck size={15} className="mr-1.5" />
                            Okundu
                          </Button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            if (!selected.record) return;
                            setEditing(selected.record);
                            setFormOpen(true);
                          }}
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-[var(--crm-app-panel-muted)] hover:text-slate-200"
                          aria-label="Duzenle"
                        >
                          <MailOpen size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => selected.record && setDeleting(selected.record)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-rose-400 transition-colors hover:bg-rose-500/10"
                          aria-label="Sil"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="custom-scrollbar flex-1 overflow-y-auto p-5">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
                  {selected.preview || 'Bu mesaj icin onizleme icerigi bulunmuyor.'}
                </p>
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-500">
              <MailOpen size={40} />
              <p className="text-sm">Okumak icin bir mesaj secin</p>
            </div>
          )}
        </div>
      </div>

      <SalesDeskGmailConnectPanel open={connectOpen} onOpenChange={setConnectOpen} />

      <SalesDeskEntityForm
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editing ? 'Mesaji Duzenle' : 'Yeni Gmail Kaydi'}
        description="Gmail mesaj bilgilerini girin."
        schema={gmailFormSchema}
        defaultValues={toGmailFormValues()}
        entity={editing}
        mapEntityToForm={(entity) => toGmailFormValues(entity as SalesDeskGmailMessageDto)}
        onSubmit={handleSubmit}
        isLoading={createGmail.isPending || updateGmail.isPending}
        fields={[
          { name: 'gmailMessageId', label: 'Mesaj ID', required: true },
          { name: 'sender', label: 'Gonderen', required: true },
          { name: 'subject', label: 'Konu', required: true, colSpan: 2 },
          { name: 'receivedAt', label: 'Alim Tarihi', type: 'date', required: true },
          { name: 'threadId', label: 'Thread ID' },
          { name: 'preview', label: 'Onizleme', type: 'textarea', colSpan: 2 },
          { name: 'isUnread', label: 'Okunmadi', type: 'checkbox' },
          { name: 'isMeeting', label: 'Toplanti', type: 'checkbox' },
        ]}
      />

      <SalesDeskDeleteDialog
        open={deleting != null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Kaydi sil"
        description={
          deleting
            ? buildSalesDeskDeleteDescription(deleting.subject)
            : 'Bu islem geri alinamaz.'
        }
        onConfirm={async () => {
          if (!deleting) return;
          await deleteGmail.mutateAsync(deleting.id);
          if (selectedKey === `record-${deleting.id}`) setSelectedKey(null);
          setDeleting(null);
        }}
        isDeleting={deleteGmail.isPending}
      />
    </div>
  );
}

function KpiChip({
  icon,
  label,
  value,
  tone = 'brand',
}: {
  icon: ReactElement;
  label: string;
  value: number;
  tone?: 'brand' | 'amber' | 'emerald';
}): ReactElement {
  const toneClass =
    tone === 'amber'
      ? 'text-amber-300'
      : tone === 'emerald'
        ? 'text-emerald-300'
        : 'text-[var(--crm-brand-accent)]';
  return (
    <div className="inline-flex items-center gap-2 rounded-xl border border-[var(--crm-app-border)] bg-[var(--crm-app-list-card)] px-3.5 py-2">
      <span className={toneClass}>{icon}</span>
      <span className="text-sm font-bold text-slate-100">{value}</span>
      <span className="text-xs text-[var(--crm-app-text-muted)]">{label}</span>
    </div>
  );
}
