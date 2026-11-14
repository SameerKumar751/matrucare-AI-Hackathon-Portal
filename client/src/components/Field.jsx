/** Label + control + error wrapper. Children is the input element. */
export default function Field({ label, htmlFor, error, hint, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block font-mono text-[11px] uppercase tracking-widest text-muted">{label}</label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-400" role="alert">{error}</p>}
    </div>
  );
}
