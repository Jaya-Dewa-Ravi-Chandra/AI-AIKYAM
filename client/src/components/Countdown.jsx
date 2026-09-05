import React from "react";
import { useEffect, useState } from "react";

const target = new Date("2026-10-08T09:00:00+05:30").getTime();

function getRemaining() {
  const diff = Math.max(0, target - Date.now());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60)
  };
}

export default function Countdown() {
  const [time, setTime] = useState(getRemaining());

  useEffect(() => {
    const id = setInterval(() => setTime(getRemaining()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="countdown-grid" aria-label="Countdown to AI AIKYAM">
      {Object.entries(time).map(([label, value]) => (
        <div className="countdown-unit" key={label}>
          <span>{String(value).padStart(2, "0")}</span>
          <small>{label.toUpperCase()}</small>
        </div>
      ))}
    </div>
  );
}
