import { RouterProvider } from 'react-router-dom';
import { useMemo } from 'react';
import { createAppRouter } from './routes';
import { Toaster } from './components/ui/sonner';
import { SystemSettingsBootstrap } from './components/shared/SystemSettingsBootstrap';
import { useNotificationConnection } from './features/notification/hooks/useNotificationConnection';
import { SalesDeskMeetingWatcher } from './features/salesdesk/components/SalesDeskMeetingWatcher';
import { SalesDeskErpNewsWatcher } from './features/salesdesk/components/SalesDeskErpNewsWatcher';
import { SalesDeskLocalServicesBootstrap } from './features/salesdesk/components/SalesDeskLocalServicesBootstrap';
import { useSalesDeskChatConnection } from './features/salesdesk/hooks/useSalesDeskChatConnection';
import { SalesDeskChatWidget } from './features/salesdesk/components/chat/SalesDeskChatWidget';
import './App.css';

function App() {
  const router = useMemo(() => createAppRouter(), []);
  useNotificationConnection();
  useSalesDeskChatConnection();

  return (
    <>
      <SystemSettingsBootstrap />
      <SalesDeskLocalServicesBootstrap />
      <SalesDeskMeetingWatcher />
      <SalesDeskErpNewsWatcher />
      <RouterProvider router={router} />
      <SalesDeskChatWidget />
      <Toaster />
    </>
  );
}

export default App;
