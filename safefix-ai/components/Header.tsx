"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, ShieldCheck, X } from "lucide-react";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/analyze", label: "Analyze" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/about", label: "About" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-navy-950/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2.5" aria-label="SafeFix AI home">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500 text-white">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-bold tracking-tight text-white">SafeFix AI</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {LINKS.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                  active ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-lg text-white hover:bg-white/10 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-white/10 bg-navy-950 px-5 py-3 md:hidden" aria-label="Mobile">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="block rounded-lg px-3 py-3 text-base font-medium text-slate-200 hover:bg-white/5"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
