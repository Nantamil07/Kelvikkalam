const handleAskQuestion = async () => {
  if (!question.trim()) return;

  setPosting(true);
  setMessage("");

  try {
    // AI improve + validation
    const aiResponse = await fetch(
      "/api/improve-question",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: question,
        }),
      }
    );

    const aiData = await aiResponse.json();

    // Invalid question
    if (!aiData.success) {
      setMessage(aiData.error || "Invalid question");
      setPosting(false);
      return;
    }

    // Improved question
    const improvedQuestion =
      aiData.question.trim();

    // Duplicate check
    const { data: existingQuestion } =
      await supabase
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

    // Insert question
    const { error } = await supabase
      .from("questions")
      .insert([
        {
          question: improvedQuestion,
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
