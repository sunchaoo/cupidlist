"use client";

import { useState } from "react";
import { Heart, HeartOff, Linkedin, Pencil, Trash2, Sparkles } from "lucide-react";
import type { Friend, NewFriendInput } from "@/lib/types";
import { formatHandle } from "@/lib/match";
import { useFriends } from "@/context/FriendsContext";
import { Avatar } from "./Avatar";
import { PlatformIcon } from "./PlatformIcon";
import { AddFriendModal } from "./AddFriendModal";

export function FriendCard({
  friend,
  onMatchmake,
}: {
  friend: Friend;
  onMatchmake?: (friend: Friend) => void;
}) {
  const { toggleSingle, removeFriend, updateFriend } = useFriends();
  const [editOpen, setEditOpen] = useState(false);
  const handle = formatHandle(friend.instagramHandle);

  // Strip generated fields so the edit form sees only its inputs.
  const editInitial: NewFriendInput = {
    name: friend.name,
    source: friend.source,
    instagramHandle: friend.instagramHandle ?? "",
    isSingle: friend.isSingle,
    gender: friend.gender,
    preference: friend.preference,
  };

  return (
    <div className="group flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-soft">
      <div className="flex items-start gap-3">
        <Avatar name={friend.name} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-semibold text-slate-800">
              {friend.name}
            </h3>
            <PlatformIcon platform={friend.source} />
          </div>
          {handle ? (
            <a
              href={`https://instagram.com/${handle.slice(1)}`}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-cupid-600 hover:underline"
            >
              {handle}
            </a>
          ) : friend.linkedinUrl ? (
            <a
              href={friend.linkedinUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm text-sky-700 hover:underline"
            >
              <Linkedin size={12} /> LinkedIn
            </a>
          ) : friend.phone ? (
            <span className="text-sm text-slate-500">{friend.phone}</span>
          ) : (
            <span className="text-sm text-slate-400">No handle</span>
          )}
          {friend.headline && (
            <p className="truncate text-xs text-slate-400">{friend.headline}</p>
          )}
        </div>

        {friend.isSingle && (
          <span className="inline-flex items-center gap-1 rounded-full bg-cupid-100 px-2 py-0.5 text-[11px] font-medium text-cupid-600">
            <Heart size={11} fill="currentColor" /> Single
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {onMatchmake && friend.isSingle && (
          <button
            onClick={() => onMatchmake(friend)}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-cupid-500 to-indigoSoft-500 px-3 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            <Sparkles size={15} /> Matchmake
          </button>
        )}
        <button
          onClick={() => toggleSingle(friend.id)}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
          title={friend.isSingle ? "Mark as taken" : "Mark as single"}
        >
          {friend.isSingle ? <HeartOff size={15} /> : <Heart size={15} />}
          <span className="hidden sm:inline">
            {friend.isSingle ? "Taken" : "Single"}
          </span>
        </button>
        <button
          onClick={() => setEditOpen(true)}
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 p-2 text-slate-400 transition-colors hover:border-cupid-200 hover:bg-cupid-50 hover:text-cupid-500"
          title="Edit friend"
          aria-label={`Edit ${friend.name}`}
        >
          <Pencil size={15} />
        </button>
        <button
          onClick={() => removeFriend(friend.id)}
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 p-2 text-slate-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-500"
          title="Remove friend"
          aria-label={`Remove ${friend.name}`}
        >
          <Trash2 size={15} />
        </button>
      </div>

      <AddFriendModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSubmit={(patch) => updateFriend(friend.id, patch)}
        initial={editInitial}
        title={`Edit ${friend.name}`}
        submitLabel="Save changes"
      />
    </div>
  );
}
