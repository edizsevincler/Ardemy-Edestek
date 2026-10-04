import { getDailyState } from "@/lib/daily-question";
import { DailyQuestionCard } from "@/components/DailyQuestionCard";
import { getReferralShareUrl } from "@/lib/referral";

export async function DailyQuestionSection({ userId }: { userId: string }) {
  const state = await getDailyState(userId);
  if (!state) return null;
  const shareUrl = await getReferralShareUrl(userId);
  return <DailyQuestionCard item={state.item} initialResult={state.result} shareUrl={shareUrl} />;
}
