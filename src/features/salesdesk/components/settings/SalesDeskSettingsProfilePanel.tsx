import { type ReactElement, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import {
  Building2,
  Camera,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Phone,
  Save,
  UserRound,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';
import { useChangePassword } from '@/features/auth/hooks/useChangePassword';
import { changePasswordSchema, type ChangePasswordRequest } from '@/features/auth/types/auth';
import { ProfilePictureEditor } from '@/features/user-detail-management/components/ProfilePictureEditor';
import { useCreateUserDetail } from '@/features/user-detail-management/hooks/useCreateUserDetail';
import { useUpdateUserDetail } from '@/features/user-detail-management/hooks/useUpdateUserDetail';
import { useUploadProfilePicture } from '@/features/user-detail-management/hooks/useUploadProfilePicture';
import { useUserDetailByUserId } from '@/features/user-detail-management/hooks/useUserDetailByUserId';
import { getImageUrl } from '@/features/user-detail-management/utils/image-url';
import {
  GENDER_OPTIONS,
  userDetailFormSchema,
  type UserDetailFormSchema,
} from '@/features/user-detail-management/types/user-detail-types';
import { useSalesRepMatchList } from '@/features/sales-rep-match-management/hooks/useSalesRepMatchList';
import { fieldClass, salesDeskSectionTitleClass } from '../../lib/salesdesk-shared';
import { SD_ADD_BUTTON, SD_FORM_LABEL, SD_SECONDARY_BUTTON } from '../../lib/salesdesk-popup-styles';

export function SalesDeskSettingsProfilePanel(): ReactElement {
  const { t } = useTranslation('user-detail-management');
  const { user, branch } = useAuthStore();
  const userId = user?.id ?? 0;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const { data: userDetail, isLoading, refetch } = useUserDetailByUserId(userId);
  const { data: matchData } = useSalesRepMatchList({
    pageSize: 1,
    filters: [{ column: 'userId', value: String(userId), operator: 'eq' }],
  });

  const createUserDetail = useCreateUserDetail();
  const updateUserDetail = useUpdateUserDetail();
  const uploadProfilePicture = useUploadProfilePicture();
  const changePassword = useChangePassword();

  const displayName = user?.name || user?.email || 'Kullanici';
  const erpMatch = matchData?.data?.[0];

  const profileForm = useForm<UserDetailFormSchema>({
    resolver: zodResolver(userDetailFormSchema),
    defaultValues: {
      profilePictureUrl: '',
      height: undefined,
      weight: undefined,
      description: '',
      gender: undefined,
      linkedinUrl: '',
      phoneNumber: '',
      email: '',
    },
  });

  const passwordForm = useForm<ChangePasswordRequest>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '' },
  });

  useEffect(() => {
    if (!userDetail) return;
    profileForm.reset({
      profilePictureUrl: userDetail.profilePictureUrl || '',
      height: userDetail.height || undefined,
      weight: userDetail.weight || undefined,
      description: userDetail.description || '',
      gender: userDetail.gender || undefined,
      linkedinUrl: userDetail.linkedinUrl || '',
      phoneNumber: userDetail.phoneNumber || '',
      email: userDetail.email || user?.email || '',
    });
    setPreviewUrl(userDetail.profilePictureUrl ? getImageUrl(userDetail.profilePictureUrl) : null);
  }, [userDetail, user?.email, profileForm]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setIsEditorOpen(true);
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleSaveCroppedImage = async (croppedBlob: Blob): Promise<void> => {
    const file = new File([croppedBlob], 'profile-picture.jpg', { type: 'image/jpeg' });
    await uploadProfilePicture.mutateAsync({ userId, file });
    await refetch();
    setIsEditorOpen(false);
    setSelectedImage(null);
    toast.success('Profil fotografi guncellendi.');
  };

  const handleProfileSubmit = profileForm.handleSubmit(async (data) => {
    const payload = {
      profilePictureUrl: data.profilePictureUrl || undefined,
      height: data.height || undefined,
      weight: data.weight || undefined,
      description: data.description || undefined,
      gender: data.gender || undefined,
      linkedinUrl: data.linkedinUrl || undefined,
      phoneNumber: data.phoneNumber || undefined,
      email: data.email || undefined,
    };

    if (userDetail) {
      await updateUserDetail.mutateAsync({ id: userDetail.id, data: payload });
    } else {
      await createUserDetail.mutateAsync({ userId, ...payload });
    }
    toast.success('Profil bilgileri kaydedildi.');
  });

  const handlePasswordSubmit = passwordForm.handleSubmit(async (data) => {
    await changePassword.mutateAsync(data);
    passwordForm.reset();
    toast.success('Sifreniz guncellendi.');
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[280px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--crm-brand-text)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-[var(--crm-app-border)] bg-[var(--crm-app-panel-muted)] p-5 sm:p-6">
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[var(--crm-brand-soft)] blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative mx-auto shrink-0 sm:mx-0">
            <div className="group relative h-24 w-24 overflow-hidden rounded-2xl border-2 border-[var(--crm-app-border)] bg-[var(--crm-app-panel)] shadow-lg sm:h-28 sm:w-28">
              {previewUrl ? (
                <img src={previewUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[image:var(--crm-brand-gradient)] text-3xl font-black text-white">
                  {displayName[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100"
              >
                <Camera size={24} className="text-white" />
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="sr-only" />
          </div>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{displayName}</h2>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-[var(--crm-app-text-muted)] sm:justify-start">
              <span className="inline-flex items-center gap-1.5">
                <Mail size={14} />
                {user?.email}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Building2 size={14} />
                {branch?.name || '-'}
              </span>
              {erpMatch ? (
                <span className="rounded-lg border border-[var(--crm-brand-ring)] bg-[var(--crm-brand-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--crm-brand-text)]">
                  ERP #{erpMatch.salesRepCode}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <form onSubmit={(event) => void handleProfileSubmit(event)} className="space-y-4">
        <h3 className={salesDeskSectionTitleClass}>
          <UserRound size={18} className="mr-2 inline" />
          Kisisel Bilgiler
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className={SD_FORM_LABEL}>E-posta</span>
            <input className={`${fieldClass} w-full`} {...profileForm.register('email')} />
          </label>
          <label className="block">
            <span className={SD_FORM_LABEL}>Telefon</span>
            <div className="relative">
              <Phone size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--crm-app-text-muted)]" />
              <input className={`${fieldClass} w-full pl-10`} {...profileForm.register('phoneNumber')} />
            </div>
          </label>
          <label className="block">
            <span className={SD_FORM_LABEL}>LinkedIn</span>
            <input className={`${fieldClass} w-full`} {...profileForm.register('linkedinUrl')} />
          </label>
          <label className="block">
            <span className={SD_FORM_LABEL}>Boy (cm)</span>
            <input
              type="number"
              className={`${fieldClass} w-full`}
              {...profileForm.register('height', { valueAsNumber: true })}
            />
          </label>
          <label className="block">
            <span className={SD_FORM_LABEL}>Kilo (kg)</span>
            <input
              type="number"
              className={`${fieldClass} w-full`}
              {...profileForm.register('weight', { valueAsNumber: true })}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className={SD_FORM_LABEL}>Cinsiyet</span>
            <select className={`${fieldClass} w-full`} {...profileForm.register('gender', { valueAsNumber: true })}>
              <option value="">{t('noGenderSelected')}</option>
              {GENDER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(`gender${option.label}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className={SD_FORM_LABEL}>Hakkimda</span>
            <textarea
              rows={3}
              className={`${fieldClass} min-h-[88px] w-full resize-y py-2`}
              {...profileForm.register('description')}
            />
          </label>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={createUserDetail.isPending || updateUserDetail.isPending}
            className={SD_ADD_BUTTON}
          >
            <Save size={16} />
            {createUserDetail.isPending || updateUserDetail.isPending ? 'Kaydediliyor...' : 'Profili Kaydet'}
          </button>
        </div>
      </form>

      <form
        onSubmit={(event) => void handlePasswordSubmit(event)}
        className="space-y-4 border-t border-[var(--crm-app-border)] pt-6"
      >
        <h3 className={salesDeskSectionTitleClass}>
          <Lock size={18} className="mr-2 inline" />
          Sifre Degistir
        </h3>
        <div className="grid max-w-xl gap-4">
          <label className="block">
            <span className={SD_FORM_LABEL}>Mevcut sifre</span>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                className={`${fieldClass} w-full pr-10`}
                {...passwordForm.register('currentPassword')}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--crm-app-text-muted)]"
              >
                {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>
          <label className="block">
            <span className={SD_FORM_LABEL}>Yeni sifre</span>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                className={`${fieldClass} w-full pr-10`}
                {...passwordForm.register('newPassword')}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--crm-app-text-muted)]"
              >
                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={changePassword.isPending} className={SD_SECONDARY_BUTTON}>
            {changePassword.isPending ? 'Guncelleniyor...' : 'Sifreyi Guncelle'}
          </button>
        </div>
      </form>

      {isEditorOpen && selectedImage ? (
        <ProfilePictureEditor
          image={selectedImage}
          isOpen={isEditorOpen}
          onClose={() => {
            setIsEditorOpen(false);
            setSelectedImage(null);
          }}
          onSave={handleSaveCroppedImage}
          isSaving={uploadProfilePicture.isPending}
        />
      ) : null}
    </div>
  );
}
