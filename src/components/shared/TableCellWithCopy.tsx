import { type ReactElement, type ReactNode } from 'react';
import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { copyTableCellValue } from '@/lib/table-cell-copy';

interface TableCellWithCopyProps {
  children: ReactNode;
  copyText: string;
  label?: string;
  centered?: boolean;
}

export function TableCellWithCopy({
  children,
  copyText,
  label,
  centered = false,
}: TableCellWithCopyProps): ReactElement {
  return (
    <div
      className={cn(
        'group/cell flex min-w-0 items-center gap-0',
        centered && 'justify-center'
      )}
    >
      <span className={cn('min-w-0 flex-1 truncate', centered && 'text-center')}>{children}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        title="Kopyala"
        aria-label="Kopyala"
        data-skip-row-double-click
        data-no-drag-scroll
        className="h-2.5 w-2.5 min-h-2.5 min-w-2.5 shrink-0 p-0 text-zinc-400 opacity-70 hover:bg-zinc-100/80 hover:text-zinc-700 hover:opacity-100 dark:text-zinc-500 dark:hover:bg-white/10 dark:hover:text-zinc-200 [&_svg]:size-[5px]"
        onClick={(event) => {
          event.stopPropagation();
          void copyTableCellValue(copyText, label);
        }}
      >
        <Copy size={5} strokeWidth={2.75} aria-hidden />
      </Button>
    </div>
  );
}

export function wrapTableCellWithCopy(
  content: ReactNode,
  copyText: string | null,
  label?: string,
  options?: { centered?: boolean }
): ReactNode {
  if (!copyText) return content;
  return (
    <TableCellWithCopy copyText={copyText} label={label} centered={options?.centered}>
      {content}
    </TableCellWithCopy>
  );
}
