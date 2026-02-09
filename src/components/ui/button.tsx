import * as React from "react";
import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "lg";
};

export function Button({ className, variant="default", size="default", ...props }: Props) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl text-sm font-medium transition",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
        size === "lg" ? "h-11 px-5" : "h-10 px-4",
        variant === "default" && "bg-foreground text-background hover:opacity-90",
        variant === "outline" && "border border-border bg-background hover:bg-muted/30",
        variant === "ghost" && "hover:bg-muted/40",
        className
      )}
      {...props}
    />
  );
}
