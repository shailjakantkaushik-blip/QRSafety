import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
};

export function Button({ className, asChild, ...props }: ButtonProps) {
  if (asChild) {
    // Use React.cloneElement to pass className and props to the child
    const child = React.Children.only(props.children);
    return React.cloneElement(child as React.ReactElement, {
      className: cn(
        "inline-flex items-center justify-center rounded-xl bg-gray-200 px-4 py-2 text-sm font-medium text-gray-900 transition hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50",
        className,
        (child as React.ReactElement).props.className
      ),
      ...props,
      children: (child as React.ReactElement).props.children,
    });
  }
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
