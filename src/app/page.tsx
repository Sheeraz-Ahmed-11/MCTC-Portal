// src/app/page.tsx
import Link from "next/link";
import logo from "@/images/Logos/white logo.svg";
import { Trophy, Users, Calendar, ChevronRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen flex-col bg-[#0f0f0f] text-white">

      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-white/8 bg-[#0f0f0f]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center">
            <img src={logo.src} alt="MCTC" className="h-10 w-auto" />
          </Link>
          <nav className="flex items-center gap-2">
            {user ? (
              <Link href="/dashboard">
                <Button size="sm" className="bg-[#a33030] hover:bg-[#8a2828] text-white border-0">
                  Dashboard <ChevronRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/8">
                    Sign in
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="bg-[#a33030] hover:bg-[#8a2828] text-white border-0">
                    Get started
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">

        {/* Hero */}
        <section className="border-b border-white/8 bg-[#a33030] px-6 py-20 sm:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white/80">
              <Trophy className="h-3.5 w-3.5" />
              Midwest Collegiate Taekwondo Championship
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Athlete roster management
              </h1>
              <p className="text-2xl font-semibold text-white/50 sm:text-3xl">
                for Spring &amp; Fall tournaments
              </p>
            </div>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/70">
              Register athletes, build division rosters, and track confirmations
              for each biannual MCTC event — all in one secure portal.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Link href={user ? "/dashboard" : "/signup"}>
                <Button size="lg" className="bg-white text-[#a33030] hover:bg-white/90 font-semibold border-0">
                  {user ? "Open dashboard" : "Create account"}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white hover:border-white/50">
                  Coach sign in
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Stats strip */}
        <section className="border-b border-white/8 bg-[#161616]">
          <div className="mx-auto grid max-w-4xl grid-cols-3 divide-x divide-white/8">
            {[
              { value: "25+", label: "Competing teams" },
              { value: "300+", label: "Registered athletes" },
              { value: "2×", label: "Per year" },
            ].map(({ value, label }) => (
              <div key={label} className="px-8 py-8 text-center">
                <p className="text-3xl font-bold text-[#c45050]">{value}</p>
                <p className="mt-1 text-sm text-white/40">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <div className="mb-12 text-center">
              <h2 className="text-2xl font-bold tracking-tight">Everything you need</h2>
              <p className="mt-3 text-white/40">Built for team managers competing in MCTC events.</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              {[
                { icon: Calendar, title: "Twice a year", desc: "Dedicated Spring and Fall tournament cycles with separate rosters and registration windows." },
                { icon: Users, title: "Athlete directory", desc: "Maintain belt rank, weight class, event type, and status for every competitor on your roster." },
                { icon: Shield, title: "Secure portal", desc: "Role-based access ensures managers only see their own team. Full admin oversight for organizers." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="rounded-xl border border-white/8 bg-[#161616] p-6 transition hover:border-[#a33030]/40 hover:bg-[#1a1a1a]">
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#a33030]/15 text-[#c45050]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/45">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-white/8 bg-[#161616] px-6 py-16 text-center">
          <h2 className="text-xl font-bold">Ready to submit your roster?</h2>
          <p className="mt-2 text-white/40">Register your team and start adding athletes in minutes.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/signup">
              <Button className="bg-[#a33030] hover:bg-[#8a2828] text-white border-0" size="lg">
                Register your team
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="border-white/15 text-white hover:bg-white/8 hover:text-white">
                Sign in
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/8 bg-[#0f0f0f] px-6 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="flex items-center">
            <img src={logo.src} alt="MCTC" className="h-9 w-auto opacity-50" />
          </Link>
          <p className="text-xs text-white/25">Midwest Collegiate Taekwondo Championship</p>
        </div>
      </footer>
    </div>
  );
}