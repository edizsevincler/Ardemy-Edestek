import Image from "next/image";

export function Logo({
  size = 36,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center rounded-xl bg-white p-1.5 shadow-sm ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src="/logo.jpg"
        alt="Ardemy"
        width={size}
        height={size}
        className="rounded-lg object-cover"
        priority
      />
    </div>
  );
}
