import React, { useState, useMemo } from 'react';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { X, Search, Link2, AlertCircle, CheckCircle2, Loader2, Package, ChevronDown } from 'lucide-react';
import { integrationsApi } from '@/lib/api/integrations';
import { productsApi } from '@/lib/api/products';
import type { ShopeeMappingCandidate, CreateShopeeMappingRequest } from '@/types/integration';
import type { Product } from '@/types/product';

interface ShopeeMappingModalProps {
  storeId: string;
  storeName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ShopeeMappingModal({ storeId, storeName, isOpen, onClose }: ShopeeMappingModalProps) {
  const queryClient = useQueryClient();
  const [candidateFilter, setCandidateFilter] = useState<'all' | 'mapped' | 'unmapped'>('all');
  const [candidateSearch, setCandidateSearch] = useState('');
  
  // Mapping state
  const [mappingCandidate, setMappingCandidate] = useState<ShopeeMappingCandidate | null>(null);
  const [internalProductSearch, setInternalProductSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');

  const { 
    data: candidatesData, 
    isLoading: isLoadingCandidates, 
    error: candidatesError, 
    refetch: refetchCandidates,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['shopeeMappingCandidates', storeId],
    queryFn: ({ pageParam = 0 }) => integrationsApi.getShopeeMappingCandidates(storeId, { offset: pageParam as number, page_size: 20 }),
    getNextPageParam: (lastPage) => lastPage.has_next_page ? lastPage.next_offset : undefined,
    initialPageParam: 0,
    enabled: isOpen,
  });

  const allCandidates = useMemo(() => {
    return candidatesData?.pages.flatMap(page => page.candidates) || [];
  }, [candidatesData]);

  const stats = useMemo(() => {
    if (!candidatesData?.pages[0]) return null;
    let total = 0;
    let mapped = 0;
    let unmapped = 0;
    candidatesData.pages.forEach(page => {
      total += page.records_processed;
      mapped += page.mapped_count;
      unmapped += page.unmapped_count;
    });
    return { total, mapped, unmapped };
  }, [candidatesData]);

  const { data: searchProducts, isLoading: isSearchingProducts } = useQuery({
    queryKey: ['internalProductsSearch', internalProductSearch],
    queryFn: () => productsApi.list({ search: internalProductSearch }),
    enabled: !!internalProductSearch && internalProductSearch.length >= 2,
  });

  const createMappingMutation = useMutation({
    mutationFn: (payload: CreateShopeeMappingRequest) => integrationsApi.createShopeeProductMapping(storeId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopeeMappingCandidates', storeId] });
      setMappingCandidate(null);
      setSelectedProduct(null);
      setSelectedVariantId('');
      setInternalProductSearch('');
    },
  });

  if (!isOpen) return null;

  const filteredCandidates = allCandidates.filter(c => {
    const matchesFilter = 
      candidateFilter === 'all' || 
      (candidateFilter === 'mapped' && c.mapping_status === 'mapped') ||
      (candidateFilter === 'unmapped' && c.mapping_status === 'unmapped');
    
    const matchesSearch = 
      c.title.toLowerCase().includes(candidateSearch.toLowerCase()) || 
      c.sku.toLowerCase().includes(candidateSearch.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const handleMapAction = (candidate: ShopeeMappingCandidate) => {
    setMappingCandidate(candidate);
    setInternalProductSearch(candidate.sku || candidate.title);
  };

  const handleCreateMapping = () => {
    if (!mappingCandidate || !selectedProduct) return;

    createMappingMutation.mutate({
      external_product_id: mappingCandidate.external_product_id,
      external_variant_id: mappingCandidate.external_variant_id,
      internal_product_id: selectedProduct.id,
      internal_variant_id: selectedVariantId || null,
      external_sku: mappingCandidate.sku,
      external_name: mappingCandidate.title,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Shopee Product Mapping - {storeName}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  View pulled Shopee listings and link them to your internal Product Master.
                </p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>

            {candidatesError ? (
              <div className="bg-red-50 p-4 rounded-md mb-6">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
                  <p className="text-sm text-red-700">{(candidatesError as Error).message}</p>
                </div>
              </div>
            ) : null}

            {/* Stats Bar */}
            {!isLoadingCandidates && stats && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Loaded Listings</p>
                  <p className="text-lg font-bold">{stats.total}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                  <p className="text-xs text-green-600 uppercase font-semibold">Mapped</p>
                  <p className="text-lg font-bold text-green-700">{stats.mapped}</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                  <p className="text-xs text-yellow-600 uppercase font-semibold">Unmapped</p>
                  <p className="text-lg font-bold text-yellow-700">{stats.unmapped}</p>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search Shopee title or SKU..."
                  value={candidateSearch}
                  onChange={(e) => setCandidateSearch(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex rounded-md shadow-sm">
                <button
                  onClick={() => setCandidateFilter('all')}
                  className={`px-4 py-2 text-sm font-medium border ${candidateFilter === 'all' ? 'bg-blue-50 border-blue-500 text-blue-700 z-10' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'} rounded-l-md`}
                >
                  All
                </button>
                <button
                  onClick={() => setCandidateFilter('unmapped')}
                  className={`px-4 py-2 text-sm font-medium border-t border-b ${candidateFilter === 'unmapped' ? 'bg-blue-50 border-blue-500 text-blue-700 z-10' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  Unmapped
                </button>
                <button
                  onClick={() => setCandidateFilter('mapped')}
                  className={`px-4 py-2 text-sm font-medium border ${candidateFilter === 'mapped' ? 'bg-blue-50 border-blue-500 text-blue-700 z-10' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'} rounded-r-md`}
                >
                  Mapped
                </button>
              </div>
              <button 
                onClick={() => refetchCandidates()}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingCandidates ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {/* Candidate List */}
            <div className="max-h-[50vh] overflow-y-auto border border-gray-200 rounded-lg">
              {isLoadingCandidates ? (
                <div className="p-12 flex flex-col items-center justify-center text-gray-500">
                  <Loader2 className="w-8 h-8 animate-spin mb-2" />
                  <p>Loading Shopee listings...</p>
                </div>
              ) : filteredCandidates.length === 0 ? (
                <div className="p-12 text-center text-gray-500 italic">
                  No listings found matching your criteria.
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Shopee SKU</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Price/Stock</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Internal Mapping</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 text-sm">
                    {filteredCandidates.map((c) => (
                      <tr key={`${c.external_product_id}-${c.external_variant_id || 'base'}`} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                              {c.image_url ? (
                                <img src={c.image_url} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-gray-400">
                                  <Package size={20} />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 max-w-xs truncate" title={c.title}>
                                {c.title}
                              </div>
                              {c.variant_name && (
                                <div className="text-xs text-gray-500 italic">
                                  Variant: {c.variant_name}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-gray-500 font-mono text-xs">
                          {c.sku || '-'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right">
                          <div className="text-sm text-gray-900 font-semibold">{c.price.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">Stock: {c.stock}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          {c.mapping_status === 'mapped' ? (
                            <div className="flex flex-col items-center">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Mapped
                              </span>
                              <span className="text-[10px] text-gray-500 mt-1 max-w-[120px] truncate" title={c.internal_product_name || ''}>
                                {c.internal_product_name}
                              </span>
                            </div>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Unmapped
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {c.mapping_status === 'unmapped' ? (
                            <button
                              onClick={() => handleMapAction(c)}
                              className="text-blue-600 hover:text-blue-900 flex items-center gap-1 justify-end ml-auto"
                            >
                              <Link2 className="w-4 h-4" />
                              Map
                            </button>
                          ) : (
                            <span className="text-gray-400 text-xs">Already Mapped</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {hasNextPage && (
                <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-center">
                  <button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50"
                  >
                    {isFetchingNextPage ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading more...
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        Load More Listings
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Manual Mapping Overlay/Modal */}
      {mappingCandidate && (
        <div className="fixed inset-0 z-[60] overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black opacity-50" onClick={() => setMappingCandidate(null)}></div>
          <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-bold flex items-center gap-2">
                <Link2 className="w-5 h-5 text-blue-500" />
                Map to Product
              </h4>
              <button onClick={() => setMappingCandidate(null)} className="text-gray-400 hover:text-gray-500">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-center gap-3">
               <div className="h-10 w-10 bg-gray-200 rounded overflow-hidden">
                  {mappingCandidate.image_url && <img src={mappingCandidate.image_url} className="w-full h-full object-cover" />}
               </div>
               <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Shopee Listing</p>
                  <p className="text-sm font-medium truncate max-w-[250px]">{mappingCandidate.title}</p>
                  <p className="text-xs text-gray-500 font-mono">{mappingCandidate.sku || 'No SKU'}</p>
               </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search Internal Product
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={internalProductSearch}
                    onChange={(e) => setInternalProductSearch(e.target.value)}
                    placeholder="Search by name or SKU..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Search Results */}
              <div className="max-h-40 overflow-y-auto border border-gray-100 rounded-md">
                {isSearchingProducts ? (
                  <div className="p-4 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Searching...
                  </div>
                ) : searchProducts && searchProducts.length > 0 ? (
                  <div className="divide-y divide-gray-50">
                    {searchProducts.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setSelectedProduct(p);
                          setSelectedVariantId('');
                          setInternalProductSearch(p.name);
                        }}
                        className={`w-full text-left p-3 hover:bg-blue-50 transition-colors flex items-center justify-between ${selectedProduct?.id === p.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                      >
                        <div>
                          <div className="text-sm font-medium text-gray-900">{p.name}</div>
                          <div className="text-xs text-gray-500 font-mono">{p.sku}</div>
                        </div>
                        {selectedProduct?.id === p.id && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                      </button>
                    ))}
                  </div>
                ) : internalProductSearch.length >= 2 ? (
                  <div className="p-4 text-center text-sm text-gray-500 italic">
                    No products found.
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-gray-500 italic">
                    Type at least 2 characters to search.
                  </div>
                )}
              </div>

              {/* Variant Selector if product selected and has multiple variants */}
              {selectedProduct && selectedProduct.variants && selectedProduct.variants.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Variant (Optional)
                  </label>
                  <select
                    value={selectedVariantId}
                    onChange={(e) => setSelectedVariantId(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Default / Base Product</option>
                    {selectedProduct.variants.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.sku})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setMappingCandidate(null)}
                  className="flex-1 px-4 py-2 bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateMapping}
                  disabled={!selectedProduct || createMappingMutation.isPending}
                  className="flex-1 px-4 py-2 bg-blue-600 border border-transparent text-sm font-medium text-white hover:bg-blue-700 rounded-md disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {createMappingMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Confirm Mapping
                </button>
              </div>
              
              {createMappingMutation.isError && (
                <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100">
                  <strong>Error:</strong> { (createMappingMutation.error as Error)?.message || 'Failed to create mapping. Listing might already be mapped.' }
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RefreshCw(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}
