import Link from "next/link";
import logo from "@/images/Logos/white logo.svg";
import { Trophy, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center">
            <Link href="/" className="inline-flex items-center">
              <img src={logo.src} alt="MCTC logo" className="h-10 w-auto" />
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <Link href="/dashboard">
                <Button>Go to dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Sign in</Button>
                </Link>
                <Link href="/signup">
                  <Button>Get started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden px-4 py-20 sm:py-28">
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              background:
                "radial-gradient(ellipse 80% 50% at 50% -20%, oklch(0.52 0.19 25 / 0.35), transparent)",
            }}
          />
          <div className="relative mx-auto max-w-3xl text-center">
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-mctc-gold">
              Minnesota Collegiate Taekwondo Championship
            </p>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Athlete roster management for{" "}
              <span className="text-primary">Spring & Fall</span> tournaments
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
              Register athletes, build division rosters, and track confirmations
              for each biannual MCTC event — all in one secure portal.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link href={user ? "/dashboard" : "/signup"}>
                <Button size="lg">
                  {user ? "Open dashboard" : "Create account"}
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="secondary">
                  Coach sign in
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-muted/30 px-4 py-16">
          <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-3">
            {[
              {
                icon: Calendar,
                title: "Twice a year",
                desc: "Dedicated Spring and Fall tournament cycles with separate rosters and registration windows.",
              },
              {
                icon: Users,
                title: "Athlete directory",
                desc: "Maintain belt rank, weight, division, and emergency contacts for your club's competitors.",
              },
              {
                icon: Trophy,
                title: "Live rosters",
                desc: "Add athletes to a tournament roster, assign divisions, and track registered vs confirmed status.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <Card key={title}>
                <CardContent className="pt-6">
                  <Icon className="mb-4 size-8 text-primary" />
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center">
        <Link href="/" className="inline-block">
          <img src={logo.src} alt="MCTC logo" className="mx-auto h-8 w-auto" />
        </Link>
      </footer>
    </div>
  );
}
