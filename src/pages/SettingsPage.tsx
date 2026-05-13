import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { systemApi } from '@/lib/api/client';
import { useAuth } from '@/lib/auth/auth-context';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Loader2, CheckCircle2 } from 'lucide-react';

export function SettingsPage() {
  const { admin } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: systemApi.changePassword,
    onSuccess: () => {
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setSuccess(false), 3000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ current_password: currentPassword, new_password: newPassword });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage your admin profile and security.</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <div className="mt-1 p-2 bg-gray-50 rounded-md border border-gray-200 text-gray-700">
              {admin?.name}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <div className="mt-1 p-2 bg-gray-50 rounded-md border border-gray-200 text-gray-700">
              {admin?.email}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <div className="mt-1 p-2 bg-gray-50 rounded-md border border-gray-200 text-gray-700 uppercase text-xs font-bold inline-block">
              {admin?.role}
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900">Change Password</h2>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mutation.isError && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm border border-red-200">
                {mutation.error instanceof Error ? mutation.error.message : 'Failed to change password'}
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm border border-green-200 flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Password updated successfully
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="form-input block w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password (min 8 characters)
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="form-input block w-full"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={mutation.isPending || !currentPassword || newPassword.length < 8}
                className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Updating...
                  </>
                ) : (
                  'Update Password'
                )}
              </button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
