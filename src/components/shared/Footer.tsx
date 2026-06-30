import { type ReactElement } from 'react';

export function Footer(): ReactElement {
  return (
    <footer className="pointer-events-none fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#05070d]/95 text-xs text-slate-400 shadow-[0_-12px_30px_rgba(0,0,0,.24)] backdrop-blur-xl">
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
