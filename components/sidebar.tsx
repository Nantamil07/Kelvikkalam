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
          
          {/* Profile Section */}
          <div className="flex items-center gap-3 mb-8 min-w-0">
            
            {/* Profile Picture */}
            <img
              src={profile?.avatar_url || "/default-avatar.png"}
              alt="profile"
              className="w-12 h-12 rounded-full object-cover border flex-shrink-0"
            />

            {/* User Info */}
            <div className="min-w-0">
              <p className="font-bold truncate">
                {profile?.username || "User"}
              </p>

              <p className="text-sm text-gray-500 truncate max-w-[150px]">
                {user?.email}
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <div className="mt-auto">
            <button
              onClick={signOut}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
