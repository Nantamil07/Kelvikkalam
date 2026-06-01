import { supabase } from "@/lib/supabase";

export async function getRecentQuestions(limit = 20) {
  const { data, error } = await supabase
    .from("questions")
    .select("id, body, author, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data ?? [];
}
