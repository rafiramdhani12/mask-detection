import React, { useRef, useEffect, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import { ShieldCheck, ShieldAlert, Camera, RefreshCcw, Video, VideoOff } from 'lucide-react';

const API_URL = 'http://localhost:5000/predict';

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [results, setResults] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [isCameraOn, setIsCameraOn] = useState(true);

  // Get available video devices
  const handleDevices = useCallback(
    (mediaDevices) =>
      setDevices(mediaDevices.filter(({ kind }) => kind === "videoinput")),
    [setDevices]
  );

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(handleDevices);
  }, [handleDevices]);

  // Audio alert setup
  const playAlert = useCallback(() => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.2);
  }, []);

  const captureAndPredict = useCallback(async () => {
    if (!isCameraOn || isProcessing || !webcamRef.current) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    setIsProcessing(true);
    try {
      const response = await axios.post(API_URL, { image: imageSrc });
      setResults(response.data);
      
      const noMaskDetected = response.data.some(res => res.class_index === 1);
      if (noMaskDetected) {
        playAlert();
      }
      setError(null);
    } catch (err) {
      console.error("Prediction error:", err);
      setError("Backend connection failed. Make sure Flask is running.");
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, isCameraOn, playAlert]);

  useEffect(() => {
    let interval;
    if (isCameraOn) {
      interval = setInterval(() => {
        captureAndPredict();
      }, 300); // 3 FPS to save some resources
    } else {
      setResults([]);
    }
    return () => clearInterval(interval);
  }, [captureAndPredict, isCameraOn]);

  useEffect(() => {
    if (!canvasRef.current || !webcamRef.current || !isCameraOn) return;

    const ctx = canvasRef.current.getContext('2d');
    const video = webcamRef.current.video;
    
    if (video.readyState !== 4) return;

    const { videoWidth, videoHeight } = video;
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    ctx.clearRect(0, 0, videoWidth, videoHeight);

    results.forEach(res => {
      const [x, y, w, h] = res.bbox;
      const isMask = res.class_index === 0;
      const color = isMask ? '#10b981' : '#ef4444';

      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, w, h);

      ctx.fillStyle = color;
      const label = `${res.label} (${(res.confidence * 100).toFixed(1)}%)`;
      const textWidth = ctx.measureText(label).width;
      ctx.fillRect(x, y - 25, textWidth + 10, 25);

      ctx.fillStyle = 'white';
      ctx.font = '14px Inter, sans-serif';
      ctx.fillText(label, x + 5, y - 7);
    });
  }, [results, isCameraOn]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8 flex flex-col items-center">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
          <Camera className="w-8 h-8 text-blue-400" />
          Mask Detector AI
        </h1>
        <p className="text-slate-400 text-lg">Real-time mask detection powered by Flask & React</p>
      </header>

      <div className="mb-6 w-full max-w-2xl flex flex-wrap gap-4 items-end justify-center">
        <div className="flex flex-col gap-2 min-w-[200px]">
          <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
            <RefreshCcw className="w-4 h-4" /> Select Camera:
          </label>
          <select 
            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            disabled={!isCameraOn}
          >
            <option value="">Default Camera</option>
            {devices.map((device, key) => (
              <option key={key} value={device.deviceId}>
                {device.label || `Camera ${key + 1}`}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setIsCameraOn(!isCameraOn)}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-all ${
            isCameraOn 
            ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30' 
            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500/30'
          }`}
        >
          {isCameraOn ? (
            <><VideoOff className="w-5 h-5" /> Stop Camera</>
          ) : (
            <><Video className="w-5 h-5" /> Start Camera</>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-2 rounded-lg mb-6 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-800 bg-slate-800 max-w-full min-h-[480px] flex items-center justify-center">
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
                deviceId: selectedDevice ? { exact: selectedDevice } : undefined
              }}
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
            />
          </>
        ) : (
          <div className="text-slate-500 flex flex-col items-center gap-4 p-20">
            <VideoOff className="w-16 h-16 opacity-20" />
            <p className="text-lg font-medium">Camera is turned off</p>
          </div>
        )}
        
        {isCameraOn && (
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-white/10">
            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full animate-pulse ${isProcessing ? 'bg-blue-400' : 'bg-slate-600'}`} />
              <span className="text-sm font-medium">
                {isProcessing ? 'Processing...' : 'Live Feed'}
              </span>
            </div>
            
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs text-slate-300">Mask Detected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-xs text-slate-300">No Mask</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
