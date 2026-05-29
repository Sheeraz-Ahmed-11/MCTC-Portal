"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const AUTH_ROUTES = ["/login", "/signup", "/auth/forgot", "/"];

export function PrefetchAuthRoutes() {
  const router = useRouter();

  useEffect(() => {
    for (const href of AUTH_ROUTES) {
      router.prefetch(href);
    }
  }, [router]);

  return null;
}
