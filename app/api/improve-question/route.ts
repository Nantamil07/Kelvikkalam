import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const genAI = new GoogleGenerativeAI(
      process.env.GEMINI_API_KEY!
    );

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const result = await model.generateContent(
      `Convert this into a proper question: ${body.text}`
    );

    const response = result.response.text();

    return NextResponse.json({
      success: true,
      question: response,
    });
  } catch (err: any) {
    console.error(err);

    return NextResponse.json({
      success: false,
      error: String(err),
    });
  }
}
