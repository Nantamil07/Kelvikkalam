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

  const [search, setSearch] = useState("");

  const [pins, setPins] = useState<string[]>([]);

  // Poll States
  const [pollQuestion, setPollQuestion] =
    useState("");

  const [pollOptions, setPollOptions] =
    useState(["", ""]);

  const [polls, setPolls] = useState<any[]>([]);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchQuestions();
      fetchVotes();
      fetchPolls();
      fetchPins();
    }
  }, [user]);

  // Fetch Questions
  const fetchQuestions = async () => {
    const { data } = await supabase
      .from("questions")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (data) {
      setQuestions(data);
    }
  };

  // Fetch Votes
  const fetchVotes = async () => {
    const { data } = await supabase
      .from("question_votes")
      .select("*");

    if (data) {
      const mappedVotes: Record<
        string,
        number
      > = {};

      data.forEach((vote: any) => {
        mappedVotes[vote.question_id] =
          (mappedVotes[
            vote.question_id
          ] || 0) + vote.vote;
      });

      setVotes(mappedVotes);
    }
  };

  // Fetch Polls
  const fetchPolls = async () => {
    const { data } = await supabase
      .from("polls")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (data) {
      setPolls(data);
    }
  };

  // Fetch Pins
  const fetchPins = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("pins")
      .select("*")
      .eq("user_id", user.id);

    if (data) {
      setPins(
        data.map(
          (pin: any) =>
            pin.item_type +
            "-" +
            pin.item_id
        )
      );
    }
  };

  // Improve Question
  const handleImproveQuestion =
    async () => {
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
  const handleAskQuestion =
    async () => {
      if (!question.trim()) return;

      setPosting(true);
      setMessage("");

      try {
        const aiResponse =
          await fetch(
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

        const {
          data: existingQuestion,
        } = await supabase
          .from("questions")
          .select("id")
          .eq(
            "question",
            improvedQuestion
          )
          .maybeSingle();

        if (existingQuestion) {
          setMessage(
            "Question already exists."
          );

          setPosting(false);
          return;
        }

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

  // Vote Question
  const handleVote = async (
    questionId: string,
    value: number
  ) => {
    if (!user) return;

    const {
      data: existingVote,
    } = await supabase
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

  // Create Poll
  const handleCreatePoll =
    async () => {
      if (
        !pollQuestion.trim() ||
        pollOptions.some(
          (opt) => !opt.trim()
        )
      ) {
        return;
      }

      await supabase
        .from("polls")
        .insert([
          {
            question: pollQuestion,
            options: pollOptions,
            created_by: user?.id,
          },
        ]);

      setPollQuestion("");
      setPollOptions(["", ""]);

      fetchPolls();
    };

  // Poll Vote
  const handlePollVote = async (
    pollId: string,
    option: string
  ) => {
    if (!user) return;

    const {
      data: existingVote,
    } = await supabase
      .from("poll_votes")
      .select("*")
      .eq("poll_id", pollId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingVote) {
      await supabase
        .from("poll_votes")
        .delete()
        .eq("id", existingVote.id);
    }

    await supabase
      .from("poll_votes")
      .insert([
        {
          poll_id: pollId,
          user_id: user.id,
          selected_option: option,
        },
      ]);
  };

  // Pin / Unpin
  const handlePin = async (
    itemId: string,
    itemType: string
  ) => {
    if (!user) return;

    const key =
      itemType + "-" + itemId;

    const isPinned =
      pins.includes(key);

    if (isPinned) {
      await supabase
        .from("pins")
        .delete()
        .eq("user_id", user.id)
        .eq("item_id", itemId)
        .eq("item_type", itemType);
    } else {
      await supabase
        .from("pins")
        .insert([
          {
            user_id: user.id,
            item_id: itemId,
            item_type: itemType,
          },
        ]);
    }

    fetchPins();
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
        Ask questions and create polls.
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

        <button
          onClick={
            handleImproveQuestion
          }
          disabled={improving}
          className="bg-yellow-500 text-white px-4 rounded-lg"
        >
          {improving
            ? "Improving..."
            : "Improve"}
        </button>

        <button
          onClick={handleAskQuestion}
          disabled={posting}
          className="bg-blue-600 text-white px-6 rounded-lg"
        >
          {posting
            ? "Posting..."
            : "Ask"}
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Search questions..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="flex-1 border rounded-lg px-4 py-2"
        />

        <button className="bg-gray-700 text-white px-4 rounded-lg">
          Search
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className="mb-4 text-red-500 text-sm">
          {message}
        </div>
      )}

      {/* Questions */}
      <div className="space-y-3 max-h-[700px] overflow-y-auto mb-10">
        {questions
          .filter((q) =>
            q.question
              .toLowerCase()
              .includes(
                search.toLowerCase()
              )
          )
          .map((q) => (
            <div
              key={q.id}
              className="border rounded-lg p-2 bg-white shadow-sm flex gap-2 items-start"
            >

              {/* Vote Box */}
              <div className="flex flex-col items-center border rounded-md px-2 py-1 h-fit min-w-[42px]">
                <button
                  onClick={() =>
                    handleVote(q.id, 1)
                  }
                  className="text-sm hover:text-blue-600 leading-none"
                >
                  ▲
                </button>

                <span className="text-sm font-bold my-1">
                  {Math.max(
                    votes[q.id] || 0,
                    0
                  )}
                </span>

                <button
                  onClick={() =>
                    handleVote(q.id, -1)
                  }
                  className="text-sm hover:text-red-600 leading-none"
                >
                  ▼
                </button>
              </div>

              {/* Question */}
              <div className="flex-1">
                <p className="text-sm leading-5 break-words">
                  {q.question}
                </p>

                <button
                  onClick={() =>
                    handlePin(
                      q.id,
                      "question"
                    )
                  }
                  className="text-xs text-blue-600 mt-2"
                >
                  {pins.includes(
                    "question-" +
                      q.id
                  )
                    ? "Unpin"
                    : "Pin"}
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* Poll Section */}
      <div className="mt-10">

        <h2 className="text-2xl font-bold mb-4">
          Polls
        </h2>

        {/* Create Poll */}
        <div className="border p-4 rounded-lg mb-6">
          <input
            type="text"
            placeholder="Create poll..."
            value={pollQuestion}
            onChange={(e) =>
              setPollQuestion(
                e.target.value
              )
            }
            className="w-full border rounded-lg px-4 py-2 mb-2"
          />

          {pollOptions.map(
            (option, index) => (
              <input
                key={index}
                type="text"
                placeholder={`Option ${
                  index + 1
                }`}
                value={option}
                onChange={(e) => {
                  const updated = [
                    ...pollOptions,
                  ];

                  updated[index] =
                    e.target.value;

                  setPollOptions(
                    updated
                  );
                }}
                className="w-full border rounded-lg px-4 py-2 mb-2"
              />
            )
          )}

          <button
            onClick={
              handleCreatePoll
            }
            className="bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            Create Poll
          </button>
        </div>

        {/* Poll List */}
        <div className="space-y-4 max-h-[700px] overflow-y-auto">
          {polls.map((poll) => (
            <div
              key={poll.id}
              className="border rounded-lg p-4"
            >

              <div className="flex justify-between mb-3">
                <h3 className="font-bold">
                  {poll.question}
                </h3>

                <button
                  onClick={() =>
                    handlePin(
                      poll.id,
                      "poll"
                    )
                  }
                  className="text-xs text-blue-600"
                >
                  {pins.includes(
                    "poll-" +
                      poll.id
                  )
                    ? "Unpin"
                    : "Pin"}
                </button>
              </div>

              <div className="space-y-2">
                {poll.options.map(
                  (
                    option: string,
                    index: number
                  ) => (
                    <button
                      key={index}
                      onClick={() =>
                        handlePollVote(
                          poll.id,
                          option
                        )
                      }
                      className="w-full border rounded-lg px-4 py-2 text-left hover:bg-gray-100"
                    >
                      {option}
                    </button>
                  )
                )}
              </div>

            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
