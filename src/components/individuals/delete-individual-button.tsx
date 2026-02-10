"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteIndividual } from "@/app/(app)/individuals/actions";
import { Button } from "@/components/ui/button";

export function DeleteIndividualButton({
  individualId,
  individualName,
}: {
  individualId: string;
  individualName: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (!confirm(`Are you sure you want to delete "${individualName}"? This action cannot be undone.`)) {
      return;
    }

    startTransition(async () => {
      const res = await deleteIndividual(individualId);
      if (!res.ok) return toast.error(res.message);
      toast.success("Individual deleted");
      router.push("/individuals");
    });
  };

  return (
    <Button 
      onClick={handleDelete} 
      disabled={isPending}
      className="bg-red-600 hover:bg-red-700"
    >
      {isPending ? "Deleting..." : "Delete Individual"}
    </Button>
  );
}
