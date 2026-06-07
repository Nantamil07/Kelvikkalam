"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

interface Question {
  id: string;
  question: string;
}

export default function HomePage() {
  const router = useRouter();

  const { user, loading } = useAuth();

  const [question, setQuestion] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [posting, setPosting] = useState(false);
  const [message, setMessage] = useState("");

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchQuestions();
    }
  }, [user]);

  const fetchQuestions = async () => {
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setQuestions(data);
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) return;

    if (!user) {
      setMessage("Please login first.");
      return;
    }

    setPosting(true);
    setMessage("");

    // Check duplicate
    const { data: existingQuestion } = await supabase
      .from("questions")
      .select("id")
      .eq("question", question.trim())
      .maybeSingle();

    if (existingQuestion) {
      setMessage("Question already exists.");
      setPosting(false);
      return;
    }

    // Insert question
    const { error } = await supabase
      .from("questions")
      .insert([
        {
          question: question.trim(),
          user_id: user.id,
        },
      ]);

    if (error) {
      console.log(error);
      setMessage(error.message);
    } else {
      setQuestion("");
      setMessage("Question posted successfully.");
      fetchQuestions();
    }

    setPosting(false);
  };

  // Loading screen
  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-2">
        Live Q&A
      </h1>

      <p className="text-gray-600 mb-6">
        Ask a question, upvote the ones you want answered.
      </p>

      {/* Ask Question */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Ask a question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="flex-1 border rounded-lg px-4 py-3"
        />

        <button
          onClick={handleAskQuestion}
          disabled={posting}
          className="bg-blue-600 text-white px-6 rounded-lg hover:bg-blue-700"
        >
          {posting ? "Posting..." : "Ask"}
        </button>
      </div>

      {/* Status Message */}
      {message && (
        <div className="mb-4 text-sm text-red-500">
          {message}
        </div>
      )}

      {/* Questions */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="text-gray-500">
            No questions yet — be the first to ask.
          </div>
        ) : (
          questions.map((q) => (
            <div
              key={q.id}
              className="border rounded-xl p-4 bg-white shadow-sm"
            >
              {q.question}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
