import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-xl border border-input bg-background px-3 text-sm",
        "focus:outline-none focus:ring-2 focus:ring-offset-2",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
