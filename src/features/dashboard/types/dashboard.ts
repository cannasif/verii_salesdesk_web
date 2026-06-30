export interface DashboardKpi {
  monthlyRevenue: number;
  monthlyRevenueChange: number;
  conversionRate: number;
  conversionRateChange: number;
  totalCustomers: number;
  totalCustomersChange: number;
  activeAgreements: number;
  activeAgreementsChange: number;
}

export interface DashboardActivity {
  id: number;
  type: 'sale' | 'customer' | 'task' | 'meeting';
  title: string;
  description: string;
  amount?: number;
  timeAgo: string;
  subject?: string;
  konu?: string;
  createdAt?: string | number | Date;
}

export interface DashboardData {
  kpis: DashboardKpi;
  activities: DashboardActivity[];
}

export interface CurrencyRate {
  code: string;
  rate: number;
  change: number;
}
