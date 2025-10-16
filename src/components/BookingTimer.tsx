
"use client";

import { useState, useEffect } from "react";
import { Timer } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookingTimerProps {
  duration: number; // Duration in seconds
  onExpire: () => void;
}

export default function BookingTimer({ duration, onExpire }: BookingTimerProps) {
  const [remainingTime, setRemainingTime] = useState(duration);

  useEffect(() => {
    if (remainingTime <= 0) {
      onExpire();
      return;
    }

    const intervalId = setInterval(() => {
      setRemainingTime((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [remainingTime, onExpire]);

  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;

  const isWarning = remainingTime <= 60;

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md border bg-background p-2 font-mono text-sm shadow-sm",
        isWarning && "animate-pulse border-yellow-500/50 bg-yellow-500/10 text-yellow-600"
      )}
    >
      <Timer className="h-4 w-4" />
      <span>Time left:</span>
      <span className="font-bold tracking-wider">
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </span>
    </div>
  );
}

    