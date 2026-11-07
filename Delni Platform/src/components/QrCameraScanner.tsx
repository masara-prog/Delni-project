import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { X } from "lucide-react";

/**
 * Reads a ticket QR code with the device camera (the code printed on the tourist's e-ticket is the booking number).
 * Browsers only open the camera on https:// or http://localhost; on another address the reason is shown instead.
 */
export function QrCameraScanner({ onDetected, onClose }: { onDetected: (code: string) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  // Kept in a ref so a re-render of the page does not restart the camera
  const detectedRef = useRef(onDetected);
  detectedRef.current = onDetected;

  useEffect(() => {
    let stream: MediaStream | null = null;
    let frame = 0;
    let stopped = false;

    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setError("المتصفح لا يسمح بفتح الكاميرا على هذا العنوان. افتح لوحة الإدارة عبر http://localhost:8080 أو عبر https، أو اكتب رقم التذكرة يدوياً.");
      return;
    }

    const scan = () => {
      if (stopped) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const result = jsQR(image.data, image.width, image.height, { inversionAttempts: "dontInvert" });
          if (result?.data) {
            stopped = true;
            detectedRef.current(result.data.trim());
            return;
          }
        }
      }
      frame = requestAnimationFrame(scan);
    };

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" }, audio: false })
      .then((s) => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.play().catch(() => {});
        }
        frame = requestAnimationFrame(scan);
      })
      .catch(() => setError("تعذر فتح الكاميرا. تأكد من السماح للمتصفح باستخدامها، أو اكتب رقم التذكرة يدوياً."));

    return () => {
      stopped = true;
      cancelAnimationFrame(frame);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-xs grid place-items-center p-4" onClick={onClose} dir="rtl">
      <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#003580] text-white">
          <span className="font-black text-sm">📷 مسح رمز QR للتذكرة</span>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10" aria-label="إغلاق">
            <X className="w-4 h-4" />
          </button>
        </div>
        {error ? (
          <div className="p-6 text-center text-sm font-bold text-red-700 leading-relaxed">{error}</div>
        ) : (
          <div className="relative bg-black aspect-square">
            <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
            <div className="absolute inset-10 rounded-3xl border-4 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)] pointer-events-none" />
            <div className="absolute bottom-3 inset-x-0 text-center text-xs font-bold text-white drop-shadow">وجّه الكاميرا نحو رمز QR في تذكرة السائح</div>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
