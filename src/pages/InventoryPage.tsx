import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '@/lib/api/inventory';
import { productsApi } from '@/lib/api/products';
import type { 
  InventoryItem, 
  CreateInventoryItemRequest, 
  AdjustStockRequest,
  MovementType
} from '@/types/inventory';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { 
  ArrowRightLeft, 
  Plus, 
  Search, 
  History, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownLeft,
  Settings,
  Link2
} from 'lucide-react';

const MOVEMENT_TYPES: { value: MovementType; label: string; icon: React.ElementType; color: string }[] = [

  { value: 'adjustment_in', label: 'Stock In', icon: ArrowUpRight, color: 'text-green-600' },
  { value: 'adjustment_out', label: 'Stock Out', icon: ArrowDownLeft, color: 'text-red-600' },
  { value: 'returned', label: 'Returned', icon: ArrowUpRight, color: 'text-blue-600' },
  { value: 'damaged', label: 'Damaged', icon: ArrowDownLeft, color: 'text-orange-600' },
  { value: 'manual_correction', label: 'Correction', icon: ArrowRightLeft, color: 'text-gray-600' },
];

export function InventoryPage() {
  const [search, setSearch] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);
  const [historyItem, setHistoryItem] = useState<InventoryItem | null>(null);

  const { data: inventory, isLoading, error } = useQuery({
    queryKey: ['inventory', search, lowStockFilter],
    queryFn: () => inventoryApi.list({ 
      search,
      low_stock: lowStockFilter ? 'true' : ''
    }),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor and manage your internal warehouse stock.</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Inventory
        </button>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={lowStockFilter}
                onChange={() => setLowStockFilter(!lowStockFilter)}
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              <span className="ms-3 text-sm font-medium text-gray-700 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-amber-500" />
                Low Stock Only
              </span>
            </label>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8"><LoadingState text="Loading inventory..." /></div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">Failed to load inventory.</div>
        ) : !inventory?.length ? (
          <EmptyState
            icon={<ArrowRightLeft className="w-8 h-8" />}
            title="No inventory items found"
            description="Start by adding internal stock for your products and variants."
            action={
              <button
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Inventory
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product / SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Available</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mapped</th>
                  <th className="relative px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{item.product?.name || 'Unknown'}</div>
                      <div className="text-sm text-gray-500 font-mono">{item.sku}</div>
                      {item.product_variant && (
                        <div className="text-xs text-blue-600 mt-0.5">Variant: {item.product_variant.name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {item.location_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{item.available_quantity}</div>
                      <div className="text-xs text-gray-400">Safety: {item.safety_stock}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.is_low_stock ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          <AlertTriangle className="mr-1 h-3 w-3" />
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Healthy
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Link2 className="h-3 w-3 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">{item.mapped_listing_count}</span>
                        <div className="flex -space-x-1 ml-1">
                          {item.marketplaces_mapped.map(m => (
                            <div key={m} className="w-4 h-4 rounded-full border border-white bg-blue-100 flex items-center justify-center overflow-hidden" title={m}>
                              <span className="text-[8px] font-bold text-blue-700 uppercase">{m[0]}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="text-[10px] text-gray-400 italic mt-1">{item.sync_status_label}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setAdjustingItem(item)}
                          className="p-1 text-gray-400 hover:text-blue-600"
                          title="Adjust Stock"
                        >
                          <ArrowRightLeft className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setHistoryItem(item)}
                          className="p-1 text-gray-400 hover:text-gray-900"
                          title="Movement History"
                        >
                          <History className="h-4 w-4" />
                        </button>
                        <button
                          className="p-1 text-gray-400 hover:text-gray-900"
                          title="Settings"
                        >
                          <Settings className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {isCreateOpen && (
        <CreateInventoryModal onClose={() => setIsCreateOpen(false)} />
      )}

      {adjustingItem && (
        <AdjustStockModal item={adjustingItem} onClose={() => setAdjustingItem(null)} />
      )}

      {historyItem && (
        <MovementHistoryModal item={historyItem} onClose={() => setHistoryItem(null)} />
      )}
    </div>
  );
}

function CreateInventoryModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const { data: products } = useQuery({ queryKey: ['products'], queryFn: () => productsApi.list() });

  const [formData, setFormData] = useState<CreateInventoryItemRequest>({
    product_id: '',
    product_variant_id: '',
    sku: '',
    location_name: 'Main Warehouse',
    initial_quantity: 0,
    safety_stock: 5,
    notes: ''
  });

  const selectedProduct = products?.find(p => p.id === formData.product_id);

  const mutation = useMutation({
    mutationFn: inventoryApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      onClose();
    }
  });

  const handleProductChange = (id: string) => {
    const p = products?.find(prod => prod.id === id);
    setFormData({
      ...formData,
      product_id: id,
      product_variant_id: '',
      sku: p?.sku || ''
    });
  };

  const handleVariantChange = (vId: string) => {
    const v = selectedProduct?.variants?.find(variant => variant.id === vId);
    setFormData({
      ...formData,
      product_variant_id: vId,
      sku: v?.sku || selectedProduct?.sku || ''
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-500 bg-opacity-75">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(formData); }}>
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Add Inventory Item</h3>
          </div>
          <div className="p-6 space-y-4">
            {mutation.isError && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md">
                {mutation.error instanceof Error ? mutation.error.message : 'Failed to create item'}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">Product</label>
              <select
                required
                value={formData.product_id}
                onChange={(e) => handleProductChange(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">Select a product...</option>
                {products?.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                ))}
              </select>
            </div>

            {selectedProduct && selectedProduct.variants && selectedProduct.variants.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Variant (Optional)</label>
                <select
                  value={formData.product_variant_id}
                  onChange={(e) => handleVariantChange(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="">No variant / Main Product</option>
                  {selectedProduct.variants.map(v => (
                    <option key={v.id} value={v.id}>{v.name} ({v.sku})</option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">SKU</label>
                <input
                  type="text"
                  required
                  value={formData.sku}
                  onChange={(e) => setFormData({...formData, sku: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  required
                  value={formData.location_name}
                  onChange={(e) => setFormData({...formData, location_name: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Initial Quantity</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.initial_quantity}
                  onChange={(e) => setFormData({...formData, initial_quantity: parseInt(e.target.value)})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Safety Stock</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.safety_stock}
                  onChange={(e) => setFormData({...formData, safety_stock: parseInt(e.target.value)})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>
          <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 rounded-b-lg">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {mutation.isPending ? 'Saving...' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdjustStockModal({ item, onClose }: { item: InventoryItem; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<AdjustStockRequest>({
    movement_type: 'adjustment_in',
    quantity_delta: 1,
    notes: ''
  });

  const mutation = useMutation({
    mutationFn: (data: AdjustStockRequest) => inventoryApi.adjustStock(item.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      onClose();
    }
  });

  const isPositive = ['adjustment_in', 'returned', 'initial'].includes(formData.movement_type);
  const effectiveDelta = isPositive ? Math.abs(formData.quantity_delta) : -Math.abs(formData.quantity_delta);
  const quantityAfter = item.available_quantity + effectiveDelta;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-500 bg-opacity-75">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate({...formData, quantity_delta: effectiveDelta}); }}>
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Adjust Stock</h3>
            <div className="text-xs font-mono text-gray-500">{item.sku}</div>
          </div>
          <div className="p-6 space-y-4">
            <div className="bg-blue-50 p-3 rounded-md">
              <div className="text-xs text-blue-600 font-medium uppercase tracking-wider">Current Stock</div>
              <div className="text-2xl font-bold text-blue-900">{item.available_quantity}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Adjustment Type</label>
              <select
                required
                value={formData.movement_type}
                onChange={(e) => setFormData({...formData, movement_type: e.target.value as MovementType})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                {MOVEMENT_TYPES.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Quantity Change</label>
              <input
                type="number"
                min="1"
                required
                value={formData.quantity_delta}
                onChange={(e) => setFormData({...formData, quantity_delta: parseInt(e.target.value)})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <span className="text-sm text-gray-500">New Available Stock:</span>
              <span className={cn("text-lg font-bold", quantityAfter < 0 ? "text-red-600" : "text-gray-900")}>
                {quantityAfter}
              </span>
            </div>

            {quantityAfter < 0 && (
              <div className="p-2 bg-red-50 text-red-600 text-xs rounded border border-red-100 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Error: Stock cannot be negative.
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Why are you adjusting this?"
              />
            </div>
          </div>
          <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 rounded-b-lg">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending || quantityAfter < 0}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {mutation.isPending ? 'Processing...' : 'Update Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MovementHistoryModal({ item, onClose }: { item: InventoryItem; onClose: () => void }) {
  const { data: movements, isLoading } = useQuery({
    queryKey: ['inventory-movements', item.id],
    queryFn: () => inventoryApi.listMovements(item.id)
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-500 bg-opacity-75">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Movement History</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">&times;</button>
        </div>
        
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm font-bold text-gray-900">{item.product?.name}</div>
              <div className="text-xs text-gray-500 font-mono">{item.sku}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500 uppercase">Available Stock</div>
              <div className="text-lg font-bold text-gray-900">{item.available_quantity}</div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-8"><LoadingState /></div>
          ) : !movements?.length ? (
            <div className="p-8 text-center text-gray-500">No movements recorded yet.</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-2 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-2 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Change</th>
                  <th className="px-6 py-2 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Inventory</th>
                  <th className="px-6 py-2 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {movements.map((mv) => {
                  const typeConfig = MOVEMENT_TYPES.find(t => t.value === mv.movement_type) || { label: mv.movement_type, icon: ArrowRightLeft, color: 'text-gray-600' };
                  const Icon = typeConfig.icon;
                  const isPositive = mv.quantity_delta > 0;
                  
                  return (
                    <tr key={mv.id}>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div className={cn("flex items-center text-xs font-medium", typeConfig.color)}>
                          <Icon className="mr-1.5 h-3 w-3" />
                          {typeConfig.label}
                        </div>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <span className={cn("text-sm font-bold", isPositive ? "text-green-600" : "text-red-600")}>
                          {isPositive ? '+' : ''}{mv.quantity_delta}
                        </span>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div className="text-xs text-gray-900">{mv.quantity_before} &rarr; {mv.quantity_after}</div>
                        {mv.notes && <div className="text-[10px] text-gray-400 mt-0.5 max-w-[150px] truncate" title={mv.notes}>{mv.notes}</div>}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-xs text-gray-500">
                        {new Date(mv.created_at).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Utility function duplicated here for simplicity if lib/utils/cn is not ready/exposed
function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}
