"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getQrSignedUrl } from "@/app/(app)/individuals/actions";

export function DownloadQrButton({ individualId }: { individualId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const res = await getQrSignedUrl(individualId);
          if (!res.ok) return toast.error(res.message);
          window.open(res.url, "_blank", "noreferrer");
        });
      }}
    >
      {pending ? "Preparing..." : "Download QR"}
    </Button>
  );
}
