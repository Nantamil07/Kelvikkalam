"use client";

import Sidebar from "@/components/sidebar";
import { useAuth } from "@/lib/auth-context";

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  // Wait for auth session
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Loading...
      </main>
    );
  }

  // Logged in
  if (user) {
    return (
      <>
        <Sidebar />

        <main className="md:ml-64">
          {children}
        </main>
      </>
    );
  }

  // Logged out
  return <main>{children}</main>;
}
