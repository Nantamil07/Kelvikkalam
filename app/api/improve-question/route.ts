import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: "No text provided" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const prompt = `
Convert the following text into a clean professional question.

Rules:
- Correct grammar
- Make it short and clear
- Ensure it becomes a proper question
- Do not add extra explanation
- Return ONLY the corrected question

Text:
"${text}"
`;

    const result = await model.generateContent(prompt);

    const response =
      result.response.text().trim();

    return NextResponse.json({
      question: response,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to improve question" },
      { status: 500 }
    );
  }
}
