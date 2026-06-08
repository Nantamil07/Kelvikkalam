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
  const [improving, setImproving] = useState(false);
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

      data.forEach((vote: any) => {
        mappedVotes[vote.question_id] =
          (mappedVotes[vote.question_id] || 0) +
          vote.vote;
      });

      setVotes(mappedVotes);
    }
  };

  // Improve Question Only
  const handleImproveQuestion = async () => {
    if (!question.trim()) return;

    setImproving(true);
    setMessage("");

    try {
      const response = await fetch(
        "/api/improve-question",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            text: question,
          }),
        }
      );

      const data =
        await response.json();

      if (!data.success) {
        setMessage(
          data.error ||
            "Failed to improve question"
        );
      } else {
        // Replace textbox text
        setQuestion(data.question);
      }

    } catch (error) {
      console.error(error);

      setMessage(
        "Failed to improve question"
      );
    }

    setImproving(false);
  };

  // Ask Question
  const handleAskQuestion = async () => {
    if (!question.trim()) return;

    setPosting(true);
    setMessage("");

    try {
      // AI improve first
      const aiResponse = await fetch(
        "/api/improve-question",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            text: question,
          }),
        }
      );

      const aiData =
        await aiResponse.json();

      if (!aiData.success) {
        setMessage(
          aiData.error ||
            "Invalid question"
        );

        setPosting(false);
        return;
      }

      const improvedQuestion =
        aiData.question.trim();

      // Duplicate check
      const {
        data: existingQuestion,
      } = await supabase
        .from("questions")
        .select("id")
        .eq("question", improvedQuestion)
        .maybeSingle();

      if (existingQuestion) {
        setMessage(
          "Question already exists."
        );

        setPosting(false);
        return;
      }

      // Insert
      const { error } =
        await supabase
          .from("questions")
          .insert([
            {
              question:
                improvedQuestion,
              user_id: user?.id,
            },
          ]);

      if (error) {
        setMessage(error.message);
      } else {
        setQuestion("");
        fetchQuestions();
      }

    } catch (error) {
      console.error(error);

      setMessage(
        "Failed to process question"
      );
    }

    setPosting(false);
  };

  // Vote
  const handleVote = async (
    questionId: string,
    value: number
  ) => {
    if (!user) return;

    const { data: existingVote } =
      await supabase
        .from("question_votes")
        .select("*")
        .eq("question_id", questionId)
        .eq("user_id", user.id)
        .maybeSingle();

    if (!existingVote) {
      await supabase
        .from("question_votes")
        .insert([
          {
            question_id:
              questionId,
            user_id: user.id,
            vote: value,
          },
        ]);
    } else {
      if (
        existingVote.vote === value
      ) {
        await supabase
          .from("question_votes")
          .delete()
          .eq("id", existingVote.id);
      } else {
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

  // Loading
  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <h1 className="text-4xl font-bold mb-2">
        Live Q&A
      </h1>

      <p className="text-gray-600 mb-6">
        Ask a question, upvote the ones
        you want answered.
      </p>

      {/* Ask Question */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Ask a question..."
          value={question}
          onChange={(e) =>
            setQuestion(e.target.value)
          }
          className="flex-1 border rounded-lg px-4 py-3"
        />

        {/* Improve Button */}
        <button
          onClick={
            handleImproveQuestion
          }
          disabled={improving}
          className="bg-yellow-500 text-white px-4 rounded-lg hover:bg-yellow-600"
        >
          {improving
            ? "Improving..."
            : "Improve"}
        </button>

        {/* Ask Button */}
        <button
          onClick={handleAskQuestion}
          disabled={posting}
          className="bg-blue-600 text-white px-6 rounded-lg hover:bg-blue-700"
        >
          {posting
            ? "Posting..."
            : "Ask"}
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className="mb-4 text-red-500 text-sm">
          {message}
        </div>
      )}

      {/* Questions */}
      <div className="space-y-3">
        {questions.length === 0 ? (
          <div className="text-gray-500">
            No questions yet - be the
            first to ask.
          </div>
        ) : (
          questions.map((q) => (
            <div
              key={q.id}
              className="border rounded-lg p-2 bg-white shadow-sm flex gap-2 items-start"
            >
              {/* Vote Box */}
<div className="flex flex-col items-center border rounded-md px-2 py-1 h-fit min-w-[42px]">
  <button
    onClick={() => handleVote(q.id, 1)}
    className="text-sm hover:text-blue-600 leading-none"
  >
    ▲
  </button>

  <span className="text-sm font-bold my-1">
    {Math.max(votes[q.id] || 0, 0)}
  </span>

  <button
    onClick={() => handleVote(q.id, -1)}
    className="text-sm hover:text-red-600 leading-none"
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
