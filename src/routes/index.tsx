import { lazy, type ComponentType } from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { MainLayout } from '@/components/shared/MainLayout';
import { RouteErrorFallback } from '@/components/shared/RouteErrorFallback';
import { ForbiddenPage } from '@/components/shared/ForbiddenPage';
import AuthLayout from '@/layouts/AuthLayout';
import { getAppBasePath } from '@/lib/api-config';

const lazyImport = <T extends Record<string, unknown>, K extends keyof T>(
  factory: () => Promise<T>,
  name: K
) =>
  lazy(async () => {
    const module = await factory();
    return { default: module[name] as ComponentType };
  });

const LoginPage = lazyImport(() => import('@/features/auth'), 'LoginPage');
const ResetPasswordPage = lazyImport(() => import('@/features/auth'), 'ResetPasswordPage');
const ForgotPasswordPage = lazyImport(() => import('@/features/auth'), 'ForgotPasswordPage');
const ProfilePage = lazyImport(() => import('@/features/user-detail-management'), 'ProfilePage');
const UserManagementPage = lazyImport(() => import('@/features/user-management'), 'UserManagementPage');

const SalesDeskDashboardPage = lazyImport(() => import('@/features/salesdesk'), 'SalesDeskDashboardPage');
const SalesDeskCustomersPage = lazyImport(() => import('@/features/salesdesk'), 'SalesDeskCustomersPage');
const SalesDeskPotentialsPage = lazyImport(() => import('@/features/salesdesk'), 'SalesDeskPotentialsPage');
const SalesDeskProductsPage = lazyImport(() => import('@/features/salesdesk'), 'SalesDeskProductsPage');
const SalesDeskProductCustomersPage = lazyImport(() => import('@/features/salesdesk'), 'SalesDeskProductCustomersPage');
const SalesDeskQuotesPage = lazyImport(() => import('@/features/salesdesk'), 'SalesDeskQuotesPage');
const SalesDeskInvoicesPage = lazyImport(() => import('@/features/salesdesk'), 'SalesDeskInvoicesPage');
const SalesDeskInvoiceCreatePage = lazyImport(() => import('@/features/salesdesk'), 'SalesDeskInvoiceCreatePage');
const SalesDeskSalesTrackingPage = lazyImport(() => import('@/features/salesdesk'), 'SalesDeskSalesTrackingPage');
const SalesDeskVisitsPage = lazyImport(() => import('@/features/salesdesk'), 'SalesDeskVisitsPage');
const SalesDeskOpenItemsPage = lazyImport(() => import('@/features/salesdesk'), 'SalesDeskOpenItemsPage');
const SalesDeskWeeklyPlanPage = lazyImport(() => import('@/features/salesdesk'), 'SalesDeskWeeklyPlanPage');
const SalesDeskVisitFormsPage = lazyImport(() => import('@/features/salesdesk'), 'SalesDeskVisitFormsPage');
const SalesDeskAssetsPage = lazyImport(() => import('@/features/salesdesk'), 'SalesDeskAssetsPage');
const SalesDeskPaymentsPage = lazyImport(() => import('@/features/salesdesk'), 'SalesDeskPaymentsPage');
const SalesDeskSoftwareResearchPage = lazyImport(() => import('@/features/salesdesk'), 'SalesDeskSoftwareResearchPage');
const SalesDeskErpNewsPage = lazyImport(() => import('@/features/salesdesk'), 'SalesDeskErpNewsPage');
const SalesDeskGmailPage = lazyImport(() => import('@/features/salesdesk'), 'SalesDeskGmailPage');
const SalesDeskSettingsPage = lazyImport(() => import('@/features/salesdesk'), 'SalesDeskSettingsPage');

export function createAppRouter() {
  return createBrowserRouter([
    {
      path: '/',
      element: (
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      ),
      errorElement: <RouteErrorFallback />,
      children: [
        { index: true, element: <SalesDeskDashboardPage /> },
        { path: 'forbidden', element: <ForbiddenPage /> },
        { path: 'salesdesk/customers', element: <SalesDeskCustomersPage /> },
        { path: 'salesdesk/potentials', element: <SalesDeskPotentialsPage /> },
        { path: 'salesdesk/products', element: <SalesDeskProductsPage /> },
        { path: 'salesdesk/product-customers', element: <SalesDeskProductCustomersPage /> },
        { path: 'salesdesk/quotes', element: <SalesDeskQuotesPage /> },
        { path: 'salesdesk/invoices', element: <SalesDeskInvoicesPage /> },
        { path: 'salesdesk/invoices/new', element: <SalesDeskInvoiceCreatePage /> },
        { path: 'salesdesk/sales-tracking', element: <SalesDeskSalesTrackingPage /> },
        { path: 'salesdesk/weekly-visits', element: <SalesDeskVisitsPage /> },
        { path: 'salesdesk/open-items', element: <SalesDeskOpenItemsPage /> },
        { path: 'salesdesk/weekly-plan', element: <SalesDeskWeeklyPlanPage /> },
        { path: 'salesdesk/visit-forms', element: <SalesDeskVisitFormsPage /> },
        { path: 'salesdesk/assets', element: <SalesDeskAssetsPage /> },
        { path: 'salesdesk/recurring-payments', element: <SalesDeskPaymentsPage /> },
        { path: 'salesdesk/software-research', element: <SalesDeskSoftwareResearchPage /> },
        { path: 'salesdesk/erp-news', element: <SalesDeskErpNewsPage /> },
        { path: 'salesdesk/gmail', element: <SalesDeskGmailPage /> },
        { path: 'salesdesk/settings', element: <SalesDeskSettingsPage /> },
        { path: 'user-management', element: <UserManagementPage /> },
        { path: 'profile', element: <ProfilePage /> },
        { path: '*', element: <Navigate to="/" replace /> },
      ],
    },
    {
      path: '/auth',
      element: <AuthLayout />,
      children: [
        { path: 'login', element: <LoginPage /> },
        { path: 'reset-password', element: <ResetPasswordPage /> },
        { path: 'forgot-password', element: <ForgotPasswordPage /> },
      ],
    },
    {
      path: '/reset-password',
      element: <AuthLayout />,
      children: [{ index: true, element: <ResetPasswordPage /> }],
    },
  ], {
    basename: getAppBasePath(),
  });
}
