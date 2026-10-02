import { useEffect, useState } from "react";

function fmt(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(s / 3600)).padStart(2, "0");
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const sec = String(s % 60).padStart(2, "0");
  return `${h}:${m}:${sec}`;
}

export function Countdown({ expiresAt, onExpire }: { expiresAt?: string; onExpire?: () => void }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const remaining = expiresAt && now !== null ? new Date(expiresAt).getTime() - now : 24 * 3600 * 1000;
  useEffect(() => {
    if (expiresAt && now !== null && remaining <= 0) onExpire?.();
  }, [remaining, expiresAt, now, onExpire]);
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 font-mono text-xs font-semibold text-accent-foreground">
      ⚡ Self-destructs in {fmt(remaining)}
    </span>
  );
}
