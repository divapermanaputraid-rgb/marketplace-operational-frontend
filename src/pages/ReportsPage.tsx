import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/lib/api/reports';
import { Card } from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/LoadingState';
import { ShoppingCart, Package, AlertTriangle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'products' | 'sync'>('orders');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500 mt-1">Operational reporting and analytics.</p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('orders')}
            className={cn(
              "whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center",
              activeTab === 'orders' 
                ? "border-blue-500 text-blue-600" 
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            )}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Orders
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={cn(
              "whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center",
              activeTab === 'inventory' 
                ? "border-blue-500 text-blue-600" 
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            )}
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Inventory
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={cn(
              "whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center",
              activeTab === 'products' 
                ? "border-blue-500 text-blue-600" 
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            )}
          >
            <Package className="mr-2 h-4 w-4" />
            Products
          </button>
          <button
            onClick={() => setActiveTab('sync')}
            className={cn(
              "whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center",
              activeTab === 'sync' 
                ? "border-blue-500 text-blue-600" 
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            )}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync Health
          </button>
        </nav>
      </div>

      <div className="pt-4">
        {activeTab === 'orders' && <OrdersReport />}
        {activeTab === 'inventory' && <InventoryReport />}
        {activeTab === 'products' && <ProductsReport />}
        {activeTab === 'sync' && <SyncReport />}
      </div>
    </div>
  );
}

function OrdersReport() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['reports-orders'],
    queryFn: reportsApi.getOrders,
  });

  if (isLoading) return <LoadingState />;
  if (error || !data) return <div className="text-red-500">Failed to load orders report.</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900">{data.total_orders}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500">Total Sales</p>
          <p className="text-2xl font-bold text-green-600">Rp {data.total_sales_amount.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{data.order_status_counts['pending'] || 0}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-2xl font-bold text-blue-600">{data.order_status_counts['completed'] || 0}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="p-4 border-b border-gray-200"><h3 className="font-medium">Sales by Marketplace</h3></div>
          <div className="p-4">
            {Object.entries(data.sales_by_marketplace).map(([marketplace, total]) => (
              <div key={marketplace} className="flex justify-between items-center py-2 border-b last:border-0">
                <span className="capitalize">{marketplace.replace('_', ' ')}</span>
                <span className="font-medium">Rp {total.toLocaleString()}</span>
              </div>
            ))}
            {Object.keys(data.sales_by_marketplace).length === 0 && <p className="text-sm text-gray-500">No sales data available.</p>}
          </div>
        </Card>
        <Card>
          <div className="p-4 border-b border-gray-200"><h3 className="font-medium">Payment Status</h3></div>
          <div className="p-4">
            {Object.entries(data.payment_status_counts).map(([status, count]) => (
              <div key={status} className="flex justify-between items-center py-2 border-b last:border-0">
                <span className="capitalize">{status}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function InventoryReport() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['reports-inventory'],
    queryFn: reportsApi.getInventory,
  });

  if (isLoading) return <LoadingState />;
  if (error || !data) return <div className="text-red-500">Failed to load inventory report.</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-500">Total Available Stock</p>
          <p className="text-2xl font-bold text-blue-600">{data.total_available_quantity.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500">Total Reserved Stock</p>
          <p className="text-2xl font-bold text-orange-600">{data.total_reserved_quantity.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500">Total Damaged Stock</p>
          <p className="text-2xl font-bold text-red-600">{data.total_damaged_quantity.toLocaleString()}</p>
        </Card>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-medium text-amber-600 flex items-center"><AlertTriangle className="h-4 w-4 mr-2" /> Low Stock Items</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Available</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Safety Limit</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.low_stock_items?.map(item => (
                <tr key={item.id}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium">{item.product?.name}</div>
                    <div className="text-xs text-gray-500">{item.sku}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.location_name}</td>
                  <td className="px-6 py-4 text-sm text-right font-bold text-red-600">{item.available_quantity}</td>
                  <td className="px-6 py-4 text-sm text-right text-gray-500">{item.safety_stock}</td>
                </tr>
              ))}
              {!data.low_stock_items?.length && (
                <tr><td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">No low stock items.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function ProductsReport() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['reports-products'],
    queryFn: reportsApi.getProducts,
  });

  if (isLoading) return <LoadingState />;
  if (error || !data) return <div className="text-red-500">Failed to load products report.</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-500">Mapping Coverage</p>
          <p className="text-2xl font-bold text-indigo-600">{data.mapping_coverage.toFixed(1)}%</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500">Mapped Products</p>
          <p className="text-2xl font-bold text-green-600">{data.mapped_products_count}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500">Unmapped Products</p>
          <p className="text-2xl font-bold text-red-600">{data.unmapped_products_count}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500">Total Mappings</p>
          <p className="text-2xl font-bold text-blue-600">{data.total_mappings}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="p-4 border-b border-gray-200"><h3 className="font-medium">Mappings by Marketplace</h3></div>
          <div className="p-4">
            {Object.entries(data.mappings_by_marketplace).map(([marketplace, count]) => (
              <div key={marketplace} className="flex justify-between items-center py-2 border-b last:border-0">
                <span className="capitalize">{marketplace.replace('_', ' ')}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <div className="p-4 border-b border-gray-200"><h3 className="font-medium text-red-600">Unmapped Products</h3></div>
          <div className="p-0 overflow-y-auto max-h-64">
            {data.unmapped_products?.map(p => (
              <div key={p.id} className="px-4 py-3 border-b last:border-0 hover:bg-gray-50">
                <p className="text-sm font-medium">{p.name}</p>
                <p className="text-xs text-gray-500">{p.sku}</p>
              </div>
            ))}
            {!data.unmapped_products?.length && <p className="p-4 text-sm text-gray-500">All products are mapped.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}

function SyncReport() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['reports-sync'],
    queryFn: reportsApi.getSync,
  });

  if (isLoading) return <LoadingState />;
  if (error || !data) return <div className="text-red-500">Failed to load sync report.</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="p-4 border-b border-gray-200"><h3 className="font-medium">Sync Job Statuses</h3></div>
          <div className="p-4 grid grid-cols-2 gap-4">
            {Object.entries(data.sync_job_status_counts).map(([status, count]) => (
              <div key={status} className="bg-gray-50 p-3 rounded-md border text-center">
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs text-gray-500 uppercase">{status.replace('_', ' ')}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <div className="p-4 border-b border-gray-200"><h3 className="font-medium">Recent Log Statuses</h3></div>
          <div className="p-4 grid grid-cols-2 gap-4">
            {Object.entries(data.sync_log_status_counts).map(([status, count]) => (
              <div key={status} className="bg-gray-50 p-3 rounded-md border text-center">
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs text-gray-500 uppercase">{status.replace('_', ' ')}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
