import { type MouseEvent, type ReactElement, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Edit2, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  MANAGEMENT_TABLE_ACTION_BUTTON_CLASSNAME,
  MANAGEMENT_TABLE_ACTION_DELETE_CLASSNAME,
  MANAGEMENT_TABLE_ACTION_DETAIL_CLASSNAME,
  MANAGEMENT_TABLE_ACTION_EDIT_CLASSNAME,
  MANAGEMENT_TABLE_ACTION_TOUCH_CLASSNAME,
  MANAGEMENT_TABLE_ACTIONS_WRAP_CLASSNAME,
} from '@/lib/management-table-actions';
import { cn } from '@/lib/utils';

export interface ManagementTableRowActionsProps {
  onDetail?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  detailLabel?: string;
  editLabel?: string;
  deleteLabel?: string;
  showDetail?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  detailDisabled?: boolean;
  editDisabled?: boolean;
  deleteDisabled?: boolean;
  beforeActions?: ReactNode;
  afterActions?: ReactNode;
  className?: string;
  /** compact: 32px, touch: 44px dokunma alanı (SalesDesk tabloları). */
  size?: 'compact' | 'touch';
  iconSize?: number;
}

function ActionButton({
  label,
  onClick,
  disabled,
  className,
  children,
}: {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  className: string;
  children: ReactElement;
}): ReactElement {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={disabled}
          title={label}
          aria-label={label}
          data-skip-row-double-click
          data-no-drag-scroll
          onClick={(event: MouseEvent<HTMLButtonElement>) => {
            event.stopPropagation();
            onClick?.();
          }}
          className={className}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  );
}

export function ManagementTableRowActions({
  onDetail,
  onEdit,
  onDelete,
  detailLabel,
  editLabel,
  deleteLabel,
  showDetail,
  showEdit,
  showDelete,
  detailDisabled = false,
  editDisabled = false,
  deleteDisabled = false,
  beforeActions,
  afterActions,
  className,
  size = 'compact',
  iconSize = 16,
}: ManagementTableRowActionsProps): ReactElement {
  const { t } = useTranslation('common');

  const resolvedDetailLabel = detailLabel ?? t('detail', { defaultValue: 'Detay' });
  const resolvedEditLabel = editLabel ?? t('edit', { defaultValue: 'Düzenle' });
  const resolvedDeleteLabel = deleteLabel ?? t('delete.action', { defaultValue: 'Sil' });

  const shouldShowDetail = showDetail ?? Boolean(onDetail);
  const shouldShowEdit = showEdit ?? Boolean(onEdit);
  const shouldShowDelete = showDelete ?? Boolean(onDelete);

  const buttonBaseClass =
    size === 'touch' ? MANAGEMENT_TABLE_ACTION_TOUCH_CLASSNAME : MANAGEMENT_TABLE_ACTION_BUTTON_CLASSNAME;

  const resolvedIconSize = size === 'touch' ? Math.max(iconSize, 18) : iconSize;

  return (
    <div
      className={cn(MANAGEMENT_TABLE_ACTIONS_WRAP_CLASSNAME, className)}
      data-skip-row-double-click
      data-no-drag-scroll
      onClick={(event) => event.stopPropagation()}
      onDoubleClick={(event) => event.stopPropagation()}
    >
      {beforeActions}

      {shouldShowDetail && onDetail ? (
        <ActionButton
          label={resolvedDetailLabel}
          onClick={onDetail}
          disabled={detailDisabled}
          className={cn(buttonBaseClass, MANAGEMENT_TABLE_ACTION_DETAIL_CLASSNAME)}
        >
          <Eye size={resolvedIconSize} />
        </ActionButton>
      ) : null}

      {shouldShowEdit && onEdit ? (
        <ActionButton
          label={resolvedEditLabel}
          onClick={onEdit}
          disabled={editDisabled}
          className={cn(buttonBaseClass, MANAGEMENT_TABLE_ACTION_EDIT_CLASSNAME)}
        >
          <Edit2 size={resolvedIconSize} />
        </ActionButton>
      ) : null}

      {shouldShowDelete && onDelete ? (
        <ActionButton
          label={resolvedDeleteLabel}
          onClick={onDelete}
          disabled={deleteDisabled}
          className={cn(buttonBaseClass, MANAGEMENT_TABLE_ACTION_DELETE_CLASSNAME)}
        >
          <Trash2 size={resolvedIconSize} />
        </ActionButton>
      ) : null}

      {afterActions}
    </div>
  );
}
