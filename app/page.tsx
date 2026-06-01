import QuestionsList from "./questions-list";
import { getRecentQuestions } from "@/lib/questions";

// Render on every request (don't cache/prerender) so new questions show up.
export const dynamic = "force-dynamic";

// Server component — runs only on the server, awaits the data, renders to HTML.
export default async function Page() {
  const questions = await getRecentQuestions();

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-2xl font-medium">Live Q&amp;A</h1>
      <QuestionsList initialQuestions={questions} />
    </main>
  );
}
