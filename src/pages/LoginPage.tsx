import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { systemApi } from '@/lib/api/client';
import { useAuth, type Admin } from '@/lib/auth/auth-context';
import { Card, CardBody } from '@/components/ui/Card';
import { Loader2 } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, token } = useAuth();
  const [email, setEmail] = useState('admin@marketops.local');
  const [password, setPassword] = useState('Admin123!');

  // Redirect if already logged in
  if (token) {
    navigate('/', { replace: true });
  }

  const from = location.state?.from?.pathname || "/";

  const loginMutation = useMutation({
    mutationFn: systemApi.login,
    onSuccess: (data) => {
      login(data.token, data.admin as Admin);
      navigate(from, { replace: true });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-xl">ML</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            MarketOps Lite
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Internal Operations Dashboard
          </p>
        </div>

        <Card>
          <CardBody>
            <form className="space-y-6" onSubmit={handleSubmit}>
              {loginMutation.isError && (
                <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm border border-red-200">
                  {loginMutation.error instanceof Error ? loginMutation.error.message : 'Invalid credentials'}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input block w-full"
                  placeholder="admin@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input block w-full"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
