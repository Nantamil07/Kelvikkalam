"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import QuestionsList from "./questions-list";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const questions = []; // Placeholder - will fetch from DB later
  const hasMore = false;

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-10 sm:py-14">
      <header className="mb-7">
        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-xs font-medium text-brand">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" />
          Live now
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">Live Q&A</h1>
        <p className="mt-1.5 text-sm text-muted">
          Ask a question, upvote the ones you want answered.
        </p>
      </header>
      <QuestionsList initialQuestions={questions} initialHasMore={hasMore} />
    </main>
  );
}
