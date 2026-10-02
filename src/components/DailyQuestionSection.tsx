import { getDailyState } from "@/lib/daily-question";
import { DailyQuestionCard } from "@/components/DailyQuestionCard";

export async function DailyQuestionSection({ userId }: { userId: string }) {
  const state = await getDailyState(userId);
  if (!state) return null;
  return <DailyQuestionCard item={state.item} initialResult={state.result} />;
}
