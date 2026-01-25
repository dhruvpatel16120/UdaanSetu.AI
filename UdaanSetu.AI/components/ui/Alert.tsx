import { cn } from "@/utils/cn";

type AlertVariant = "error" | "info";

type AlertProps = {
  title?: string;
  description: string;
  variant?: AlertVariant;
  className?: string;
};

const VARIANT_STYLES: Record<AlertVariant, string> = {
  error:
    "border-destructive bg-destructive/10 text-destructive",
  info:
    "border-border bg-muted text-foreground",
};

export function Alert({ title, description, variant = "info", className }: AlertProps) {
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn(
        "rounded-xl border px-4 py-3 text-sm",
        VARIANT_STYLES[variant],
        className,
      )}
    >
      {title ? <div className="mb-1 font-medium">{title}</div> : null}
      <div className="leading-6">{description}</div>
    </div>
  );
}
