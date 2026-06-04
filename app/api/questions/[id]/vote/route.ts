export const dynamic = 'force-dynamic';

import { supabase } from "@/lib/supabase";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // 1. Await dynamic parameters safely
  const { id: questionId } = await params;

  // 2. Safely parse the incoming JSON payload to prevent build-time worker crashes
  let voterId: string;
  try {
    const body = await req.json();
    voterId = body.voterId;
  } catch (error) {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // 3. Validate that the voterId is present
  if (!voterId) {
    return Response.json({ error: "Missing voterId" }, { status: 400 });
  }

  // 4. Atomic database insertion utilizing Postgres constraints
  const { error } = await supabase
    .from("votes")
    .insert({ question_id: questionId, voter_id: voterId });

  // 5. Handle potential database exceptions
  if (error) {
    if (error.code === "23505") {
      // Postgres unique violation error code
      return Response.json({ error: "already voted" }, { status: 409 });
    }
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
