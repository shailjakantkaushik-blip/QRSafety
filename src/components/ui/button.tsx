import * as React from "react";
import { cn } from "@/lib/utils";

export function Button({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl bg-gray-200 px-4 py-2 text-sm font-medium text-gray-900 transition hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}
