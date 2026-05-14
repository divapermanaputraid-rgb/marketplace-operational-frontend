import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storesApi } from '@/lib/api/stores';
import type { Store, CreateStoreRequest, UpdateStoreRequest } from '@/types/store';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Store as StoreIcon, Plus, Search, Filter, Edit2, Trash2, Link2 } from 'lucide-react';

const MARKETPLACES = [
  { value: 'shopee', label: 'Shopee' },
  { value: 'tokopedia_shop', label: 'Tokopedia Shop' },
  { value: 'tiktok_shop', label: 'TikTok Shop' },
];

const CONNECTION_STATUSES = [
  { value: 'not_connected', label: 'Not Connected', color: 'bg-gray-100 text-gray-800' },
  { value: 'connected', label: 'Connected', color: 'bg-green-100 text-green-800' },
  { value: 'token_expired', label: 'Token Expired', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'sync_error', label: 'Sync Error', color: 'bg-red-100 text-red-800' },
  { value: 'disabled', label: 'Disabled', color: 'bg-gray-100 text-gray-600' },
];

export function StoresPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [marketplaceFilter, setMarketplaceFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['stores', marketplaceFilter, statusFilter, search],
    queryFn: () => storesApi.list({ 
      marketplace: marketplaceFilter, 
      connection_status: statusFilter,
      search
    }),
  });

  const deleteMutation = useMutation({
    mutationFn: storesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to disable this store?')) {
      deleteMutation.mutate(id);
    }
  };

  const getMarketplaceLabel = (value: string) => 
    MARKETPLACES.find(m => m.value === value)?.label || value;

  const getStatusBadge = (status: string) => {
    const config = CONNECTION_STATUSES.find(s => s.value === status) || CONNECTION_STATUSES[0];
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
          <h1 className="text-2xl font-bold text-gray-900">Marketplace Accounts</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your connected marketplace stores and sync status.</p>
        </div>
        <button
          onClick={() => {
            setEditingStore(null);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Store
        </button>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search stores..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={marketplaceFilter}
                onChange={(e) => setMarketplaceFilter(e.target.value)}
                className="pl-9 form-select block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">All Marketplaces</option>
                {MARKETPLACES.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">All Statuses</option>
              {CONNECTION_STATUSES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8"><LoadingState text="Loading stores..." /></div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">Failed to load stores.</div>
        ) : !data?.length ? (
          <EmptyState
            icon={<StoreIcon className="w-8 h-8" />}
            title="No stores found"
            description="You haven't added any marketplace stores yet, or none match your filters."
            action={
              <button
                onClick={() => { setEditingStore(null); setIsFormOpen(true); }}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Store
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marketplace</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Sync</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((store) => (
                  <tr key={store.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-md flex items-center justify-center">
                          <StoreIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{store.store_name}</div>
                          <div className="text-sm text-gray-500 font-mono">{store.external_store_id || 'No External ID'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getMarketplaceLabel(store.marketplace)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(store.connection_status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {store.last_sync_at ? new Date(store.last_sync_at).toLocaleString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        <button
                          onClick={() => navigate('/integrations')}
                          className="inline-flex items-center text-blue-600 hover:text-blue-900 font-medium"
                          title="Manage Integration"
                        >
                          <Link2 className="h-4 w-4 mr-1" />
                          {store.connection_status === 'connected' ? 'Manage' : 'Connect'}
                        </button>
                        <button
                          onClick={() => { setEditingStore(store); setIsFormOpen(true); }}
                          className="text-gray-400 hover:text-gray-900"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(store.id)}
                          className="text-gray-400 hover:text-red-600"
                          title="Disable"
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
        <StoreFormModal
          store={editingStore}
          onClose={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
}

function StoreFormModal({ store, onClose }: { store: Store | null, onClose: () => void }) {
  const queryClient = useQueryClient();
  const isEditing = !!store;

  const [formData, setFormData] = useState<Partial<CreateStoreRequest & UpdateStoreRequest>>(
    store || {
      marketplace: 'shopee',
      store_name: '',
      store_url: '',
      external_store_id: '',
      notes: '',
      is_active: true
    }
  );

  const mutation = useMutation({
    mutationFn: (data: typeof formData) => {
      if (isEditing) {
        return storesApi.update(store.id, data as UpdateStoreRequest);
      }
      return storesApi.create(data as CreateStoreRequest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      onClose();
    },
  });

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

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                {isEditing ? 'Edit Store' : 'Add New Store'}
              </h3>
              
              {mutation.isError && (
                <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-md text-sm">
                  {mutation.error instanceof Error ? mutation.error.message : 'Failed to save store'}
                </div>
              )}

              <div className="space-y-4">
                {!isEditing && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Marketplace</label>
                    <select
                      required
                      value={formData.marketplace}
                      onChange={e => setFormData({ ...formData, marketplace: e.target.value as CreateStoreRequest['marketplace'] })}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      {MARKETPLACES.map(m => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Store Name</label>
                  <input
                    type="text"
                    required
                    value={formData.store_name}
                    onChange={e => setFormData({ ...formData, store_name: e.target.value })}
                    className="mt-1 form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Store URL (Optional)</label>
                  <input
                    type="url"
                    value={formData.store_url || ''}
                    onChange={e => setFormData({ ...formData, store_url: e.target.value })}
                    className="mt-1 form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">External Store ID (Optional)</label>
                  <input
                    type="text"
                    value={formData.external_store_id || ''}
                    onChange={e => setFormData({ ...formData, external_store_id: e.target.value })}
                    className="mt-1 form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="e.g. shopee_id_123"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
                  <textarea
                    rows={3}
                    value={formData.notes || ''}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    className="mt-1 form-textarea block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {mutation.isPending ? 'Saving...' : 'Save Store'}
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
