"use client";

import { useAuth } from "@/lib/auth-context";

export default function ProfilePage() {
  const { user, profile } = useAuth();

  return (
    <div className="p-6">
      <img
        src={
          profile?.avatar_url ||
          user?.user_metadata?.avatar_url
        }
        className="w-24 h-24 rounded-full"
      />

      <h1 className="text-2xl font-bold mt-4">
        {profile?.username}
      </h1>

      <p>{user?.email}</p>
    </div>
  );
}
