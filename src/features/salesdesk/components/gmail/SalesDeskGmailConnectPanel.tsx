import { type ReactElement, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, Info, KeyRound, Loader2, Mail, Save, Unplug, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useSalesDeskGmailConnectionStore } from '../../stores/salesdesk-gmail-connection-store';
import { testGmailConnection } from '../../api/gmail-bridge-api';
import {
  SD_CREATE_FORM_INPUT_CLASSNAME,
  SD_CREATE_FORM_LABEL_CLASSNAME,
} from '../../lib/salesdesk-document-create-styles';
import { SD_DOCUMENT_BUTTON_SAVE } from '../../lib/salesdesk-document-button-styles';
import { formatDate } from '../../lib/salesdesk-shared';

interface SalesDeskGmailConnectPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type FeedbackState = { type: 'success' | 'error'; message: string } | null;

export function SalesDeskGmailConnectPanel({
  open,
  onOpenChange,
}: SalesDeskGmailConnectPanelProps): ReactElement {
  const { connected, email, appPassword, count, connectedAt, setConnection, disconnect } =
    useSalesDeskGmailConnectionStore();
  const queryClient = useQueryClient();

  const [draftEmail, setDraftEmail] = useState('');
  const [draftPassword, setDraftPassword] = useState('');
  const [draftCount, setDraftCount] = useState('30');
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  useEffect(() => {
    if (open) {
      setDraftEmail(email ?? '');
      setDraftPassword(appPassword ?? '');
      setDraftCount(String(count ?? 30));
      setFeedback(null);
    }
  }, [open, email, appPassword, count]);

  const credentials = {
    email: draftEmail.trim(),
    appPassword: draftPassword.replace(/\s+/g, ''),
  };
  const canSubmit = Boolean(credentials.email && credentials.appPassword);

  const handleTest = async (): Promise<void> => {
    if (!canSubmit) return;
    setTesting(true);
    setFeedback(null);
    try {
      await testGmailConnection(credentials);
      setFeedback({ type: 'success', message: 'Baglanti basarili. Kaydedebilirsiniz.' });
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Baglanti basarisiz.' });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async (): Promise<void> => {
    if (!canSubmit) return;
    setSaving(true);
    setFeedback(null);
    try {
      await testGmailConnection(credentials);
      const parsedCount = Math.min(Math.max(Number(draftCount) || 30, 1), 100);
      setConnection({ ...credentials, count: parsedCount });
      await queryClient.invalidateQueries({ queryKey: ['salesdesk', 'gmail-bridge'] });
      onOpenChange(false);
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Baglanti kaydedilemedi.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'gap-0 overflow-hidden !p-0 sm:max-w-[540px]',
          'rounded-2xl border border-[var(--crm-app-border)] bg-[var(--crm-app-dialog)] shadow-2xl shadow-black/50'
        )}
      >
        <div className="flex items-center gap-3.5 border-b border-[var(--crm-app-border)] px-6 py-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--crm-brand-primary)_18%,transparent)] text-[var(--crm-brand-accent)] ring-1 ring-[color-mix(in_srgb,var(--crm-brand-primary)_30%,transparent)]">
            <Mail className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <DialogTitle className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
              Gmail Baglantisi
            </DialogTitle>
            <DialogDescription className="mt-0.5 text-xs text-[var(--crm-app-text-muted)]">
              Mail adresi ve uygulama sifresi ile gelen kutunuzu baglayin.
            </DialogDescription>
          </div>
          {connected && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/12 px-3 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Bagli
            </span>
          )}
        </div>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto px-6 py-5">
          {connected && (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-emerald-200">{email}</p>
                <p className="text-xs text-emerald-300/70">
                  {connectedAt ? `${formatDate(connectedAt)} tarihinde baglandi` : 'Bagli'}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="h-9 rounded-lg text-rose-300 hover:bg-rose-500/10 hover:text-rose-200"
                onClick={() => {
                  disconnect();
                  queryClient.removeQueries({ queryKey: ['salesdesk', 'gmail-bridge'] });
                }}
              >
                <Unplug className="mr-2 h-4 w-4" />
                Kes
              </Button>
            </div>
          )}

          <div className="space-y-1.5">
            <Label className={SD_CREATE_FORM_LABEL_CLASSNAME}>Gmail Adresi</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--crm-app-text-muted)]" />
              <Input
                type="email"
                placeholder="ornek@gmail.com"
                className={cn(SD_CREATE_FORM_INPUT_CLASSNAME, 'pl-9')}
                value={draftEmail}
                onChange={(event) => setDraftEmail(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className={SD_CREATE_FORM_LABEL_CLASSNAME}>Uygulama Sifresi</Label>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--crm-app-text-muted)]" />
              <Input
                type="text"
                placeholder="xxxx xxxx xxxx xxxx"
                autoComplete="off"
                className={cn(SD_CREATE_FORM_INPUT_CLASSNAME, 'pl-9 font-mono tracking-wide')}
                value={draftPassword}
                onChange={(event) => setDraftPassword(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className={SD_CREATE_FORM_LABEL_CLASSNAME}>Okunacak Adet</Label>
            <Input
              type="number"
              min={1}
              max={100}
              className={SD_CREATE_FORM_INPUT_CLASSNAME}
              value={draftCount}
              onChange={(event) => setDraftCount(event.target.value)}
            />
          </div>

          {feedback && (
            <div
              className={cn(
                'flex items-start gap-2.5 rounded-xl border px-4 py-3 text-xs leading-relaxed',
                feedback.type === 'success'
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                  : 'border-rose-500/30 bg-rose-500/10 text-rose-200'
              )}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              ) : (
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button
              type="button"
              className={cn('h-11 flex-1 rounded-xl font-bold', SD_DOCUMENT_BUTTON_SAVE)}
              disabled={!canSubmit || saving || testing}
              onClick={handleSave}
            >
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Kaydet
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl border-[var(--crm-app-border)] px-5"
              disabled={!canSubmit || testing || saving}
              onClick={handleTest}
            >
              {testing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wifi className="mr-2 h-4 w-4" />}
              Baglantiyi Test Et
            </Button>
          </div>

          <div className="flex items-start gap-2.5 rounded-xl border border-[var(--crm-app-border)] bg-[var(--crm-app-panel-muted)] px-4 py-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--crm-brand-accent)]" />
            <div className="space-y-1 text-xs leading-relaxed text-[var(--crm-app-text-muted)]">
              <p>
                <b className="text-slate-200">Uygulama sifresi</b> normal Gmail sifreniz degildir.
                Google Hesabi &rarr; Guvenlik &rarr; 2 Adimli Dogrulama acikken{' '}
                <a
                  href="https://myaccount.google.com/apppasswords"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[var(--crm-brand-accent)] underline"
                >
                  Uygulama sifreleri
                </a>{' '}
                sayfasindan olusturulur (16 haneli).
              </p>
              <p>Gmail &rarr; Ayarlar &rarr; "Yonlendirme ve POP/IMAP" bolumunden IMAP acik olmali.</p>
              <p className="text-amber-300/80">
                Baglantinin calismasi icin yerel kopru gerekir: terminalde{' '}
                <code className="rounded bg-black/30 px-1">npm run gmail:bridge</code>.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
