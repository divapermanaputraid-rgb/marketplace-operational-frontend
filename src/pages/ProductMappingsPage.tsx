import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productMappingsApi } from '@/lib/api/product-mappings';
import { productsApi } from '@/lib/api/products';
import { storesApi } from '@/lib/api/stores';
import { integrationsApi } from '@/lib/api/integrations';
import { inventoryApi } from '@/lib/api/inventory';
import type { 
  ProductMapping, 
  CreateProductMappingRequest, 
  UpdateProductMappingRequest,
  ListingStatus
} from '@/types/product-mapping';
import type { PushStockResult } from '@/types/integration';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Link2, Plus, Search, Filter, Edit2, Trash2, ExternalLink, ArrowUpCircle, CheckCircle2, AlertCircle } from 'lucide-react';

const LISTING_STATUSES: { value: ListingStatus; label: string; color: string }[] = [
  { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-800' },
  { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800' },
  { value: 'inactive', label: 'Inactive', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'deleted', label: 'Deleted', color: 'bg-red-100 text-red-800' },
  { value: 'unknown', label: 'Unknown', color: 'bg-blue-100 text-blue-800' },
];

const MARKETPLACES = [
  { value: 'shopee', label: 'Shopee' },
  { value: 'tokopedia_shop', label: 'Tokopedia' },
  { value: 'tiktok_shop', label: 'TikTok Shop' },
];

export function ProductMappingsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [marketplaceFilter, setMarketplaceFilter] = useState('');
  const [storeFilter, setStoreFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMapping, setEditingMapping] = useState<ProductMapping | null>(null);
  const [isPushModalOpen, setIsPushModalOpen] = useState(false);
  const [mappingToPush, setMappingToPush] = useState<ProductMapping | null>(null);

  const { data: mappings, isLoading, error } = useQuery({
    queryKey: ['product-mappings', marketplaceFilter, storeFilter, statusFilter, search],
    queryFn: () => productMappingsApi.list({ 
      marketplace: marketplaceFilter,
      store_id: storeFilter,
      listing_status: statusFilter,
      search
    }),
  });

  const { data: stores } = useQuery({
    queryKey: ['stores'],
    queryFn: () => storesApi.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: productMappingsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-mappings'] });
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this mapping?')) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusBadge = (status: ListingStatus) => {
    const config = LISTING_STATUSES.find(s => s.value === status) || LISTING_STATUSES[4];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
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
          <h1 className="text-2xl font-bold text-gray-900">Product Mapping</h1>
          <p className="text-sm text-gray-500 mt-1">Map internal products to marketplace listings.</p>
        </div>
        <button
          onClick={() => {
            setEditingMapping(null);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Mapping
        </button>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by listing name or external ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <select
                value={marketplaceFilter}
                onChange={(e) => setMarketplaceFilter(e.target.value)}
                className="pl-9 form-select block w-full sm:w-auto rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">All Marketplaces</option>
                {MARKETPLACES.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <select
              value={storeFilter}
              onChange={(e) => setStoreFilter(e.target.value)}
              className="form-select block w-full sm:w-auto rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">All Stores</option>
              {stores?.map(s => (
                <option key={s.id} value={s.id}>{s.store_name}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select block w-full sm:w-auto rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">All Statuses</option>
              {LISTING_STATUSES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8"><LoadingState text="Loading mappings..." /></div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">Failed to load product mappings.</div>
        ) : !mappings?.length ? (
          <EmptyState
            icon={<Link2 className="w-8 h-8" />}
            title="No mappings found"
            description="Link your internal products to marketplace listings to enable inventory and order sync."
            action={
              <button
                onClick={() => { setEditingMapping(null); setIsFormOpen(true); }}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Mapping
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Internal Product</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marketplace Listing</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sync Status</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mappings.map((mapping) => (
                  <tr key={mapping.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{mapping.product?.name || 'Unknown Product'}</div>
                      <div className="text-sm text-gray-500 font-mono">{mapping.product?.sku || mapping.product_id}</div>
                      {mapping.product_variant && (
                        <div className="text-xs text-blue-600 mt-0.5">
                          Variant: {mapping.product_variant.name}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm text-gray-900 font-medium">
                            {mapping.listing_name || 'Unnamed Listing'}
                            {mapping.listing_url && (
                              <a href={mapping.listing_url} target="_blank" rel="noopener noreferrer" className="ml-1 inline-block text-gray-400 hover:text-blue-500">
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 font-mono">ID: {mapping.external_product_id}</div>
                          {mapping.external_variant_id && (
                            <div className="text-xs text-gray-500 font-mono">VID: {mapping.external_variant_id}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{mapping.store?.store_name || 'Unknown Store'}</div>
                      <div className="text-xs text-gray-500">{getMarketplaceName(mapping.marketplace)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {mapping.price ? `${mapping.currency} ${mapping.price.toLocaleString()}` : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        {getStatusBadge(mapping.listing_status)}
                        <span className="text-[10px] text-gray-400 italic">
                          {mapping.last_synced_at ? `Synced: ${new Date(mapping.last_synced_at).toLocaleDateString()}` : 'Not synced yet'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        {mapping.marketplace === 'shopee' && (
                          <button
                            onClick={() => { setMappingToPush(mapping); setIsPushModalOpen(true); }}
                            className="text-blue-400 hover:text-blue-900"
                            title="Push Stock to Shopee"
                          >
                            <ArrowUpCircle className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => { setEditingMapping(mapping); setIsFormOpen(true); }}
                          className="text-gray-400 hover:text-gray-900"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(mapping.id)}
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

      {isFormOpen && (
        <MappingFormModal
          mapping={editingMapping}
          onClose={() => setIsFormOpen(false)}
        />
      )}

      {isPushModalOpen && mappingToPush && (
        <PushStockModal
          mapping={mappingToPush}
          onClose={() => setIsPushModalOpen(false)}
        />
      )}
    </div>
  );
}

function MappingFormModal({ mapping, onClose }: { mapping: ProductMapping | null, onClose: () => void }) {
  const queryClient = useQueryClient();
  const isEditing = !!mapping;

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.list(),
  });

  const { data: stores } = useQuery({
    queryKey: ['stores'],
    queryFn: () => storesApi.list(),
  });

  const [formData, setFormData] = useState<Partial<CreateProductMappingRequest & UpdateProductMappingRequest>>(
    mapping ? {
      listing_status: mapping.listing_status,
      price: mapping.price,
      listing_name: mapping.listing_name || '',
      listing_url: mapping.listing_url || '',
      external_sku: mapping.external_sku || '',
    } : {
      product_id: '',
      product_variant_id: '',
      store_id: '',
      marketplace: 'shopee',
      external_product_id: '',
      external_variant_id: '',
      external_sku: '',
      listing_name: '',
      listing_url: '',
      listing_status: 'unknown',
      currency: 'IDR'
    }
  );

  const selectedProduct = products?.find(p => p.id === formData.product_id);

  const mutation = useMutation({
    mutationFn: (data: CreateProductMappingRequest | UpdateProductMappingRequest) => {
      if (isEditing) {
        return productMappingsApi.update(mapping.id, data as UpdateProductMappingRequest);
      }
      return productMappingsApi.create(data as CreateProductMappingRequest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-mappings'] });
      onClose();
    },
  });

  const handleStoreChange = (storeId: string) => {
    const store = stores?.find(s => s.id === storeId);
    if (store) {
      setFormData({ 
        ...formData, 
        store_id: storeId, 
        marketplace: store.marketplace 
      });
    } else {
      setFormData({ ...formData, store_id: storeId });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
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
                {isEditing ? 'Edit Product Mapping' : 'Add Product Mapping'}
              </h3>

              {mutation.isError && (
                <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-md text-sm">
                  {mutation.error instanceof Error ? mutation.error.message : 'Failed to save mapping'}
                </div>
              )}

              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                {!isEditing && (
                  <>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Internal Product</label>
                      <select
                        required
                        value={formData.product_id}
                        onChange={e => setFormData({ ...formData, product_id: e.target.value, product_variant_id: '' })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      >
                        <option value="">Select a product...</option>
                        {products?.map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                        ))}
                      </select>
                    </div>

                    {selectedProduct && selectedProduct.variants && selectedProduct.variants.length > 0 && (
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Internal Variant (Optional)</label>
                        <select
                          value={formData.product_variant_id}
                          onChange={e => setFormData({ ...formData, product_variant_id: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                          <option value="">No variant / Main product</option>
                          {selectedProduct.variants.map(v => (
                            <option key={v.id} value={v.id}>{v.name} ({v.sku})</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Store</label>
                      <select
                        required
                        value={formData.store_id}
                        onChange={e => handleStoreChange(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      >
                        <option value="">Select a store...</option>
                        {stores?.map(s => (
                          <option key={s.id} value={s.id}>{s.store_name} ({s.marketplace})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Marketplace</label>
                      <input
                        type="text"
                        disabled
                        value={formData.marketplace || ''}
                        className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm"
                      />
                    </div>

                    <div className="pt-4 sm:col-span-2 border-t border-gray-100">
                      <h4 className="text-sm font-medium text-gray-900 mb-4">Marketplace Listing Info</h4>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">External Product ID</label>
                      <input
                        type="text"
                        required
                        value={formData.external_product_id || ''}
                        onChange={e => setFormData({ ...formData, external_product_id: e.target.value })}
                        className="mt-1 form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder="ID from marketplace"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">External Variant ID (Optional)</label>
                      <input
                        type="text"
                        value={formData.external_variant_id || ''}
                        onChange={e => setFormData({ ...formData, external_variant_id: e.target.value })}
                        className="mt-1 form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder="Variant ID from marketplace"
                      />
                    </div>
                  </>
                )}

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Listing Name</label>
                  <input
                    type="text"
                    value={formData.listing_name || ''}
                    onChange={e => setFormData({ ...formData, listing_name: e.target.value })}
                    className="mt-1 form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Product title on marketplace"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">External SKU (Optional)</label>
                  <input
                    type="text"
                    value={formData.external_sku || ''}
                    onChange={e => setFormData({ ...formData, external_sku: e.target.value })}
                    className="mt-1 form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Price</label>
                  <input
                    type="number"
                    value={formData.price || ''}
                    onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="mt-1 form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Listing URL (Optional)</label>
                  <input
                    type="url"
                    value={formData.listing_url || ''}
                    onChange={e => setFormData({ ...formData, listing_url: e.target.value })}
                    className="mt-1 form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Listing Status</label>
                  <select
                    value={formData.listing_status}
                    onChange={e => setFormData({ ...formData, listing_status: e.target.value as ListingStatus })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    {LISTING_STATUSES.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200">
              <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {mutation.isPending ? 'Saving...' : 'Save Mapping'}
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

function PushStockModal({ mapping, onClose }: { mapping: ProductMapping, onClose: () => void }) {
  const [dryRun, setDryRun] = useState(true);
  const [result, setResult] = useState<PushStockResult | null>(null);
  
  const { data: inventoryItem, isLoading: isLoadingInventory } = useQuery({
    queryKey: ['inventory', mapping.product_id, mapping.product_variant_id],
    queryFn: () => {
      // Find the main warehouse inventory item for this product/variant
      return inventoryApi.list({ 
        product_id: mapping.product_id,
        product_variant_id: mapping.product_variant_id,
        location_name: 'Main Warehouse'
      }).then(items => items[0] || null);
    },
  });

  const pushMutation = useMutation({
    mutationFn: (data: { dryRun: boolean }) => {
      return integrationsApi.pushStock(mapping.store_id, {
        product_mapping_id: mapping.id,
        dry_run: data.dryRun
      });
    },
    onSuccess: (data) => {
      setResult(data);
    },
  });

  const handlePush = (e: React.FormEvent) => {
    e.preventDefault();
    pushMutation.mutate({ dryRun });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                <ArrowUpCircle className="h-6 w-6 text-blue-600" aria-hidden="true" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Push Stock to Shopee
                </h3>
                <div className="mt-4 space-y-3">
                  <div className="p-3 bg-gray-50 rounded-md text-sm border border-gray-200">
                    <div className="font-medium text-gray-700">{mapping.listing_name}</div>
                    <div className="text-xs text-gray-500 font-mono mt-1">
                      Marketplace ID: {mapping.external_product_id}
                      {mapping.external_variant_id ? ` / ${mapping.external_variant_id}` : ''}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-md border border-blue-100">
                    <div className="text-sm text-blue-800">Available Internal Stock:</div>
                    <div className="text-lg font-bold text-blue-900">
                      {isLoadingInventory ? '...' : (inventoryItem?.available_quantity ?? 0)}
                    </div>
                  </div>

                  {!result && (
                    <p className="text-xs text-gray-500">
                      This will push the current <strong>available quantity</strong> from the Main Warehouse to Shopee.
                    </p>
                  )}

                  {result && (
                    <div className={`p-4 rounded-md flex items-start gap-3 ${
                      result.status === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                    }`}>
                      {result.status === 'success' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                      )}
                      <div>
                        <div className={`text-sm font-medium ${
                          result.status === 'success' ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {result.message}
                        </div>
                        {result.status === 'success' && (
                          <div className="text-xs text-green-700 mt-1">
                            Pushed Quantity: {result.pushed_quantity}
                            {result.dry_run && <span className="ml-2 font-bold">(DRY RUN)</span>}
                          </div>
                        )}
                        {result.sync_log_id && (
                          <div className="text-[10px] text-gray-500 mt-1">
                            Sync Log ID: {result.sync_log_id}
                          </div>
                        )}
                        {result.errors && result.errors.length > 0 && (
                          <div className="text-xs text-red-600 mt-2 space-y-1">
                            {result.errors.map((err, i) => (
                              <div key={i}>• {err}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {!result && (
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="checkbox"
                        id="dryRun"
                        checked={dryRun}
                        onChange={(e) => setDryRun(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="dryRun" className="text-sm text-gray-700">
                        Dry run (validate only, do not push)
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            {!result ? (
              <>
                <button
                  type="button"
                  disabled={pushMutation.isPending || isLoadingInventory}
                  onClick={handlePush}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {pushMutation.isPending ? 'Processing...' : (dryRun ? 'Validate Push' : 'Push Now')}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
