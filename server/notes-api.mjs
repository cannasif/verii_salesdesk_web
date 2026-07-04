import {
  createNote,
  deleteNote,
  getNote,
  listNotesForUser,
  pullPendingNotifications,
  updateNote,
} from './notes-store.mjs';

function sendError(res, status, message) {
  res.status(status).json({ success: false, error: message, message });
}

export function attachNotesApi(app) {
  app.get('/notes', (req, res) => {
    try {
      const userId = req.query.userId;
      if (!userId) {
        sendError(res, 400, 'userId gerekli.');
        return;
      }
      res.json({ success: true, data: listNotesForUser(userId) });
    } catch (error) {
      sendError(res, 500, error instanceof Error ? error.message : 'Notlar yuklenemedi.');
    }
  });

  app.get('/notes/notifications/pending', (req, res) => {
    try {
      const userId = req.query.userId;
      if (!userId) {
        sendError(res, 400, 'userId gerekli.');
        return;
      }
      res.json({ success: true, data: pullPendingNotifications(userId) });
    } catch (error) {
      sendError(res, 500, error instanceof Error ? error.message : 'Bildirimler yuklenemedi.');
    }
  });

  app.get('/notes/:id', (req, res) => {
    try {
      const note = getNote(req.params.id);
      if (!note) {
        sendError(res, 404, 'Not bulunamadi.');
        return;
      }
      res.json({ success: true, data: note });
    } catch (error) {
      sendError(res, 500, error instanceof Error ? error.message : 'Not yuklenemedi.');
    }
  });

  app.post('/notes', (req, res) => {
    try {
      const note = createNote(req.body ?? {});
      res.status(201).json({ success: true, data: note });
    } catch (error) {
      sendError(res, 400, error instanceof Error ? error.message : 'Not olusturulamadi.');
    }
  });

  app.put('/notes/:id', (req, res) => {
    try {
      const note = updateNote(req.params.id, req.body ?? {});
      res.json({ success: true, data: note });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Not guncellenemedi.';
      const status = message.includes('bulunamadi') ? 404 : 400;
      sendError(res, status, message);
    }
  });

  app.delete('/notes/:id', (req, res) => {
    try {
      deleteNote(req.params.id);
      res.json({ success: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Not silinemedi.';
      const status = message.includes('bulunamadi') ? 404 : 400;
      sendError(res, status, message);
    }
  });
}
