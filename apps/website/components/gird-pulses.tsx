"use client";

import { useEffect, useRef, useState } from "react";

const CELL = 24; // must match the grid's bg-[size:24px_24px]
const MAX_DOTS = 3;

const MIN_SIZE = 2; // px
const MAX_SIZE = 10; // px
const MIN_DURATION = 5; // seconds
const MAX_DURATION = 10; // seconds

const rand = (min: number, max: number) => min + Math.random() * (max - min);

type Dot = { id: number; x: number; y: number; size: number; duration: number };

export function GridPulses() {
  const ref = useRef<HTMLDivElement>(null);
  const [dots, setDots] = useState<Dot[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let nextId = 0;
    let timeout: ReturnType<typeof setTimeout>;

    const spawn = () => {
      const el = ref.current;
      if (el) {
        const cols = Math.floor(el.clientWidth / CELL);
        const rows = Math.floor(el.clientHeight / CELL);
        if (cols > 0 && rows > 0) {
          const dot: Dot = {
            id: nextId++,
            x: Math.floor(Math.random() * (cols + 1)) * CELL,
            y: Math.floor(Math.random() * (rows + 1)) * CELL,
            size: rand(MIN_SIZE, MAX_SIZE),
            duration: rand(MIN_DURATION, MAX_DURATION),
          };
          setDots((prev) => (prev.length >= MAX_DOTS ? prev : [...prev, dot]));
        }
      }
      timeout = setTimeout(spawn, 400 + Math.random() * 900);
    };

    spawn();
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <style>{`
        @keyframes grid-dot {
          0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.4); }
          25%  { opacity: 0; transform: translate(-50%, -50%) scale(1); }
          55%  { opacity: 0.8; transform: translate(-50%, -50%) scale(1.8); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes grid-ring {
          0%   { opacity: 0; transform: translate(-50%, -50%) scale(1); }
          25%  { opacity: 0; transform: translate(-50%, -50%) scale(1); }
          55%  { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(4); }
        }
      `}</style>

      {dots.map((dot) => (
        <span
          key={dot.id}
          className="absolute"
          style={{ left: dot.x + 0.5, top: dot.y + 0.5 }}
        >
          <span
            className="absolute rounded-full bg-primary"
            style={{
              width: dot.size,
              height: dot.size,
              animation: `grid-dot ${dot.duration}s ease-in-out forwards`,
            }}
            onAnimationEnd={() =>
              setDots((prev) => prev.filter((d) => d.id !== dot.id))
            }
          />
          <span
            className="absolute rounded-full border border-primary"
            style={{
              width: dot.size,
              height: dot.size,
              animation: `grid-ring ${dot.duration}s ease-out forwards`,
            }}
          />
        </span>
      ))}
    </div>
  );
}
