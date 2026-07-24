type Message = {
  id: string;
  body: string;
  senderRole: string;
  createdAt: Date;
};

export function MessageThread({
  messages,
  viewerRole,
}: {
  messages: Message[];
  viewerRole: "ADMIN" | "STUDENT";
}) {
  if (messages.length === 0) {
    return (
      <p className="p-4 text-sm text-slate-400">Henüz mesaj yok.</p>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-4">
      {messages.map((m) => {
        const isOwn = m.senderRole === viewerRole;
        return (
          <div
            key={m.id}
            className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
              isOwn
                ? "self-end bg-brand-700 text-white"
                : "self-start bg-brand-50 text-brand-950"
            }`}
          >
            <p className="whitespace-pre-wrap">{m.body}</p>
            <p
              className={`mt-1 text-[11px] ${
                isOwn ? "text-brand-200" : "text-slate-400"
              }`}
            >
              {m.createdAt.toLocaleString("tr-TR")}
            </p>
          </div>
        );
      })}
    </div>
  );
}
