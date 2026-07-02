import {
  createGroup,
  deleteGroup,
  getGroup,
  listGroups,
  setGroupMembers,
  updateGroup,
} from './groups-store.mjs';

function sendError(res, status, message) {
  res.status(status).json({ success: false, error: message });
}

function registerGroupsRoutes(app, basePath) {
  app.get(basePath, (_req, res) => {
    try {
      res.json({ success: true, data: listGroups() });
    } catch (error) {
      sendError(res, 500, error instanceof Error ? error.message : 'Gruplar yuklenemedi.');
    }
  });

  app.get(`${basePath}/:id`, (req, res) => {
    try {
      const group = getGroup(req.params.id);
      if (!group) {
        sendError(res, 404, 'Grup bulunamadi.');
        return;
      }
      res.json({ success: true, data: group });
    } catch (error) {
      sendError(res, 500, error instanceof Error ? error.message : 'Grup yuklenemedi.');
    }
  });

  app.post(basePath, (req, res) => {
    try {
      const { name, description, memberUserIds } = req.body ?? {};
      const group = createGroup({ name, description, memberUserIds });
      res.status(201).json({ success: true, data: group });
    } catch (error) {
      sendError(res, 400, error instanceof Error ? error.message : 'Grup olusturulamadi.');
    }
  });

  app.put(`${basePath}/:id`, (req, res) => {
    try {
      const { name, description } = req.body ?? {};
      const group = updateGroup(req.params.id, { name, description });
      res.json({ success: true, data: group });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Grup guncellenemedi.';
      const status = message.includes('bulunamadi') ? 404 : 400;
      sendError(res, status, message);
    }
  });

  app.put(`${basePath}/:id/members`, (req, res) => {
    try {
      const { memberUserIds } = req.body ?? {};
      const group = setGroupMembers(req.params.id, memberUserIds);
      res.json({ success: true, data: group });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Uyeler guncellenemedi.';
      const status = message.includes('bulunamadi') ? 404 : 400;
      sendError(res, status, message);
    }
  });

  app.delete(`${basePath}/:id`, (req, res) => {
    try {
      deleteGroup(req.params.id);
      res.json({ success: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Grup silinemedi.';
      const status = message.includes('bulunamadi') ? 404 : 400;
      sendError(res, status, message);
    }
  });
}

export function attachGroupsApi(app) {
  registerGroupsRoutes(app, '/salesdesk/groups');
  registerGroupsRoutes(app, '/groups');
}
