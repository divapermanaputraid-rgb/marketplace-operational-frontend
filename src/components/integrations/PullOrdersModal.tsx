import React, { useState } from 'react';
import { X, Calendar, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { integrationsApi } from '@/lib/api/integrations';
import type { PullOrdersResponse } from '@/types/integration';

interface PullOrdersModalProps {
  storeId: string;
  storeName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function PullOrdersModal({ storeId, storeName, isOpen, onClose }: PullOrdersModalProps) {
  const [days, setDays] = useState(7);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PullOrdersResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePull = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const now = Math.floor(Date.now() / 1000);
      const timeFrom = now - (days * 24 * 60 * 60);
      
      const response = await integrationsApi.pullOrders(storeId, {
        time_from: timeFrom,
        time_to: now,
        page_size: 20
      });

      setResult(response);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to pull orders');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Pull Orders - {storeName}
              </h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>

            {!result ? (
              <form onSubmit={handlePull} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time Range (Last X Days)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      value={days}
                      onChange={(e) => setDays(Number(e.target.value))}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value={1}>Last 24 Hours</option>
                      <option value={3}>Last 3 Days</option>
                      <option value={7}>Last 7 Days</option>
                      <option value={14}>Last 14 Days</option>
                    </select>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 italic">
                    Note: Shopee API may have limits on date range (max 15 days for some endpoints).
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 p-3 rounded-md flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <div className="mt-5 sm:mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2 bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md focus:outline-none"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-blue-600 border border-transparent text-sm font-medium text-white hover:bg-blue-700 rounded-md focus:outline-none disabled:opacity-50"
                  >
                    {isLoading ? 'Processing...' : 'Pull Now'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className={`p-4 rounded-md ${result.status === 'success' || result.status === 'partial' ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className="flex">
                    <div className="flex-shrink-0">
                      {result.status === 'success' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-400" />
                      ) : result.status === 'partial' ? (
                        <Info className="h-5 w-5 text-yellow-400" />
                      ) : (
                        <X className="h-5 w-5 text-red-400" />
                      )}
                    </div>
                    <div className="ml-3">
                      <h3 className={`text-sm font-medium ${result.status === 'success' ? 'text-green-800' : result.status === 'partial' ? 'text-yellow-800' : 'text-red-800'}`}>
                        {result.message}
                      </h3>
                      <div className="mt-2 text-sm text-gray-700">
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Processed: {result.records_processed}</li>
                          <li>Created: {result.records_created}</li>
                          <li>Updated: {result.records_updated}</li>
                          <li>Failed: {result.records_failed}</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {result.unmapped_items_count > 0 && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-yellow-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          <strong>{result.unmapped_items_count} items</strong> are not mapped to internal products yet. 
                          These orders were saved but linked to internal products.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {result.errors && result.errors.length > 0 && (
                  <div className="mt-2 text-xs text-red-600 max-h-32 overflow-y-auto border border-red-100 p-2 rounded">
                    <p className="font-semibold mb-1">Errors:</p>
                    <ul className="list-disc pl-4">
                      {result.errors.map((err: string, i: number) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-5 sm:mt-6">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full px-4 py-2 bg-blue-600 border border-transparent text-sm font-medium text-white hover:bg-blue-700 rounded-md focus:outline-none"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
