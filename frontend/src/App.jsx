import React, { useRef, useEffect, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import {
  ShieldAlert,
  Camera,
  RefreshCcw,
  Video,
  VideoOff,
} from 'lucide-react';

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const [results, setResults] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [isCameraOn, setIsCameraOn] = useState(true);

  // =========================
  // CAMERA DEVICES
  // =========================
  const handleDevices = useCallback(
    (mediaDevices) =>
      setDevices(
        mediaDevices.filter(({ kind }) => kind === 'videoinput')
      ),
    []
  );

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(handleDevices);
  }, [handleDevices]);

  // =========================
  // ALERT SOUND
  // =========================
  const playAlert = useCallback(() => {
    const audioCtx = new (window.AudioContext ||
      window.webkitAudioContext)();

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(
      440,
      audioCtx.currentTime
    );

    gainNode.gain.setValueAtTime(
      0.08,
      audioCtx.currentTime
    );

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.2);
  }, []);

  // =========================
  // CAPTURE & PREDICT
  // =========================
  const captureAndPredict = useCallback(async () => {
    if (!isCameraOn || isProcessing || !webcamRef.current)
      return;

    const imageSrc = webcamRef.current.getScreenshot();

    if (!imageSrc) return;

    setIsProcessing(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/predict`, {
        image: imageSrc,
      });

      setResults(response.data);

      const noMaskDetected = response.data.some((res) =>
        res.label.includes('AWAS')
      );

      if (noMaskDetected) {
        playAlert();
      }

      setError(null);
    } catch (err) {
      console.error('Prediction error:', err);

      setError(
        'Backend connection failed. Make sure Flask server is running.'
      );
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, isCameraOn, playAlert]);

  // =========================
  // INTERVAL LOOP
  // =========================
  useEffect(() => {
    let interval;

    if (isCameraOn) {
      interval = setInterval(() => {
        captureAndPredict();
      }, 300);
    } else {
      setResults([]);
    }

    return () => clearInterval(interval);
  }, [captureAndPredict, isCameraOn]);

  // =========================
  // DRAW DETECTION BOX
  // =========================
  useEffect(() => {
  if (!canvasRef.current || !webcamRef.current || !isCameraOn) return;

  const canvas = canvasRef.current;
  const video  = webcamRef.current.video;

  if (!video || video.readyState !== 4) return;

  // Samain ukuran canvas dengan ukuran DISPLAY-nya, bukan video aslinya
  const rect = canvas.getBoundingClientRect();
  canvas.width  = rect.width;
  canvas.height = rect.height;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Hitung skala dari resolusi video asli ke ukuran display
  const scaleX = rect.width  / video.videoWidth;
  const scaleY = rect.height / video.videoHeight;

  results.forEach((res) => {
    const [x, y, w, h] = res.bbox;

    // Skalakan koordinat
    const sx = x * scaleX;
    const sy = y * scaleY;
    const sw = w * scaleX;
    const sh = h * scaleY;

    const isMask = res.label.includes('Aman');
    const color  = isMask ? '#7dd3a0' : '#ff8a8a';

    ctx.strokeStyle = color;
    ctx.lineWidth   = 2;
    ctx.strokeRect(sx, sy, sw, sh);

    const label     = `${res.label} (${(res.confidence * 100).toFixed(1)}%)`;
    ctx.font        = '13px Inter, sans-serif';
    const textWidth = ctx.measureText(label).width;

    ctx.fillStyle = color;
    ctx.fillRect(sx, sy - 28, textWidth + 14, 28);

    ctx.fillStyle = '#ffffff';
    ctx.fillText(label, sx + 7, sy - 9);
  });
}, [results, isCameraOn]);

  return (
    <div className="min-h-screen bg-[#0f1115] text-zinc-100 relative overflow-hidden px-6 py-10 flex flex-col items-center">

      {/* ========================= */}
      {/* AMBIENT BACKGROUND */}
      {/* ========================= */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-200px] left-[-100px] w-[500px] h-[500px] bg-[#d4a574]/10 rounded-full blur-3xl" />

        <div className="absolute bottom-[-200px] right-[-100px] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      {/* ========================= */}
      {/* HEADER */}
      {/* ========================= */}
      <header className="relative z-10 mb-10 text-center">
        <h1 className="text-5xl font-semibold tracking-tight mb-4 flex items-center justify-center gap-4">

          <div className="p-3 rounded-2xl bg-[#1b1d23] border border-white/5 shadow-xl">
            <Camera className="w-7 h-7 text-[#d4a574]" />
          </div>

          <span className="bg-gradient-to-r from-[#f5e6d3] to-[#d4a574] bg-clip-text text-transparent">
            Mask Detector
          </span>
        </h1>

        <p className="text-zinc-500 text-sm tracking-[0.25em] uppercase">
          Real-time Vision Monitoring System
        </p>
      </header>

      {/* ========================= */}
      {/* CONTROL PANEL */}
      {/* ========================= */}
      <div className="relative z-10 mb-8 w-full max-w-4xl bg-[#17191f]/90 backdrop-blur-xl border border-white/5 rounded-[28px] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] flex flex-wrap gap-5 items-end justify-between">

        {/* CAMERA SELECT */}
        <div className="flex flex-col gap-2 min-w-[230px]">
          <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
            <RefreshCcw className="w-4 h-4" />
            Select Camera
          </label>

          <select
            value={selectedDevice}
            onChange={(e) =>
              setSelectedDevice(e.target.value)
            }
            disabled={!isCameraOn}
            className="
              bg-[#111318]
              border border-white/5
              rounded-2xl
              px-4 py-3
              text-sm
              text-zinc-200
              focus:outline-none
              focus:ring-2
              focus:ring-[#d4a574]/30
              transition-all
            "
          >
            <option value="">Default Camera</option>

            {devices.map((device, key) => (
              <option
                key={key}
                value={device.deviceId}
              >
                {device.label || `Camera ${key + 1}`}
              </option>
            ))}
          </select>
        </div>

        {/* CAMERA BUTTON */}
        <button
          onClick={() =>
            setIsCameraOn(!isCameraOn)
          }
          className={`
            flex items-center gap-2 px-6 py-3 rounded-2xl
            font-medium transition-all duration-300
            shadow-lg border
            ${
              isCameraOn
                ? 'bg-[#2a1618] text-[#ffb4b4] border-[#5f2d32] hover:bg-[#351b1d]'
                : 'bg-[#16211a] text-[#b8f5c8] border-[#284c34] hover:bg-[#1d2b22]'
            }
          `}
        >
          {isCameraOn ? (
            <>
              <VideoOff className="w-5 h-5" />
              Stop Camera
            </>
          ) : (
            <>
              <Video className="w-5 h-5" />
              Start Camera
            </>
          )}
        </button>
      </div>

      {/* ========================= */}
      {/* ERROR */}
      {/* ========================= */}
      {error && (
        <div
          className="
            relative z-10
            bg-[#2a1618]
            border border-[#5a2a30]
            text-[#ffb4b4]
            px-5 py-3
            rounded-2xl
            mb-6
            flex items-center gap-3
            shadow-lg
          "
        >
          <ShieldAlert className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* ========================= */}
      {/* CAMERA CONTAINER */}
      {/* ========================= */}
      <div
        className="
          relative
          z-10
          rounded-[32px]
          overflow-hidden
          shadow-[0_20px_80px_rgba(0,0,0,0.45)]
          border border-white/5
          bg-[#15171c]
          backdrop-blur-xl
          max-w-full
          min-h-[480px]
          flex items-center justify-center
        "
      >
        {isCameraOn ? (
          <>
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              className="w-full h-auto"
              videoConstraints={{
                width: 640,
                height: 480,
                deviceId: selectedDevice
                  ? { exact: selectedDevice }
                  : undefined,
              }}
            />

            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
            />
          </>
        ) : (
          <div className="text-zinc-600 flex flex-col items-center gap-4 p-24">
            <VideoOff className="w-16 h-16 opacity-20" />

            <p className="text-lg font-medium">
              Camera is turned off
            </p>
          </div>
        )}

        {/* ========================= */}
        {/* BOTTOM OVERLAY */}
        {/* ========================= */}
        {isCameraOn && (
          <div
            className="
              absolute
              bottom-4
              left-4
              right-4
              flex
              justify-between
              items-center
              bg-black/40
              backdrop-blur-xl
              p-4
              rounded-2xl
              border border-white/5
            "
          >
            {/* LEFT */}
            <div className="flex items-center gap-4">
              <div
                className={`w-3 h-3 rounded-full animate-pulse ${
                  isProcessing
                    ? 'bg-[#d4a574]'
                    : 'bg-zinc-600'
                }`}
              />

              <span className="text-sm font-medium text-zinc-300">
                {isProcessing
                  ? 'Processing Feed'
                  : 'Live Monitoring'}
              </span>
            </div>

            {/* RIGHT */}
            <div className="flex gap-5">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#7dd3a0]" />

                <span className="text-xs text-zinc-300">
                  Mask Detected
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff8a8a]" />

                <span className="text-xs text-zinc-300">
                  No Mask
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;