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
  Clock,
  History,
  ArrowRight,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { dashboardApi } from '@/lib/api/dashboard';
import { Card, CardBody } from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
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
  const { data: summary, isLoading, error } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: dashboardApi.getSummary,
  });

  if (isLoading) {
    return (
      <div className="p-12">
        <LoadingState text="Loading dashboard metrics..." />
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="p-12 text-center text-red-500">
        Failed to load dashboard data. Please try again later.
      </div>
    );
  }

  const { stores, products, product_mappings, inventory, orders, sync } = summary;

  const syncIssues = sync.not_configured + sync.failed;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome to Marketplace Operations System.</p>
      </div>

      {/* Operational Alerts */}
      {(inventory.low_stock_count > 0 || product_mappings.unmapped_products > 0 || syncIssues > 0) && (
        <div className="space-y-3">
          <h2 className="text-lg font-medium text-gray-900">Requires Attention</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {inventory.low_stock_count > 0 && (
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
            
            {product_mappings.unmapped_products > 0 && (
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

            {syncIssues > 0 && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-md flex justify-between items-center">
                <div className="flex items-center">
                  <RefreshCw className="h-5 w-5 text-red-400 mr-3" />
                  <div>
                    <p className="text-sm font-bold text-red-800">{syncIssues} Sync Issues</p>
                    <p className="text-xs text-red-700">Jobs failed or not configured.</p>
                  </div>
                </div>
                <Link to="/sync" className="text-sm font-medium text-red-800 hover:text-red-600">Review</Link>
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

        {/* Recent Sync Logs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Recent Sync Activity</h2>
            <Link to="/sync" className="text-sm text-blue-600 hover:text-blue-500 font-medium">View all logs</Link>
          </div>
          <Card>
            {!sync.latest_logs?.length ? (
              <EmptyState
                icon={<History className="w-8 h-8" />}
                title="No recent sync activity"
                description="Sync jobs haven't been run yet."
              />
            ) : (
              <div className="divide-y divide-gray-200">
                {sync.latest_logs.map(log => (
                  <div key={log.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {log.status === 'success' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : log.status === 'failed' ? (
                        <XCircle className="h-5 w-5 text-red-500" />
                      ) : log.status === 'not_configured' ? (
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-gray-400" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {log.sync_job?.job_name || 'Manual Sync'} 
                          <span className="ml-2 text-xs font-normal text-gray-500 capitalize px-2 py-0.5 bg-gray-100 rounded-full">
                            {log.sync_type}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1 flex items-center">
                          {log.message || log.error_message || log.status}
                          <span className="mx-2">&bull;</span>
                          {new Date(log.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
