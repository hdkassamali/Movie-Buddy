'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import UserInfoCard from '@/components/UserInfoCard/UserInfoCard';
import FeatureCard from '@/components/FeatureCard/FeatureCard';

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
            className="bg-red-500/20 hover:bg-red-500/30 text-red-100 px-4 py-2 rounded-lg border border-red-500/50 transition-colors hover:cursor-pointer"
          >
            Sign Out
          </button>
        </div>

        {/* Welcome Message */}
        <UserInfoCard user={user} />

        {/* Placeholder Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            title="My Lists"
            description="Create and manage your movie watchlists"
          />
          <FeatureCard
            title="Search Movies"
            description="Discover new movies and TV shows"
          />
          <FeatureCard
            title="My Ratings"
            description="Rate and review your watched content"
          />
        </div>
      </div>
    </div>
  );
}
