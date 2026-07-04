import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, 'data', 'salesdesk-companies.json');

/** @type {Promise<void>} */
let writeQueue = Promise.resolve();

function readStore() {
  if (!fs.existsSync(DATA_PATH)) {
    return { seq: 1, companies: [] };
  }
  const raw = fs.readFileSync(DATA_PATH, 'utf8');
  const parsed = JSON.parse(raw);
  return {
    seq: typeof parsed.seq === 'number' ? parsed.seq : 1,
    companies: Array.isArray(parsed.companies) ? parsed.companies : [],
  };
}

function writeStore(data) {
  fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
  fs.writeFileSync(DATA_PATH, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function withLock(fn) {
  const run = writeQueue.then(fn);
  writeQueue = run.catch(() => {});
  return run;
}

function str(value) {
  return value == null ? '' : String(value).trim();
}

function toCompanyDto(company) {
  return {
    id: company.id,
    name: company.name ?? '',
    ipAddress: company.ipAddress ?? '',
    ipUsername: company.ipUsername ?? '',
    ipPassword: company.ipPassword ?? '',
    vpnName: company.vpnName ?? '',
    vpnUsername: company.vpnUsername ?? '',
    vpnPassword: company.vpnPassword ?? '',
    vpnIpAddress: company.vpnIpAddress ?? '',
    vpnPort: company.vpnPort ?? '',
    databaseUsername: company.databaseUsername ?? '',
    databasePassword: company.databasePassword ?? '',
    loginUrl: company.loginUrl ?? '',
    description: company.description ?? '',
    description1: company.description1 ?? '',
    createdAt: company.createdAt,
    updatedAt: company.updatedAt,
  };
}

function normalizePayload(payload) {
  return {
    name: str(payload.name),
    ipAddress: str(payload.ipAddress),
    ipUsername: str(payload.ipUsername),
    ipPassword: str(payload.ipPassword),
    vpnName: str(payload.vpnName),
    vpnUsername: str(payload.vpnUsername),
    vpnPassword: str(payload.vpnPassword),
    vpnIpAddress: str(payload.vpnIpAddress),
    vpnPort: str(payload.vpnPort),
    databaseUsername: str(payload.databaseUsername),
    databasePassword: str(payload.databasePassword),
    loginUrl: str(payload.loginUrl),
    description: str(payload.description),
    description1: str(payload.description1),
  };
}

export function listCompanies() {
  const store = readStore();
  return store.companies.map(toCompanyDto).sort((a, b) => a.name.localeCompare(b.name, 'tr'));
}

export function getCompany(id) {
  const numericId = Number(id);
  const store = readStore();
  const company = store.companies.find((item) => item.id === numericId);
  return company ? toCompanyDto(company) : null;
}

export function createCompany(payload) {
  const body = normalizePayload(payload);
  if (!body.name) {
    throw new Error('Sirket adi zorunludur.');
  }

  return withLock(() => {
    const store = readStore();
    const now = new Date().toISOString();
    const id = store.seq;
    const company = { id, ...body, createdAt: now, updatedAt: now };
    store.seq += 1;
    store.companies.push(company);
    writeStore(store);
    return toCompanyDto(company);
  });
}

export function updateCompany(id, payload) {
  const numericId = Number(id);
  const body = normalizePayload(payload);
  if (!body.name) {
    throw new Error('Sirket adi zorunludur.');
  }

  return withLock(() => {
    const store = readStore();
    const index = store.companies.findIndex((item) => item.id === numericId);
    if (index === -1) {
      throw new Error('Sirket bulunamadi.');
    }

    store.companies[index] = {
      ...store.companies[index],
      ...body,
      updatedAt: new Date().toISOString(),
    };
    writeStore(store);
    return toCompanyDto(store.companies[index]);
  });
}

export function deleteCompany(id) {
  const numericId = Number(id);

  return withLock(() => {
    const store = readStore();
    const before = store.companies.length;
    store.companies = store.companies.filter((item) => item.id !== numericId);
    if (store.companies.length === before) {
      throw new Error('Sirket bulunamadi.');
    }
    writeStore(store);
    return { ok: true };
  });
}
