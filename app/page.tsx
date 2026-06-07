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
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [posting, setPosting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchQuestions();
      fetchVotes();
    }
  }, [user]);

  const fetchQuestions = async () => {
    const { data } = await supabase
      .from("questions")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      setQuestions(data);
    }
  };

  const fetchVotes = async () => {
    const { data } = await supabase
      .from("question_votes")
      .select("*");

    if (data) {
      const mappedVotes: Record<string, number> = {};

      data.forEach((vote) => {
        mappedVotes[vote.question_id] =
          (mappedVotes[vote.question_id] || 0) + vote.vote;
      });

      setVotes(mappedVotes);
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) return;

    setPosting(true);
    setMessage("");

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

    const { error } = await supabase
      .from("questions")
      .insert([
        {
          question: question.trim(),
          user_id: user?.id,
        },
      ]);

    if (error) {
      setMessage(error.message);
    } else {
      setQuestion("");
      fetchQuestions();
    }

    setPosting(false);
  };

  const handleVote = async (
    questionId: string,
    value: number
  ) => {
    if (!user) return;

    const { data: existingVote } = await supabase
      .from("question_votes")
      .select("*")
      .eq("question_id", questionId)
      .eq("user_id", user.id)
      .maybeSingle();

    // No vote yet
    if (!existingVote) {
      await supabase.from("question_votes").insert([
        {
          question_id: questionId,
          user_id: user.id,
          vote: value,
        },
      ]);
    } else {
      // Same vote clicked again → ignore
      if (existingVote.vote === value) {
        return;
      }

      // Change vote
      await supabase
        .from("question_votes")
        .update({
          vote: value,
        })
        .eq("id", existingVote.id);
    }

    fetchVotes();
  };

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
          className="bg-blue-600 text-white px-6 rounded-lg"
        >
          {posting ? "Posting..." : "Ask"}
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className="mb-4 text-red-500">
          {message}
        </div>
      )}

      {/* Questions */}
      <div className="space-y-4">
        {questions.map((q) => (
          <div
            key={q.id}
            className="border rounded-xl p-4 bg-white shadow-sm flex gap-4"
          >
            {/* Vote Box */}
            <div className="flex flex-col items-center border rounded-lg px-3 py-2 min-w-[60px]">
              <button
                onClick={() => handleVote(q.id, 1)}
                className="text-xl hover:text-blue-600"
              >
                ▲
              </button>

              <span className="font-bold">
                {votes[q.id] || 0}
              </span>

              <button
                onClick={() => handleVote(q.id, -1)}
                className="text-xl hover:text-red-600"
              >
                ▼
              </button>
            </div>

            {/* Question */}
            <div className="flex-1">
              <p className="font-medium">
                {q.question}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
