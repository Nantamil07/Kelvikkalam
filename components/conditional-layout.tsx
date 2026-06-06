"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./sidebar";

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const hideSidebar =
    pathname === "/login" ||
    pathname === "/setup-profile";

  return (
    <div className="flex">
      {!hideSidebar && <Sidebar />}

      <main className={!hideSidebar ? "md:ml-64 flex-1" : "flex-1"}>
        {children}
      </main>
    </div>
  );
}
