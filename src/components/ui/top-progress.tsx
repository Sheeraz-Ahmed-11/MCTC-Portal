"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const MAX_PROGRESS = 90;
const UPDATE_INTERVAL = 150;
const NAV_DELAY = 700;

export function TopProgress() {
  const pathname = usePathname();
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const intervalRef = useRef<number | undefined>(undefined);
  const navTimeoutRef = useRef<number | undefined>(undefined);

  const clearProgressInterval = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  };

  const startProgress = () => {
    if (!visible) {
      setVisible(true);
      setProgress(12);
    }

    clearProgressInterval();

    intervalRef.current = window.setInterval(() => {
      setProgress((current) => Math.min(current + Math.random() * 6 + 4, MAX_PROGRESS));
    }, UPDATE_INTERVAL) as unknown as number;
  };

  const scheduleNavigation = (href: string) => {
    if (navTimeoutRef.current) {
      window.clearTimeout(navTimeoutRef.current);
    }

    navTimeoutRef.current = window.setTimeout(() => {
      router.push(href);
    }, NAV_DELAY) as unknown as number;
  };

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.button !== 0 || event.defaultPrevented || event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a") as HTMLAnchorElement | null;
      if (!anchor || !anchor.href || anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;

      const samePage = url.pathname === window.location.pathname && url.search === window.location.search && url.hash !== "";
      if (samePage) return;

      event.preventDefault();
      startProgress();
      scheduleNavigation(url.pathname + url.search + url.hash);
    };

    document.addEventListener("click", onClick, true);

    return () => {
      document.removeEventListener("click", onClick, true);
      if (navTimeoutRef.current) {
        window.clearTimeout(navTimeoutRef.current);
      }
      clearProgressInterval();
    };
  }, []);

  useEffect(() => {
    if (!visible) return;

    setProgress(100);
    clearProgressInterval();

    const timeoutId = window.setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 320);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [pathname, visible]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-1 overflow-hidden">
      <div
        className={`h-full transition-all duration-200 ease-out ${visible ? "opacity-100" : "opacity-0"}`}
        style={{
          width: `${progress}%`,
          backgroundImage:
            "linear-gradient(90deg, rgba(252,211,77,1) 0%, rgba(253,108,106,1) 50%, rgba(245,158,11,1) 100%)",
          boxShadow: "0 0 10px rgba(252,211,77,0.5)",
        }}
      />
    </div>
  );
}
