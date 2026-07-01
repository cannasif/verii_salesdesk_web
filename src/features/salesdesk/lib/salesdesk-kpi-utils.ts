import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import type { SalesDeskKpiItem, SalesDeskKpiTone } from '../components/SalesDeskKpiCards';

type SalesDeskMetricLike = {
  label: string;
  value: string | number;
  tone?: 'blue' | 'green' | 'yellow' | 'red' | 'violet' | 'pink' | 'cyan';
};

const metricToneToKpi: Record<NonNullable<SalesDeskMetricLike['tone']>, SalesDeskKpiTone> = {
  blue: 'brand',
  cyan: 'sky',
  green: 'emerald',
  yellow: 'amber',
  red: 'rose',
  violet: 'brand',
  pink: 'rose',
};

const metricIconByTone: Record<NonNullable<SalesDeskMetricLike['tone']>, LucideIcon> = {
  blue: Users,
  cyan: TrendingUp,
  green: CheckCircle2,
  yellow: AlertTriangle,
  red: AlertTriangle,
  violet: Sparkles,
  pink: BarChart3,
};

export function salesDeskMetricsToKpiItems(metrics: SalesDeskMetricLike[]): SalesDeskKpiItem[] {
  return metrics.map((metric) => {
    const tone = metric.tone ?? 'blue';
    return {
      key: metric.label,
      label: metric.label,
      value: metric.value,
      tone: metricToneToKpi[tone],
      icon: metricIconByTone[tone],
    };
  });
}
