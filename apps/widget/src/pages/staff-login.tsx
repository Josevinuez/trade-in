import { useState } from 'react';
import { useRouter } from 'next/router';
import { Shield, User, Lock, AlertCircle } from 'lucide-react';
import { supabase } from '../utils/supabase';

export default function StaffLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Use Supabase built-in authentication
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error('Supabase auth error:', authError);
        setError('Invalid email or password');
        return;
      }

      if (data.user) {
        console.log('Supabase auth successful, user:', data.user);
        
        // Check if user exists in our staff table - using exact database structure
        const { data: staff, error: staffError } = await supabase
          .from('staff')  // lowercase table name
          .select('*')
          .eq('email', email)
          .eq('is_active', true)  // lowercase column name
          .single();

        if (staffError) {
          console.error('Staff lookup error:', staffError);
          console.error('Looking for email:', email);
          console.error('Error details:', staffError);
          setError(`Staff account lookup failed: ${staffError.message}`);
          return;
        }

        if (!staff) {
          console.error('No staff record found for email:', email);
          setError('Staff account not found or inactive');
          return;
        }

        console.log('Staff record found:', staff);

        // Store staff user data in localStorage
        localStorage.setItem('staffUser', JSON.stringify({
          id: staff.id,
          email: staff.email,
          firstName: staff.first_name,  // map from database column name
          lastName: staff.last_name,    // map from database column name
          role: staff.role,
          isActive: staff.is_active     // map from database column name
        }));

        console.log('Staff data stored in localStorage');
        
        // Verify the session is established
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Session after login:', { session: !!session, hasAccessToken: !!session?.access_token });
        
        console.log('About to redirect to dashboard...');

        // Try router.push first
        try {
          await router.push('/staff-dashboard');
          console.log('Router redirect successful');
        } catch (routerError) {
          console.error('Router redirect failed:', routerError);
          // Fallback: use window.location
          window.location.href = '/staff-dashboard';
          console.log('Fallback redirect executed');
        }
        
        console.log('Redirect command executed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center mr-3">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">TradeIn Pro</h1>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Staff Portal</h2>
          <p className="text-gray-600">Manage trade-ins and customer orders</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Staff Login</h1>
            <p className="text-gray-600 mt-2">Access the staff dashboard</p>
          </div>

          {/* Demo Credentials Notice */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
            <div className="flex items-center text-sm text-green-800">
              <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" clipRule="evenodd" />
              </svg>
              <span><strong>Production Ready:</strong> Use <code className="bg-green-100 px-1 rounded">staff@tradeinpro.com</code> / <code className="bg-green-100 px-1 rounded">staff123</code> to connect to your Supabase database</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                <span className="text-red-700">{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="staff@tradeinpro.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Demo Credentials:</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Email:</strong> staff@tradeinpro.com</p>
              <p><strong>Password:</strong> staff123</p>
            </div>
          </div>

          {/* Back to Landing Page */}
          <div className="mt-6 text-center">
            <a
              href="/"
              className="inline-flex items-center text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-1"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 