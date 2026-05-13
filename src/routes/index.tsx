/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { StoresPage } from '@/pages/StoresPage';

import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { LoginPage } from '@/pages/LoginPage';

// Placeholder pages (Inline for simplicity during foundation, normally separate files)
import { BarChart2 } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { SettingsPage } from '@/pages/SettingsPage';

import { ProductsPage } from '@/pages/ProductsPage';
import { ProductMappingsPage } from '@/pages/ProductMappingsPage';
import { InventoryPage } from '@/pages/InventoryPage';
import { OrdersPage } from '@/pages/OrdersPage';
import { SyncCenterPage } from '@/pages/SyncCenterPage';

import { IntegrationsPage } from '@/pages/IntegrationsPage';

const PlaceholderPage = ({ title, icon: Icon, sprint }: { title: string, icon: React.ElementType, sprint: string }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      </div>
      <EmptyState 
        icon={<Icon className="h-8 w-8" />}
        title={`Coming in Sprint ${sprint}`}
        description={`This page will be implemented in Sprint ${sprint}.`}
      />
    </div>
  );
};

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
      { path: 'reports', element: <PlaceholderPage title="Reports" icon={BarChart2} sprint="5" /> },
      { path: 'settings', element: <SettingsPage /> },
    ]
  }]
}
]);
