"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Linkedin, LogOut } from "lucide-react";
import { Avatar } from "./Avatar";

// Real login only shows when LinkedIn credentials are configured (see auth.ts).
const AUTH_ENABLED = process.env.NEXT_PUBLIC_AUTH_ENABLED === "true";

export function AccountMenu() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="h-9 animate-pulse rounded-xl bg-slate-100" />;
  }

  if (session?.user) {
    const name = session.user.name ?? "You";
    return (
      <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-2.5 py-2">
        <Avatar name={name} size={30} />
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700">
          {name}
        </span>
        <button
          onClick={() => signOut()}
          title="Sign out"
          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          <LogOut size={15} />
        </button>
      </div>
    );
  }

  if (!AUTH_ENABLED) {
    // Live demo without credentials: act as a friendly guest.
    return (
      <div className="rounded-xl border border-dashed border-slate-200 px-3 py-2 text-[11px] leading-relaxed text-slate-400">
        Browsing as <span className="font-medium text-slate-500">Guest</span>.
        LinkedIn sign-in activates once credentials are configured.
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn("linkedin")}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-700 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sky-800"
    >
      <Linkedin size={16} /> Sign in with LinkedIn
    </button>
  );
}
