import { AlertCircle, CheckCircle2 } from 'lucide-react';
/** Inline notification. type: 'error' | 'success' */
export default function Alert({ type = 'error', children }) {
  if (!children) return null;
  const ok = type === 'success';
  const Icon = ok ? CheckCircle2 : AlertCircle;
  return (
    <div role={ok ? 'status' : 'alert'} className={`flex items-start gap-2 rounded border px-3.5 py-3 text-sm ${ok ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200' : 'border-red-400/40 bg-red-500/10 text-red-200'}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
