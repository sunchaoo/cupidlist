"use client";

import { useMemo, useRef, useState } from "react";
import {
  CheckSquare,
  ExternalLink,
  FileUp,
  Linkedin,
  Square,
  Sparkles,
} from "lucide-react";
import {
  connectionToFriend,
  parseLinkedInConnections,
  type LinkedInConnection,
} from "@/lib/linkedinImport";
import { useFriends } from "@/context/FriendsContext";
import { Modal } from "./Modal";
import { Avatar } from "./Avatar";

// LinkedIn's "Get a copy of your data" page — request the "Connections" file.
const LINKEDIN_EXPORT_URL =
  "https://www.linkedin.com/mypreferences/d/download-my-data";

// A few sample connections so the flow is testable without a real export.
const DEMO_CONNECTIONS: LinkedInConnection[] = [
  { firstName: "Maya", lastName: "Patel", name: "Maya Patel", company: "Figma", position: "Product Designer", url: "https://linkedin.com/in/mayapatel" },
  { firstName: "Diego", lastName: "Romero", name: "Diego Romero", company: "Stripe", position: "Software Engineer", url: "https://linkedin.com/in/diegoromero" },
  { firstName: "Priya", lastName: "Nair", name: "Priya Nair", company: "Canva", position: "Illustrator", url: "https://linkedin.com/in/priyanair" },
  { firstName: "Jordan", lastName: "Lee", name: "Jordan Lee", company: "Notion", position: "Content Strategist", url: "https://linkedin.com/in/jordanlee" },
  { firstName: "Sofia", lastName: "Marchetti", name: "Sofia Marchetti", company: "Spotify", position: "Data Analyst", url: "https://linkedin.com/in/sofiamarchetti" },
  { firstName: "Liam", lastName: "O'Connor", name: "Liam O'Connor", company: "Airbnb", position: "Product Manager", url: "https://linkedin.com/in/liamoconnor" },
  { firstName: "Aisha", lastName: "Mohammed", name: "Aisha Mohammed", company: "Adobe", position: "UX Researcher", url: "https://linkedin.com/in/aishamohammed" },
];

export function ImportConnectionsModal({
  open,
  onClose,
  onImported,
}: {
  open: boolean;
  onClose: () => void;
  onImported: (count: number) => void;
}) {
  const { importFriends } = useFriends();
  const [connections, setConnections] = useState<LinkedInConnection[] | null>(
    null
  );
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setConnections(null);
    setSelected(new Set());
    setError(null);
    setFileName(null);
    setDragging(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function loadConnections(list: LinkedInConnection[], name: string | null) {
    if (!list.length) {
      setError(
        "Couldn't find any connections in that file. Make sure it's the Connections.csv from LinkedIn's data export."
      );
      return;
    }
    setError(null);
    setFileName(name);
    setConnections(list);
    setSelected(new Set(list.map((_, i) => i))); // select all by default
  }

  async function handleFile(file: File) {
    try {
      const text = await file.text();
      loadConnections(parseLinkedInConnections(text), file.name);
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
    () => connections != null && selected.size === connections.length,
    [connections, selected]
  );

  function toggleAll() {
    if (!connections) return;
    setSelected(
      allSelected ? new Set() : new Set(connections.map((_, i) => i))
    );
  }

  function doImport() {
    if (!connections) return;
    const chosen = connections.filter((_, i) => selected.has(i));
    const added = importFriends(chosen.map(connectionToFriend));
    onImported(added);
    handleClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title="Import LinkedIn connections">
      {!connections ? (
        // ---------- Step 1: get + upload the file ----------
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl bg-sky-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-sky-800">
              <Linkedin size={18} />
              <span className="text-sm font-semibold">Step 1 — get your file</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-600">
              Open LinkedIn&apos;s data export, tick{" "}
              <span className="font-medium">&ldquo;Connections&rdquo;</span>, and
              request it. LinkedIn emails you a{" "}
              <code className="rounded bg-white px-1 py-0.5 text-xs">
                Connections.csv
              </code>{" "}
              in about 10 minutes.
            </p>
            <a
              href={LINKEDIN_EXPORT_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-sky-700 px-3.5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sky-800"
            >
              <ExternalLink size={15} /> Open LinkedIn export page
            </a>
          </div>

          <div>
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <FileUp size={16} /> Step 2 — drop your file here
            </p>
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
                Drag &amp; drop your Connections.csv
              </p>
              <p className="text-xs text-slate-400">or click to choose a file</p>
              <input
                ref={inputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleFile(f);
                }}
              />
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-500">{error}</p>
            )}
          </div>

          <button
            onClick={() => loadConnections(DEMO_CONNECTIONS, null)}
            className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-slate-400 transition-colors hover:text-cupid-500"
          >
            <Sparkles size={14} /> No file yet? Load demo connections to try it
          </button>
        </div>
      ) : (
        // ---------- Step 3: review + select + import ----------
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              {fileName ? (
                <>
                  Found{" "}
                  <span className="font-semibold text-slate-700">
                    {connections.length}
                  </span>{" "}
                  connections in {fileName}
                </>
              ) : (
                <>
                  <span className="font-semibold text-slate-700">
                    {connections.length}
                  </span>{" "}
                  demo connections
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
            {connections.map((c, i) => {
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
                      {(c.position || c.company) && (
                        <span className="block truncate text-xs text-slate-400">
                          {[c.position, c.company].filter(Boolean).join(" · ")}
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
