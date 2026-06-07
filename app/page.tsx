"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

interface Question {
  id: string;
  question: string;
}

export default function HomePage() {
  const { user } = useAuth();

  const [question, setQuestion] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Fetch Error:", error);
      return;
    }

    if (data) {
      setQuestions(data);
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) return;

    if (!user) {
      setMessage("Please login first.");
      return;
    }

    setLoading(true);
    setMessage("");

    // Check duplicate
    const { data: duplicate } = await supabase
      .from("questions")
      .select("id")
      .eq("question", question.trim())
      .maybeSingle();

    if (duplicate) {
      setMessage("Question already exists.");
      setLoading(false);
      return;
    }

    // Insert question
    const { data, error } = await supabase
      .from("questions")
      .insert([
        {
          question: question.trim(),
          user_id: user.id,
        },
      ])
      .select();

    console.log("Inserted:", data);
    console.log("Insert Error:", error);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Question posted successfully.");
      setQuestion("");
      fetchQuestions();
    }

    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-2">
        Live Q&A
      </h1>

      <p className="text-gray-600 mb-6">
        Ask a question, upvote the ones you want answered.
      </p>

      {/* Ask Box */}
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
          disabled={loading}
          className="bg-blue-600 text-white px-6 rounded-lg hover:bg-blue-700"
        >
          {loading ? "Posting..." : "Ask"}
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className="mb-4 text-sm font-medium text-red-500">
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
              <p className="font-medium">
                {q.question}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
