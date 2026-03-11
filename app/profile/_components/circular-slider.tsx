/* eslint-disable @typescript-eslint/no-unused-vars */
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

  // ── Convert value to angle (0 at top, clockwise) ──────────────────────────
  const valueToAngle = (val: number): number => {
    const percentage = (val - min) / (max - min);
    return percentage * 360 - 90; // start from top
  };

  // ── Convert angle to value ────────────────────────────────────────────────
  const angleToValue = (angle: number): number => {
    const normalized = ((angle + 90) % 360 + 360) % 360;
    const val = Math.round((normalized / 360) * (max - min) + min);
    return Math.min(max, Math.max(min, val));
  };

  // ── Get angle from mouse/touch position ───────────────────────────────────
  const getAngleFromEvent = useCallback(
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

  // ── Draw canvas ────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, size, size);

    const startAngle = -Math.PI / 2;
    const endAngle =
      startAngle + ((value - min) / (max - min)) * 2 * Math.PI;

    // ── Track background ───────────────────────────────────────────────────
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = "#3f3f46";
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = "round";
    ctx.stroke();

    // ── Colored arc ────────────────────────────────────────────────────────
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, "#FF8D28");
    gradient.addColorStop(1, "#ff6b00");

    ctx.beginPath();
    ctx.arc(center, center, radius, startAngle, endAngle);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = "round";
    ctx.stroke();

    // ── Tick marks for each hour ───────────────────────────────────────────
    for (let i = min; i <= max; i++) {
      const tickAngle =
        -Math.PI / 2 + ((i - min) / (max - min)) * 2 * Math.PI;
      const innerR = radius - strokeWidth / 2 - 4;
      const outerR = radius + strokeWidth / 2 + 2;
      const x1 = center + innerR * Math.cos(tickAngle);
      const y1 = center + innerR * Math.sin(tickAngle);
      const x2 = center + outerR * Math.cos(tickAngle);
      const y2 = center + outerR * Math.sin(tickAngle);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = i <= value ? "#FF8D28" : "#52525b";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // ── Thumb (draggable handle) ───────────────────────────────────────────
    const thumbAngle =
      -Math.PI / 2 + ((value - min) / (max - min)) * 2 * Math.PI;
    const thumbX = center + radius * Math.cos(thumbAngle);
    const thumbY = center + radius * Math.sin(thumbAngle);

    // Outer glow
    ctx.beginPath();
    ctx.arc(thumbX, thumbY, 14, 0, 2 * Math.PI);
    ctx.fillStyle = "rgba(255, 141, 40, 0.15)";
    ctx.fill();

    // Main thumb
    ctx.beginPath();
    ctx.arc(thumbX, thumbY, 10, 0, 2 * Math.PI);
    ctx.fillStyle = "#FF8D28";
    ctx.shadowColor = "#FF8D28";
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Inner dot
    ctx.beginPath();
    ctx.arc(thumbX, thumbY, 4, 0, 2 * Math.PI);
    ctx.fillStyle = "#fff";
    ctx.fill();

  }, [value, min, max, center, radius, size, strokeWidth]);

  useEffect(() => {
    draw();
  }, [draw]);

  // ── Mouse Events ───────────────────────────────────────────────────────────
  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    isDragging.current = true;
    const angle = getAngleFromEvent(e.clientX, e.clientY);
    onChange(angleToValue(angle));
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current || disabled) return;
    const angle = getAngleFromEvent(e.clientX, e.clientY);
    onChange(angleToValue(angle));
  };

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  // ── Touch Events ───────────────────────────────────────────────────────────
  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    isDragging.current = true;
    const touch = e.touches[0];
    const angle = getAngleFromEvent(touch.clientX, touch.clientY);
    onChange(angleToValue(angle));
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging.current || disabled) return;
    e.preventDefault();
    const touch = e.touches[0];
    const angle = getAngleFromEvent(touch.clientX, touch.clientY);
    onChange(angleToValue(angle));
  };

  // ── Attach global listeners ────────────────────────────────────────────────
  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const angle = valueToAngle(value);
  const thumbX =
    center + radius * Math.cos((angle * Math.PI) / 180);
  const thumbY =
    center + radius * Math.sin((angle * Math.PI) / 180);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className={`${disabled ? "opacity-50" : "cursor-grab active:cursor-grabbing"}`}
        />

        {/* Center display */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        >
          <span className="text-4xl font-bold text-white">
            {value}
          </span>
          <span className="text-zinc-400 text-sm">
            {value === 1 ? "hour" : "hours"}
          </span>
        </div>
      </div>

      {/* Min/Max labels */}
      <div className="flex items-center gap-3 text-xs text-zinc-500">
        <span>Min: {min}h</span>
        <div className="w-1 h-1 rounded-full bg-zinc-600" />
        <span className="text-[#FF8D28] font-medium">
          {value}h / day
        </span>
        <div className="w-1 h-1 rounded-full bg-zinc-600" />
        <span>Max: {max}h</span>
      </div>

      {/* Hour indicators */}
      <div className="flex gap-1.5 flex-wrap justify-center max-w-48">
        {Array.from({ length: max - min + 1 }, (_, i) => i + min).map(
          (h) => (
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
          )
        )}
      </div>
    </div>
  );
};