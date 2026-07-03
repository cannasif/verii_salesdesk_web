import { type ReactElement } from 'react';
import { useSalesDeskErpNewsWatcher } from '../hooks/useSalesDeskErpNewsWatcher';

export function SalesDeskErpNewsWatcher(): ReactElement | null {
  useSalesDeskErpNewsWatcher();
  return null;
}
