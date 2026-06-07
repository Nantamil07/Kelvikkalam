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
You are an AI assistant for a Q&A website.

Tasks:
1. Correct grammar
2. Convert text into a proper question
3. Keep same meaning
4. Reject only nonsense spam or random letters

Rules:
- Most inputs are valid
- Do not reject technical questions
- Do not reject short questions
- Do not reject bad grammar

If invalid return only:
INVALID

If valid return only the corrected question.

Input:
${text}
`;

    const result =
      await model.generateContent(prompt);

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
    console.error(error);

    return NextResponse.json({
      success: false,
      error:
        error?.message ||
        "Unknown server error",
    });
  }
}
