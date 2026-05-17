import {
  forwardRef,
  type InputHTMLAttributes,
  type LabelHTMLAttributes,
} from "react";
import { cn } from "@/lib/cn";

export function Label({
  className,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("block text-sm font-semibold text-text-primary", className)}
      {...props}
    />
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ className, error, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "h-10 w-full rounded-md border bg-surface px-3 text-base text-text-primary outline-none transition-all placeholder:text-neutral focus:border-primary focus:ring-3 focus:ring-focus-ring",
          error ? "border-error" : "border-border",
          className,
        )}
        {...props}
      />
    );
  },
);
