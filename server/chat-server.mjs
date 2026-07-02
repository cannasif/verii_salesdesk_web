// @ts-nocheck
/**
 * Gercek zamanli sohbet + presence (socket.io).
 * - identify: soket'i bir kullaniciya baglar, cevrimici listeyi yayinlar.
 * - dm: dogrudan mesaj iletir (alici + gonderenin tum sekmelerine).
 * - history: iki kullanici arasindaki gecmisi dondurur (bellek ici).
 * - typing: yaziyor gostergesi.
 *
 * Not: Mesaj gecmisi sunucu bellekte tutulur (sunucu yeniden baslayinca sifirlanir).
 */

import { Server } from 'socket.io';

function pairKey(a, b) {
  return [Number(a), Number(b)].sort((x, y) => x - y).join(':');
}

let messageSeq = 1;

export function attachChatServer(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: true, methods: ['GET', 'POST'] },
    path: '/socket.io',
  });

  // userId -> bagli soket sayisi (coklu sekme icin ref count)
  const onlineCounts = new Map();
  // pairKey -> mesaj dizisi
  const history = new Map();

  const onlineUserIds = () => [...onlineCounts.keys()];
  const broadcastPresence = () => io.emit('presence', onlineUserIds());

  io.on('connection', (socket) => {
    socket.on('identify', (user) => {
      if (!user || user.id == null) return;
      const userId = Number(user.id);
      socket.data.userId = userId;
      socket.data.userName = user.name || '';
      socket.join(`user:${userId}`);
      onlineCounts.set(userId, (onlineCounts.get(userId) || 0) + 1);
      broadcastPresence();
      socket.emit('presence', onlineUserIds());
    });

    socket.on('history', ({ withUserId } = {}, ack) => {
      const me = socket.data.userId;
      if (me == null || withUserId == null) {
        if (typeof ack === 'function') ack([]);
        return;
      }
      const list = history.get(pairKey(me, withUserId)) || [];
      if (typeof ack === 'function') ack(list);
    });

    socket.on('dm', ({ toUserId, text, tempId } = {}) => {
      const me = socket.data.userId;
      if (me == null || toUserId == null || !text?.trim()) return;

      const message = {
        id: `s${messageSeq++}`,
        fromUserId: me,
        toUserId: Number(toUserId),
        text: String(text).slice(0, 4000),
        createdAt: new Date().toISOString(),
      };

      const key = pairKey(me, message.toUserId);
      const list = history.get(key) || [];
      list.push(message);
      if (list.length > 500) list.shift();
      history.set(key, list);

      io.to(`user:${message.toUserId}`).emit('dm', message);
      // Gonderenin DIGER sekmelerine ilet (bu soket haric, cift kayit olmasin).
      socket.to(`user:${me}`).emit('dm', message);
      // Bu sekme optimistic mesaji gercek mesajla degistirir.
      socket.emit('dm:ack', { tempId, message });
    });

    socket.on('typing', ({ toUserId, typing } = {}) => {
      const me = socket.data.userId;
      if (me == null || toUserId == null) return;
      io.to(`user:${Number(toUserId)}`).emit('typing', { fromUserId: me, typing: !!typing });
    });

    socket.on('disconnect', () => {
      const userId = socket.data.userId;
      if (userId == null) return;
      const next = (onlineCounts.get(userId) || 1) - 1;
      if (next <= 0) onlineCounts.delete(userId);
      else onlineCounts.set(userId, next);
      broadcastPresence();
    });
  });

  return io;
}
