"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

export default function Sidebar() {
  const { user, profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 bg-black text-white px-3 py-2 rounded-md md:hidden"
      >
        ☰
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white border-r z-50
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <div className="p-6 flex flex-col h-full">
          {/* Profile */}
          <div className="flex items-center gap-3 mb-8">
            <img
              src={
                profile?.avatar_url ||
                user?.user_metadata?.avatar_url ||
                "/default-avatar.png"
              }
              alt="profile"
              className="w-12 h-12 rounded-full"
            />

            <div>
              <p className="font-bold">
  {profile?.username || user?.email?.split("@")[0] || "User"}
</p>

              <p className="text-sm text-gray-500">
                {user?.email}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-4">
            <Link href="/">🏠 Home</Link>
            <Link href="/questions">❓ Questions</Link>
            <Link href="/ask">➕ Ask Question</Link>
            <Link href="/profile">👤 Profile</Link>
          </nav>

          {/* Bottom */}
          <div className="mt-auto">
            <button
              onClick={signOut}
              className="w-full bg-red-500 text-white py-2 rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
