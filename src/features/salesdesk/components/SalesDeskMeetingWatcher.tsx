import { type ReactElement } from 'react';
import { useSalesDeskGmailMeetingWatcher } from '../hooks/useSalesDeskGmailMeetingWatcher';

/**
 * Uygulama genelinde toplanti izleyicisini calistiran gorunmez bilesen.
 * QueryClientProvider altinda (App icinde) mount edilmelidir.
 */
export function SalesDeskMeetingWatcher(): ReactElement | null {
  useSalesDeskGmailMeetingWatcher();
  return null;
}
