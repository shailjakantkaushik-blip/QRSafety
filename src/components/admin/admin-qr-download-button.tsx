"use client";

import { useTransition } from "react";
import { getQrSignedUrl } from "@/app/(app)/individuals/actions";
import { Button } from "@/components/ui/button";

export function AdminQrDownloadButton({
  individualId,
  individualName,
}: {
  individualId: string;
  individualName: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleDownload = () => {
    startTransition(async () => {
      const res = await getQrSignedUrl(individualId);
      
      // Create a temporary link and trigger download
      const link = document.createElement("a");
      link.href = res.url;
      link.download = `qr-${individualName}-${individualId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={isPending}
      className="text-xs bg-blue-600 hover:bg-blue-700"
    >
      {isPending ? "Loading..." : "Download"}
    </Button>
  );
}
