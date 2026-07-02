// @ts-nocheck
/**
 * Gmail IMAP kopru rotalari (Express router olarak eklenir).
 * Ayrinti icin bkz. server/index.mjs
 */

import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';

function createClient(email, appPassword) {
  return new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: { user: email, pass: appPassword },
    logger: false,
  });
}

function formatAddress(address) {
  if (!address?.value?.length) return '';
  return address.value
    .map((entry) => (entry.name ? `${entry.name} <${entry.address}>` : entry.address))
    .join(', ');
}

function detectMeeting(parsed) {
  const from = (parsed.from?.text || '').toLowerCase();
  const subject = (parsed.subject || '').toLowerCase();

  const hasCalendarAttachment = (parsed.attachments || []).some((att) => {
    const ct = (att.contentType || '').toLowerCase();
    const name = (att.filename || '').toLowerCase();
    return ct.includes('text/calendar') || ct.includes('application/ics') || name.endsWith('.ics');
  });

  const headerContentType = (parsed.headers?.get('content-type')?.value || '').toLowerCase();
  const hasCalendarHeader = headerContentType.includes('text/calendar');

  const fromCalendar =
    from.includes('calendar-notification@google.com') || from.includes('calendar-server');

  const meetingSubject =
    /^(invitation:|updated invitation|accepted:|declined:|davet:|güncellenen davet)/i.test(subject) ||
    subject.includes('toplant') ||
    subject.includes('meeting') ||
    subject.includes('google meet') ||
    subject.includes('zoom') ||
    subject.includes('teams');

  return hasCalendarAttachment || hasCalendarHeader || fromCalendar || meetingSubject;
}

async function fetchMessages(email, appPassword, count) {
  const client = createClient(email, appPassword);
  await client.connect();
  const messages = [];
  const lock = await client.getMailboxLock('INBOX');
  try {
    const total = client.mailbox?.exists ?? 0;
    if (total > 0) {
      const start = Math.max(1, total - count + 1);
      const range = `${start}:*`;
      for await (const message of client.fetch(range, { source: true, flags: true, uid: true })) {
        const parsed = await simpleParser(message.source);
        const receivedAt = (parsed.date || new Date()).toISOString();
        const preview = (parsed.text || parsed.subject || '')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 240);
        messages.push({
          id: String(message.uid),
          threadId: parsed.headers?.get('message-id') || String(message.uid),
          sender: formatAddress(parsed.from) || '(bilinmeyen gonderen)',
          subject: parsed.subject || '(konu yok)',
          preview,
          receivedAt,
          isUnread: !(message.flags && message.flags.has('\\Seen')),
          isMeeting: detectMeeting(parsed),
        });
      }
    }
  } finally {
    lock.release();
    await client.logout().catch(() => {});
  }

  messages.sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());
  return messages;
}

function readableError(error) {
  const message = String(error?.message || error || 'Bilinmeyen hata');
  if (/AUTHENTICATIONFAILED|Invalid credentials|auth/i.test(message)) {
    return 'Giris basarisiz. Uygulama sifresini ve IMAP erisiminin acik oldugunu kontrol edin.';
  }
  return message;
}

export function attachGmailBridge(app) {
  app.post('/gmail/test', async (req, res) => {
    const { email, appPassword } = req.body || {};
    if (!email || !appPassword) {
      return res.status(400).json({ error: 'email ve appPassword zorunludur.' });
    }
    const client = createClient(email, appPassword);
    try {
      await client.connect();
      await client.logout().catch(() => {});
      return res.json({ ok: true, email });
    } catch (error) {
      return res.status(401).json({ error: readableError(error) });
    }
  });

  app.post('/gmail/messages', async (req, res) => {
    const { email, appPassword, count } = req.body || {};
    if (!email || !appPassword) {
      return res.status(400).json({ error: 'email ve appPassword zorunludur.' });
    }
    const limit = Math.min(Math.max(Number(count) || 30, 1), 100);
    try {
      const messages = await fetchMessages(email, appPassword, limit);
      return res.json({ messages });
    } catch (error) {
      const status = /auth|invalid|credential|login/i.test(String(error?.message)) ? 401 : 500;
      return res.status(status).json({ error: readableError(error) });
    }
  });
}
