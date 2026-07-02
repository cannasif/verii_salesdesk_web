// @ts-nocheck
/**
 * Verii Sales Desk - yerel yardimci sunucu.
 * Tek surecte iki servis calisir:
 *   1) Gmail IMAP koprusu  (POST /gmail/test, /gmail/messages)
 *   2) Gercek zamanli sohbet + presence (socket.io)
 *
 * Calistirma:  npm run server   (veya npm run gmail:bridge)
 * Varsayilan port: 8787  (SERVER_PORT ile degistirilebilir)
 */

import http from 'node:http';
import express from 'express';
import cors from 'cors';
import { attachGmailBridge } from './gmail-bridge.mjs';
import { attachChatServer } from './chat-server.mjs';
import { attachGroupsApi } from './groups-api.mjs';

const PORT = Number(process.env.SERVER_PORT || process.env.GMAIL_BRIDGE_PORT || 8787);

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => res.json({ ok: true }));

attachGmailBridge(app);
attachGroupsApi(app);

const httpServer = http.createServer(app);
attachChatServer(httpServer);

httpServer.listen(PORT, () => {
  console.log(`[verii-server] calisiyor: http://localhost:${PORT}`);
  console.log('  - Gmail koprusu: POST /gmail/test, /gmail/messages');
  console.log('  - Gruplar: GET/POST/PUT/DELETE /salesdesk/groups');
  console.log('  - Sohbet (socket.io): /socket.io');
});
