import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PostProvider } from './context/PostContext';
import { UserProvider } from './context/UserContext';
import { CommentProvider } from './context/CommentContext';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/Header';
import { MobileFooter } from './components/MobileFooter';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { PostPage } from './pages/PostPage';
import { CommentPage } from './pages/CommentPage';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import PostDetail from './pages/PostDetail';
import AuthCallback from './pages/AuthCallback';
import TestDatabase from './pages/TestDatabase';
import './index.css';

// Protected route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  const { currentUser } = useAuth();
  
  return (
    <Router>
      <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white">
        <Header />
        <main className="pt-2 pb-16 sm:pb-2">
          <Routes>
            <Route path="/login" element={currentUser ? <Navigate to="/" replace /> : <LoginPage />} />
            <Route path="/signup" element={currentUser ? <Navigate to="/" replace /> : <SignupPage />} />
            <Route path="/profile/:username" element={<ProfilePage />} />
            <Route path="/post/:postId" element={<PostPage />} />
            <Route path="/comment/:commentId" element={<CommentPage />} />
            <Route path="/settings" element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } />
            <Route path="/" element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/test-database" element={<TestDatabase />} />
          </Routes>
        </main>
        {currentUser && <MobileFooter />}
      </div>
    </Router>
  );
}

export function App() {
  useEffect(() => {
    // Load Instrument Sans from Google Fonts
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <UserProvider>
          <PostProvider>
            <CommentProvider>
              <AppRoutes />
            </CommentProvider>
          </PostProvider>
        </UserProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
