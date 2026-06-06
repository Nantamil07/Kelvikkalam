import type { Metadata } from "next";
import "./globals.css";

import { AuthProvider } from "@/lib/auth-context";
import ConditionalLayout from "@/components/conditional-layout";

export const metadata: Metadata = {
  title: "Live Q&A",
  description: "Ask questions and upvote answers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
