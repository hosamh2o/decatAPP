import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, X } from "lucide-react";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    if (!isScanning) return;

    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;

    const startScanning = async () => {
      try {
        const videoElement = videoRef.current;
        if (!videoElement) return;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });

        videoElement.srcObject = stream;

        const decodeFromVideoElement = async () => {
          if (!videoElement || !isScanning) return;

          try {
            const result = await reader.decodeFromVideoElement(videoElement);
            if (result) {
              onScan(result.getText());
              setIsScanning(false);
            }
          } catch (err) {
            if (!(err instanceof NotFoundException)) {
              console.error("Scanning error:", err);
            }
          }

          if (isScanning) {
            requestAnimationFrame(decodeFromVideoElement);
          }
        };

        decodeFromVideoElement();
      } catch (err) {
        setError("Impossible d'accéder à la caméra. Vérifiez les permissions.");
        console.error("Camera access error:", err);
      }
    };

    startScanning();

    return () => {
      setIsScanning(false);
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [isScanning, onScan]);

  return (
    <Card className="border-cyan-200 fixed inset-0 m-4 z-50 max-w-md mx-auto my-auto">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Scannez le code-barres
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative w-full aspect-square bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
          />
          <div className="absolute inset-0 border-2 border-cyan-500 m-8 rounded-lg pointer-events-none" />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="text-center text-sm text-gray-600">
          Positionnez le code-barres dans le cadre
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={onClose}
        >
          Fermer
        </Button>
      </CardContent>
    </Card>
  );
}
