"use client";
import { useState, useEffect } from "react";

type Question = { id: string; body: string; author: string | null };

export default function QuestionsList({
  initialQuestions,
}: {
  initialQuestions: Question[];
}) {
  // Logs once on the server (terminal) and once in the browser (console) —
  // same component, both places. That second run is hydration.
  console.log(
    "QuestionsList rendered on:",
    typeof window === "undefined" ? "server" : "client"
  );

  const [questions, setQuestions] = useState(initialQuestions);

  // Flip AFTER mount (browser-only), never during render — so the first
  // render returns false on both server and client and they agree.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        {hydrated ? "Interactive ✓" : "Loading interactivity…"}
      </p>
      <ul className="space-y-3">
        {questions.map((q) => (
          <li key={q.id} className="rounded-lg border p-3">
            {q.body}
          </li>
        ))}
      </ul>
    </div>
  );
}
