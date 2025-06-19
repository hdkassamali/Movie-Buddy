'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Dashboard</h1>
          <button
            onClick={handleSignOut}
            className="bg-red-500/20 hover:bg-red-500/30 text-red-100 px-4 py-2 rounded-lg border border-red-500/50 transition-colors"
          >
            Sign Out
          </button>
        </div>

        {/* Welcome Message */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Welcome back!
          </h2>
          <div className="space-y-2 text-blue-100">
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>User ID:</strong> {user.id}
            </p>
            {user.user_metadata?.username && (
              <p>
                <strong>Username:</strong> {user.user_metadata.username}
              </p>
            )}
            <p>
              <strong>Account created:</strong>{' '}
              {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Placeholder Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white/5 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-2">My Lists</h3>
            <p className="text-blue-100 text-sm mb-4">
              Create and manage your movie watchlists
            </p>
            <button className="text-blue-300 hover:text-blue-200 text-sm font-medium">
              Coming Soon →
            </button>
          </div>

          <div className="bg-white/5 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-2">
              Search Movies
            </h3>
            <p className="text-blue-100 text-sm mb-4">
              Discover new movies and TV shows
            </p>
            <button className="text-blue-300 hover:text-blue-200 text-sm font-medium">
              Coming Soon →
            </button>
          </div>

          <div className="bg-white/5 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-2">
              My Ratings
            </h3>
            <p className="text-blue-100 text-sm mb-4">
              Rate and review your watched content
            </p>
            <button className="text-blue-300 hover:text-blue-200 text-sm font-medium">
              Coming Soon →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
