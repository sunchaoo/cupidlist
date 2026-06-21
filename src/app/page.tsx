"use client";

import { useState } from "react";
import { Download, Plus, Search, Users } from "lucide-react";
import { useFriends } from "@/context/FriendsContext";
import type { Friend } from "@/lib/types";
import { PageHeader } from "@/components/PageHeader";
import { FriendCard } from "@/components/FriendCard";
import { AddFriendModal } from "@/components/AddFriendModal";
import { MatchmakeModal } from "@/components/MatchmakeModal";
import { EmptyState } from "@/components/EmptyState";

export default function AllFriendsPage() {
  const { friends, loading, addFriend, importMockFriends } = useFriends();
  const [addOpen, setAddOpen] = useState(false);
  const [matchTarget, setMatchTarget] = useState<Friend | null>(null);
  const [query, setQuery] = useState("");
  const [importNote, setImportNote] = useState<string | null>(null);

  const filtered = friends.filter(
    (f) =>
      f.name.toLowerCase().includes(query.toLowerCase()) ||
      (f.instagramHandle ?? "").toLowerCase().includes(query.toLowerCase())
  );

  function handleImport() {
    const added = importMockFriends();
    setImportNote(
      added > 0
        ? `Imported ${added} friend${added === 1 ? "" : "s"} 🎉`
        : "Your sample friends are already imported."
    );
    setTimeout(() => setImportNote(null), 2500);
  }

  return (
    <>
      <PageHeader
        title="All Friends"
        subtitle="Your contacts, all in one place. Tag the single ones to start matchmaking."
        actions={
          <>
            <button
              onClick={handleImport}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Download size={16} /> Import sample
            </button>
            <button
              onClick={() => setAddOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cupid-500 to-indigoSoft-500 px-3.5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              <Plus size={16} /> Add friend
            </button>
          </>
        }
      />

      {importNote && (
        <div className="mb-4 rounded-xl bg-cupid-50 px-4 py-2.5 text-sm font-medium text-cupid-700">
          {importNote}
        </div>
      )}

      {friends.length > 0 && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5">
          <Search size={16} className="text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or handle…"
            className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
          />
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-400">Loading your friends…</p>
      ) : friends.length === 0 ? (
        <EmptyState
          icon={<Users size={26} />}
          title="No friends yet"
          description="Add your first friend manually, or import a sample crew to see how matchmaking works."
          action={
            <div className="flex gap-2">
              <button
                onClick={handleImport}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <Download size={16} /> Import sample
              </button>
              <button
                onClick={() => setAddOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cupid-500 to-indigoSoft-500 px-3.5 py-2.5 text-sm font-semibold text-white"
              >
                <Plus size={16} /> Add friend
              </button>
            </div>
          }
        />
      ) : filtered.length === 0 ? (
        <p className="text-sm text-slate-400">
          No friends match “{query}”.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((f) => (
            <FriendCard key={f.id} friend={f} onMatchmake={setMatchTarget} />
          ))}
        </div>
      )}

      <AddFriendModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={addFriend}
      />
      <MatchmakeModal
        friendA={matchTarget}
        onClose={() => setMatchTarget(null)}
      />
    </>
  );
}
