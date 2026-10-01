import { CheckCircle2, X } from "lucide-react";
import { useEffect } from "react";

interface MensajeProps {
  successMessage: string | null;
  actionError: string | null;
  setSuccessMessage: (msg: string | null) => void;
  setActionError: (msg: string | null) => void;
}

export default function Mensaje({
  successMessage,
  actionError,
  setSuccessMessage,
  setActionError,
}: MensajeProps) {
  
  useEffect(() => {
    if (!successMessage && !actionError) return;

    const timeoutId = window.setTimeout(() => {
      setSuccessMessage(null);
      setActionError(null);
    }, 5000);
    
    return () => window.clearTimeout(timeoutId);
  }, [successMessage, actionError, setSuccessMessage, setActionError]);

  if (!successMessage && !actionError) return null;

  return (
    <div
      role={actionError ? "alert" : "status"}
      aria-live="polite"
      className="fixed right-4 top-4 z-50 w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-md border border-gray-200 bg-white text-gray-700 shadow-xl"
    >
      <div className="flex min-h-16 items-center gap-3 px-4 py-3">
        <CheckCircle2
          size={20}
          className={`shrink-0 ${actionError ? "text-red-600" : "text-emerald-600"}`}
          aria-hidden="true"
        />
        <p className="flex-1 text-sm font-medium">{actionError ?? successMessage}</p>
        <button
          type="button"
          onClick={() => {
            setSuccessMessage(null);
            setActionError(null);
          }}
          aria-label="Cerrar aviso"
          className="flex size-7 shrink-0 items-center justify-center rounded text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
        >
          <X size={16} />
        </button>
      </div>
      <div className="h-1 bg-gray-200">
        <div className={`h-full origin-left animate-[toast-progress_5s_linear_forwards] ${actionError ? "bg-red-500" : "bg-emerald-500"}`} />
      </div>
    </div>
  );
}
