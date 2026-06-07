import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const text = body.text;

    // Empty check
    if (!text || text.trim().length < 3) {
      return NextResponse.json({
        success: false,
        error: "Question too short",
      });
    }

    // Remove extra spaces
    const cleaned = text.trim();

    // Reject meaningless spam
    const invalidPatterns = [
      /^[a-zA-Z]{1,2}$/,
      /^(.)\1+$/,
      /^[0-9]+$/,
    ];

    const isInvalid =
      invalidPatterns.some((pattern) =>
        pattern.test(cleaned)
      );

    if (isInvalid) {
      return NextResponse.json({
        success: false,
        error: "Invalid question",
      });
    }

    // Auto convert to question
    let improvedQuestion = cleaned;

    // Capitalize first letter
    improvedQuestion =
      improvedQuestion.charAt(0).toUpperCase() +
      improvedQuestion.slice(1);

    // Add question mark if missing
    if (
      !improvedQuestion.endsWith("?")
    ) {
      improvedQuestion += "?";
    }

    return NextResponse.json({
      success: true,
      question: improvedQuestion,
    });

  } catch (error: any) {
    console.error(error);

    return NextResponse.json({
      success: false,
      error: "Server error",
    });
  }
}
