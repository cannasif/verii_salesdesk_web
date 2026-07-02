import { type ReactElement, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, CalendarClock, CalendarX2, Radio } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSalesDeskGmailList } from '../../hooks/useSalesDeskModules';
import { useGmailInbox } from '../../hooks/useSalesDeskGmailBridge';
import { useSalesDeskGmailConnectionStore } from '../../stores/salesdesk-gmail-connection-store';
import { useSalesDeskMeetingStore } from '../../stores/salesdesk-meeting-store';
import { formatDate, formatTime } from '../../lib/salesdesk-shared';

interface CardMeeting {
  id: string;
  subject: string;
  sender: string;
  receivedAt: string;
}

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
  const name = senderName(sender).replace(/[<>@].*$/, '').trim();
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toLocaleUpperCase('tr');
  return `${parts[0][0]}${parts[1][0]}`.toLocaleUpperCase('tr');
}

function toneForSender(sender: string): string {
  let hash = 0;
  for (let i = 0; i < sender.length; i += 1) hash = (hash + sender.charCodeAt(i)) % AVATAR_TONES.length;
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
  return formatDate(value);
}

export function SalesDeskMeetingsCard(): ReactElement {
  const navigate = useNavigate();
  const connected = useSalesDeskGmailConnectionStore((state) => state.connected);
  const unseenCount = useSalesDeskMeetingStore((state) => state.unseenCount);
  const gmailInbox = useGmailInbox();
  const recordList = useSalesDeskGmailList({
    pageNumber: 1,
    pageSize: 50,
    sortBy: 'ReceivedAt',
    sortDirection: 'desc',
  });

  const isLoading = connected ? gmailInbox.isLoading : recordList.isLoading;

  const meetings = useMemo<CardMeeting[]>(() => {
    const source = connected
      ? (gmailInbox.data ?? []).filter((message) => message.isMeeting)
      : (recordList.data?.data ?? [])
          .filter((message) => message.isMeeting)
          .map((message) => ({ ...message, id: `record-${message.id}` }));
    return source.slice(0, 5).map((message) => ({
      id: String(message.id),
      subject: message.subject,
      sender: message.sender,
      receivedAt: message.receivedAt,
    }));
  }, [connected, gmailInbox.data, recordList.data?.data]);

  return (
    <section className="group relative overflow-hidden rounded-2xl border border-[var(--crm-app-border)] bg-[var(--crm-app-list-card)] shadow-lg shadow-black/10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-emerald-500/10 to-transparent" />

      <div className="relative flex items-center gap-3 border-b border-[var(--crm-app-border)] px-5 py-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/25 to-emerald-500/5 text-emerald-300 ring-1 ring-emerald-500/25">
          <CalendarClock size={21} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-bold text-slate-50">Toplantilar</h2>
            {unseenCount > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1.5 text-[11px] font-bold text-white shadow-sm shadow-emerald-500/40">
                {unseenCount}
              </span>
            )}
          </div>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-[var(--crm-app-text-muted)]">
            {connected ? (
              <>
                <Radio size={11} className="text-emerald-400" />
                <span>Canli · Gmail gelen kutusu</span>
              </>
            ) : (
              'Gmail toplanti davetleri'
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/salesdesk/gmail')}
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
        ) : meetings.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-9 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--crm-app-panel-muted)] text-slate-500">
              <CalendarX2 size={22} />
            </div>
            <p className="text-sm font-medium text-slate-300">Yaklasan toplanti yok</p>
            <p className="max-w-[220px] text-xs text-[var(--crm-app-text-muted)]">
              {connected
                ? 'Yeni bir toplanti daveti geldiginde burada gorunecek.'
                : 'Gmail hesabinizi baglayarak toplanti davetlerini otomatik takip edin.'}
            </p>
            {!connected && (
              <button
                type="button"
                onClick={() => navigate('/salesdesk/gmail')}
                className="mt-1 text-xs font-semibold text-[var(--crm-brand-accent)] underline"
              >
                Gmail'i bagla
              </button>
            )}
          </div>
        ) : (
          <ul className="space-y-1">
            {meetings.map((meeting) => (
              <li key={meeting.id}>
                <button
                  type="button"
                  onClick={() => navigate('/salesdesk/gmail')}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors',
                    'hover:bg-[var(--crm-brand-soft)]'
                  )}
                >
                  <span
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold',
                      toneForSender(meeting.sender)
                    )}
                  >
                    {initials(meeting.sender)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-100">
                      {meeting.subject}
                    </span>
                    <span className="block truncate text-xs text-[var(--crm-app-text-muted)]">
                      {senderName(meeting.sender)}
                    </span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-0.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/12 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 ring-1 ring-emerald-500/25">
                      <CalendarClock size={10} />
                      {formatTime(meeting.receivedAt)}
                    </span>
                    <span className="text-[10px] text-[var(--crm-app-text-muted)]">
                      {relativeTime(meeting.receivedAt)}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {meetings.length > 0 && (
        <button
          type="button"
          onClick={() => navigate('/salesdesk/gmail')}
          className="relative flex w-full items-center justify-center gap-1.5 border-t border-[var(--crm-app-border)] py-2.5 text-xs font-semibold text-[var(--crm-brand-accent)] transition-colors hover:bg-[var(--crm-brand-soft)]"
        >
          Tum toplantilari gor
          <ArrowUpRight size={13} />
        </button>
      )}
    </section>
  );
}
