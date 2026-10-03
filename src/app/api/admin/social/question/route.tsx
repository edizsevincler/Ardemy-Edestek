import { auth } from "@/auth";
import { QuestionCard } from "@/lib/og/cards";
import { parseFormat } from "@/lib/og/assets";
import { ogResponse } from "@/lib/og/respond";
import { getSocialQuestion, SOCIAL_LANGUAGES } from "@/lib/social-question";

export async function GET(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return new Response("Unauthorized", { status: 401 });
  }

  const url = new URL(request.url);
  const language = url.searchParams.get("language") ?? "";
  if (!(SOCIAL_LANGUAGES as readonly string[]).includes(language)) {
    return new Response("Invalid language", { status: 400 });
  }
  const n = Number(url.searchParams.get("n") ?? "0") || 0;
  const reveal = url.searchParams.get("reveal") === "1";
  const format = parseFormat(url.searchParams.get("format"));

  const { question } = await getSocialQuestion(language, n);
  if (!question) return new Response("No question", { status: 404 });

  return ogResponse(
    ({ size, logo }) => (
      <QuestionCard
        size={size}
        logo={logo}
        language={language}
        prompt={question.prompt}
        options={question.options}
        correct={question.correct}
        reveal={reveal}
      />
    ),
    format,
    `ardemy-${language.toLowerCase()}-${reveal ? "cevap" : "soru"}-${format}.png`,
    url.searchParams.get("download") === "1"
  );
}
