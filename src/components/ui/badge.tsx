import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  variant="default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: "default" | "secondary" | "outline" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        variant === "default" && "bg-foreground text-background",
        variant === "secondary" && "bg-muted text-foreground",
        variant === "outline" && "border border-border text-foreground",
        className
      )}
      {...props}
    />
  );
}
