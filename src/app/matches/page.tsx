"use client";

import { History, Heart } from "lucide-react";
import { useFriends } from "@/context/FriendsContext";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { EmptyState } from "@/components/EmptyState";

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function MatchHistoryPage() {
  const { matches, loading } = useFriends();

  return (
    <>
      <PageHeader
        title="Match History"
        subtitle="Every introduction you've made. Cupid would be proud."
      />

      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : matches.length === 0 ? (
        <EmptyState
          icon={<History size={26} />}
          title="No matches yet"
          description="When you matchmake two friends, the introduction shows up here so you can keep track."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {matches.map((m) => (
            <li
              key={m.id}
              className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Avatar name={m.friendAName} size={38} />
                  <Heart
                    size={16}
                    className="text-cupid-500"
                    fill="currentColor"
                  />
                  <Avatar name={m.friendBName} size={38} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {m.friendAName}{" "}
                    <span className="font-normal text-slate-400">→</span>{" "}
                    {m.friendBName}
                  </p>
                  <p className="text-xs text-slate-400">
                    {formatDate(m.createdAt)}
                  </p>
                </div>
              </div>
              <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm leading-relaxed text-slate-600">
                {m.message}
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
