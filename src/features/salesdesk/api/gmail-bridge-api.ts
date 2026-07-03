/**
 * Gmail IMAP kopru istemcisi (frontend).
 * Yerel Node koprusune (server/gmail-bridge.mjs) baglanir.
 */

import { getLocalServerUrl } from '../lib/local-server-url';

export interface GmailMessage {
  id: string;
  threadId: string;
  sender: string;
  subject: string;
  preview: string;
  receivedAt: string;
  isUnread: boolean;
  isMeeting: boolean;
}

export interface GmailCredentials {
  email: string;
  appPassword: string;
}

export function getGmailBridgeUrl(): string {
  return getLocalServerUrl();
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${getGmailBridgeUrl()}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error(
      'Gmail koprusune ulasilamadi. Uygulamayi "npm run dev" ile baslatin; yerel sunucu otomatik acilir.'
    );
  }

  const data = (await response.json().catch(() => ({}))) as { error?: string } & T;
  if (!response.ok) {
    throw new Error(data.error || `Gmail koprusu hatasi (${response.status}).`);
  }
  return data;
}

export async function testGmailConnection(credentials: GmailCredentials): Promise<void> {
  await postJson('/gmail/test', credentials);
}

export async function fetchGmailMessages(
  credentials: GmailCredentials,
  count: number
): Promise<GmailMessage[]> {
  const data = await postJson<{ messages: GmailMessage[] }>('/gmail/messages', {
    ...credentials,
    count,
  });
  return data.messages ?? [];
}
