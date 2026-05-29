"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const MAX_PROGRESS = 90;
const TICK_MS = 80;

function isInternalNavClick(event: MouseEvent, pathname: string) {
  if (
    event.button !== 0 ||
    event.defaultPrevented ||
    event.metaKey ||
    event.altKey ||
    event.ctrlKey ||
    event.shiftKey
  ) {
    return false;
  }

  const target = event.target;
  if (!(target instanceof Element)) return false;

  const anchor = target.closest("a") as HTMLAnchorElement | null;
  if (!anchor?.href || anchor.target === "_blank" || anchor.hasAttribute("download")) {
    return false;
  }

  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) return false;

  return !(
    url.pathname === pathname &&
    url.search === window.location.search &&
    url.hash === ""
  );
}

export function TopProgress() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const intervalRef = useRef<number | undefined>(undefined);
  const navigatingRef = useRef(false);
  const isFirstPathnameRef = useRef(true);

  const clearTick = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  };

  const startProgress = () => {
    navigatingRef.current = true;
    setVisible(true);
    setProgress(18);
    clearTick();
    intervalRef.current = window.setInterval(() => {
      setProgress((current) =>
        current >= MAX_PROGRESS ? current : current + Math.random() * 10 + 6,
      );
    }, TICK_MS);
  };

  const completeProgress = () => {
    clearTick();
    setProgress(100);
    window.setTimeout(() => {
      setVisible(false);
      setProgress(0);
      navigatingRef.current = false;
    }, 200);
  };

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!isInternalNavClick(event, pathname)) return;
      startProgress();
    };

    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      clearTick();
    };
  }, [pathname]);

  useEffect(() => {
    if (isFirstPathnameRef.current) {
      isFirstPathnameRef.current = false;
      return;
    }

    if (navigatingRef.current || visible) {
      completeProgress();
    }
  }, [pathname, visible]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden">
      <div
        className={`h-full transition-[width,opacity] duration-150 ease-out ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        style={{
          width: `${progress}%`,
          backgroundImage:
            "linear-gradient(90deg, rgba(252,211,77,1) 0%, rgba(253,108,106,1) 50%, rgba(245,158,11,1) 100%)",
          boxShadow: visible ? "0 0 8px rgba(252,211,77,0.45)" : "none",
        }}
      />
    </div>
  );
}
