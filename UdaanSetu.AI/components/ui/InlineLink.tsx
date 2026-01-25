import Link, { type LinkProps } from "next/link";

import { cn } from "@/utils/cn";

export type InlineLinkProps = LinkProps & {
  className?: string;
  children: React.ReactNode;
};

export function InlineLink({ className, children, ...props }: InlineLinkProps) {
  return (
    <Link
      className={cn(
        "font-medium text-foreground underline underline-offset-4 hover:opacity-80",
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
