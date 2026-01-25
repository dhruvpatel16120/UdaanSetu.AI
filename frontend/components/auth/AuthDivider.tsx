export function AuthDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
      <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</span>
      <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
    </div>
  );
}
