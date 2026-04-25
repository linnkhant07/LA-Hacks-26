'use client';

import { useRef, useState, useEffect } from 'react';

interface DrawCanvasProps {
  enabled: boolean;
  onSubmit?: (dataUrl: string) => void;
}

// Transparent canvas overlay for circling objects on the illustration.
// When enabled=true, mouse draws red lines. "Submit Circle" fires onSubmit
// with the PNG data URL (or console.logs as placeholder).
export default function DrawCanvas({ enabled, onSubmit }: DrawCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const [hasDrawing, setHasDrawing] = useState(false);

  // Sync canvas pixel dimensions with its CSS layout size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const sync = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, []);

  function getPos(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function onMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!enabled) return;
    isDrawing.current = true;
    lastPos.current = getPos(e);
  }

  function onMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!isDrawing.current || !enabled) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    lastPos.current = pos;
    setHasDrawing(true);
  }

  function onMouseUp() {
    isDrawing.current = false;
  }

  function handleSubmit() {
    const canvas = canvasRef.current!;
    const dataUrl = canvas.toDataURL('image/png');
    if (onSubmit) {
      onSubmit(dataUrl);
    } else {
      console.log('circle submitted', dataUrl.slice(0, 80) + '...');
    }
    // Clear canvas after submit
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawing(false);
  }

  function handleClear() {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawing(false);
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{
          cursor: enabled ? 'crosshair' : 'default',
          pointerEvents: enabled ? 'auto' : 'none',
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      />
      {enabled && hasDrawing && (
        <div className="absolute bottom-3 right-3 flex gap-2 pointer-events-auto">
          <button
            onClick={handleClear}
            className="bg-gray-700 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
          >
            Clear
          </button>
          <button
            onClick={handleSubmit}
            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-500"
          >
            What is this? 🔍
          </button>
        </div>
      )}
    </div>
  );
}
