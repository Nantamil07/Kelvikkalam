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

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Fetch data
  useEffect(() => {
    if (user) {
      fetchQuestions();
      fetchVotes();
    }
  }, [user]);

  // Fetch questions
  const fetchQuestions = async () => {
    const { data } = await supabase
      .from("questions")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      setQuestions(data);
    }
  };

  // Fetch votes
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

  // Ask question
  const handleAskQuestion = async () => {
    if (!question.trim()) return;

    setPosting(true);
    setMessage("");

    // Duplicate check
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

  // Vote handler
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

    // No existing vote
    if (!existingVote) {
      await supabase.from("question_votes").insert([
        {
          question_id: questionId,
          user_id: user.id,
          vote: value,
        },
      ]);
    } else {
      // Clicking same vote removes vote
      if (existingVote.vote === value) {
        await supabase
          .from("question_votes")
          .delete()
          .eq("id", existingVote.id);
      } else {
        // Switch vote
        await supabase
          .from("question_votes")
          .update({
            vote: value,
          })
          .eq("id", existingVote.id);
      }
    }

    fetchVotes();
  };

  // Loading state
  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-2">
        Live Q&A
      </h1>

      <p className="text-gray-600 mb-6 text-sm">
        Ask a question, upvote the ones you want answered.
      </p>

      {/* Ask Question */}
      <div className="flex gap-2 mb-4">
  <input
    type="text"
    placeholder="Ask a question..."
    value={question}
    onChange={(e) => setQuestion(e.target.value)}
    className="flex-1 border rounded-lg px-4 py-2 text-sm"
  />

  <button
    onClick={handleAskQuestion}
    disabled={posting}
    className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 text-sm"
  >
    {posting ? "Posting..." : "Ask"}
  </button>
</div>

      {/* Message */}
      {message && (
        <div className="mb-4 text-red-500 text-sm">
          {message}
        </div>
      )}

      {/* Questions */}
      <div className="space-y-2">
        {questions.length === 0 ? (
          <div className="text-gray-500 text-sm">
            No questions yet — be the first to ask.
          </div>
        ) : (
          questions.map((q) => (
            <div
              key={q.id}
              className="border rounded-lg px-3 py-2 bg-white shadow-sm flex gap-2 items-start"
            >
              {/* Small Vote Box */}
              <div className="flex flex-col items-center border rounded px-1 py-1 h-fit w-8 shrink-0">
                <button
                  onClick={() => handleVote(q.id, 1)}
                  className="text-[10px] hover:text-blue-600 leading-none"
                >
                  ▲
                </button>

                <span className="text-xs font-bold my-0.5">
                  {Math.max(votes[q.id] || 0, 0)}
                </span>

                <button
                  onClick={() => handleVote(q.id, -1)}
                  className="text-[10px] hover:text-red-600 leading-none"
                >
                  ▼
                </button>
              </div>

              {/* Question */}
              <div className="flex-1 max-h-12 overflow-y-auto">
                <p className="text-sm leading-5 break-words">
                  {q.question}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
