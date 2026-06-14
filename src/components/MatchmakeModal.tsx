"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  Copy,
  Heart,
  MessageCircle,
  Send,
} from "lucide-react";
import type { Friend } from "@/lib/types";
import {
  buildMatchMessage,
  compatibleTargets,
  formatHandle,
  instagramDirectUrl,
  whatsappShareUrl,
} from "@/lib/match";
import { useFriends } from "@/context/FriendsContext";
import { Modal } from "./Modal";
import { Avatar } from "./Avatar";
import { PlatformIcon } from "./PlatformIcon";

export function MatchmakeModal({
  friendA,
  onClose,
}: {
  friendA: Friend | null;
  onClose: () => void;
}) {
  const { friends, recordMatch } = useFriends();
  const [target, setTarget] = useState<Friend | null>(null);
  const [copied, setCopied] = useState(false);

  const candidates = useMemo(
    () => (friendA ? compatibleTargets(friendA, friends) : []),
    [friendA, friends]
  );

  const message = useMemo(
    () => (friendA && target ? buildMatchMessage(friendA, target) : ""),
    [friendA, target]
  );

  function reset() {
    setTarget(null);
    setCopied(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function pickTarget(t: Friend) {
    setTarget(t);
    setCopied(false);
    if (friendA) {
      recordMatch({
        friendAId: friendA.id,
        friendAName: friendA.name,
        friendAHandle: friendA.instagramHandle,
        friendBId: t.id,
        friendBName: t.name,
        message: buildMatchMessage(friendA, t),
      });
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(message);
    } catch {
      // Fallback for older/non-secure contexts.
      const ta = document.createElement("textarea");
      ta.value = message;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!friendA) return null;

  return (
    <Modal
      open={!!friendA}
      onClose={handleClose}
      title={target ? "Your match card" : `Matchmake ${friendA.name}`}
    >
      {!target ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-slate-500">
            Who do you want to introduce{" "}
            <span className="font-semibold text-slate-700">
              {friendA.name}
            </span>{" "}
            to?
          </p>

          {candidates.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              No other compatible single friends yet. Mark a few more friends as
              single to start matchmaking!
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {candidates.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => pickTarget(c)}
                    className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 text-left transition-colors hover:border-cupid-200 hover:bg-cupid-50"
                  >
                    <Avatar name={c.name} size={40} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium text-slate-800">
                          {c.name}
                        </span>
                        <PlatformIcon platform={c.source} />
                      </div>
                      <span className="text-xs text-slate-400">
                        {formatHandle(c.instagramHandle) || "No handle"}
                      </span>
                    </div>
                    <Heart size={16} className="text-cupid-400" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Shareable match card */}
          <div className="rounded-3xl bg-gradient-to-br from-cupid-50 to-indigoSoft-50 p-5">
            <div className="mb-4 flex items-center justify-center gap-3">
              <Avatar name={friendA.name} size={52} />
              <Heart
                size={22}
                className="text-cupid-500"
                fill="currentColor"
              />
              <Avatar name={target.name} size={52} />
            </div>
            <div className="rounded-2xl bg-white p-4 text-sm leading-relaxed text-slate-700 shadow-sm">
              {message}
            </div>
            <p className="mt-3 text-center text-xs text-slate-400">
              Introducing {friendA.name} → {target.name}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={copy}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-900"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Copied!" : "Copy to clipboard"}
            </button>
            <div className="grid grid-cols-2 gap-2">
              <a
                href={whatsappShareUrl(message)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                <MessageCircle size={16} /> WhatsApp
              </a>
              <a
                href={instagramDirectUrl(target)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-cupid-500 px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                <Send size={16} /> IG DM
              </a>
            </div>
          </div>

          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            <ArrowLeft size={15} /> Pick someone else
          </button>
        </div>
      )}
    </Modal>
  );
}
