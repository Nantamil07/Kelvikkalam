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

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization:
            `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content:
                "Convert this into a proper grammatically correct question. Reject nonsense spam. If invalid return only INVALID. Input: " +
                text,
            },
          ],
        }),
      }
    );

    const data = await response.json();

    const improved =
      data?.choices?.[0]?.message?.content;

    if (!improved) {
      return NextResponse.json({
        success: false,
        error: "AI failed",
      });
    }

    if (
      improved.trim().toUpperCase() ===
      "INVALID"
    ) {
      return NextResponse.json({
        success: false,
        error: "Invalid question",
      });
    }

    return NextResponse.json({
      success: true,
      question: improved.trim(),
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    });
  }
}
