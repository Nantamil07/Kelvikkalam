import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const text = body.text;

    // Short check
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
        error: "Missing Gemini API key",
      });
    }

    // Gemini API request
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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
                    "Reject only nonsense spam. " +
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

    console.log("Gemini Response:", data);

    // Safe extraction
    const improvedQuestion =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      null;

    if (!improvedQuestion) {
      return NextResponse.json({
        success: false,
        error: "Gemini returned empty response",
      });
    }

    // Invalid
    if (
      improvedQuestion.trim().toUpperCase() ===
      "INVALID"
    ) {
      return NextResponse.json({
        success: false,
        error: "Invalid question",
      });
    }

    return NextResponse.json({
      success: true,
      question: improvedQuestion.trim(),
    });

  } catch (error: any) {
    console.error(error);

    return NextResponse.json({
      success: false,
      error:
        error.message || "Server error",
    });
  }
}
