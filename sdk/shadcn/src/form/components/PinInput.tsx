"use client";

import * as React from "react";
import type { UiNode } from "@ory/client-fetch";
import { cn } from "@/lib/utils";
import { isUiNodeInputAttributes } from "../types";

type PinInputProps = {
  node: UiNode;
  length?: number;
  initialValue?: string;
};

export function PinInput({
  node,
  length = 6,
  initialValue = "",
}: PinInputProps) {
  if (!isUiNodeInputAttributes(node.attributes)) {
    return null;
  }

  // Initialize pins with the initial value if provided
  const [pins, setPins] = React.useState<string[]>(() => {
    if (initialValue) {
      const sanitized = initialValue.replace(/[^0-9]/g, "").slice(0, length);
      const pinArray = Array(length).fill("");
      for (let i = 0; i < sanitized.length; i++) {
        pinArray[i] = sanitized[i];
      }
      return pinArray;
    }
    return Array(length).fill("");
  });
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    // Only allow single digit numbers
    const sanitizedValue = value.replace(/[^0-9]/g, "").slice(0, 1);

    const newPins = [...pins];
    newPins[index] = sanitizedValue;
    setPins(newPins);

    // Auto-focus next input
    if (sanitizedValue && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    // Handle backspace
    if (e.key === "Backspace" && !pins[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    // Handle left arrow
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    // Handle right arrow
    if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/[^0-9]/g, "");
    const newPins = [...pins];

    for (let i = 0; i < Math.min(pastedData.length, length); i++) {
      newPins[i] = pastedData[i];
    }

    setPins(newPins);

    // Focus the next empty input or the last one
    const nextEmptyIndex = newPins.findIndex((pin) => !pin);
    const focusIndex = nextEmptyIndex === -1 ? length - 1 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();
  };

  // Combine all pins into a single value for the hidden input
  const combinedValue = pins.join("");

  return (
    <div className="space-y-2 mb-6">
      <div className="flex gap-2 justify-center">
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={pins[index]}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            disabled={
              isUiNodeInputAttributes(node.attributes)
                ? node.attributes.disabled
                : false
            }
            className={cn(
              "w-10 h-12 text-center text-lg font-semibold rounded-md border-2",
              "border-input bg-background shadow-sm transition-all duration-200 outline-none",
              "hover:border-ring/60",
              "focus:border-ring focus:ring-4 focus:ring-ring/20 focus:scale-105",
              "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
              "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
              pins[index] && "border-primary bg-primary/5"
            )}
            aria-label={`Digit ${index + 1}`}
          />
        ))}
      </div>

      {/* Hidden input to submit the actual value */}
      <input
        type="hidden"
        id={node.attributes.name}
        name={node.attributes.name}
        value={combinedValue}
        required={node.attributes.required}
      />
    </div>
  );
}
