"use client";

import { useMemo, useRef, useState } from "react";
import {
  Apple,
  CheckSquare,
  ExternalLink,
  FileUp,
  Linkedin,
  Square,
  Sparkles,
} from "lucide-react";
import type { NewFriendInput } from "@/lib/types";
import {
  connectionToFriend,
  parseLinkedInConnections,
} from "@/lib/linkedinImport";
import {
  contactSubtitle,
  parseVCards,
  vcardToFriend,
} from "@/lib/vcardImport";
import { useFriends } from "@/context/FriendsContext";
import { Modal } from "./Modal";
import { Avatar } from "./Avatar";

// A source-agnostic row the review list renders and imports.
interface Candidate {
  name: string;
  subtitle?: string;
  friend: NewFriendInput;
}

type SourceId = "linkedin" | "vcard";

interface SourceDef {
  id: SourceId;
  label: string;
  icon: React.ReactNode;
  accept: string;
  parse: (text: string) => Candidate[];
  demo: Candidate[];
}

const LINKEDIN: SourceDef = {
  id: "linkedin",
  label: "LinkedIn",
  icon: <Linkedin size={15} />,
  accept: ".csv,text/csv",
  parse: (text) =>
    parseLinkedInConnections(text).map((c) => ({
      name: c.name,
      subtitle: [c.position, c.company].filter(Boolean).join(" · ") || undefined,
      friend: connectionToFriend(c),
    })),
  demo: [
    { firstName: "Maya", company: "Figma", position: "Product Designer" },
    { firstName: "Diego", company: "Stripe", position: "Software Engineer" },
    { firstName: "Priya", company: "Canva", position: "Illustrator" },
    { firstName: "Jordan", company: "Notion", position: "Content Strategist" },
  ].map((d) => {
    const c = {
      firstName: d.firstName,
      lastName: "",
      name: d.firstName,
      company: d.company,
      position: d.position,
    };
    return {
      name: c.name,
      subtitle: `${d.position} · ${d.company}`,
      friend: connectionToFriend(c),
    };
  }),
};

const VCARD: SourceDef = {
  id: "vcard",
  label: "Apple / Phone",
  icon: <Apple size={15} />,
  accept: ".vcf,.vcard,text/vcard",
  parse: (text) =>
    parseVCards(text).map((c) => ({
      name: c.name,
      subtitle: contactSubtitle(c),
      friend: vcardToFriend(c),
    })),
  demo: [
    { name: "Alex Rivera", phone: "+1 415 555 0148" },
    { name: "Sam Chen", phone: "+1 415 555 0192" },
    { name: "Noor Hassan", phone: "+44 7700 900321" },
    { name: "Taylor Brooks", phone: "+1 415 555 0177" },
  ].map((c) => ({
    name: c.name,
    subtitle: c.phone,
    friend: vcardToFriend(c),
  })),
};

const SOURCES: SourceDef[] = [LINKEDIN, VCARD];

export function ImportContactsModal({
  open,
  onClose,
  onImported,
}: {
  open: boolean;
  onClose: () => void;
  onImported: (count: number) => void;
}) {
  const { importFriends } = useFriends();
  const [source, setSource] = useState<SourceDef>(LINKEDIN);
  const [candidates, setCandidates] = useState<Candidate[] | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setCandidates(null);
    setSelected(new Set());
    setError(null);
    setFileName(null);
    setDragging(false);
  }

  function handleClose() {
    reset();
    setSource(LINKEDIN);
    onClose();
  }

  function loadCandidates(list: Candidate[], name: string | null) {
    if (!list.length) {
      setError(
        `Couldn't find any contacts in that file. Make sure it's a ${
          source.id === "linkedin" ? "LinkedIn Connections.csv" : "vCard (.vcf)"
        } export.`
      );
      return;
    }
    setError(null);
    setFileName(name);
    setCandidates(list);
    setSelected(new Set(list.map((_, i) => i)));
  }

  async function handleFile(file: File) {
    try {
      const text = await file.text();
      loadCandidates(source.parse(text), file.name);
    } catch {
      setError("Sorry, that file couldn't be read. Please try again.");
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  }

  function toggle(i: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  const allSelected = useMemo(
    () => candidates != null && selected.size === candidates.length,
    [candidates, selected]
  );

  function toggleAll() {
    if (!candidates) return;
    setSelected(allSelected ? new Set() : new Set(candidates.map((_, i) => i)));
  }

  function doImport() {
    if (!candidates) return;
    const chosen = candidates.filter((_, i) => selected.has(i));
    const added = importFriends(chosen.map((c) => c.friend));
    onImported(added);
    handleClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title="Import contacts">
      {!candidates ? (
        <div className="flex flex-col gap-4">
          {/* Source picker */}
          <div className="flex gap-2">
            {SOURCES.map((s) => {
              const active = s.id === source.id;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    setSource(s);
                    setError(null);
                  }}
                  className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "border-cupid-300 bg-cupid-50 text-cupid-700"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {s.icon} {s.label}
                </button>
              );
            })}
          </div>

          {/* Source-specific guidance */}
          {source.id === "linkedin" ? (
            <div className="rounded-2xl bg-sky-50 p-4">
              <p className="text-sm leading-relaxed text-slate-600">
                Open LinkedIn&apos;s data export, tick{" "}
                <span className="font-medium">&ldquo;Connections&rdquo;</span>,
                and request it. You&apos;ll get a{" "}
                <code className="rounded bg-white px-1 py-0.5 text-xs">
                  Connections.csv
                </code>{" "}
                by email in ~10 min.
              </p>
              <a
                href="https://www.linkedin.com/mypreferences/d/download-my-data"
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-sky-700 px-3.5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sky-800"
              >
                <ExternalLink size={15} /> Open LinkedIn export page
              </a>
            </div>
          ) : (
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm leading-relaxed text-slate-600">
                Export your contacts as a{" "}
                <span className="font-medium">vCard (.vcf)</span> and drop it
                below:
              </p>
              <ul className="mt-2 list-disc pl-5 text-xs leading-relaxed text-slate-500">
                <li>
                  <span className="font-medium">Mac:</span> Contacts app → select
                  all → File → Export → Export vCard.
                </li>
                <li>
                  <span className="font-medium">iPhone:</span> iCloud.com →
                  Contacts → select → Export vCard.
                </li>
              </ul>
              <p className="mt-2 text-xs text-slate-400">
                This also covers your WhatsApp contacts — WhatsApp uses your
                phone&apos;s address book.
              </p>
            </div>
          )}

          {/* Drop zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-colors ${
              dragging
                ? "border-cupid-400 bg-cupid-50"
                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <FileUp size={24} className="mb-2 text-slate-400" />
            <p className="text-sm font-medium text-slate-700">
              Drag &amp; drop your {source.id === "linkedin" ? "CSV" : "vCard"}
            </p>
            <p className="text-xs text-slate-400">or click to choose a file</p>
            <input
              ref={inputRef}
              type="file"
              accept={source.accept}
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleFile(f);
              }}
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            onClick={() => loadCandidates(source.demo, null)}
            className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-slate-400 transition-colors hover:text-cupid-500"
          >
            <Sparkles size={14} /> No file yet? Load demo contacts to try it
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              {fileName ? (
                <>
                  Found{" "}
                  <span className="font-semibold text-slate-700">
                    {candidates.length}
                  </span>{" "}
                  contacts in {fileName}
                </>
              ) : (
                <>
                  <span className="font-semibold text-slate-700">
                    {candidates.length}
                  </span>{" "}
                  demo contacts
                </>
              )}
            </p>
            <button
              onClick={toggleAll}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-cupid-600 hover:text-cupid-700"
            >
              {allSelected ? <CheckSquare size={15} /> : <Square size={15} />}
              {allSelected ? "Deselect all" : "Select all"}
            </button>
          </div>

          <ul className="flex max-h-72 flex-col gap-1.5 overflow-y-auto pr-1">
            {candidates.map((c, i) => {
              const on = selected.has(i);
              return (
                <li key={i}>
                  <button
                    onClick={() => toggle(i)}
                    className={`flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition-colors ${
                      on
                        ? "border-cupid-200 bg-cupid-50"
                        : "border-slate-100 hover:bg-slate-50"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                        on
                          ? "border-cupid-500 bg-cupid-500 text-white"
                          : "border-slate-300"
                      }`}
                    >
                      {on && <CheckSquare size={12} />}
                    </span>
                    <Avatar name={c.name} size={36} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-800">
                        {c.name}
                      </span>
                      {c.subtitle && (
                        <span className="block truncate text-xs text-slate-400">
                          {c.subtitle}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={reset}
              className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Back
            </button>
            <button
              onClick={doImport}
              disabled={selected.size === 0}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-cupid-500 to-indigoSoft-500 px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Import {selected.size} {selected.size === 1 ? "person" : "people"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
