import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

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
You are a strict moderator for a Q&A platform.

TASKS:
1. Correct grammar
2. Convert text into a proper question
3. Reject meaningless input
4. Reject spam
5. Reject random characters
6. Reject statements that are not questions

Return ONLY valid JSON.

VALID FORMAT:
{
  "valid": true,
  "question": "Improved question here"
}

INVALID FORMAT:
{
  "valid": false,
  "message": "Reason here"
}

INVALID examples:
- "asdfgh"
- "hi"
- "hello"
- "test"
- "aaaa"
- "........."
- random spam

User Input:
"${text}"
`;

    const result = await model.generateContent(prompt);

    const response = result.response
      .text()
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    try {
      const parsed = JSON.parse(response);

      return NextResponse.json(parsed);
    } catch {
      return NextResponse.json({
        valid: false,
        message: "Failed to process question",
      });
    }
  } catch (error) {
    console.error(error);

    return NextResponse.json({
      valid: false,
      message: "Server error",
    });
  }
}
