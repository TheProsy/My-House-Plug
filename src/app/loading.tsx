import { InlineLoading } from "@/components/feedback/loading-state";

export default function Loading() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <InlineLoading label="Loading" />
    </div>
  );
}
