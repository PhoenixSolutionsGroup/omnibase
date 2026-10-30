"use client";

import { useState, useSyncExternalStore } from "react";

// ---- Pulsing dots config -------------------------------------------------
const DOT_COUNT = 2; // how many dots appear around the hero
const PULSE_DURATION_S = 3; // base duration of one pulse (seconds)
const PULSE_DURATION_JITTER_S = 1.5; // each dot gets +/- this much randomness (0 = all identical)
const MAX_START_DELAY_S = 4; // dots start at random offsets within this window
const DOT_SIZE_PX = 6; // size of the solid centre dot
const RING_SCALE = 8; // how far the pulse ring expands (multiple of dot size)
// --------------------------------------------------------------------------

type Dot = {
  id: number;
  top: number; // %
  left: number; // %
  duration: number; // s
  delay: number; // s
};

function randomPosition(): { top: number; left: number } {
  return { top: Math.random() * 100, left: Math.random() * 100 };
}

function generateDots(): Dot[] {
  return Array.from({ length: DOT_COUNT }, (_, id) => ({
    id,
    ...randomPosition(),
    duration: Math.max(
      0.2,
      PULSE_DURATION_S + (Math.random() * 2 - 1) * PULSE_DURATION_JITTER_S,
    ),
    delay: -Math.random() * MAX_START_DELAY_S, // negative = start mid-cycle, no empty first frame
  }));
}

// false on the server and during hydration, true afterwards on the client.
// Avoids both a setState-in-effect and hydration mismatches from Math.random().
const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function PulsingDots() {
  const hydrated = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );
  const [dots, setDots] = useState<Dot[]>(generateDots);

  // Called at the end of every pulse: move that dot to a new random spot.
  // The dot is fully transparent at the cycle boundary, so the jump is invisible.
  const relocate = (id: number) => {
    setDots((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...randomPosition() } : d)),
    );
  };

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <style>{`
        @keyframes hero-dot-pulse {
          0%   { transform: scale(1); opacity: 0; }
          15%  { opacity: 0.6; }
          100% { transform: scale(${RING_SCALE}); opacity: 0; }
        }
        @keyframes hero-dot-core {
          0%, 100% { opacity: 0; }
          25%, 60% { opacity: 0.9; }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-dot-ring, .hero-dot-core { animation: none !important; }
          .hero-dot-ring { display: none; }
          .hero-dot-core { opacity: 0.5; }
        }
      `}</style>

      {hydrated &&
        dots.map((dot) => (
          <span
            key={dot.id}
            className="absolute"
            style={{
              top: `${dot.top}%`,
              left: `${dot.left}%`,
              width: DOT_SIZE_PX,
              height: DOT_SIZE_PX,
              transform: "translate(-50%, -50%)",
            }}
          >
            <span
              className="hero-dot-ring absolute inset-0 rounded-full bg-primary"
              style={{
                animation: `hero-dot-pulse ${dot.duration}s ease-out ${dot.delay}s infinite`,
              }}
              onAnimationIteration={() => relocate(dot.id)}
            />
            <span
              className="hero-dot-core absolute inset-0 rounded-full bg-primary"
              style={{
                animation: `hero-dot-core ${dot.duration}s ease-in-out ${dot.delay}s infinite`,
              }}
            />
          </span>
        ))}
    </div>
  );
}
