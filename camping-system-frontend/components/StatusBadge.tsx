export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase tracking-wide text-slate-700">
      {status.replaceAll("_", " ")}
    </span>
  );
}
