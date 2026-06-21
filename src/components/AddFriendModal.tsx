"use client";

import { useEffect, useState } from "react";
import type {
  Gender,
  NewFriendInput,
  Platform,
  Preference,
} from "@/lib/types";
import { Modal } from "./Modal";

const PLATFORMS: { value: Platform; label: string }[] = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "manual", label: "Manual" },
];

const GENDERS: { value: Gender; label: string }[] = [
  { value: "unspecified", label: "Prefer not to say" },
  { value: "female", label: "Woman" },
  { value: "male", label: "Man" },
  { value: "nonbinary", label: "Non-binary" },
];

const PREFERENCES: { value: Preference; label: string }[] = [
  { value: "unspecified", label: "Not sure" },
  { value: "men", label: "Interested in men" },
  { value: "women", label: "Interested in women" },
  { value: "everyone", label: "Open to everyone" },
];

const EMPTY: NewFriendInput = {
  name: "",
  source: "instagram",
  instagramHandle: "",
  isSingle: true,
  gender: "unspecified",
  preference: "unspecified",
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition-colors focus:border-cupid-400 focus:ring-2 focus:ring-cupid-100";
const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";

export function AddFriendModal({
  open,
  onClose,
  onSubmit,
  initial = null,
  title = "Add a friend",
  submitLabel = "Add friend",
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (friend: NewFriendInput) => void;
  /** When provided, the form opens pre-filled for editing. */
  initial?: NewFriendInput | null;
  title?: string;
  submitLabel?: string;
}) {
  const [form, setForm] = useState<NewFriendInput>(initial ?? EMPTY);

  // Re-seed the form whenever the modal opens (so edit shows current values
  // and add starts blank).
  useEffect(() => {
    if (open) setForm(initial ?? EMPTY);
  }, [open, initial]);

  function update<K extends keyof NewFriendInput>(
    key: K,
    value: NewFriendInput[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSubmit({
      ...form,
      name: form.name.trim(),
      instagramHandle: form.instagramHandle?.replace(/^@+/, "").trim() || undefined,
    });
    setForm(EMPTY);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className={labelClass} htmlFor="name">
            Name
          </label>
          <input
            id="name"
            className={inputClass}
            placeholder="e.g. Maya Patel"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            autoFocus
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="source">
              Platform source
            </label>
            <select
              id="source"
              className={inputClass}
              value={form.source}
              onChange={(e) => update("source", e.target.value as Platform)}
            >
              {PLATFORMS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="handle">
              Instagram handle
            </label>
            <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3 focus-within:border-cupid-400 focus-within:ring-2 focus-within:ring-cupid-100">
              <span className="text-sm text-slate-400">@</span>
              <input
                id="handle"
                className="w-full bg-transparent py-2.5 pl-1 text-sm text-slate-800 outline-none"
                placeholder="optional"
                value={form.instagramHandle ?? ""}
                onChange={(e) => update("instagramHandle", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="gender">
              Gender
            </label>
            <select
              id="gender"
              className={inputClass}
              value={form.gender}
              onChange={(e) => update("gender", e.target.value as Gender)}
            >
              {GENDERS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="preference">
              Looking for
            </label>
            <select
              id="preference"
              className={inputClass}
              value={form.preference}
              onChange={(e) =>
                update("preference", e.target.value as Preference)
              }
            >
              {PREFERENCES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label className="flex cursor-pointer items-center justify-between rounded-xl bg-cupid-50 px-4 py-3">
          <span className="text-sm font-medium text-slate-700">
            Is single? 💘
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={form.isSingle}
            onClick={() => update("isSingle", !form.isSingle)}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              form.isSingle ? "bg-cupid-500" : "bg-slate-300"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                form.isSingle ? "left-[22px]" : "left-0.5"
              }`}
            />
          </button>
        </label>

        <button
          type="submit"
          className="mt-1 w-full rounded-xl bg-gradient-to-r from-cupid-500 to-indigoSoft-500 px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          {submitLabel}
        </button>
      </form>
    </Modal>
  );
}
