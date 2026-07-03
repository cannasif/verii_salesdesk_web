import { type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, CheckCircle2, UserCheck, Users } from 'lucide-react';
import { useUserStats } from '../hooks/useUserStats';
import { SalesDeskKpiCards } from '@/features/salesdesk/components/SalesDeskKpiCards';

export function UserStats(): ReactElement {
  const { t } = useTranslation();
  const { data: stats, isLoading } = useUserStats();

  return (
    <SalesDeskKpiCards
      isLoading={isLoading}
      items={[
        {
          key: 'totalUsers',
          label: t('userManagement.stats.totalUsers'),
          value: stats?.totalUsers ?? 0,
          tone: 'brand',
          icon: Users,
        },
        {
          key: 'activeUsers',
          label: t('userManagement.stats.activeUsers'),
          value: stats?.activeUsers ?? 0,
          tone: 'emerald',
          icon: UserCheck,
        },
        {
          key: 'newThisMonth',
          label: t('userManagement.stats.newThisMonth'),
          value: stats?.newThisMonth ?? 0,
          tone: 'amber',
          icon: Calendar,
        },
        {
          key: 'confirmedUsers',
          label: t('userManagement.stats.confirmedUsers'),
          value: stats?.confirmedUsers ?? 0,
          tone: 'sky',
          icon: CheckCircle2,
        },
      ]}
    />
  );
}
