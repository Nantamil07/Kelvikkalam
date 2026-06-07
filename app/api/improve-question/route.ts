import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const text = body.text;

    // Basic validation
    if (!text || text.trim().length < 3) {
      return NextResponse.json({
        success: false,
        error: "Question is too short",
      });
    }

    // Gemini setup
    const genAI = new GoogleGenerativeAI(
      process.env.GEMINI_API_KEY!
    );

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    // AI prompt
    const result = await model.generateContent(`
You are an AI assistant for a Q&A website.

Your tasks:
1. Correct grammar
2. Convert text into a proper question
3. Keep the meaning same
4. Reject only COMPLETE nonsense/spam/random letters

IMPORTANT:
- Most user inputs are valid
- Do NOT reject short technical questions
- Do NOT reject programming questions
- Do NOT reject imperfect grammar

If invalid, return ONLY:
INVALID

If valid, return ONLY the improved question.

Input:
${text}
`);

    const response = result.response
      .text()
      .trim();

    // Invalid question
    if (response === "INVALID") {
      return NextResponse.json({
        success: false,
        error: "Invalid question",
      });
    }

    // Valid improved question
    return NextResponse.json({
      success: true,
      question: response,
    });

  } catch (err: any) {
    console.error(err);

    return NextResponse.json({
      success: false,
      error: "Server error",
    });
  }
}
