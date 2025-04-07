import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { UserProfile } from '../components/UserProfile';
import { useUsers } from '../context/UserContext';
import { User } from '../types';

export function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { getUserByUsername } = useUsers();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (username) {
      const foundUser = getUserByUsername(username);
      setUser(foundUser || null);
      setLoading(false);
    }
  }, [username, getUserByUsername]);
  
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4 text-center">
        Loading profile...
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <div className="max-w-2xl mx-auto">
      <UserProfile user={user} />
    </div>
  );
}
