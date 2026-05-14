import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plug, AlertCircle, CheckCircle2, XCircle, RefreshCw, Clock, Download, Link2 } from 'lucide-react';
import { integrationsApi } from '@/lib/api/integrations';
import { Card } from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { PullOrdersModal } from '@/components/integrations/PullOrdersModal';
import { ShopeeMappingModal } from '@/components/integrations/ShopeeMappingModal';
import type { StoreIntegration } from '@/types/integration';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return String(error);
}

export function IntegrationsPage() {
  const queryClient = useQueryClient();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Modals state
  const [pullModalOpen, setPullModalOpen] = useState(false);
  const [mappingModalOpen, setMappingModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<{id: string, name: string} | null>(null);

  const { data: integrations, isLoading, error } = useQuery({
    queryKey: ['integrations'],
    queryFn: integrationsApi.listIntegrations,
  });

  const { data: supportedMarketplaces } = useQuery({
    queryKey: ['supportedMarketplaces'],
    queryFn: integrationsApi.listSupportedMarketplaces,
  });

  const initiateMutation = useMutation({
    mutationFn: (storeId: string) => integrationsApi.initiateStoreIntegration(storeId),
    onSuccess: (data) => {
      setSuccessMsg(null);
      setErrorMsg(null);
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else if (data.status === 'missing_credentials') {
        setErrorMsg(data.message || 'Shopee API credentials are not configured on the backend yet.');
      } else if (data.status === 'not_implemented') {
        setErrorMsg(data.message || 'This marketplace integration is not implemented yet.');
      } else {
        setSuccessMsg(data.message || 'Marketplace integration initiated.');
      }
    },
    onError: (err: unknown) => {
      setSuccessMsg(null);
      setErrorMsg(getErrorMessage(err) || 'Failed to initiate setup');
    }
  });

  const testMutation = useMutation({
    mutationFn: (storeId: string) => integrationsApi.testStoreIntegration(storeId),
    onSuccess: (data) => {
      setErrorMsg(null);
      setSuccessMsg(data.message || 'Test connection completed.');
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
    onError: (err: unknown) => {
      setSuccessMsg(null);
      setErrorMsg(getErrorMessage(err) || 'Test connection failed');
    }
  });

  const disconnectMutation = useMutation({
    mutationFn: (storeId: string) => integrationsApi.disconnectStoreIntegration(storeId),
    onSuccess: (data) => {
      setErrorMsg(null);
      setSuccessMsg(data.message || 'Store disconnected.');
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
    onError: (err: unknown) => {
      setSuccessMsg(null);
      setErrorMsg(getErrorMessage(err) || 'Disconnect failed');
    }
  });

  if (isLoading) return <LoadingState />;

  if (error) {
    return (
      <EmptyState
        icon={<AlertCircle className="h-8 w-8 text-red-500" />}
        title="Error loading integrations"
        description={(error as Error).message}
      />
    );
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'connected':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" /> Connected</span>;
      case 'pending_authorization':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><RefreshCw className="w-3 h-3 mr-1 animate-spin" /> Pending Auth</span>;
      case 'failed':
      case 'expired':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" /> {status === 'expired' ? 'Expired' : 'Failed'}</span>;
      case 'not_implemented':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Not Implemented</span>;
      case 'missing_credentials':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">Missing Backend Credentials</span>;
      case 'disconnected':
      case 'not_configured':
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Not Configured</span>;
    }
  };

  const handlePullOrders = (storeId: string, storeName: string) => {
    setSelectedStore({ id: storeId, name: storeName });
    setPullModalOpen(true);
  };

  const handleOpenMapping = (storeId: string, storeName: string) => {
    setSelectedStore({ id: storeId, name: storeName });
    setMappingModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Marketplace Integrations</h1>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{errorMsg}</p>
            </div>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{successMsg}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 grid-cols-1">
        {integrations?.map((item: StoreIntegration) => (
          <Card key={item.store_id} className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{item.store_name}</h3>
                <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                  <span className="capitalize">{item.marketplace.replace('_', ' ')}</span>
                  <span>&bull;</span>
                  {getStatusBadge(item.integration?.connection_status)}
                </div>
                
                {item.integration?.last_err && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    Last Error: {item.integration.last_err}
                  </p>
                )}
                
                {item.integration?.last_connected_at && (
                  <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Last Connected: {new Date(item.integration.last_connected_at).toLocaleString()}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                {item.integration?.connection_status === 'connected' && item.marketplace === 'shopee' && (
                  <>
                    <button
                      onClick={() => handleOpenMapping(item.store_id, item.store_name)}
                      className="px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md flex items-center gap-1"
                    >
                      <Link2 className="w-4 h-4" />
                      Mapping Candidates
                    </button>
                    <button
                      onClick={() => handlePullOrders(item.store_id, item.store_name)}
                      className="px-3 py-1.5 text-sm font-medium text-orange-700 bg-orange-100 hover:bg-orange-200 rounded-md flex items-center gap-1"
                    >
                      <Download className="w-4 h-4" />
                      Pull Orders
                    </button>
                  </>
                )}
                <button
                  onClick={() => initiateMutation.mutate(item.store_id)}
                  disabled={initiateMutation.isPending}
                  className="px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md disabled:opacity-50"
                >
                  {initiateMutation.isPending ? 'Working...' : 'Setup'}
                </button>
                <button
                  onClick={() => testMutation.mutate(item.store_id)}
                  disabled={testMutation.isPending}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50"
                >
                  Test Connection
                </button>
                {item.integration?.connection_status && item.integration.connection_status !== 'not_configured' && (
                  <button
                    onClick={() => disconnectMutation.mutate(item.store_id)}
                    disabled={disconnectMutation.isPending}
                    className="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md disabled:opacity-50"
                  >
                    Disconnect
                  </button>
                )}
              </div>
            </div>
          </Card>
        ))}

        {(!integrations || integrations.length === 0) && (
          <EmptyState
            icon={<Plug className="h-8 w-8 text-gray-400" />}
            title="No Stores Found"
            description="Create a store first to configure marketplace integrations."
          />
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Supported Marketplaces</h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {supportedMarketplaces?.map((mp) => (
            <div key={mp.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium text-gray-900 capitalize">{mp.name}</h4>
              <p className="text-sm text-gray-500 mt-1">{mp.description}</p>
            </div>
          ))}
          {(!supportedMarketplaces || supportedMarketplaces.length === 0) && (
            <div className="text-sm text-gray-500 italic">Loading supported marketplaces...</div>
          )}
        </div>
      </div>

      {selectedStore && (
        <PullOrdersModal
          storeId={selectedStore.id}
          storeName={selectedStore.name}
          isOpen={pullModalOpen}
          onClose={() => {
            setPullModalOpen(false);
            setSelectedStore(null);
            queryClient.invalidateQueries({ queryKey: ['integrations'] });
          }}
        />
      )}

      {selectedStore && (
        <ShopeeMappingModal
          storeId={selectedStore.id}
          storeName={selectedStore.name}
          isOpen={mappingModalOpen}
          onClose={() => {
            setMappingModalOpen(false);
            setSelectedStore(null);
            queryClient.invalidateQueries({ queryKey: ['integrations'] });
          }}
        />
      )}
    </div>
  );
}

