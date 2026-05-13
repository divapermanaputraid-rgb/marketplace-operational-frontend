import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '@/lib/api/products';
import type { Product, CreateProductRequest, UpdateProductRequest } from '@/types/product';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Package, Plus, Search, Filter, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';

const PRODUCT_STATUSES = [
  { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-800' },
  { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800' },
  { value: 'inactive', label: 'Inactive', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'archived', label: 'Archived', color: 'bg-red-100 text-red-800' },
];

export function ProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['products', statusFilter, search],
    queryFn: () => productsApi.list({ 
      status: statusFilter,
      search
    }),
  });

  const deleteMutation = useMutation({
    mutationFn: productsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to archive this product?')) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = PRODUCT_STATUSES.find(s => s.value === status) || PRODUCT_STATUSES[0];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Master</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your internal product catalog and base SKUs.</p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </button>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by product name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-9 form-select block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">All Statuses</option>
                {PRODUCT_STATUSES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8"><LoadingState text="Loading products..." /></div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">Failed to load products.</div>
        ) : !data?.length ? (
          <EmptyState
            icon={<Package className="w-8 h-8" />}
            title="No products found"
            description="Create your first internal product/SKU before mapping it to marketplace listings."
            action={
              <button
                onClick={() => { setEditingProduct(null); setIsFormOpen(true); }}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Info</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category & Brand</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((product) => {
                  const primaryImg = product.images?.find(img => img.is_primary)?.image_url;
                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center overflow-hidden">
                            {primaryImg ? (
                              <img src={primaryImg} alt={product.name} className="h-full w-full object-cover" />
                            ) : (
                              <ImageIcon className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500 font-mono">{product.sku}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.category || '-'}</div>
                        <div className="text-sm text-gray-500">{product.brand || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {product.selling_price ? `${product.currency} ${product.selling_price.toLocaleString()}` : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(product.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-3">
                          <button
                            onClick={() => { setEditingProduct(product); setIsFormOpen(true); }}
                            className="text-gray-400 hover:text-gray-900"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-gray-400 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {isFormOpen && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
}

function ProductFormModal({ product, onClose }: { product: Product | null, onClose: () => void }) {
  const queryClient = useQueryClient();
  const isEditing = !!product;

  const primaryImage = product?.images?.find(i => i.is_primary)?.image_url;

  const [formData, setFormData] = useState<Partial<CreateProductRequest & UpdateProductRequest>>(
    product ? {
      name: product.name,
      description: product.description || '',
      brand: product.brand || '',
      category: product.category || '',
      status: product.status,
      cost_price: product.cost_price,
      selling_price: product.selling_price,
      weight_grams: product.weight_grams,
      length_cm: product.length_cm,
      width_cm: product.width_cm,
      height_cm: product.height_cm,
      primary_image_url: primaryImage || ''
    } : {
      sku: '',
      name: '',
      description: '',
      brand: '',
      category: '',
      status: 'draft',
      primary_image_url: ''
    }
  );

  const mutation = useMutation({
    mutationFn: (data: typeof formData) => {
      if (isEditing) {
        return productsApi.update(product.id, data as UpdateProductRequest);
      }
      return productsApi.create(data as CreateProductRequest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData };
    
    // Convert numeric NaN to undefined
    if (Number.isNaN(payload.cost_price)) payload.cost_price = undefined;
    if (Number.isNaN(payload.selling_price)) payload.selling_price = undefined;
    if (Number.isNaN(payload.weight_grams)) payload.weight_grams = undefined;
    
    mutation.mutate(payload);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 max-h-[80vh] overflow-y-auto">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6 border-b pb-2">
                {isEditing ? 'Edit Product' : 'Add New Product'}
              </h3>
              
              {mutation.isError && (
                <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-md text-sm">
                  {mutation.error instanceof Error ? mutation.error.message : 'Failed to save product'}
                </div>
              )}

              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                {!isEditing && (
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">SKU</label>
                    <input
                      type="text"
                      required
                      value={formData.sku || ''}
                      onChange={e => setFormData({ ...formData, sku: e.target.value })}
                      className="mt-1 form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm font-mono"
                      placeholder="e.g. SKU-123"
                    />
                  </div>
                )}

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Product Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                  <textarea
                    rows={3}
                    value={formData.description || ''}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 form-textarea block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Category (Optional)</label>
                  <input
                    type="text"
                    value={formData.category || ''}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="mt-1 form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Brand (Optional)</label>
                  <input
                    type="text"
                    value={formData.brand || ''}
                    onChange={e => setFormData({ ...formData, brand: e.target.value })}
                    className="mt-1 form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Cost Price (IDR)</label>
                  <input
                    type="number"
                    value={formData.cost_price || ''}
                    onChange={e => setFormData({ ...formData, cost_price: parseFloat(e.target.value) })}
                    className="mt-1 form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Selling Price (IDR)</label>
                  <input
                    type="number"
                    value={formData.selling_price || ''}
                    onChange={e => setFormData({ ...formData, selling_price: parseFloat(e.target.value) })}
                    className="mt-1 form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Weight (grams)</label>
                  <input
                    type="number"
                    value={formData.weight_grams || ''}
                    onChange={e => setFormData({ ...formData, weight_grams: parseInt(e.target.value, 10) })}
                    className="mt-1 form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as CreateProductRequest['status'] })}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    {PRODUCT_STATUSES.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2 pt-4 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Media</label>
                  <div className="flex gap-4">
                    {formData.primary_image_url && (
                      <div className="h-24 w-24 border rounded-md overflow-hidden bg-gray-50 flex-shrink-0">
                        <img src={formData.primary_image_url} alt="Preview" className="h-full w-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Primary Image URL</label>
                      <input
                        type="url"
                        value={formData.primary_image_url || ''}
                        onChange={e => setFormData({ ...formData, primary_image_url: e.target.value })}
                        className="form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200">
              <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {mutation.isPending ? 'Saving...' : 'Save Product'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
