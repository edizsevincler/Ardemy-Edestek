import type { Instrumentation } from "next";

// Sunucuda yakalanan hatalarda yöneticiye e-posta gönderir (bkz. lib/alerts.ts).
export const onRequestError: Instrumentation.onRequestError = async (
  err,
  request,
  context
) => {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  try {
    const { notifyServerError } = await import("@/lib/alerts");
    await notifyServerError(err, request, context);
  } catch {
    // Uyarı gönderilemese bile asıl istek etkilenmesin.
  }
};
