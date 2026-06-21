"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Users, Sparkles, History, Trash2 } from "lucide-react";
import { useFriends } from "@/context/FriendsContext";

const NAV = [
  { href: "/", label: "All Friends", Icon: Users },
  { href: "/single", label: "Single Pool", Icon: Sparkles },
  { href: "/matches", label: "Match History", Icon: History },
];

function NavLinks({ orientation }: { orientation: "sidebar" | "bottom" }) {
  const pathname = usePathname();
  const { friends, singleFriends, matches } = useFriends();

  const counts: Record<string, number> = {
    "/": friends.length,
    "/single": singleFriends.length,
    "/matches": matches.length,
  };

  return (
    <>
      {NAV.map(({ href, label, Icon }) => {
        const active = pathname === href;
        const count = counts[href];
        if (orientation === "bottom") {
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors ${
                active ? "text-cupid-600" : "text-slate-400"
              }`}
            >
              <Icon size={20} />
              <span>{label.split(" ")[0]}</span>
            </Link>
          );
        }
        return (
          <Link
            key={href}
            href={href}
            className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-cupid-100 text-cupid-700"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span className="flex items-center gap-3">
              <Icon
                size={18}
                className={active ? "text-cupid-600" : "text-slate-400"}
              />
              {label}
            </span>
            {count > 0 && (
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  active
                    ? "bg-cupid-200 text-cupid-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {count}
              </span>
            )}
          </Link>
        );
      })}
    </>
  );
}

function ResetButton() {
  const { friends, matches, clearAll } = useFriends();
  const isEmpty = friends.length === 0 && matches.length === 0;
  if (isEmpty) return null;
  return (
    <button
      onClick={() => {
        if (
          window.confirm(
            "Reset CupidList? This clears all friends and match history from this browser."
          )
        ) {
          clearAll();
        }
      }}
      className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400 transition-colors hover:text-red-500"
    >
      <Trash2 size={12} /> Reset all data
    </button>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cupid-500 to-indigoSoft-500 shadow-soft">
        <Heart size={18} className="text-white" fill="white" />
      </span>
      <div className="leading-tight">
        <p className="text-base font-bold text-slate-800">CupidList</p>
        <p className="text-[11px] text-slate-400">Be the matchmaker</p>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-cupid-50 via-white to-indigoSoft-50">
      <div className="mx-auto flex max-w-6xl">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-6 border-r border-slate-100 bg-white/70 px-3 py-6 backdrop-blur md:flex">
          <Brand />
          <nav className="flex flex-col gap-1">
            <NavLinks orientation="sidebar" />
          </nav>
          <div className="mt-auto flex flex-col gap-2 px-3">
            <ResetButton />
            <p className="text-[11px] leading-relaxed text-slate-400">
              MVP · data is saved locally in your browser.
            </p>
          </div>
        </aside>

        {/* Main column */}
        <div className="flex min-h-screen w-full flex-col">
          {/* Mobile top bar */}
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-100 bg-white/80 px-4 py-3 backdrop-blur md:hidden">
            <Brand />
          </header>

          <main className="flex-1 px-4 pb-24 pt-6 md:px-8 md:pb-10">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 flex border-t border-slate-100 bg-white/90 backdrop-blur md:hidden">
        <NavLinks orientation="bottom" />
      </nav>
    </div>
  );
}
