import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-indigo-600">Breek</div>
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <Link
                to="/dashboard"
                className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-500"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Connect, Share, and Grow Together
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl">
            Join a vibrant community where you can share your thoughts, connect with others, and discover new perspectives.
          </p>
          {!currentUser && (
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/signup"
                className="px-8 py-3 text-lg font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-500"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="px-8 py-3 text-lg font-medium text-indigo-600 bg-white border border-indigo-600 rounded-md hover:bg-gray-50"
              >
                Log In
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose Breek?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-indigo-600 text-2xl mb-4">🌟</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy to Use</h3>
              <p className="text-gray-600">
                Simple and intuitive interface that makes sharing and connecting effortless.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-indigo-600 text-2xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure & Private</h3>
              <p className="text-gray-600">
                Your data is protected with industry-standard security measures.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-indigo-600 text-2xl mb-4">🌐</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Connect Globally</h3>
              <p className="text-gray-600">
                Join a diverse community of users from around the world.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="bg-indigo-600 rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-indigo-100 mb-8">
            Join thousands of users who are already sharing and connecting on Breek.
          </p>
          {!currentUser && (
            <Link
              to="/signup"
              className="inline-block px-8 py-3 text-lg font-medium text-indigo-600 bg-white rounded-md hover:bg-gray-50"
            >
              Create Your Account
            </Link>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-2xl font-bold text-white mb-4 md:mb-0">Breek</div>
            <div className="flex space-x-6">
              <a href="#" className="hover:text-gray-300">About</a>
              <a href="#" className="hover:text-gray-300">Privacy</a>
              <a href="#" className="hover:text-gray-300">Terms</a>
              <a href="#" className="hover:text-gray-300">Contact</a>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-400">
            © {new Date().getFullYear()} Breek. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home; 