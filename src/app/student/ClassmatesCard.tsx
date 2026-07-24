import { prisma } from "@/lib/prisma";
import { maskFullName } from "@/lib/mask";

export async function ClassmatesCard({ currentUserId }: { currentUserId: string }) {
  const classmates = await prisma.user.findMany({
    where: { role: "STUDENT", id: { not: currentUserId } },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="font-medium text-slate-900">
        Diğer Öğrenciler ({classmates.length})
      </h2>
      <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
        {classmates.length === 0 && (
          <li className="text-slate-400">Henüz başka öğrenci yok.</li>
        )}
        {classmates.map((c) => (
          <li key={c.id}>{maskFullName(c.name)}</li>
        ))}
      </ul>
    </div>
  );
}
