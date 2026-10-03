import { findFrame } from "@/lib/cosmetics";

export function UserAvatar({
  name,
  frameId,
  size = 36,
}: {
  name: string;
  frameId?: string | null;
  size?: number;
}) {
  const frame = findFrame(frameId);
  const initial = name.trim().charAt(0).toLocaleUpperCase("tr-TR") || "?";
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: size * 0.45 }}
      className={`flex shrink-0 items-center justify-center rounded-full bg-brand-700 font-semibold text-white ring-offset-2 ring-offset-brand-950 ${
        frame ? frame.ring : "ring-1 ring-brand-500"
      }`}
    >
      {initial}
    </span>
  );
}
