"use client";

import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const { signInWithGoogle, loading } = useAuth();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2">
          Live Q&A
        </h1>

        <p className="text-gray-600 text-center mb-8">
          Ask and upvote questions
        </p>

        <button
          onClick={signInWithGoogle}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold transition"
        >
          {loading ? "Loading..." : "Sign in with Google"}
        </button>
      </div>
    </div>
  );
}
