"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { regenerateQrCode } from "@/app/(app)/individuals/actions";
import { Button } from "@/components/ui/button";

export function RegenerateQrButton({
  individualId,
  individualName,
}: {
  individualId: string;
  individualName: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleRegenerate = () => {
    startTransition(async () => {
      const res = await regenerateQrCode(individualId);
      // Refresh the page to show updated data
      setTimeout(() => {
        router.refresh();
      }, 500);
    });
  };

  return (
    <Button
      onClick={handleRegenerate}
      disabled={isPending}
      className="text-xs bg-orange-600 hover:bg-orange-700"
    >
      {isPending ? "Generating..." : "Generate QR"}
    </Button>
  );
}
