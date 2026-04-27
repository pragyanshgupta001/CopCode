import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

export default function ExportButton({ roomId, roomName }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const handleExport = async () => {
    if (loading || !roomId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/rooms/${roomId}/export`,
        {
          method:      "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Export failed");
      }

      // read response as binary blob
      const blob = await response.blob();

      // create a temporary anchor element and click it to trigger download
      const url      = URL.createObjectURL(blob);
      const anchor   = document.createElement("a");
      const filename = `${(roomName || "project").replace(/[^a-z0-9]/gi, "-")}.zip`;

      anchor.href     = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();

      // cleanup
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error("Export error:", err.message);
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleExport}
        disabled={loading}
        className={`
          flex items-center gap-1.5 px-2.5 py-1 rounded-md border
          font-mono text-[10px] transition-colors
          ${loading
            ? "text-gray-500 border-gray-700 cursor-not-allowed"
            : error
              ? "text-red-400 border-red-500/30 bg-red-500/5"
              : "text-gray-400 border-[#30363d] hover:text-white hover:border-gray-500 hover:bg-[#21262d]"
          }
        `}
        title="Download project as ZIP"
      >
        {loading
          ? <Loader2 size={11} className="animate-spin" />
          : <Download size={11} />
        }
        {loading ? "Exporting..." : error ? "Failed" : "Export ZIP"}
      </button>

      {/* error tooltip */}
      {error && (
        <div className="absolute top-full mt-1 right-0 bg-red-900/80 border border-red-500/30 rounded px-2 py-1 font-mono text-[9px] text-red-300 whitespace-nowrap z-50">
          {error}
        </div>
      )}
    </div>
  );
}