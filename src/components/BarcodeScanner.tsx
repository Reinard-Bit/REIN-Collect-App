import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { X, Camera, RefreshCw } from 'lucide-react';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (decodedText: string) => void;
  continuous?: boolean;
}

export function BarcodeScanner({ isOpen, onClose, onScan, continuous = false }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [scanFlash, setScanFlash] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerRegionId = "html5qr-code-full-region";
  
  // Create an Audio context lazily for success sound
  const playSuccessSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); // High pitch beep
      oscillator.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.15);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.2);
    } catch(e) {
      console.warn("AudioContext prohibited or failed", e);
    }
  };

  useEffect(() => {
    if (isOpen && !isScanning) {
      startScanner();
    } else if (!isOpen && isScanning) {
      stopScanner();
    }

    return () => {
      if (isScanning) {
        stopScanner();
      }
    };
  }, [isOpen, facingMode]);

  const startScanner = async () => {
    try {
      setCameraError(null);
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            await scannerRef.current.stop();
          }
          scannerRef.current.clear();
        } catch (e) {
          console.warn("Error stopping previous scanner instance", e);
        }
      }

      const html5QrCode = new Html5Qrcode(scannerRegionId);
      scannerRef.current = html5QrCode;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        formatsToSupport: [
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39
        ]
      };

      await html5QrCode.start(
        { facingMode: facingMode },
        config,
        (decodedText) => {
          onScan(decodedText);
          if (continuous) {
            setScanFlash(true);
            playSuccessSound();
            setTimeout(() => setScanFlash(false), 300);
          } else {
            stopScanner();
            onClose();
          }
        },
        (errorMessage) => {
          // parse error, ignore it.
        }
      );
      setIsScanning(true);
    } catch (err: any) {
      console.error("Error starting scanner", err);
      if (err?.name === 'NotAllowedError' || err?.message?.includes('NotAllowedError')) {
        setCameraError("Camera access denied. If you are in the AI Studio preview, you must open the app in a new tab (using the arrow icon top right) to grant camera permissions.");
      } else {
        setCameraError("Could not access camera. Please ensure a camera is available and permissions are granted.");
      }
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (err: any) {
        // Suppress transition errors common during sudden unmounts
        if (err?.message && err.message.includes("already under transition")) {
          console.warn("Scanner transition overlap suppressed.");
        } else {
          console.error("Error stopping scanner", err);
        }
      } finally {
        setIsScanning(false);
      }
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-200/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#f2f2f2] border border-gray-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-2 text-gray-900 font-medium">
            <Camera className="text-[#961b2b]" size={20} />
            <span>Scan Barcode</span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scanner Area */}
        <div className="relative bg-gray-200 aspect-square flex items-center justify-center overflow-hidden">
          <div id={scannerRegionId} className="w-full h-full" />
          
          {scanFlash && (
            <div className="absolute inset-0 bg-green-500/30 z-20 transition-opacity duration-300"></div>
          )}

          {/* Custom Overlay UI (only visible when scanning) */}
          {isScanning && !cameraError && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {/* Scanning Frame */}
              <div className="relative w-64 h-64 border-2 border-[#961b2b]/50 rounded-lg">
                {/* Corner Markers */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#961b2b] -mt-0.5 -ml-0.5"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#961b2b] -mt-0.5 -mr-0.5"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#961b2b] -mb-0.5 -ml-0.5"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#961b2b] -mb-0.5 -mr-0.5"></div>

                {/* Laser Animation */}
                <div className="absolute top-0 left-0 w-full h-0.5 bg-[#961b2b] shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-[scan_2s_linear_infinite]"></div>
              </div>
              
              <div className="absolute bottom-8 text-xs text-gray-900/70 bg-gray-200/50 px-3 py-1 rounded-full backdrop-blur-md">
                Align code within frame
              </div>
            </div>
          )}

          {cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-[#961b2b]/10 flex items-center justify-center mb-4">
                <Camera className="text-[#961b2b]" size={24} />
              </div>
              <p className="text-gray-900 font-medium mb-2">Camera Error</p>
              <p className="text-sm text-gray-500">{cameraError}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-gray-200 flex justify-between gap-3">
          <button 
            onClick={toggleCamera}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <RefreshCw size={16} />
            Flip Camera
          </button>
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#961b2b] hover:bg-[#961b2b]/90 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
      
      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        #html5qr-code-full-region video {
          object-fit: cover;
          border-radius: 0;
        }
      `}</style>
    </div>
  );
}
