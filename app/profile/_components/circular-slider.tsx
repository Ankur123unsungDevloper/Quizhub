"use client";

import { useRef, useEffect, useCallback } from "react";

type CircularSliderProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  size?: number;
};

export const CircularSlider = ({
  value,
  onChange,
  min = 1,
  max = 12,
  disabled = false,
  size = 160,
}: CircularSliderProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDragging = useRef(false);
  const center = size / 2;
  const radius = size / 2 - 20;
  const strokeWidth = 12;

  // Keep latest callbacks in refs so global listeners never go stale
  const onChangeRef = useRef(onChange);
  const disabledRef = useRef(disabled);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);
  useEffect(() => { disabledRef.current = disabled; }, [disabled]);

  const angleToValue = useCallback(
    (angle: number): number => {
      const normalized = ((angle + 90) % 360 + 360) % 360;
      const val = Math.round((normalized / 360) * (max - min) + min);
      return Math.min(max, Math.max(min, val));
    },
    [min, max]
  );

  const getAngleFromPointer = useCallback(
    (clientX: number, clientY: number): number => {
      const canvas = canvasRef.current;
      if (!canvas) return 0;
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left - center;
      const y = clientY - rect.top - center;
      return (Math.atan2(y, x) * 180) / Math.PI;
    },
    [center]
  );

  // Draw
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, size, size);

    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + ((value - min) / (max - min)) * 2 * Math.PI;

    // Track bg
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = "#3f3f46";
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = "round";
    ctx.stroke();

    // Colored arc
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, "#FF8D28");
    gradient.addColorStop(1, "#ff6b00");
    ctx.beginPath();
    ctx.arc(center, center, radius, startAngle, endAngle);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = "round";
    ctx.stroke();

    // Ticks
    for (let i = min; i <= max; i++) {
      const tickAngle = -Math.PI / 2 + ((i - min) / (max - min)) * 2 * Math.PI;
      const innerR = radius - strokeWidth / 2 - 4;
      const outerR = radius + strokeWidth / 2 + 2;
      ctx.beginPath();
      ctx.moveTo(center + innerR * Math.cos(tickAngle), center + innerR * Math.sin(tickAngle));
      ctx.lineTo(center + outerR * Math.cos(tickAngle), center + outerR * Math.sin(tickAngle));
      ctx.strokeStyle = i <= value ? "#FF8D28" : "#52525b";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Thumb
    const thumbAngle = -Math.PI / 2 + ((value - min) / (max - min)) * 2 * Math.PI;
    const thumbX = center + radius * Math.cos(thumbAngle);
    const thumbY = center + radius * Math.sin(thumbAngle);

    ctx.beginPath();
    ctx.arc(thumbX, thumbY, 14, 0, 2 * Math.PI);
    ctx.fillStyle = "rgba(255, 141, 40, 0.15)";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(thumbX, thumbY, 10, 0, 2 * Math.PI);
    ctx.fillStyle = "#FF8D28";
    ctx.shadowColor = "#FF8D28";
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.arc(thumbX, thumbY, 4, 0, 2 * Math.PI);
    ctx.fillStyle = "#fff";
    ctx.fill();
  }, [value, min, max, center, radius, size, strokeWidth]);

  useEffect(() => { draw(); }, [draw]);

  // Stable global listeners — registered once, use refs internally
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || disabledRef.current) return;
      onChangeRef.current(angleToValue(getAngleFromPointer(e.clientX, e.clientY)));
    };
    const handleMouseUp = () => { isDragging.current = false; };
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging.current || disabledRef.current) return;
      e.preventDefault();
      const t = e.touches[0];
      onChangeRef.current(angleToValue(getAngleFromPointer(t.clientX, t.clientY)));
    };
    const handleTouchEnd = () => { isDragging.current = false; };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [angleToValue, getAngleFromPointer]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    isDragging.current = true;
    onChange(angleToValue(getAngleFromPointer(e.clientX, e.clientY)));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    isDragging.current = true;
    const t = e.touches[0];
    onChange(angleToValue(getAngleFromPointer(t.clientX, t.clientY)));
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className={disabled ? "opacity-50" : "cursor-grab active:cursor-grabbing"}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-4xl font-bold text-white">{value}</span>
          <span className="text-zinc-400 text-sm">{value === 1 ? "hour" : "hours"}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs text-zinc-500">
        <span>Min: {min}h</span>
        <div className="w-1 h-1 rounded-full bg-zinc-600" />
        <span className="text-[#FF8D28] font-medium">{value}h / day</span>
        <div className="w-1 h-1 rounded-full bg-zinc-600" />
        <span>Max: {max}h</span>
      </div>

      <div className="flex gap-1.5 flex-wrap justify-center max-w-48">
        {Array.from({ length: max - min + 1 }, (_, i) => i + min).map((h) => (
          <button
            key={h}
            disabled={disabled}
            onClick={() => !disabled && onChange(h)}
            className={`w-7 h-7 rounded-full text-xs font-medium transition-all ${
              h === value
                ? "bg-[#FF8D28] text-white scale-110"
                : h < value
                ? "bg-[#FF8D28]/20 text-[#FF8D28]"
                : "bg-zinc-800 text-zinc-500 hover:bg-zinc-700"
            } disabled:cursor-not-allowed`}
          >
            {h}
          </button>
        ))}
      </div>
    </div>
  );
};