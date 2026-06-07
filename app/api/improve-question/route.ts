import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("Missing GEMINI_API_KEY");
}

const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const text = body.text;

    if (!text || text.trim().length < 3) {
      return NextResponse.json({
        valid: false,
        message: "Question is too short",
      });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const prompt = `
You are an AI moderator for a Q&A website.

RULES:
- Fix grammar
- Convert into proper question
- Reject meaningless text
- Reject spam
- Reject random letters
- Reject non-question messages

Return ONLY JSON.

VALID:
{"valid": true, "question": "Improved question"}

INVALID:
{"valid": false, "message": "Invalid question"}

Input:
${text}
`;

    const result = await model.generateContent(prompt);

    const rawText = result.response.text();

    console.log("Gemini Response:", rawText);

    const cleaned = rawText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsed;

    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({
        valid: false,
        message: "AI returned invalid response",
      });
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Gemini API Error:", error);

    return NextResponse.json({
      valid: false,
      message: "Server error",
    });
  }
}
