import {
  addTriggerKey,
  deleteOverlay,
  getOverlay,
  hasTriggerKey,
  listOverlays,
  listTriggerKeys,
  saveOverlay,
} from './erp-news-meta-store.mjs';

function sendError(res, error, status = 400) {
  res.status(status).json({
    success: false,
    message: error instanceof Error ? error.message : String(error),
  });
}

export function attachErpNewsMetaApi(app) {
  app.get('/erp-news-meta', (_req, res) => {
    res.json({
      success: true,
      data: {
        overlays: listOverlays(),
        triggerKeys: listTriggerKeys(),
      },
    });
  });

  app.get('/erp-news-meta/:id', (req, res) => {
    const overlay = getOverlay(req.params.id);
    if (!overlay) {
      res.status(404).json({ success: false, message: 'Meta bulunamadi.' });
      return;
    }
    res.json({ success: true, data: overlay });
  });

  app.put('/erp-news-meta/:id', (req, res) => {
    try {
      const overlay = saveOverlay(req.params.id, req.body ?? {});
      res.json({ success: true, data: overlay });
    } catch (error) {
      sendError(res, error);
    }
  });

  app.delete('/erp-news-meta/:id', (req, res) => {
    try {
      deleteOverlay(req.params.id);
      res.json({ success: true });
    } catch (error) {
      sendError(res, error);
    }
  });

  app.get('/erp-news-meta-triggers', (_req, res) => {
    res.json({ success: true, data: listTriggerKeys() });
  });

  app.post('/erp-news-meta-triggers', (req, res) => {
    try {
      const key = req.body?.key;
      if (hasTriggerKey(key)) {
        res.json({ success: true, data: { key, duplicate: true } });
        return;
      }
      const result = addTriggerKey(key);
      res.json({ success: true, data: result });
    } catch (error) {
      sendError(res, error);
    }
  });
}
