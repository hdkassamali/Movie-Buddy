'use client';

import { User } from '@supabase/supabase-js';

interface UserInfoCardProps {
  user: User;
}

export default function UserInfoCard({ user }: UserInfoCardProps) {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 mb-8">
      <h2 className="text-2xl font-semibold text-white mb-4">Welcome back!</h2>
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
  );
}
