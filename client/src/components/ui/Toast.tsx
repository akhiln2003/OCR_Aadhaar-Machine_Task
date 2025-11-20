import { AlertCircle, X } from "lucide-react";
import { useEffect } from "react";

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top duration-300">
      <div className="bg-red-50 border border-red-200 rounded-lg shadow-lg p-4 flex items-start gap-3 max-w-md">
        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h5 className="font-semibold text-red-900 text-sm mb-1">
            Upload Error
          </h5>
          <p className="text-sm text-red-700">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-red-400 hover:text-red-600 flex-shrink-0"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

export default Toast;
