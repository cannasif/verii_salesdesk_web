import { type ReactElement, type ReactNode, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  userFormSchema,
  userUpdateFormSchema,
  type UserFormSchema,
  type UserUpdateFormSchema,
} from '../types/user-types';
import type { UserDto } from '../types/user-types';
import { useUserAuthorityOptionsQuery } from '../hooks/useUserAuthorityOptionsQuery';
import type { RoleOption } from '../hooks/useUserAuthorityOptionsQuery';
import { useUserManagerOptionsQuery } from '../hooks/useUserManagerOptionsQuery';
import { useUserPermissionGroupsForForm } from '../hooks/useUserPermissionGroupsForForm';
import { UserFormPermissionGroupSelect } from './UserFormPermissionGroupSelect';
import { User, Mail, Lock, Phone, Shield, Activity, X, Users, Loader2 } from 'lucide-react';
import { FormSubmitTooltipWrap } from '@/components/shared/FormSubmitTooltipWrap';
import { isZodFieldRequired } from '@/lib/zod-required';
import { getZodValidationMessages } from '@/lib/zod-validation-hint';
import { cn } from '@/lib/utils';
import {
  SD_DIALOG_BODY_FORM,
  SD_DIALOG_CLOSE,
  SD_DIALOG_CONTENT_FORM,
  SD_DIALOG_DESC,
  SD_DIALOG_FOOTER_FORM,
  SD_DIALOG_HEADER_FORM,
  SD_DIALOG_ICON,
  SD_DIALOG_ICON_RING_FORM,
  SD_DIALOG_TITLE,
  SD_FORM_GRID_MD,
  SD_FORM_INPUT_MD,
  SD_FORM_LABEL_ICON,
  SD_FORM_LABEL_ICON_SVG,
  SD_FORM_MESSAGE,
  SD_PRIMARY_BUTTON_FORM,
  SD_SECONDARY_BUTTON_FORM,
  SD_SELECT_CONTENT,
} from '@/features/salesdesk/lib/salesdesk-popup-styles';

interface UserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UserFormSchema | UserUpdateFormSchema) => void | Promise<void>;
  user?: UserDto | null;
  isLoading?: boolean;
  canManagePermissionGroups?: boolean;
}

const INPUT_FIELD_CLASSNAME = SD_FORM_INPUT_MD;

const LABEL_STYLE = SD_FORM_LABEL_ICON;

const FORM_MESSAGE_SLOT_CLASSNAME = 'min-h-5';

function FormMessageSlot(): ReactElement {
  return (
    <div className={FORM_MESSAGE_SLOT_CLASSNAME}>
      <FormMessage className={SD_FORM_MESSAGE} />
    </div>
  );
}

function FieldLabel({
  icon: Icon,
  required,
  children,
}: {
  icon: typeof User;
  required?: boolean;
  children: ReactNode;
}): ReactElement {
  return (
    <FormLabel className={LABEL_STYLE} required={required}>
      <Icon size={14} className={SD_FORM_LABEL_ICON_SVG} />
      {children}
    </FormLabel>
  );
}

const EMPTY_ROLE_OPTIONS: RoleOption[] = [];

export function UserForm({
  open,
  onOpenChange,
  onSubmit,
  user,
  isLoading = false,
  canManagePermissionGroups = false,
}: UserFormProps): ReactElement {
  const { t } = useTranslation('user-management');
  const userId = user?.id ?? null;
  const userUsername = user?.username ?? '';
  const userEmail = user?.email ?? '';
  const userFirstName = user?.firstName ?? '';
  const userLastName = user?.lastName ?? '';
  const userPhoneNumber = user?.phoneNumber ?? '';
  const userManagerUserId = user?.managerUserId ?? null;
  const userRoleLabel = user?.role ?? '';
  const userRoleId = user?.roleId ?? 0;
  const userIsActive = user?.isActive ?? true;
  const isEditMode = userId != null;
  const roleOptionsQuery = useUserAuthorityOptionsQuery();
  const roleOptions = roleOptionsQuery.data ?? EMPTY_ROLE_OPTIONS;
  const managerOptionsQuery = useUserManagerOptionsQuery();
  const managerOptions = (managerOptionsQuery.data ?? []).filter((option) => option.value !== userId);
  const userPermissionGroupsQuery = useUserPermissionGroupsForForm(
    userId,
    canManagePermissionGroups
  );

  const form = useForm<UserFormSchema | UserUpdateFormSchema>({
    resolver: zodResolver(isEditMode ? userUpdateFormSchema : userFormSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      roleId: 0,
      managerUserId: null,
      isActive: true,
      permissionGroupIds: [],
    },
  });
  const isFormValid = form.formState.isValid;
  const watchedValues = form.watch();
  const activeSchema = useMemo(
    () => (isEditMode ? userUpdateFormSchema : userFormSchema),
    [isEditMode]
  );

  const saveManualHintLines = useMemo(() => {
    if (isFormValid) return [];
    return getZodValidationMessages(activeSchema, watchedValues).map((message) =>
      t(message, { defaultValue: message })
    );
  }, [activeSchema, isFormValid, t, watchedValues]);

  const handleInvalidSubmit = (): void => {
    void form.trigger();
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    if (userId != null) {
      form.reset({
        username: userUsername,
        email: userEmail,
        firstName: userFirstName,
        lastName: userLastName,
        phoneNumber: userPhoneNumber,
        roleId: userRoleId,
        managerUserId: userManagerUserId,
        isActive: userIsActive,
        permissionGroupIds: [],
      });
      return;
    }

    form.reset({
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      roleId: 0,
      managerUserId: null,
      isActive: true,
      permissionGroupIds: [],
    });
  }, [
    open,
    userId,
    userUsername,
    userEmail,
    userFirstName,
    userLastName,
    userPhoneNumber,
    userManagerUserId,
    userIsActive,
    userRoleId,
    form,
  ]);

  useEffect(() => {
    if (!open || userId == null || !canManagePermissionGroups) {
      return;
    }

    if (userPermissionGroupsQuery.isLoading || userPermissionGroupsQuery.data == null) {
      return;
    }

    const current = form.getValues('permissionGroupIds') ?? [];
    const next = userPermissionGroupsQuery.data;
    const same =
      current.length === next.length &&
      current.every((value, index) => value === next[index]);

    if (!same) {
      form.setValue('permissionGroupIds', next, { shouldDirty: false, shouldTouch: false });
    }
  }, [open, userId, canManagePermissionGroups, userPermissionGroupsQuery.isLoading, userPermissionGroupsQuery.data, form]);

  useEffect(() => {
    if (!open || userId == null || roleOptions.length === 0) {
      return;
    }

    const currentRole = form.getValues('roleId');
    if (currentRole && currentRole > 0) {
      return;
    }

    const matchedRole = roleOptions.find((r) => r.label === userRoleLabel);
    if (matchedRole) {
      form.setValue('roleId', matchedRole.value, { shouldDirty: false, shouldTouch: false });
    }
  }, [open, userId, userRoleLabel, roleOptions, form]);

  const handleSubmit = async (data: UserFormSchema | UserUpdateFormSchema): Promise<void> => {
    await onSubmit(data);
    if (!isLoading) {
      form.reset({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        roleId: 0,
        managerUserId: null,
        isActive: true,
        permissionGroupIds: [],
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <DialogContent className={SD_DIALOG_CONTENT_FORM} showCloseButton={false}>
          <DialogHeader className={SD_DIALOG_HEADER_FORM}>
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className={SD_DIALOG_ICON_RING_FORM}>
                <User className={`h-5 w-5 ${SD_DIALOG_ICON}`} aria-hidden />
              </div>
              <div className="min-w-0 space-y-0.5">
                <DialogTitle className={SD_DIALOG_TITLE}>
                  {user ? t('form.editUser') : t('form.addUser')}
                </DialogTitle>
                <DialogDescription className={SD_DIALOG_DESC}>
                  {user ? t('form.editDescription') : t('form.addDescription')}
                </DialogDescription>
              </div>
            </div>
            <button
              type="button"
              className={SD_DIALOG_CLOSE}
              onClick={() => onOpenChange(false)}
              aria-label="Kapat"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>

          <Form {...form}>
            <form
              id="user-management-form"
              onSubmit={form.handleSubmit(handleSubmit, handleInvalidSubmit)}
              className={SD_DIALOG_BODY_FORM}
            >
              <div className={cn(SD_FORM_GRID_MD, 'space-y-0')}>
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FieldLabel icon={User} required={isZodFieldRequired(activeSchema, 'username')}>
                        {t('form.username')}
                      </FieldLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t('form.usernamePlaceholder')}
                          maxLength={50}
                          disabled={isEditMode}
                          className={INPUT_FIELD_CLASSNAME}
                        />
                      </FormControl>
                      <FormMessageSlot />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FieldLabel icon={Mail} required={isZodFieldRequired(activeSchema, 'email')}>
                        {t('form.email')}
                      </FieldLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder={t('form.emailPlaceholder')}
                          className={INPUT_FIELD_CLASSNAME}
                        />
                      </FormControl>
                      <FormMessageSlot />
                    </FormItem>
                  )}
                />

                {!isEditMode && (
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FieldLabel icon={Lock}>{t('form.password')}</FieldLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            placeholder={t('form.passwordPlaceholder')}
                            className={INPUT_FIELD_CLASSNAME}
                          />
                        </FormControl>
                        <FormMessageSlot />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FieldLabel icon={User}>{t('form.firstName')}</FieldLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t('form.firstNamePlaceholder')}
                          maxLength={50}
                          className={INPUT_FIELD_CLASSNAME}
                        />
                      </FormControl>
                      <FormMessageSlot />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FieldLabel icon={User}>{t('form.lastName')}</FieldLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t('form.lastNamePlaceholder')}
                          maxLength={50}
                          className={INPUT_FIELD_CLASSNAME}
                        />
                      </FormControl>
                      <FormMessageSlot />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FieldLabel icon={Phone}>{t('form.phoneNumber')}</FieldLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t('form.phoneNumberPlaceholder')}
                          maxLength={20}
                          className={INPUT_FIELD_CLASSNAME}
                        />
                      </FormControl>
                      <FormMessageSlot />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="roleId"
                  render={({ field }) => (
                    <FormItem>
                      <FieldLabel icon={Shield} required={isZodFieldRequired(activeSchema, 'roleId')}>
                        {t('form.role')}
                      </FieldLabel>
                      <Select
                        value={field.value ? String(field.value) : ''}
                        onValueChange={(v) => field.onChange(v ? parseInt(v, 10) : 0)}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger className={INPUT_FIELD_CLASSNAME}>
                            <SelectValue placeholder={t('form.rolePlaceholder')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className={SD_SELECT_CONTENT}>
                          {roleOptions.map((opt) => (
                            <SelectItem key={opt.value} value={String(opt.value)}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessageSlot />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="managerUserId"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FieldLabel icon={Users}>{t('form.manager')}</FieldLabel>
                      <Select
                        value={field.value ? String(field.value) : 'none'}
                        onValueChange={(value) =>
                          field.onChange(value === 'none' ? null : parseInt(value, 10))
                        }
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger className={INPUT_FIELD_CLASSNAME}>
                            <SelectValue placeholder={t('form.managerPlaceholder')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className={SD_SELECT_CONTENT}>
                          <SelectItem value="none">{t('form.noManager')}</SelectItem>
                          {managerOptions.map((option) => (
                            <SelectItem key={option.value} value={String(option.value)}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessageSlot />
                    </FormItem>
                  )}
                />

                {canManagePermissionGroups && (
                  <FormField
                    control={form.control}
                    name="permissionGroupIds"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FieldLabel icon={Shield}>{t('form.permissionGroups')}</FieldLabel>
                        <FormControl>
                          <UserFormPermissionGroupSelect
                            value={field.value ?? []}
                            onChange={field.onChange}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessageSlot />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2 flex flex-row items-center justify-between rounded-xl border border-[var(--crm-app-border)] bg-[var(--crm-app-panel-muted)]/50 px-4 py-3">
                      <FieldLabel icon={Activity}>{t('form.isActive')}</FieldLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-[var(--crm-brand-primary)]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>

          <DialogFooter className={SD_DIALOG_FOOTER_FORM}>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className={SD_SECONDARY_BUTTON_FORM}
            >
              {t('form.cancel')}
            </Button>
            <FormSubmitTooltipWrap
              schema={activeSchema}
              value={watchedValues}
              isValid={isFormValid}
              isPending={isLoading}
              manualHintLines={saveManualHintLines}
            >
              <Button
                type="submit"
                form="user-management-form"
                variant="ghost"
                disabled={isLoading}
                className={SD_PRIMARY_BUTTON_FORM}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('form.saving')}
                  </>
                ) : (
                  t('form.save')
                )}
              </Button>
            </FormSubmitTooltipWrap>
          </DialogFooter>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
