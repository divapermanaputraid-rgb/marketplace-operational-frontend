import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/lib/api/orders';
import { storesApi } from '@/lib/api/stores';
import { productsApi } from '@/lib/api/products';
import type { 
  Order, 
  CreateOrderRequest, 
  UpdateOrderRequest,
  OrderStatus,
  PaymentStatus
} from '@/types/order';
import type { InventoryReservationResult } from '@/types/inventory';

import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Eye,
  Store as StoreIcon
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const ORDER_STATUSES: { value: OrderStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'ready_to_process', label: 'Ready to Process', color: 'bg-blue-100 text-blue-800' },
  { value: 'packed', label: 'Packed', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'shipped', label: 'Shipped', color: 'bg-purple-100 text-purple-800' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-gray-100 text-gray-800' },
  { value: 'returned', label: 'Returned', color: 'bg-orange-100 text-orange-800' },
  { value: 'failed', label: 'Failed', color: 'bg-red-100 text-red-800' },
];

const PAYMENT_STATUSES: { value: PaymentStatus; label: string; color: string }[] = [
  { value: 'unpaid', label: 'Unpaid', color: 'bg-red-100 text-red-800' },
  { value: 'paid', label: 'Paid', color: 'bg-green-100 text-green-800' },
  { value: 'cod', label: 'COD', color: 'bg-blue-100 text-blue-800' },
  { value: 'refunded', label: 'Refunded', color: 'bg-gray-100 text-gray-800' },
  { value: 'unknown', label: 'Unknown', color: 'bg-gray-100 text-gray-800' },
];

const MARKETPLACES = [
  { value: 'shopee', label: 'Shopee' },
  { value: 'tokopedia_shop', label: 'Tokopedia' },
  { value: 'tiktok_shop', label: 'TikTok Shop' },
  { value: 'manual', label: 'Manual Order' },
];

export function OrdersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [storeFilter, setStoreFilter] = useState('');
  const [marketplaceFilter, setMarketplaceFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders', storeFilter, marketplaceFilter, statusFilter, paymentStatusFilter, search],
    queryFn: () => ordersApi.list({ 
      store_id: storeFilter,
      marketplace: marketplaceFilter,
      order_status: statusFilter,
      payment_status: paymentStatusFilter,
      search
    }),
  });

  const { data: stores } = useQuery({
    queryKey: ['stores'],
    queryFn: () => storesApi.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: ordersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this order?')) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    const config = ORDER_STATUSES.find(s => s.value === status) || ORDER_STATUSES[0];
    return (
      <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", config.color)}>
        {config.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    const config = PAYMENT_STATUSES.find(s => s.value === status) || PAYMENT_STATUSES[0];
    return (
      <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", config.color)}>
        {config.label}
      </span>
    );
  };

  const getMarketplaceName = (value: string) => {
    return MARKETPLACES.find(m => m.value === value)?.label || value;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track your marketplace orders.</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Manual Order
        </button>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col xl:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search order number or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <select
                value={storeFilter}
                onChange={(e) => setStoreFilter(e.target.value)}
                className="pl-9 form-select block w-full sm:w-auto rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">All Stores</option>
                {stores?.map(s => (
                  <option key={s.id} value={s.id}>{s.store_name}</option>
                ))}
              </select>
            </div>
            <select
              value={marketplaceFilter}
              onChange={(e) => setMarketplaceFilter(e.target.value)}
              className="form-select block w-full sm:w-auto rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">All Marketplaces</option>
              {MARKETPLACES.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select block w-full sm:w-auto rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">All Statuses</option>
              {ORDER_STATUSES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="form-select block w-full sm:w-auto rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">All Payments</option>
              {PAYMENT_STATUSES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8"><LoadingState text="Loading orders..." /></div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">Failed to load orders.</div>
        ) : !orders?.length ? (
          <EmptyState
            icon={<ShoppingCart className="w-8 h-8" />}
            title="No orders found"
            description="Create a manual order or wait for future marketplace sync."
            action={
              <button
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Manual Order
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                  <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.order_number}</div>
                      <div className="text-xs text-gray-500 flex items-center mt-1">
                        <StoreIcon className="h-3 w-3 mr-1" />
                        {order.store?.store_name || 'Unknown Store'} 
                        <span className="mx-1">&bull;</span> 
                        {getMarketplaceName(order.marketplace)}
                      </div>
                      {order.marketplace === 'manual' && (
                        <div className="text-[10px] text-blue-600 mt-0.5 font-medium uppercase tracking-wider">Manual Order</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.customer_name || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        {order.currency} {order.total_amount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.order_status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPaymentStatusBadge(order.payment_status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        <button
                          onClick={() => setViewingOrder(order)}
                          className="text-gray-400 hover:text-blue-600"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEditingOrder(order)}
                          className="text-gray-400 hover:text-gray-900"
                          title="Edit Status"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(order.id)}
                          className="text-gray-400 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
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
        <CreateOrderModal onClose={() => setIsCreateOpen(false)} />
      )}

      {editingOrder && (
        <EditOrderModal order={editingOrder} onClose={() => setEditingOrder(null)} />
      )}

      {viewingOrder && (
        <ViewOrderModal orderId={viewingOrder.id} onClose={() => setViewingOrder(null)} />
      )}
    </div>
  );
}

function CreateOrderModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const { data: stores } = useQuery({ queryKey: ['stores'], queryFn: () => storesApi.list() });
  const { data: products } = useQuery({ queryKey: ['products'], queryFn: () => productsApi.list() });

  const [formData, setFormData] = useState<CreateOrderRequest>(() => ({
    store_id: '',
    marketplace: 'manual',
    order_number: `ORD-${Date.now()}`,
    customer_name: '',
    customer_phone: '',
    customer_address: '',
    order_status: 'pending',
    payment_status: 'unpaid',
    shipping_fee: 0,
    discount_amount: 0,
    items: []
  }));

  const mutation = useMutation({
    mutationFn: ordersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      onClose();
    }
  });

  const handleStoreChange = (storeId: string) => {
    const store = stores?.find(s => s.id === storeId);
    setFormData({
      ...formData,
      store_id: storeId,
      marketplace: store?.marketplace || 'manual'
    });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { product_name: '', quantity: 1, unit_price: 0 }
      ]
    });
  };

  const removeItem = (index: number) => {
    const newItems = [...formData.items];
    newItems.splice(index, 1);
    setFormData({ ...formData, items: newItems });
  };

  const updateItem = <K extends keyof typeof formData.items[0]>(index: number, field: K, value: typeof formData.items[0][K]) => {
    const newItems = [...formData.items];
    const updatedItem = { ...newItems[index] };
    updatedItem[field] = value;
    newItems[index] = updatedItem;
    
    // Auto-fill price if product is selected
    if (field === 'product_id' && typeof value === 'string') {
      const product = products?.find(p => p.id === value);
      if (product) {
        newItems[index].product_name = product.name;
        newItems[index].unit_price = product.selling_price || 0;
        newItems[index].sku = product.sku;
      }
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const subtotal = formData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const total = subtotal + (formData.shipping_fee || 0) - (formData.discount_amount || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.items.length === 0) {
      alert("Please add at least one item to the order.");
      return;
    }
    mutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-500 bg-opacity-75">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Create Manual Order</h3>
          </div>
          
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {mutation.isError && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md">
                {mutation.error instanceof Error ? mutation.error.message : 'Failed to create order'}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 border-b pb-2">Order Information</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Store</label>
                  <select
                    required
                    value={formData.store_id}
                    onChange={(e) => handleStoreChange(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="">Select a store...</option>
                    {stores?.map(s => (
                      <option key={s.id} value={s.id}>{s.store_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Marketplace</label>
                  <select
                    required
                    value={formData.marketplace}
                    onChange={(e) => setFormData({...formData, marketplace: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    {MARKETPLACES.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Order Number</label>
                  <input
                    type="text"
                    required
                    value={formData.order_number}
                    onChange={(e) => setFormData({...formData, order_number: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Order Status</label>
                    <select
                      value={formData.order_status}
                      onChange={(e) => setFormData({...formData, order_status: e.target.value as OrderStatus})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      {ORDER_STATUSES.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Payment Status</label>
                    <select
                      value={formData.payment_status}
                      onChange={(e) => setFormData({...formData, payment_status: e.target.value as PaymentStatus})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      {PAYMENT_STATUSES.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 border-b pb-2">Customer Information</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                  <input
                    type="text"
                    value={formData.customer_name || ''}
                    onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="text"
                    value={formData.customer_phone || ''}
                    onChange={(e) => setFormData({...formData, customer_phone: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <textarea
                    rows={2}
                    value={formData.customer_address || ''}
                    onChange={(e) => setFormData({...formData, customer_address: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h4 className="font-medium text-gray-900">Order Items</h4>
                <button
                  type="button"
                  onClick={addItem}
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Item
                </button>
              </div>
              
              {formData.items.length === 0 ? (
                <div className="text-center py-4 text-sm text-gray-500 border-2 border-dashed rounded-md">
                  No items added yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex items-start gap-4 bg-gray-50 p-3 rounded-md border border-gray-200">
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Product</label>
                            <select
                              value={item.product_id || ''}
                              onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            >
                              <option value="">Custom Item...</option>
                              {products?.map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Item Name</label>
                            <input
                              type="text"
                              required
                              value={item.product_name}
                              onChange={(e) => updateItem(index, 'product_name', e.target.value)}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Qty</label>
                            <input
                              type="number"
                              min="1"
                              required
                              value={item.quantity}
                              onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Unit Price</label>
                            <input
                              type="number"
                              min="0"
                              required
                              value={item.unit_price}
                              onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Total</label>
                            <div className="block w-full py-1.5 px-3 bg-gray-100 rounded-md sm:text-sm font-medium text-gray-900 border border-transparent">
                              {(item.quantity * item.unit_price).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-gray-400 hover:text-red-500 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 border-b pb-2">Totals</h4>
              <div className="flex justify-end">
                <div className="w-64 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-medium">{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Shipping</span>
                    <input
                      type="number"
                      value={formData.shipping_fee}
                      onChange={(e) => setFormData({...formData, shipping_fee: parseFloat(e.target.value) || 0})}
                      className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-right"
                    />
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Discount</span>
                    <input
                      type="number"
                      value={formData.discount_amount}
                      onChange={(e) => setFormData({...formData, discount_amount: parseFloat(e.target.value) || 0})}
                      className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-right text-red-600"
                    />
                  </div>
                  <div className="flex justify-between text-base font-bold border-t pt-2">
                    <span className="text-gray-900">Total (IDR)</span>
                    <span className="text-gray-900">{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 rounded-b-lg border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending || formData.items.length === 0}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {mutation.isPending ? 'Saving...' : 'Create Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditOrderModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<UpdateOrderRequest>({
    order_status: order.order_status,
    payment_status: order.payment_status,
    notes: order.notes || ''
  });

  const mutation = useMutation({
    mutationFn: (data: UpdateOrderRequest) => ordersApi.update(order.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      onClose();
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-500 bg-opacity-75">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(formData); }}>
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Update Order {order.order_number}</h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Order Status</label>
              <select
                value={formData.order_status}
                onChange={(e) => setFormData({...formData, order_status: e.target.value as OrderStatus})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                {ORDER_STATUSES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Status</label>
              <select
                value={formData.payment_status}
                onChange={(e) => setFormData({...formData, payment_status: e.target.value as PaymentStatus})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                {PAYMENT_STATUSES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                rows={3}
                value={formData.notes || ''}
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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ViewOrderModal({ orderId, onClose }: { orderId: string; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [actionResult, setActionResult] = useState<InventoryReservationResult | null>(null);

  const { data: order, isLoading } = useQuery({
    queryKey: ['orders', orderId],
    queryFn: () => ordersApi.get(orderId)
  });

  const reserveMutation = useMutation({
    mutationFn: () => ordersApi.reserveStock(orderId),
    onSuccess: (result) => {
      setActionResult(result);
      queryClient.invalidateQueries({ queryKey: ['orders', orderId] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : 'Failed to reserve stock';
      setActionResult({
        status: 'error',
        message: message,
        records_processed: 0,
        records_reserved: 0,
        records_released: 0,
        records_confirmed: 0,
        records_skipped: 0,
        errors: [message]
      });
    }
  });

  const releaseMutation = useMutation({
    mutationFn: () => ordersApi.releaseReservation(orderId),
    onSuccess: (result) => {
      setActionResult(result);
      queryClient.invalidateQueries({ queryKey: ['orders', orderId] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : 'Failed to release reservation';
      setActionResult({
        status: 'error',
        message: message,
        records_processed: 0,
        records_reserved: 0,
        records_released: 0,
        records_confirmed: 0,
        records_skipped: 0,
        errors: [message]
      });
    }
  });


  const isActionLoading = reserveMutation.isPending || releaseMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-500 bg-opacity-75">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Order Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 text-2xl">&times;</button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <LoadingState />
          ) : !order ? (
            <div className="text-center text-red-500">Order not found</div>
          ) : (
            <div className="space-y-6">
              {/* Action Result Alerts */}
              {actionResult && (
                <div className={cn(
                  "p-4 rounded-md border mb-4",
                  actionResult.status === 'success' ? "bg-green-50 border-green-200 text-green-800" :
                  actionResult.status === 'insufficient_stock' ? "bg-red-50 border-red-200 text-red-800" :
                  actionResult.status === 'partially_mapped' ? "bg-yellow-50 border-yellow-200 text-yellow-800" :
                  "bg-red-50 border-red-200 text-red-800"
                )}>
                  <div className="flex flex-col gap-1">
                    <p className="font-bold text-sm uppercase tracking-tight">{actionResult.message}</p>
                    <div className="text-xs space-x-3">
                      <span>Processed: {actionResult.records_processed}</span>
                      {actionResult.records_reserved > 0 && <span className="font-medium">Reserved: {actionResult.records_reserved}</span>}
                      {actionResult.records_released > 0 && <span className="font-medium">Released: {actionResult.records_released}</span>}
                      {actionResult.records_skipped > 0 && <span className="text-gray-600 italic">Skipped: {actionResult.records_skipped}</span>}
                    </div>
                    {actionResult.records_skipped > 0 && actionResult.status === 'success' && (
                      <p className="text-[10px] mt-1 text-blue-600">Note: Some items were skipped (either already processed or not mapped to inventory).</p>
                    )}
                    {actionResult.errors && actionResult.errors.length > 0 && (
                      <ul className="mt-2 list-disc list-inside text-[11px] text-red-600">
                        {actionResult.errors.map((err, i) => <li key={i}>{err}</li>)}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{order.order_number}</h2>
                  <div className="text-sm text-gray-500 mt-1">
                    {order.store?.store_name} &bull; {order.marketplace}
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                    ORDER_STATUSES.find(s => s.value === order.order_status)?.color || 'bg-gray-100 text-gray-800'
                  )}>
                    {ORDER_STATUSES.find(s => s.value === order.order_status)?.label || order.order_status}
                  </span>
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                    PAYMENT_STATUSES.find(s => s.value === order.payment_status)?.color || 'bg-gray-100 text-gray-800'
                  )}>
                    {PAYMENT_STATUSES.find(s => s.value === order.payment_status)?.label || order.payment_status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div>
                  <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">Customer Info</h4>
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">{order.customer_name || 'N/A'}</p>
                    <p className="text-gray-600">{order.customer_phone}</p>
                    <p className="text-gray-600 mt-1 whitespace-pre-wrap">{order.customer_address}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">Order Info</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between"><span className="text-gray-500">Date:</span> <span>{order.ordered_at ? new Date(order.ordered_at).toLocaleString() : 'N/A'}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">External ID:</span> <span>{order.external_order_id || 'N/A'}</span></div>
                  </div>
                </div>
              </div>

              {/* Inventory Actions Area */}
              <div className="border border-orange-200 bg-orange-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-orange-900">Inventory Controls</h4>
                    <p className="text-xs text-orange-700 mt-0.5">Manually manage stock reservations for this order.</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => reserveMutation.mutate()}
                      disabled={isActionLoading}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
                    >
                      {reserveMutation.isPending ? 'Reserving...' : 'Reserve Stock'}
                    </button>
                    <button
                      onClick={() => releaseMutation.mutate()}
                      disabled={isActionLoading}
                      className="inline-flex items-center px-3 py-1.5 border border-orange-300 text-xs font-medium rounded shadow-sm text-orange-700 bg-white hover:bg-orange-50 disabled:opacity-50"
                    >
                      {releaseMutation.isPending ? 'Releasing...' : 'Release Reservation'}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-3 border-b pb-2">Line Items</h4>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                      <th className="py-2 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                      <th className="py-2 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {order.items?.map(item => (
                      <tr key={item.id}>
                        <td className="py-3">
                          <div className="text-sm font-medium text-gray-900">{item.product_name}</div>
                          <div className="flex items-center mt-0.5 space-x-2">
                            {item.sku && <span className="text-[10px] font-mono bg-gray-100 px-1 rounded text-gray-500">{item.sku}</span>}
                            {item.product_id ? (
                              <span className="text-[10px] text-green-600 font-medium">Mapped</span>
                            ) : (
                              <span className="text-[10px] text-red-500 italic">Unmapped</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 text-right text-sm text-gray-900">{item.quantity}</td>
                        <td className="py-3 text-right text-sm text-gray-500">{item.unit_price.toLocaleString()}</td>
                        <td className="py-3 text-right text-sm font-medium text-gray-900">{item.total_price.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Subtotal</span>
                    <span>{order.subtotal_amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Shipping</span>
                    <span>{order.shipping_fee.toLocaleString()}</span>
                  </div>
                  {order.discount_amount > 0 && (
                    <div className="flex justify-between text-sm text-red-500">
                      <span>Discount</span>
                      <span>-{order.discount_amount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                    <span>Total</span>
                    <span>{order.currency} {order.total_amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {order.notes && (
                <div className="bg-yellow-50 p-3 rounded-md text-sm text-yellow-800 border border-yellow-200">
                  <span className="font-bold">Notes:</span> {order.notes}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

