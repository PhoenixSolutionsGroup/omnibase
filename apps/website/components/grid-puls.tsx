"use client";

import { useEffect, useRef, useState } from "react";

const MAX_DOTS = 8;

const rand = (min: number, max: number) => min + Math.random() * (max - min);

type Dot = {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
};

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
        const dot: Dot = {
          id: nextId++,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: rand(3, 7),
          duration: rand(3, 6),
        };

        setDots((prev) => [...prev, dot].slice(-MAX_DOTS));
      }

      timeout = setTimeout(spawn, rand(500, 1200));
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
        @keyframes hero-dot-pulse {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5);
          }
          15% {
            opacity: 0.65;
            transform: translate(-50%, -50%) scale(1);
          }
          45% {
            opacity: 0.8;
            transform: translate(-50%, -50%) scale(1.5);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(2);
          }
        }
      `}</style>

      {dots.map((dot) => (
        <span
          key={dot.id}
          className="absolute rounded-full bg-primary"
          style={{
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            width: dot.size,
            height: dot.size,
            animation: `hero-dot-pulse ${dot.duration}s ease-out forwards`,
          }}
          onAnimationEnd={() =>
            setDots((prev) => prev.filter((d) => d.id !== dot.id))
          }
        />
      ))}
    </div>
  );
}
