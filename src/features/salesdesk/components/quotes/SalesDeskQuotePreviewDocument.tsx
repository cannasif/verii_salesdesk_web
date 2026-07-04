import { type ReactElement } from 'react';
import type { SalesDeskQuotePreviewData } from '../../lib/build-salesdesk-quote-preview-data';
import { SALESDESK_QUOTE_TEMPLATE } from '../../lib/salesdesk-quote-template';

interface SalesDeskQuotePreviewDocumentProps {
  data: SalesDeskQuotePreviewData;
  printMode?: boolean;
}

function PageFooter({ pageNumber }: { pageNumber: number }): ReactElement {
  return (
    <footer className="mt-auto flex items-center justify-between border-t border-slate-200 pt-4 text-[10px] text-slate-500">
      <span>{SALESDESK_QUOTE_TEMPLATE.footerLine}</span>
      <span className="font-medium text-slate-700">{String(pageNumber).padStart(2, '0')}</span>
    </footer>
  );
}

export function SalesDeskQuotePreviewDocument({
  data,
  printMode = false,
}: SalesDeskQuotePreviewDocumentProps): ReactElement {
  const template = SALESDESK_QUOTE_TEMPLATE;
  const allNotes = data.notes.length > 0 ? data.notes : [...template.defaultNotes];

  const pageClass = printMode
    ? 'quote-preview-page mx-auto mb-0 min-h-[297mm] w-[210mm] bg-white p-[16mm] text-slate-900 overflow-hidden'
    : 'quote-preview-page mx-auto mb-8 min-h-[297mm] w-full min-w-0 max-w-[210mm] bg-white p-[16mm] text-slate-900 shadow-lg ring-1 ring-slate-200 last:mb-0 overflow-hidden';

  return (
    <div className={printMode ? 'bg-white' : 'space-y-0'}>
      {/* Sayfa 1 — Kapak (müşteri) */}
      <section className={`${pageClass} flex flex-col`}>
        <div className="flex flex-1 flex-col justify-center">
          <div className="mb-10 flex items-center gap-4">
            <img src={template.logoPath} alt="V3RII" className="h-14 w-auto object-contain" />
          </div>
          <h1 className="max-w-[85%] text-[28px] font-semibold leading-tight text-slate-900">
            {data.customerName}
          </h1>
          <p className="mt-4 text-lg text-slate-600">{template.coverTagline}</p>
        </div>
        <PageFooter pageNumber={1} />
      </section>

      {/* Sayfa 2 — V3RII tanıtım */}
      <section className={`${pageClass} flex flex-col`}>
        <div className="mb-6 flex items-center justify-between gap-4">
          <img src={template.logoPath} alt="V3RII" className="h-10 w-auto object-contain" />
          <p className="text-right text-[11px] text-slate-500">{template.introSubtitle}</p>
        </div>

        <h2 className="text-xl font-semibold text-slate-900">{template.introTitle}</h2>
        <p className="mt-3 text-[13px] leading-relaxed text-slate-700">{template.introLead}</p>
        <p className="mt-3 text-[13px] leading-relaxed text-slate-700">{template.introSecondary}</p>

        <h3 className="mt-8 text-base font-semibold text-slate-900">{template.principlesTitle}</h3>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {template.principles.map((item) => (
            <div
              key={item.title}
              className="flex min-h-[92px] flex-col rounded-lg border border-slate-200 bg-slate-50/80 p-3.5 pb-4"
            >
              <p className="text-[11px] font-semibold leading-snug text-slate-900">{item.title}</p>
              <p className="mt-1.5 flex-1 break-words text-[10px] leading-[1.45] text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>

        <h3 className="mt-8 text-base font-semibold text-slate-900">{template.expertiseTitle}</h3>
        <div className="mt-4 grid grid-cols-3 gap-2.5 items-stretch">
          {template.expertise.map((item) => (
            <div
              key={item.title}
              className="flex min-h-[108px] flex-col rounded-lg border border-slate-200 p-3.5 pb-4"
            >
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-900">{item.title}</p>
              <p className="mt-2 flex-1 break-words text-[9.5px] leading-[1.5] text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>

        <PageFooter pageNumber={2} />
      </section>

      {/* Sayfa 3 — Fiyat teklifi */}
      <section className={`${pageClass} flex flex-col`}>
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Fiyat Teklifi</h2>
            <p className="mt-1 text-sm text-slate-600">
              {data.customerName}
              {data.quoteNumber ? ` · ${data.quoteNumber}` : ''}
              {data.quoteDateLabel ? ` · ${data.quoteDateLabel}` : ''}
            </p>
          </div>
          <img src={template.logoPath} alt="V3RII" className="h-10 w-auto object-contain" />
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-300">
          <table className="w-full table-fixed border-collapse text-[10.5px]">
            <colgroup>
              <col className="w-[23%]" />
              <col className="w-[47%]" />
              <col className="w-[30%]" />
            </colgroup>
            <thead>
              <tr className="bg-slate-900 text-left text-white">
                <th className="px-2.5 py-2.5 font-semibold">Hizmet / Ürün</th>
                <th className="px-2.5 py-2.5 font-semibold">Kapsam Açıklaması</th>
                <th className="px-2.5 py-2.5 text-right font-semibold">Bedel</th>
              </tr>
            </thead>
            <tbody>
              {data.lines.map((line, index) => (
                <tr key={`${line.title}-${index}`} className="border-t border-slate-200 align-top">
                  <td className="px-2.5 py-3 font-medium break-words text-slate-900">{line.title}</td>
                  <td className="px-2.5 py-3 break-words leading-[1.45] text-slate-700">{line.description}</td>
                  <td className="px-2.5 py-3 text-right font-medium break-words leading-snug text-slate-900">
                    {line.amountLabel}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-900 bg-slate-50">
                <td colSpan={2} className="px-2.5 py-3 text-right font-semibold text-slate-900">
                  Genel Toplam
                </td>
                <td className="px-2.5 py-3 text-right text-[11px] font-bold break-words leading-snug text-slate-900">
                  {data.grandTotalLabel}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-semibold text-slate-900">Teklif Notları</h3>
          <ul className="mt-2 space-y-1.5 text-[12px] leading-relaxed text-slate-700">
            {allNotes.map((note, index) => (
              <li key={`${index}-${note.slice(0, 24)}`}>{note}</li>
            ))}
          </ul>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2.5 items-stretch">
          {template.infoCards.map((card) => (
            <div
              key={card.title}
              className="flex min-h-[88px] flex-col rounded-lg border border-slate-200 bg-slate-50/70 p-3.5 pb-4"
            >
              <p className="text-[10.5px] font-semibold text-slate-900">{card.title}</p>
              <p className="mt-1.5 flex-1 break-words text-[9.5px] leading-[1.5] text-slate-600">{card.description}</p>
            </div>
          ))}
        </div>

        <PageFooter pageNumber={3} />
      </section>
    </div>
  );
}
