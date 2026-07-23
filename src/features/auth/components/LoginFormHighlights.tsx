import { type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, Layers, ShieldCheck } from 'lucide-react';

const HIGHLIGHTS = [
  { key: 'formHighlight1', icon: Layers },
  { key: 'formHighlight2', icon: BarChart3 },
  { key: 'formHighlight3', icon: ShieldCheck },
] as const;

export function LoginFormHighlights(): ReactElement {
  const { t } = useTranslation('auth');

  return (
    <div className="mt-4 grid grid-cols-3 gap-2">
      {HIGHLIGHTS.map(({ key, icon: Icon }) => (
        <div
          key={key}
          className="group relative overflow-hidden rounded-xl border border-[rgba(251,191,36,0.22)] bg-[rgba(251,191,36,0.06)] px-2.5 py-3 text-center transition-colors hover:border-[rgba(251,191,36,0.4)] hover:bg-[rgba(251,191,36,0.1)]"
        >
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 [background:radial-gradient(circle_at_50%_0%,rgba(251,191,36,0.18),transparent_70%)]" />
          <div className="relative mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg border border-[rgba(251,191,36,0.35)] bg-[rgba(251,191,36,0.12)] text-[#fbbf24] shadow-[0_0_16px_rgba(251,191,36,0.15)]">
            <Icon className="h-4 w-4" strokeWidth={2.2} />
          </div>
          <p className="relative text-[10px] font-bold leading-tight text-[#fde68a]">
            {t(`login.${key}Title`)}
          </p>
          <p className="relative mt-1 text-[9px] leading-snug text-[#b8a88a]">
            {t(`login.${key}Desc`)}
          </p>
        </div>
      ))}
    </div>
  );
}
