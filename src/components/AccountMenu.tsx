"use client";

import { useEffect, useState } from "react";
import {
  getProviders,
  signIn,
  signOut,
  useSession,
} from "next-auth/react";
import { Linkedin, Facebook, LogOut } from "lucide-react";
import { Avatar } from "./Avatar";

type Providers = Awaited<ReturnType<typeof getProviders>>;

// Multi-colour Google "G" — lucide has no brand mark for Google.
function GoogleIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8a12 12 0 1 1 7.9-21l5.7-5.7A20 20 0 1 0 24 44a20 20 0 0 0 19.6-23.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8A12 12 0 0 1 24 12c3.1 0 5.8 1.2 7.9 3l5.7-5.7A20 20 0 0 0 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A12 12 0 0 1 12.7 28l-6.5 5A20 20 0 0 0 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2C40.9 36 44 30.6 44 24c0-1.2-.1-2.4-.4-3.5z" />
    </svg>
  );
}

// Per-provider button styling.
const STYLE: Record<
  string,
  { className: string; icon: React.ReactNode }
> = {
  linkedin: {
    className: "bg-sky-700 text-white hover:bg-sky-800",
    icon: <Linkedin size={16} />,
  },
  google: {
    className: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
    icon: <GoogleIcon />,
  },
  facebook: {
    className: "bg-[#1877F2] text-white hover:brightness-95",
    icon: <Facebook size={16} />,
  },
};

export function AccountMenu() {
  const { data: session, status } = useSession();
  const [providers, setProviders] = useState<Providers>(null);

  useEffect(() => {
    getProviders().then(setProviders);
  }, []);

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

  const list = providers ? Object.values(providers) : [];

  if (list.length === 0) {
    // No providers configured: friendly guest state.
    return (
      <div className="rounded-xl border border-dashed border-slate-200 px-3 py-2 text-[11px] leading-relaxed text-slate-400">
        Browsing as <span className="font-medium text-slate-500">Guest</span>.
        Social sign-in activates once a provider is configured.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      {list.map((p) => {
        const style = STYLE[p.id] ?? {
          className: "bg-slate-800 text-white hover:bg-slate-900",
          icon: null,
        };
        return (
          <button
            key={p.id}
            onClick={() => signIn(p.id)}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${style.className}`}
          >
            {style.icon} Continue with {p.name}
          </button>
        );
      })}
    </div>
  );
}
