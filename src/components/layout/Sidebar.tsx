import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Store, 
  Package, 
  ShoppingCart, 
  RefreshCw,
  BarChart2,
  Settings,
  ArrowRightLeft,
  Link2
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Stores', href: '/stores', icon: Store },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Product Mapping', href: '/product-mappings', icon: Link2 },
  { name: 'Inventory', href: '/inventory', icon: ArrowRightLeft },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
  { name: 'Sync Center', href: '/sync', icon: RefreshCw },
  { name: 'Reports', href: '/reports', icon: BarChart2 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
      <div className="flex h-16 items-center px-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">ML</span>
          </div>
          <span className="text-xl font-bold text-gray-900">MarketOps Lite</span>
        </div>
      </div>
      
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive 
                  ? "bg-blue-50 text-blue-700" 
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon 
                className={cn(
                  "mr-3 flex-shrink-0 h-5 w-5",
                  isActive ? "text-blue-700" : "text-gray-400 group-hover:text-gray-500"
                )} 
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900">Marketplace Ops System</h4>
          <p className="mt-1 text-xs text-gray-500">
            Internal MVP
          </p>
        </div>
      </div>
    </div>
  );
}
