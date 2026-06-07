import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

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

    // CHECK ENV VARIABLE
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: "Missing GEMINI_API_KEY",
      });
    }

    const genAI = new GoogleGenerativeAI(
      process.env.GEMINI_API_KEY
    );

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const prompt = `
Convert this into a proper grammatically correct question.

Reject only nonsense/random letters/spam.

If invalid return ONLY:
INVALID

Otherwise return ONLY the corrected question.

Input:
${text}
`;

    const result = await model.generateContent(
      prompt
    );

    const response =
      result.response.text().trim();

    if (response === "INVALID") {
      return NextResponse.json({
        success: false,
        error: "Invalid question",
      });
    }

    return NextResponse.json({
      success: true,
      question: response,
    });
  } catch (error: any) {
    console.error("FULL ERROR:", error);

    return NextResponse.json({
      success: false,
      error:
        error?.message ||
        JSON.stringify(error) ||
        "Unknown server error",
    });
  }
}
