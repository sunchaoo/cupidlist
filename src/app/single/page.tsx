"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { useFriends } from "@/context/FriendsContext";
import type { Friend } from "@/lib/types";
import { PageHeader } from "@/components/PageHeader";
import { FriendCard } from "@/components/FriendCard";
import { MatchmakeModal } from "@/components/MatchmakeModal";
import { EmptyState } from "@/components/EmptyState";

export default function SinglePoolPage() {
  const { singleFriends, loading } = useFriends();
  const [matchTarget, setMatchTarget] = useState<Friend | null>(null);

  return (
    <>
      <PageHeader
        title="Single Pool"
        subtitle={`${singleFriends.length} friend${
          singleFriends.length === 1 ? "" : "s"
        } ready to be matched.`}
      />

      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : singleFriends.length === 0 ? (
        <EmptyState
          icon={<Sparkles size={26} />}
          title="No single friends yet"
          description="Head to All Friends and flip the “Single” toggle on anyone you'd love to set up."
          action={
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cupid-500 to-indigoSoft-500 px-3.5 py-2.5 text-sm font-semibold text-white"
            >
              Go to All Friends
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {singleFriends.map((f) => (
            <FriendCard key={f.id} friend={f} onMatchmake={setMatchTarget} />
          ))}
        </div>
      )}

      <MatchmakeModal
        friendA={matchTarget}
        onClose={() => setMatchTarget(null)}
      />
    </>
  );
}
