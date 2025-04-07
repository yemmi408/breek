import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center space-x-4">
              <img
                src={currentUser.avatar}
                alt={currentUser.displayName}
                className="h-16 w-16 rounded-full"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome, {currentUser.displayName}!
                </h1>
                <p className="text-gray-600">@{currentUser.username}</p>
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-medium text-gray-900">Your Profile</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="mt-1 text-sm text-gray-900">{currentUser.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Bio</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {currentUser.bio || 'No bio yet'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Member Since</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(currentUser.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Following</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {currentUser.following.length} users
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 