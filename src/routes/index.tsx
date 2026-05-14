import { createBrowserRouter } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { StoresPage } from '@/pages/StoresPage';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { LoginPage } from '@/pages/LoginPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { ProductsPage } from '@/pages/ProductsPage';
import { ProductMappingsPage } from '@/pages/ProductMappingsPage';
import { InventoryPage } from '@/pages/InventoryPage';
import { OrdersPage } from '@/pages/OrdersPage';
import { SyncCenterPage } from '@/pages/SyncCenterPage';
import { IntegrationsPage } from '@/pages/IntegrationsPage';
import { ReportsPage } from '@/pages/ReportsPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        path: '',
        element: <DashboardLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'stores', element: <StoresPage /> },
          { path: 'products', element: <ProductsPage /> },
          { path: 'product-mappings', element: <ProductMappingsPage /> },
          { path: 'inventory', element: <InventoryPage /> },
          { path: 'orders', element: <OrdersPage /> },
          { path: 'sync', element: <SyncCenterPage /> },
          { path: 'integrations', element: <IntegrationsPage /> },
          { path: 'reports', element: <ReportsPage /> },
          { path: 'settings', element: <SettingsPage /> },
        ]
      }
    ]
  }
]);
