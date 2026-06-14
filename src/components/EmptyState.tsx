export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/60 px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cupid-100 text-cupid-500">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      <p className="mt-1 max-w-xs text-sm text-slate-500">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
