import {
  createCompany,
  deleteCompany,
  getCompany,
  listCompanies,
  updateCompany,
} from './companies-store.mjs';

function sendError(res, status, message) {
  res.status(status).json({ success: false, error: message, message });
}

function registerCompaniesRoutes(app, basePath) {
  app.get(basePath, (_req, res) => {
    try {
      res.json({ success: true, data: listCompanies() });
    } catch (error) {
      sendError(res, 500, error instanceof Error ? error.message : 'Sirketler yuklenemedi.');
    }
  });

  app.get(`${basePath}/:id`, (req, res) => {
    try {
      const company = getCompany(req.params.id);
      if (!company) {
        sendError(res, 404, 'Sirket bulunamadi.');
        return;
      }
      res.json({ success: true, data: company });
    } catch (error) {
      sendError(res, 500, error instanceof Error ? error.message : 'Sirket yuklenemedi.');
    }
  });

  app.post(basePath, (req, res) => {
    try {
      const company = createCompany(req.body ?? {});
      res.status(201).json({ success: true, data: company });
    } catch (error) {
      sendError(res, 400, error instanceof Error ? error.message : 'Sirket olusturulamadi.');
    }
  });

  app.put(`${basePath}/:id`, (req, res) => {
    try {
      const company = updateCompany(req.params.id, req.body ?? {});
      res.json({ success: true, data: company });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sirket guncellenemedi.';
      const status = message.includes('bulunamadi') ? 404 : 400;
      sendError(res, status, message);
    }
  });

  app.delete(`${basePath}/:id`, (req, res) => {
    try {
      deleteCompany(req.params.id);
      res.json({ success: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sirket silinemedi.';
      const status = message.includes('bulunamadi') ? 404 : 400;
      sendError(res, status, message);
    }
  });
}

export function attachCompaniesApi(app) {
  registerCompaniesRoutes(app, '/salesdesk/companies');
  registerCompaniesRoutes(app, '/companies');
}
