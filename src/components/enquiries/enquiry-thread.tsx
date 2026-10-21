interface EnquiryThreadProps {
  messages: {
    id: string;
    sender_id: string;
    body: string;
    created_at: string;
  }[];
  viewerId: string;
  names: Record<string, string>;
  emptyLabel?: string;
}

function formatTime(value: string): string {
  return new Date(value).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function EnquiryThread({
  messages,
  viewerId,
  names,
  emptyLabel = "No messages yet. Say hello and share what you need.",
}: EnquiryThreadProps) {
  if (messages.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-line bg-surface-1/60 px-4 py-6 text-center text-sm text-ink-500">
        {emptyLabel}
      </p>
    );
  }

  return (
    <ol className="flex flex-col gap-3">
      {messages.map((message) => {
        const mine = message.sender_id === viewerId;
        const name = mine ? "You" : (names[message.sender_id] ?? "User");

        return (
          <li key={message.id}>
            <div
              className={
                mine
                  ? "ml-auto max-w-[85%] rounded-2xl rounded-br-md border border-brand-200 bg-brand-50 px-4 py-2.5"
                  : "mr-auto max-w-[85%] rounded-2xl rounded-bl-md border border-line-soft bg-surface-2 px-4 py-2.5"
              }
            >
              <p className="flex items-baseline justify-between gap-3 text-xs font-medium text-ink-500">
                <span>{name}</span>
                <span className="font-normal text-ink-400">
                  {formatTime(message.created_at)}
                </span>
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-ink-800">
                {message.body}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
