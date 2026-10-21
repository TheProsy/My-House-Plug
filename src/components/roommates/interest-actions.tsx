"use client";

import { ActionButton } from "@/components/ui/action-button";
import { respondToRoommateInterestAction } from "@/features/roommates/actions";
import type { RoommateInterestStatus } from "@/types/database";

interface InterestActionsProps {
  interestId: string;
  direction: "incoming" | "outgoing";
  status: RoommateInterestStatus;
}

export function InterestActions({
  interestId,
  direction,
  status,
}: InterestActionsProps) {
  if (direction === "outgoing") {
    if (status !== "pending") return null;
    return (
      <ActionButton
        size="sm"
        variant="ghost"
        action={respondToRoommateInterestAction}
        fields={{ interestId, decision: "withdraw" }}
        confirmMessage="Withdraw this interest?"
        successFallback="Interest withdrawn."
      >
        Withdraw
      </ActionButton>
    );
  }

  if (status !== "pending") return null;

  return (
    <div className="flex flex-wrap gap-2">
      <ActionButton
        size="sm"
        action={respondToRoommateInterestAction}
        fields={{ interestId, decision: "accept" }}
        successFallback="Accepted — you're matched!"
      >
        Accept
      </ActionButton>
      <ActionButton
        size="sm"
        variant="secondary"
        action={respondToRoommateInterestAction}
        fields={{ interestId, decision: "decline" }}
        successFallback="Request declined."
      >
        Decline
      </ActionButton>
      <ActionButton
        size="sm"
        variant="ghost"
        action={respondToRoommateInterestAction}
        fields={{ interestId, decision: "block" }}
        confirmMessage="Block this person? They won't be able to contact you again."
        successFallback="Blocked."
      >
        Block
      </ActionButton>
    </div>
  );
}
