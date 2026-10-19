'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import jsQR from 'jsqr';
import { Camera, CameraOff, ImageUp, Keyboard, ScanLine } from 'lucide-react';
import { guestPath, parseGuestLink } from '../services/qrLinks';

const MAX_FRAME_WIDTH = 640;

type CameraState = 'idle' | 'starting' | 'scanning' | 'denied' | 'unsupported';

export const QrScanner: React.FC = () => {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number>(0);
  const handledRef = useRef(false);

  const [camera, setCamera] = useState<CameraState>('idle');
  const [message, setMessage] = useState('');
  const [code, setCode] = useState('');
  const [table, setTable] = useState('');

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => stopCamera, [stopCamera]);

  /** Validates scanned text and opens the guest menu. Returns false when it is not a RestoFlow table code. */
  const handleText = useCallback(
    (text: string): boolean => {
      const target = parseGuestLink(text);
      if (!target) {
        setMessage('That QR is not a RestoFlow table code. Try the QR on your table.');
        return false;
      }
      if (handledRef.current) return true;
      handledRef.current = true;
      stopCamera();
      // The guest page itself reports an unknown restaurant, so no lookup is needed here.
      router.push(guestPath(target.slug, target.table));
      return true;
    },
    [router, stopCamera],
  );

  const decodeFromSource = (source: CanvasImageSource, width: number, height: number): string | null => {
    const canvas = canvasRef.current;
    if (!canvas || !width || !height) return null;
    const scale = Math.min(1, MAX_FRAME_WIDTH / width);
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return jsQR(data.data, data.width, data.height, { inversionAttempts: 'dontInvert' })?.data ?? null;
  };

  const tick = useCallback(() => {
    const video = videoRef.current;
    if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
      const text = decodeFromSource(video, video.videoWidth, video.videoHeight);
      if (text && handleText(text)) return;
    }
    frameRef.current = requestAnimationFrame(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleText]);

  const startCamera = async () => {
    setMessage('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setCamera('unsupported');
      return;
    }
    setCamera('starting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play();
      setCamera('scanning');
      frameRef.current = requestAnimationFrame(tick);
    } catch {
      setCamera('denied');
    }
  };

  const onImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const text = decodeFromSource(img, img.naturalWidth, img.naturalHeight);
      URL.revokeObjectURL(url);
      if (!text) setMessage('We could not find a QR code in that image.');
      else handleText(text);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setMessage('We could not read that image.');
    };
    img.src = url;
  };

  const onManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setMessage('Enter the restaurant code printed on the card.');
      return;
    }
    if (!table.trim()) {
      setMessage('Enter the table name printed on the card.');
      return;
    }
    handleText(guestPath(code.trim().toLowerCase(), table));
  };

  return (
    <div className="space-y-6">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-obsidian-900">
        <video ref={videoRef} playsInline muted className={`h-full w-full object-cover ${camera === 'scanning' ? '' : 'hidden'}`} />
        <canvas ref={canvasRef} className="hidden" />

        {camera === 'scanning' && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative h-3/5 w-3/5">
              <span className="absolute left-0 top-0 h-8 w-8 rounded-tl-lg border-l-4 border-t-4 border-amber-400" />
              <span className="absolute right-0 top-0 h-8 w-8 rounded-tr-lg border-r-4 border-t-4 border-amber-400" />
              <span className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-lg border-b-4 border-l-4 border-amber-400" />
              <span className="absolute bottom-0 right-0 h-8 w-8 rounded-br-lg border-b-4 border-r-4 border-amber-400" />
            </div>
          </div>
        )}

        {camera !== 'scanning' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center text-slate-200">
            {camera === 'denied' || camera === 'unsupported' ? (
              <>
                <CameraOff className="h-10 w-10 text-slate-400" strokeWidth={1.5} />
                <p className="text-sm">
                  {camera === 'denied'
                    ? 'Camera access was blocked. Allow it in your browser settings, or use one of the options below.'
                    : 'This browser cannot open the camera. Use one of the options below.'}
                </p>
              </>
            ) : (
              <>
                <ScanLine className="h-10 w-10 text-amber-400" strokeWidth={1.5} />
                <p className="text-sm">Point your camera at the QR code on your table.</p>
              </>
            )}
            <button
              onClick={startCamera}
              disabled={camera === 'starting'}
              className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-3 text-sm font-semibold text-white hover:bg-amber-400 disabled:opacity-60"
            >
              <Camera className="h-4 w-4" /> {camera === 'starting' ? 'Starting camera…' : camera === 'denied' ? 'Try again' : 'Start scanning'}
            </button>
          </div>
        )}
      </div>

      {message && (
        <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {message}
        </p>
      )}

      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-800 hover:border-slate-400">
        <ImageUp className="h-4 w-4" /> Upload a photo of the QR
        <input type="file" accept="image/*" onChange={onImage} className="sr-only" />
      </label>

      <form onSubmit={onManual} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4" noValidate>
        <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Keyboard className="h-4 w-4 text-slate-500" /> Enter it manually
        </p>
        <div className="grid grid-cols-2 gap-3">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Restaurant code"
            aria-label="Restaurant code"
            autoCapitalize="none"
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
          />
          <input
            value={table}
            onChange={(e) => setTable(e.target.value)}
            placeholder="Table name"
            aria-label="Table name"
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
          />
        </div>
        <button type="submit" className="w-full rounded-lg bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800">
          Open menu
        </button>
      </form>
    </div>
  );
};
