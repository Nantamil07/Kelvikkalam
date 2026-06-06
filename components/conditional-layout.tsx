"use client";

import Sidebar from "@/components/sidebar";
import { useAuth } from "@/lib/auth-context";

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  // If logged in → show sidebar
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

  // If logged out → no sidebar
  return <main>{children}</main>;
}
