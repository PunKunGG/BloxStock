"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function useStockClock(initialNow: number, expiresAt?: string) {
  const [now, setNow] = useState(initialNow);
  const [isRefreshing, startTransition] = useTransition();
  const attemptedExpiry = useRef<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (
      !expiresAt ||
      now < Date.parse(expiresAt) ||
      attemptedExpiry.current === expiresAt
    )
      return;
    attemptedExpiry.current = expiresAt;
    startTransition(() => router.refresh());
  }, [now, expiresAt, router]);

  return {
    now,
    isRefreshing,
    refresh: () => startTransition(() => router.refresh()),
  };
}
