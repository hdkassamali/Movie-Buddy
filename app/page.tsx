'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function Page() {
  const { user, loading } = useAuth();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-4">Movie Buddy</h1>
          <p className="text-xl text-blue-100 mb-8">
            Discover, track, and rate your favorite movies and TV shows
          </p>
        </div>

        {/* Navigation Cards */}
        {loading ? (
          <div className="text-center">
            <div className="text-white text-xl">Loading...</div>
          </div>
        ) : user ? (
          <div className="grid md:grid-cols-1 gap-8 max-w-2xl mx-auto">
            <Link
              href="/dashboard"
              className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-center hover:bg-white/20 transition-all duration-300 border border-white/20"
            >
              <h2 className="text-2xl font-semibold text-white mb-4">
                Go to Dashboard
              </h2>
              <p className="text-blue-100">
                Welcome back, {user.user_metadata?.username || user.email}!
                Continue managing your movies.
              </p>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Link
              href="/login"
              className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-center hover:bg-white/20 transition-all duration-300 border border-white/20"
            >
              <h2 className="text-2xl font-semibold text-white mb-4">Login</h2>
              <p className="text-blue-100">
                Access your personal movie tracking dashboard
              </p>
            </Link>

            <Link
              href="/register"
              className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-center hover:bg-white/20 transition-all duration-300 border border-white/20"
            >
              <h2 className="text-2xl font-semibold text-white mb-4">
                Register
              </h2>
              <p className="text-blue-100">
                Create an account to start tracking your favorites
              </p>
            </Link>
          </div>
        )}

        {/* Search Section */}
        <div className="mt-16 text-center">
          <Link
            href="/search"
            className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-xl"
          >
            🔍 Search Movies & TV Shows
          </Link>
        </div>

        {/* Features Preview */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-semibold text-white mb-8">
            What you can do
          </h3>
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="bg-white/5 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-white mb-2">
                Track Watchlists
              </h4>
              <p className="text-blue-100 text-sm">
                Create custom lists for movies you want to watch
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-white mb-2">
                Rate & Review
              </h4>
              <p className="text-blue-100 text-sm">
                Give ratings and write reviews for content you&apos;ve watched
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-white mb-2">
                Track Progress
              </h4>
              <p className="text-blue-100 text-sm">
                Keep track of what you&apos;re currently watching
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
