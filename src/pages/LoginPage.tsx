import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleSignInButton } from '../components/GoogleSignInButton';

export function LoginPage() {
  const [loginType, setLoginType] = useState<'username' | 'email'>('username');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, loginWithEmail } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loginType === 'username' && (!username || !password)) {
      setError('Please enter both username and password');
      return;
    }
    
    if (loginType === 'email' && (!email || !password)) {
      setError('Please enter both email and password');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      if (loginType === 'username') {
        await login(username, password);
      } else {
        await loginWithEmail(email, password);
      }
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid login credentials');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold text-center mb-6 text-black dark:text-white">Log in to Breek</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      <div className="mb-4 flex">
        <button
          type="button"
          onClick={() => setLoginType('username')}
          className={`flex-1 py-2 border-b-2 ${
            loginType === 'username' 
              ? 'border-blue-500 text-blue-500' 
              : 'border-gray-200 dark:border-gray-700 text-gray-500'
          }`}
        >
          Username
        </button>
        <button
          type="button"
          onClick={() => setLoginType('email')}
          className={`flex-1 py-2 border-b-2 ${
            loginType === 'email' 
              ? 'border-blue-500 text-blue-500' 
              : 'border-gray-200 dark:border-gray-700 text-gray-500'
          }`}
        >
          Email
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {loginType === 'username' ? (
          <div>
            <label htmlFor="username" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-black dark:text-white"
              placeholder="Enter your username"
              autoComplete="username"
              required
            />
          </div>
        ) : (
          <div>
            <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-black dark:text-white"
              placeholder="Enter your email address"
              autoComplete="email"
              required
            />
          </div>
        )}
        
        <div>
          <label htmlFor="password" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-black dark:text-white"
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-500 text-white py-2 rounded-lg font-medium disabled:opacity-50"
        >
          {isLoading ? 'Logging in...' : 'Log in'}
        </button>
      </form>
      
      <div className="mt-6 relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">Or continue with</span>
        </div>
      </div>
      
      <div className="mt-6">
        <GoogleSignInButton />
      </div>
      
      <p className="mt-4 text-center text-gray-600 dark:text-gray-400">
        Don&apos;t have an account?{' '}
        <Link to="/signup" className="text-blue-500 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
