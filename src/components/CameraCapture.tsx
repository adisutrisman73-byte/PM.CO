import { useState, useEffect, useRef } from "react";
import { Camera, RefreshCw, X, AlertCircle, Play, Check } from "lucide-react";

interface CameraCaptureProps {
  onCapture: (base64Image: string) => void;
  onClose: () => void;
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load available camera devices
  useEffect(() => {
    async function getDevices() {
      try {
        // Request temporary stream to trigger permissions prompt first
        const initStream = await navigator.mediaDevices.getUserMedia({ video: true });
        initStream.getTracks().forEach(track => track.stop());

        const deviceList = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = deviceList.filter(device => device.kind === "videoinput");
        setDevices(videoDevices);
        
        if (videoDevices.length > 0) {
          setSelectedDeviceId(videoDevices[0].deviceId);
        }
      } catch (err: any) {
        console.error("Gagal mendeteksi kamera:", err);
        setError("Gagal mengakses kamera. Mohon berikan izin kamera pada browser Anda atau pastikan kamera tidak dipakai oleh aplikasi lain.");
      }
    }
    getDevices();
  }, []);

  // Initialize stream based on selected camera device
  useEffect(() => {
    if (!selectedDeviceId) return;

    let activeStream: MediaStream | null = null;

    async function startCamera() {
      setIsLoading(true);
      setError(null);
      
      // Stop old stream tracks first
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      try {
        const constraints = {
          video: {
            deviceId: { exact: selectedDeviceId },
            width: { ideal: 1024 },
            height: { ideal: 768 }
          }
        };
        
        activeStream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(activeStream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = activeStream;
        }
      } catch (err: any) {
        console.error("Error starting camera device:", err);
        // Fallback constraint if exact device is rejected
        try {
          activeStream = await navigator.mediaDevices.getUserMedia({ video: true });
          setStream(activeStream);
          if (videoRef.current) {
            videoRef.current.srcObject = activeStream;
          }
        } catch (innerErr) {
          setError("Gagal mematangkan stream kamera. Mohon muat ulang halaman atau periksa izin kamera.");
        }
      } finally {
        setIsLoading(false);
      }
    }

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [selectedDeviceId]);

  // Handle capture sound/visual flash effect, then capture image
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (context) {
      // Matches the precise aspect ratio of the stream
      canvas.width = video.videoWidth || 800;
      canvas.height = video.videoHeight || 600;

      // Draw the current frame of the video stream onto the offscreen canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas content to base64 jpeg
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      setCapturedImage(dataUrl);
    }
  };

  const usePhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  // Close stream on element unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const toggleCamera = () => {
    if (devices.length > 1) {
      const currentIndex = devices.findIndex(d => d.deviceId === selectedDeviceId);
      const nextIndex = (currentIndex + 1) % devices.length;
      setSelectedDeviceId(devices[nextIndex].deviceId);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 z-50 flex flex-col items-center justify-center p-4 backdrop-blur-md animate-fade-in" id="camera-modal">
      <div className="w-full max-w-xl bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col backdrop-blur-xl" id="camera-window">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/5 flex justify-between items-center bg-slate-950">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <h3 className="font-display font-bold text-white text-sm tracking-wide">
              {capturedImage ? "Hasil Pengambilan Foto" : "Modul Kamera Konstruksi"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition p-1.5 bg-slate-900 hover:bg-slate-800 rounded-full cursor-pointer"
            title="Tutup Kamera"
            id="btn-close-camera"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Viewport */}
        <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden">
          {error ? (
            <div className="p-6 text-center max-w-sm flex flex-col items-center gap-3.5" id="camera-error">
              <AlertCircle className="w-12 h-12 text-red-500" />
              <p className="text-slate-300 text-xs font-sans leading-relaxed">{error}</p>
              <button
                onClick={onClose}
                className="mt-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-sans font-semibold transition cursor-pointer"
              >
                Gunakan Upload Folder Sebagai Alternatif
              </button>
            </div>
          ) : capturedImage ? (
            <img
              src={capturedImage}
              alt="Hasil Ambil Foto"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              id="camera-preview-captured"
            />
          ) : (
            <div className="relative w-full h-full bg-slate-950">
              {isLoading && (
                <div className="absolute inset-0 z-10 bg-slate-950 flex flex-col items-center justify-center gap-2">
                  <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                  <span className="text-slate-400 text-xs font-mono font-medium">Memuat stream kamera...</span>
                </div>
              )}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform scale-x-[-1]" // mirror view for typical webcam feedback
              />
            </div>
          )}

          {/* Hidden Canvas used for freezing/drawing photo */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Info or helper text */}
        <div className="bg-slate-950/70 py-1.5 px-4 text-center border-t border-white/5">
          <p className="text-[11px] text-slate-500 font-sans font-medium tracking-wide">
            Sektor Proyek: Resolusi optimal 1024x768 didukung kompresi rendering otomatis.
          </p>
        </div>

        {/* Footer controls */}
        <div className="p-5 bg-slate-950 border-t border-white/5 flex items-center justify-between gap-4">
          {!error && (
            <>
              {capturedImage ? (
                /* Captured State Controls */
                <>
                  <button
                    onClick={retakePhoto}
                    className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold font-sans transition flex items-center justify-center gap-2 border border-white/10 cursor-pointer"
                    id="btn-retake"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Ambil Ulang (Retake)
                  </button>
                  <button
                    onClick={usePhoto}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:opacity-90 rounded-xl text-xs font-bold font-sans transition flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                    id="btn-use-photo"
                  >
                    <Check className="w-4 h-4" />
                    Gunakan Foto Ini
                  </button>
                </>
              ) : (
                /* Live Stream State Controls */
                <>
                  <div className="flex items-center gap-2">
                    {devices.length > 1 && (
                      <button
                        onClick={toggleCamera}
                        className="py-2.5 px-3.5 bg-slate-900 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 rounded-xl text-xs font-sans font-bold transition flex items-center gap-1.5 cursor-pointer"
                        title="Ganti Perangkat Kamera"
                        id="btn-switch-cam"
                      >
                        <RefreshCw className="w-3.5 h-3.5 animate-pulse" />
                        Ganti Kamera
                      </button>
                    )}
                    <span className="hidden sm:inline-block text-[11px] text-slate-500 font-mono truncate max-w-[160px]">
                      Cam: {devices.find(d => d.deviceId === selectedDeviceId)?.label || "Kamera Utama"}
                    </span>
                  </div>

                  <button
                    onClick={capturePhoto}
                    disabled={isLoading}
                    className="mx-auto w-14 h-14 bg-red-600 hover:bg-red-500 disabled:opacity-40 rounded-full border-4 border-slate-950 flex items-center justify-center transition hover:scale-105 active:scale-95 shadow-lg shadow-red-900/30 cursor-pointer ring-4 ring-red-600/20"
                    title="Ambil Foto Sekarang"
                    id="btn-trigger-capture"
                  >
                    <Camera className="w-6 h-6 text-white" />
                  </button>

                  <button
                    onClick={onClose}
                    className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-sans font-bold transition cursor-pointer"
                  >
                    Batal
                  </button>
                </>
              )}
            </>
          )}

          {error && (
            <button
              onClick={onClose}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white rounded-xl text-xs font-sans font-bold transition text-center cursor-pointer"
            >
              Kembali
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
