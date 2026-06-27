import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "success";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variant === "default" && "bg-orange-100 text-orange-700",
        variant === "secondary" && "bg-zinc-100 text-zinc-600",
        variant === "success" && "bg-emerald-100 text-emerald-700",
        className,
      )}
      {...props}
    />
  );
}
