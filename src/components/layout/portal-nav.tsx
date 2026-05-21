"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Trophy,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import logo from "@/images/Logos/white logo.svg";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tournaments", label: "Tournaments", icon: Trophy },
  { href: "/athletes", label: "Athletes", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function PortalNav({ email }: { email?: string }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navContent = (
    <>
      <div className="border-b border-border bg-sidebar px-4 py-6">
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="inline-flex w-full items-center gap-3 rounded-2xl border border-border bg-muted px-3 py-3 text-sm font-semibold text-black transition hover:border-primary hover:bg-primary/10"
        >
          <img src={logo.src} alt="MCTC logo" className="h-9 w-auto" />
          <span>MCTC Portal</span>
        </Link>
        <p className="mt-3 truncate text-sm text-muted-foreground">{email}</p>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
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
        <form
          action="/auth/signout"
          method="post"
          className="w-full"
          onSubmit={() => setMobileOpen(false)}
        >
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start text-muted-foreground"
          >
            <LogOut className="size-4" />
            Sign out
          </Button>
        </form>
      </div>
    </>
  );

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2">
          <Link href="/" onClick={() => setMobileOpen(false)} className="inline-flex items-center gap-2">
            <img src={logo.src} alt="MCTC logo" className="h-7 w-auto" />
            <span className="font-semibold text-mctc-gold">MCTC Portal</span>
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
