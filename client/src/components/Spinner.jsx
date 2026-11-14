import { Loader2 } from 'lucide-react';
export default function Spinner({ full = false }) {
  return (
    <div className={`flex items-center justify-center ${full ? 'min-h-[60vh]' : 'py-8'}`} role="status" aria-label="Loading">
      <Loader2 className="h-7 w-7 animate-spin text-magenta" />
    </div>
  );
}
