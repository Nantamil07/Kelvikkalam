import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const text = body.text;

    if (!text || text.trim().length < 3) {
      return NextResponse.json({
        success: false,
        error: "Question too short",
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: "Missing API key",
      });
    }

    const response = await fetch(
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=" +
    apiKey,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text:
                    "Convert this into a proper grammatically correct question. " +
                    "Reject only meaningless spam. " +
                    "If invalid return only INVALID. " +
                    "Input: " +
                    text,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    console.log(data);

    // SHOW RAW RESPONSE
    if (!data.candidates) {
      return NextResponse.json({
        success: false,
        error:
          JSON.stringify(data),
      });
    }

    const improvedQuestion =
      data.candidates[0].content.parts[0].text;

    if (
      improvedQuestion
        .trim()
        .toUpperCase() === "INVALID"
    ) {
      return NextResponse.json({
        success: false,
        error: "Invalid question",
      });
    }

    return NextResponse.json({
      success: true,
      question: improvedQuestion,
    });

  } catch (error: any) {
    console.error(error);

    return NextResponse.json({
      success: false,
      error:
        error.message ||
        "Server error",
    });
  }
}
