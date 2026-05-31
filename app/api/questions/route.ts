import { NextResponse } from "next/server";
import type { Question } from "@/lib/seed";

// In-memory store — lives only as long as this server process.
// Survives page reloads (the array stays in memory between requests),
// but is wiped on every server restart / redeploy. That's the catch.
let questions: Question[] = [];

// Always read the live array; never serve a cached snapshot.
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(questions);
}

export async function POST(req: Request) {
  const { body, author } = await req.json();

  const question: Question = {
    id: crypto.randomUUID(),
    body,
    author: author ?? "Anonymous",
  };

  questions = [question, ...questions];
  return NextResponse.json(question);
}
