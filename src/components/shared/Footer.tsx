import { type ReactElement } from 'react';
import { CRM_APP_PANEL_GLASS } from '@/lib/management-list-layout';

export function Footer(): ReactElement {
  return (
    <footer className={`pointer-events-none fixed inset-x-0 bottom-0 z-40 border-t text-xs text-[var(--crm-app-text-muted)] shadow-[0_-12px_30px_rgba(0,0,0,.24)] ${CRM_APP_PANEL_GLASS}`}>
      <div className="flex h-10 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.8)]" />
          <span>Hazir</span>
        </div>
        <div className="flex items-center gap-4">
          <span>V3RII Sales Desk v1.0</span>
          <span className="rounded-md border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 font-semibold text-emerald-200">
            SQL Server bagli
          </span>
        </div>
      </div>
    </footer>
  );
}
