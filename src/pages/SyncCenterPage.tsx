import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { syncApi } from '@/lib/api/sync';
import { storesApi } from '@/lib/api/stores';
import type { 
  SyncJob, 
  CreateSyncJobRequest,
  UpdateSyncJobRequest,
  SyncMarketplace,
  SyncType,
  SyncDirection
} from '@/types/sync';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { 
  RefreshCw, 
  Plus, 
  Filter, 
  Edit2, 
  Trash2, 
  Play,
  History,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Store as StoreIcon
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const MARKETPLACES: { value: SyncMarketplace; label: string }[] = [
  { value: 'all', label: 'All Marketplaces' },
  { value: 'shopee', label: 'Shopee' },
  { value: 'tokopedia_shop', label: 'Tokopedia' },
  { value: 'tiktok_shop', label: 'TikTok Shop' },
];

const SYNC_TYPES: { value: SyncType; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'orders', label: 'Orders' },
  { value: 'products', label: 'Products' },
  { value: 'inventory', label: 'Inventory' },
  { value: 'stock', label: 'Stock Levels' },
];

const SYNC_DIRECTIONS: { value: SyncDirection; label: string }[] = [
  { value: 'pull', label: 'Pull from Marketplace' },
  { value: 'push', label: 'Push to Marketplace' },
  { value: 'bidirectional', label: 'Bidirectional' },
  { value: 'internal', label: 'Internal Only' },
];

const STATUS_COLORS: Record<string, string> = {
  idle: 'bg-gray-100 text-gray-800',
  running: 'bg-blue-100 text-blue-800',
  success: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  expired: 'bg-red-100 text-red-800',
  not_implemented: 'bg-purple-100 text-purple-800',
  not_configured: 'bg-orange-100 text-orange-800',
  disabled: 'bg-gray-200 text-gray-500',
  started: 'bg-blue-100 text-blue-800',
};

export function SyncCenterPage() {
  const [activeTab, setActiveTab] = useState<'jobs' | 'logs'>('jobs');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sync Center</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and monitor marketplace integrations and automated tasks.</p>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('jobs')}
            className={cn(
              "whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center",
              activeTab === 'jobs' 
                ? "border-blue-500 text-blue-600" 
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            )}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync Jobs
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={cn(
              "whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center",
              activeTab === 'logs' 
                ? "border-blue-500 text-blue-600" 
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            )}
          >
            <History className="mr-2 h-4 w-4" />
            Sync Logs
          </button>
        </nav>
      </div>

      {activeTab === 'jobs' ? <JobsView /> : <LogsView />}
    </div>
  );
}

function JobsView() {
  const queryClient = useQueryClient();
  const [marketplaceFilter, setMarketplaceFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<SyncJob | null>(null);

  const { data: jobs, isLoading, error } = useQuery({
    queryKey: ['sync-jobs', marketplaceFilter, typeFilter],
    queryFn: () => syncApi.listJobs({ 
      marketplace: marketplaceFilter,
      sync_type: typeFilter
    }),
  });

  const deleteMutation = useMutation({
    mutationFn: syncApi.deleteJob,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sync-jobs'] })
  });

  const runMutation = useMutation({
    mutationFn: syncApi.runJob,
    onSuccess: (data: unknown) => {
      // The API returns the job as data.data if unwrapped appropriately, 
      // but in our fetchApi it returns the payload directly. We can access data.message if available.
      // But fetchApi usually returns T. If the backend sends SuccessResponse(job, msg), fetchApi unwraps data.
      // We will just invalidate to refresh.
      const message = (data as { message?: string })?.message;
      alert("Manual run triggered. Result: " + (message || "Marketplace API integration is not configured yet. Sync was skipped."));
      queryClient.invalidateQueries({ queryKey: ['sync-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['sync-logs'] });
    },
    onError: (err: Error) => {
      alert("Failed to run job: " + err.message);
    }
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this sync job?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleRun = (id: string) => {
    runMutation.mutate(id);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <select
              value={marketplaceFilter}
              onChange={(e) => setMarketplaceFilter(e.target.value)}
              className="pl-9 form-select block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Filter by Marketplace</option>
              {MARKETPLACES.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="form-select block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">Filter by Type</option>
            {SYNC_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Job
        </button>
      </div>

      <Card>
        {isLoading ? (
          <div className="p-8"><LoadingState text="Loading sync jobs..." /></div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">Failed to load sync jobs.</div>
        ) : !jobs?.length ? (
          <EmptyState
            icon={<RefreshCw className="w-8 h-8" />}
            title="No sync jobs configured"
            description="Create a sync job to automate data transfer between your internal system and marketplaces."
            action={
              <button
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Job
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Configuration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Schedule</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Run</th>
                  <th className="relative px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {jobs.map((job) => (
                  <tr key={job.id} className={cn("hover:bg-gray-50", !job.is_active && "opacity-60")}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900 flex items-center">
                        {job.job_name}
                        {!job.is_active && <span className="ml-2 text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full uppercase">Disabled</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <span className="font-medium capitalize">{job.sync_direction}</span> 
                        <span className="mx-2 text-gray-400">&rarr;</span> 
                        <span className="font-medium capitalize">{job.sync_type}</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        {job.store ? (
                          <><StoreIcon className="h-3 w-3 mr-1" /> {job.store.store_name}</>
                        ) : (
                          <><StoreIcon className="h-3 w-3 mr-1" /> Global / All Stores</>
                        )}
                        <span className="mx-1">&bull;</span>
                        <span className="capitalize">{job.marketplace.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", STATUS_COLORS[job.status] || STATUS_COLORS.idle)}>
                        {job.status.replace('_', ' ').toUpperCase()}
                      </span>
                      {job.last_error && (
                        <div className="text-[10px] text-red-500 mt-1 max-w-[150px] truncate" title={job.last_error}>
                          {job.last_error}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {job.schedule_enabled ? (
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1 text-blue-500" />
                          Every {job.schedule_interval_minutes} min
                        </div>
                      ) : (
                        <span className="italic text-gray-400">Manual only</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {job.last_run_at ? new Date(job.last_run_at).toLocaleString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        <button
                          onClick={() => handleRun(job.id)}
                          disabled={runMutation.isPending || !job.is_active}
                          className="text-gray-400 hover:text-green-600 disabled:opacity-30 disabled:hover:text-gray-400"
                          title="Run Now"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEditingJob(job)}
                          className="text-gray-400 hover:text-blue-600"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(job.id)}
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

      {isCreateOpen && <CreateJobModal onClose={() => setIsCreateOpen(false)} />}
      {editingJob && <EditJobModal job={editingJob} onClose={() => setEditingJob(null)} />}
    </div>
  );
}

function LogsView() {
  const [marketplaceFilter, setMarketplaceFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const { data: logs, isLoading, error } = useQuery({
    queryKey: ['sync-logs', marketplaceFilter, typeFilter, statusFilter],
    queryFn: () => syncApi.listLogs({ 
      marketplace: marketplaceFilter,
      sync_type: typeFilter,
      status: statusFilter
    }),
  });

  return (
    <Card>
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-lg font-medium text-gray-900">Recent Sync Executions</h3>
        <div className="flex flex-wrap gap-2">
          <select
            value={marketplaceFilter}
            onChange={(e) => setMarketplaceFilter(e.target.value)}
            className="form-select block w-40 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">All Marketplaces</option>
            {MARKETPLACES.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="form-select block w-40 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">All Types</option>
            {SYNC_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-select block w-40 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">All Statuses</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="partial">Partial</option>
            <option value="expired">Expired</option>
            <option value="not_configured">Not Configured</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="p-8"><LoadingState text="Loading logs..." /></div>
      ) : error ? (
        <div className="p-8 text-center text-red-500">Failed to load logs.</div>
      ) : !logs?.length ? (
        <div className="p-8 text-center text-gray-500">No sync execution history available.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job / Context</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Records (P/C/U/F)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{log.sync_job?.job_name || 'Manual / Deleted Job'}</div>
                    <div className="text-xs text-gray-500 capitalize">{log.sync_direction} &bull; {log.sync_type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", STATUS_COLORS[log.status] || STATUS_COLORS.idle)}>
                      {log.status === 'success' && <CheckCircle2 className="mr-1 h-3 w-3" />}
                      {(log.status === 'failed' || log.status === 'expired') && <XCircle className="mr-1 h-3 w-3" />}
                      {(log.status === 'not_configured' || log.status === 'not_implemented') && <AlertTriangle className="mr-1 h-3 w-3" />}
                      {log.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-mono">
                      {log.records_processed} / <span className="text-green-600">{log.records_created}</span> / <span className="text-blue-600">{log.records_updated}</span> / <span className="text-red-600">{log.records_failed}</span>
                    </div>
                    {log.raw_summary && (
                      <div className="text-[10px] text-gray-400 mt-1 italic">
                        {log.records_failed > 0 && "Failures detected"}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate" title={log.message || log.error_message || ''}>
                    {log.message || log.error_message || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.duration_ms ? `${log.duration_ms} ms` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function CreateJobModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const { data: stores } = useQuery({ queryKey: ['stores'], queryFn: () => storesApi.list() });

  const [formData, setFormData] = useState<CreateSyncJobRequest>({
    job_name: '',
    marketplace: 'all',
    sync_type: 'orders',
    sync_direction: 'pull',
    is_active: true,
    schedule_enabled: false,
    schedule_interval_minutes: 60,
  });

  const mutation = useMutation({
    mutationFn: syncApi.createJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sync-jobs'] });
      onClose();
    }
  });

  const handleStoreChange = (storeId: string) => {
    const store = stores?.find(s => s.id === storeId);
    setFormData({
      ...formData,
      store_id: storeId,
      marketplace: store ? (store.marketplace as SyncMarketplace) : 'all'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-500 bg-opacity-75">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(formData); }}>
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Create Sync Job</h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Job Name</label>
              <input
                type="text"
                required
                value={formData.job_name}
                onChange={(e) => setFormData({...formData, job_name: e.target.value})}
                placeholder="e.g. Pull Shopee Orders Hourly"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Store Context (Optional)</label>
              <select
                value={formData.store_id || ''}
                onChange={(e) => handleStoreChange(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">Global / All Stores</option>
                {stores?.map(s => (
                  <option key={s.id} value={s.id}>{s.store_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Marketplace Target</label>
              <select
                value={formData.marketplace}
                onChange={(e) => setFormData({...formData, marketplace: e.target.value as SyncMarketplace})}
                disabled={!!formData.store_id}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100"
              >
                {MARKETPLACES.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              {formData.store_id && <p className="text-xs text-gray-500 mt-1">Locked to store's marketplace.</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Sync Direction</label>
                <select
                  value={formData.sync_direction}
                  onChange={(e) => setFormData({...formData, sync_direction: e.target.value as SyncDirection})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  {SYNC_DIRECTIONS.map(d => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Data Type</label>
                <select
                  value={formData.sync_type}
                  onChange={(e) => setFormData({...formData, sync_type: e.target.value as SyncType})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  {SYNC_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <label className="flex items-center mb-4">
                <input
                  type="checkbox"
                  checked={formData.schedule_enabled}
                  onChange={(e) => setFormData({...formData, schedule_enabled: e.target.checked})}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 h-4 w-4"
                />
                <span className="ml-2 text-sm text-gray-700">Enable Automated Schedule</span>
              </label>

              {formData.schedule_enabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Interval (Minutes)</label>
                  <input
                    type="number"
                    min="5"
                    required={formData.schedule_enabled}
                    value={formData.schedule_interval_minutes}
                    onChange={(e) => setFormData({...formData, schedule_interval_minutes: parseInt(e.target.value) || 60})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                  <p className="text-xs text-amber-600 mt-1 italic">Note: Scheduling is currently a metadata feature and does not trigger real background tasks yet.</p>
                </div>
              )}
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
              Save Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditJobModal({ job, onClose }: { job: SyncJob; onClose: () => void }) {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<UpdateSyncJobRequest>({
    job_name: job.job_name,
    is_active: job.is_active,
    schedule_enabled: job.schedule_enabled,
    schedule_interval_minutes: job.schedule_interval_minutes || 60,
  });

  const mutation = useMutation({
    mutationFn: (data: UpdateSyncJobRequest) => syncApi.updateJob(job.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sync-jobs'] });
      onClose();
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-500 bg-opacity-75">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(formData); }}>
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Edit Sync Job</h3>
            <p className="text-xs text-gray-500 font-mono mt-1">{job.marketplace} &bull; {job.sync_direction} &bull; {job.sync_type}</p>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Job Name</label>
              <input
                type="text"
                required
                value={formData.job_name}
                onChange={(e) => setFormData({...formData, job_name: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 h-4 w-4"
              />
              <span className="ml-2 text-sm font-medium text-gray-900">Job Active</span>
            </label>

            <div className="pt-4 border-t border-gray-200">
              <label className="flex items-center mb-4">
                <input
                  type="checkbox"
                  checked={formData.schedule_enabled}
                  onChange={(e) => setFormData({...formData, schedule_enabled: e.target.checked})}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 h-4 w-4"
                />
                <span className="ml-2 text-sm text-gray-700">Enable Automated Schedule</span>
              </label>

              {formData.schedule_enabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Interval (Minutes)</label>
                  <input
                    type="number"
                    min="5"
                    required={formData.schedule_enabled}
                    value={formData.schedule_interval_minutes}
                    onChange={(e) => setFormData({...formData, schedule_interval_minutes: parseInt(e.target.value) || 60})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              )}
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
