import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  Store, 
  Package, 
  Link2, 
  AlertTriangle, 
  ShoppingCart, 
  DollarSign, 
  RefreshCw,
  ArrowRight,
  Zap,
  Info,
  ShieldAlert
} from 'lucide-react';
import { dashboardApi } from '@/lib/api/dashboard';
import { Card, CardBody } from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/LoadingState';
import { cn } from '@/lib/utils/cn';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: React.ElementType;
  colorClass: string;
  link?: string;
}

function MetricCard({ title, value, subtext, icon: Icon, colorClass, link }: MetricCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardBody className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
            {subtext && <p className="mt-1 text-sm text-gray-500">{subtext}</p>}
          </div>
          <div className={cn("p-3 rounded-full", colorClass)}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
        {link && (
          <div className="mt-4">
            <Link to={link} className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center">
              View details <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

export function DashboardPage() {
  const { data: summary, isLoading: isSummaryLoading, error: summaryError } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: dashboardApi.getSummary,
  });

  const { data: shopeeOps, isLoading: isShopeeLoading } = useQuery({
    queryKey: ['shopee-operations'],
    queryFn: dashboardApi.getShopeeOperations,
  });

  if (isSummaryLoading) {
    return (
      <div className="p-12">
        <LoadingState text="Loading dashboard metrics..." />
      </div>
    );
  }

  if (summaryError || !summary) {
    return (
      <div className="p-12 text-center text-red-500">
        Failed to load dashboard data. Please try again later.
      </div>
    );
  }

  const { stores, products, product_mappings, inventory, orders, sync } = summary;
  const syncIssues = sync.not_configured + sync.failed + (sync.partial || 0);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Welcome to Marketplace Operations System.</p>
        </div>
        <div className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-xs font-bold border border-orange-200 flex items-center gap-1">
          <Zap className="h-3 w-3" />
          Shopee Focus Active
        </div>
      </div>

      {/* Operational Alerts */}
      {(inventory.low_stock_count > 0 || product_mappings.unmapped_products > 0 || syncIssues > 0 || (shopeeOps?.alerts && shopeeOps.alerts.length > 0)) && (
        <div className="space-y-3">
          <h2 className="text-lg font-medium text-gray-900">Requires Attention</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Shopee Specific Alerts */}
            {shopeeOps?.alerts.map((alert, idx) => (
              <div key={idx} className={cn(
                "border-l-4 p-4 rounded-r-md flex justify-between items-center",
                alert.severity === 'critical' ? "bg-red-50 border-red-400" : 
                alert.severity === 'warning' ? "bg-amber-50 border-amber-400" : "bg-blue-50 border-blue-400"
              )}>
                <div className="flex items-center">
                  {alert.severity === 'critical' ? <ShieldAlert className="h-5 w-5 text-red-400 mr-3" /> : 
                   alert.severity === 'warning' ? <AlertTriangle className="h-5 w-5 text-amber-400 mr-3" /> : <Info className="h-5 w-5 text-blue-400 mr-3" />}
                  <div>
                    <p className={cn("text-sm font-bold", 
                      alert.severity === 'critical' ? "text-red-800" : 
                      alert.severity === 'warning' ? "text-amber-800" : "text-blue-800")}>{alert.title}</p>
                    <p className={cn("text-xs", 
                      alert.severity === 'critical' ? "text-red-700" : 
                      alert.severity === 'warning' ? "text-amber-700" : "text-blue-700")}>{alert.message}</p>
                  </div>
                </div>
                <Link to={alert.action_target} className={cn("text-sm font-medium", 
                  alert.severity === 'critical' ? "text-red-800 hover:text-red-600" : 
                  alert.severity === 'warning' ? "text-amber-800 hover:text-amber-600" : "text-blue-800 hover:text-blue-600")}>{alert.action_label}</Link>
              </div>
            ))}

            {/* General Alerts */}
            {inventory.low_stock_count > 0 && !shopeeOps?.alerts.find(a => a.type === 'low_stock') && (
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-md flex justify-between items-center">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-amber-400 mr-3" />
                  <div>
                    <p className="text-sm font-bold text-amber-800">{inventory.low_stock_count} Low Stock Items</p>
                    <p className="text-xs text-amber-700">Inventory needs replenishment.</p>
                  </div>
                </div>
                <Link to="/inventory" className="text-sm font-medium text-amber-800 hover:text-amber-600">Review</Link>
              </div>
            )}
            
            {product_mappings.unmapped_products > 0 && !shopeeOps?.alerts.find(a => a.type === 'unmapped_listings') && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-md flex justify-between items-center">
                <div className="flex items-center">
                  <Link2 className="h-5 w-5 text-blue-400 mr-3" />
                  <div>
                    <p className="text-sm font-bold text-blue-800">{product_mappings.unmapped_products} Unmapped Products</p>
                    <p className="text-xs text-blue-700">Products missing marketplace links.</p>
                  </div>
                </div>
                <Link to="/product-mappings" className="text-sm font-medium text-blue-800 hover:text-blue-600">Review</Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Total Sales" 
          value={`Rp ${orders.total_sales_amount.toLocaleString()}`} 
          subtext={`${orders.completed} completed orders`}
          icon={DollarSign} 
          colorClass="bg-green-500"
          link="/reports"
        />
        <MetricCard 
          title="Pending Orders" 
          value={orders.pending} 
          subtext={`Out of ${orders.total} total orders`}
          icon={ShoppingCart} 
          colorClass="bg-blue-500"
          link="/orders"
        />
        <MetricCard 
          title="Mapping Coverage" 
          value={`${product_mappings.coverage_percent.toFixed(1)}%`} 
          subtext={`${product_mappings.mapped_products} of ${products.total} products`}
          icon={Link2} 
          colorClass="bg-indigo-500"
          link="/product-mappings"
        />
        <MetricCard 
          title="Active Stores" 
          value={stores.active} 
          subtext={`Across ${Object.keys(stores.by_marketplace).length} marketplaces`}
          icon={Store} 
          colorClass="bg-purple-500"
          link="/stores"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Shopee Operations Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-500" />
              Shopee Operations Control
            </h2>
          </div>
          <Card>
            {isShopeeLoading ? (
              <div className="p-8"><LoadingState text="Loading Shopee operations..." /></div>
            ) : !shopeeOps ? (
              <div className="p-8 text-center text-gray-500">Shopee operations data unavailable.</div>
            ) : (
              <div className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
                  <div className="text-center">
                    <p className="text-xs font-medium text-gray-500 uppercase">Stores Connected</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{shopeeOps.metrics.connected_stores} / {shopeeOps.metrics.total_stores}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium text-gray-500 uppercase">Sync Failures (24h)</p>
                    <p className={cn("text-2xl font-bold mt-1", shopeeOps.metrics.failed_sync_count_24h > 0 ? "text-red-600" : "text-gray-900")}>
                      {shopeeOps.metrics.failed_sync_count_24h}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium text-gray-500 uppercase">Mapped Listings</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{shopeeOps.metrics.mapped_listing_count}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium text-gray-500 uppercase">Unmapped Listings</p>
                    <p className={cn("text-2xl font-bold mt-1", shopeeOps.metrics.unmapped_listing_count > 0 ? "text-orange-600" : "text-gray-900")}>
                      {shopeeOps.metrics.unmapped_listing_count}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 border-t pt-6">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Last Successful Syncs</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                      <ShoppingCart className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase">Orders Pull</p>
                        <p className="text-xs font-medium text-gray-900">
                          {shopeeOps.metrics.last_successful_order_sync ? 
                            new Date(shopeeOps.metrics.last_successful_order_sync.created_at).toLocaleTimeString() : 'Never'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                      <Package className="h-5 w-5 text-indigo-500" />
                      <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase">Product Refresh</p>
                        <p className="text-xs font-medium text-gray-900">
                          {shopeeOps.metrics.last_successful_product_sync ? 
                            new Date(shopeeOps.metrics.last_successful_product_sync.created_at).toLocaleTimeString() : 'Never'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                      <RefreshCw className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase">Stock Push</p>
                        <p className="text-xs font-medium text-gray-900">
                          {shopeeOps.metrics.last_successful_stock_push ? 
                            new Date(shopeeOps.metrics.last_successful_stock_push.created_at).toLocaleTimeString() : 'Never'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-center">
                  <Link to="/reports" className="inline-flex items-center px-4 py-2 border border-blue-600 rounded-md text-sm font-medium text-blue-600 hover:bg-blue-50">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Open Reconciliation Report
                  </Link>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Quick Links */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
          <Card>
            <div className="divide-y divide-gray-200">
              <Link to="/stores" className="flex items-center p-4 hover:bg-gray-50 transition-colors">
                <Store className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-sm font-medium text-gray-900 flex-1">Manage Stores</span>
                <ArrowRight className="h-4 w-4 text-gray-300" />
              </Link>
              <Link to="/products" className="flex items-center p-4 hover:bg-gray-50 transition-colors">
                <Package className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-sm font-medium text-gray-900 flex-1">Manage Products</span>
                <ArrowRight className="h-4 w-4 text-gray-300" />
              </Link>
              <Link to="/product-mappings" className="flex items-center p-4 hover:bg-gray-50 transition-colors">
                <Link2 className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-sm font-medium text-gray-900 flex-1">Map Products</span>
                <ArrowRight className="h-4 w-4 text-gray-300" />
              </Link>
              <Link to="/inventory" className="flex items-center p-4 hover:bg-gray-50 transition-colors">
                <AlertTriangle className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-sm font-medium text-gray-900 flex-1">Check Inventory</span>
                <ArrowRight className="h-4 w-4 text-gray-300" />
              </Link>
              <Link to="/orders" className="flex items-center p-4 hover:bg-gray-50 transition-colors">
                <ShoppingCart className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-sm font-medium text-gray-900 flex-1">Process Orders</span>
                <ArrowRight className="h-4 w-4 text-gray-300" />
              </Link>
              <Link to="/sync" className="flex items-center p-4 hover:bg-gray-50 transition-colors">
                <RefreshCw className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-sm font-medium text-gray-900 flex-1">Sync Center</span>
                <ArrowRight className="h-4 w-4 text-gray-300" />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

