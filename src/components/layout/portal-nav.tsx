"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Trophy,
  Users,
  Settings,
  CircleHelp,
  LogOut,
  MoreVertical,
  Menu,
  X,
} from "lucide-react";
import logo from "@/images/Logos/white logo.svg";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const adminLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tournaments", label: "Tournaments", icon: Trophy },
  { href: "/athletes", label: "Athletes", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

const managerLinks = [
  { href: "/tournaments", label: "Tournaments", icon: Trophy },
  { href: "/athletes", label: "Athletes", icon: Users },
];

export function PortalNav({
  email,
  fullName,
  avatarUrl,
  role,
}: {
  email?: string;
  fullName?: string | null;
  avatarUrl?: string | null;
  role?: "admin" | "coach";
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const isAdmin = role === "admin";

  useEffect(() => {
    if (!accountMenuOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target as Node)
      ) {
        setAccountMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [accountMenuOpen]);
  const visibleLinks = isAdmin ? adminLinks : managerLinks;

  const navContent = (
    <>
      <div className="border-b border-border bg-sidebar px-4 py-6">
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="inline-flex items-center"
        >
          <img src={logo.src} alt="MCTC logo" className="h-11 w-auto" />
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {visibleLinks.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-none px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-black",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-3">
        <div ref={accountMenuRef} className="relative flex items-start justify-between px-3">
          <div className="min-w-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={`${fullName ?? "Account"} profile`}
                className="mb-1 h-8 w-8 rounded-none border border-border object-cover"
              />
            ) : null}
            <p className="truncate text-sm font-medium text-foreground">{fullName ?? "Account"}</p>
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Account menu"
            className="size-8 rounded-none text-muted-foreground"
            onClick={() => setAccountMenuOpen((open) => !open)}
          >
            <MoreVertical className="size-4" />
          </Button>
          {accountMenuOpen ? (
            <div className="absolute bottom-10 right-0 z-50 w-44 rounded-none border border-border bg-sidebar p-1 shadow-lg">
              <Link
                href="/settings"
                onClick={() => {
                  setAccountMenuOpen(false);
                  setMobileOpen(false);
                }}
                className={cn(
                  "flex items-center gap-2 rounded-none px-3 py-2 text-sm transition-colors",
                  pathname === "/settings" || pathname.startsWith("/settings/")
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-black",
                )}
              >
                <Settings className="size-4 shrink-0" />
                Settings
              </Link>
              <a
                href="mailto:info@mctctkd.com?subject=MCTC%20Portal%20Help"
                onClick={() => setAccountMenuOpen(false)}
                className="flex items-center gap-2 rounded-none px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-black"
              >
                <CircleHelp className="size-4 shrink-0" />
                Get help
              </a>
              <form
                action="/auth/signout"
                method="post"
                className="w-full"
                onSubmit={() => {
                  setAccountMenuOpen(false);
                  setMobileOpen(false);
                }}
              >
                <Button
                  type="submit"
                  variant="ghost"
                  className="w-full justify-start rounded-none px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-black"
                >
                  <LogOut className="size-4 shrink-0" />
                  Logout
                </Button>
              </form>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2">
          <Link href="/" onClick={() => setMobileOpen(false)} className="inline-flex items-center">
            <img src={logo.src} alt="MCTC logo" className="h-10 w-auto" />
          </Link>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </header>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          role="presentation"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-sidebar transition-transform lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {navContent}
      </aside>
    </>
  );
}
