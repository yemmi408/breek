import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserSetupModal } from './UserSetupModal';

export function GoogleSignInButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showUserSetup, setShowUserSetup] = useState(false);
  const [userData, setUserData] = useState<{email: string, displayName?: string}>({email: ''});
  const { signInWithGoogle, completeGoogleSignup } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const result = await signInWithGoogle();
      if (result.needsProfile) {
        // User needs to set up profile
        setUserData({
          email: result.email || '',
          displayName: result.displayName || ''
        });
        setShowUserSetup(true);
      } else {
        // User is already set up, navigate to home
        navigate('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in with Google');
      console.error("Google sign-in error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserSetupSubmit = async (username: string, displayName: string, password: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      await completeGoogleSignup(username, displayName, password);
      setShowUserSetup(false);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete profile setup');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="w-full flex justify-center items-center bg-white text-gray-700 border border-gray-300 py-2 px-4 rounded-lg font-medium mb-2 hover:bg-gray-50 disabled:opacity-50"
      >
        {isLoading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading...
          </span>
        ) : (
          <span className="flex items-center">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" 
                fill="#4285F4" 
              />
              <path 
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" 
                fill="#34A853" 
              />
              <path 
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" 
                fill="#FBBC05" 
              />
              <path 
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" 
                fill="#EA4335" 
              />
            </svg>
            Sign in with Google
          </span>
        )}
      </button>
      
      {error && (
        <div className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</div>
      )}

      <UserSetupModal
        isOpen={showUserSetup}
        onClose={() => setShowUserSetup(false)}
        onSubmit={handleUserSetupSubmit}
        initialEmail={userData.email}
        initialDisplayName={userData.displayName}
        initialUsername={userData.displayName ? userData.displayName.toLowerCase().replace(/[^a-z0-9_]/g, '_').substring(0, 15) : ''}
        error={error}
      />
    </div>
  );
}
