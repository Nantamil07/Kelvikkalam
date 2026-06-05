"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

export default function SetupProfile() {
  const router = useRouter();
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const checkUsernameAvailability = async (value: string) => {
    if (value.length < 3) {
      setIsAvailable(false);
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", value)
      .single();

    setIsAvailable(!data);
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setUsername(value);
    setError("");
    checkUsernameAvailability(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAvailable || !user) {
      setError("Please select an available username");
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ username })
      .eq("id", user.id);

    if (!updateError) {
      router.push("/");
    } else {
      setError("Failed to create username. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2">Create Your Username</h1>
        <p className="text-gray-600 mb-6">Choose a unique username like Instagram</p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Username</label>
            <div className="flex items-center border rounded-lg overflow-hidden">
              <span className="px-3 py-2 bg-gray-100 text-gray-600">@</span>
              <input
                type="text"
                value={username}
                onChange={handleUsernameChange}
                placeholder="john_doe"
                className="flex-1 px-4 py-2 focus:outline-none"
                minLength={3}
                maxLength={30}
                required
              />
            </div>
            {username && (
              <p className={`mt-2 text-sm ${isAvailable ? "text-green-600" : "text-red-600"}`}>
                {isAvailable ? "✓ Username available" : "✗ Username taken"}
              </p>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-600 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!isAvailable || loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold transition"
          >
            {loading ? "Creating..." : "Create Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
