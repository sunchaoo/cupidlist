import type { NewFriendInput } from "./types";

/** One parsed contact from a vCard (.vcf) file. */
export interface VCardContact {
  name: string;
  phone?: string;
  email?: string;
  org?: string;
  title?: string;
}

/** Unescape a vCard text value (\, \; \n etc.). */
function unescape(v: string): string {
  return v
    .replace(/\\n/gi, " ")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\")
    .trim();
}

/**
 * Parse the raw text of a vCard (.vcf) export — works for files from the macOS
 * Contacts app, iCloud, Google Contacts, and phone exports (which is also how
 * WhatsApp contacts come across, since WhatsApp uses the phone's address book).
 *
 * Handles multiple VCARD blocks and RFC-2425 line folding (continuation lines
 * that begin with a space or tab).
 */
export function parseVCards(text: string): VCardContact[] {
  // Unfold: join continuation lines (leading space/tab) onto the previous line.
  const raw = text.replace(/\r\n?/g, "\n");
  const unfolded = raw.replace(/\n[ \t]/g, "");
  const lines = unfolded.split("\n");

  const contacts: VCardContact[] = [];
  let cur: Partial<VCardContact> & { nameFromN?: string } = {};
  let inCard = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^BEGIN:VCARD$/i.test(trimmed)) {
      cur = {};
      inCard = true;
      continue;
    }
    if (/^END:VCARD$/i.test(trimmed)) {
      const name = (cur.name || cur.nameFromN || "").trim();
      if (name) {
        contacts.push({
          name,
          phone: cur.phone,
          email: cur.email,
          org: cur.org,
          title: cur.title,
        });
      }
      inCard = false;
      continue;
    }
    if (!inCard) continue;

    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const rawKey = line.slice(0, colon);
    const value = line.slice(colon + 1);
    // Property name is before any ";" params, ignoring any "group." prefix.
    const prop = rawKey.split(";")[0].split(".").pop()!.toUpperCase();

    switch (prop) {
      case "FN":
        cur.name = unescape(value);
        break;
      case "N":
        if (!cur.nameFromN) {
          // N is Family;Given;Additional;Prefix;Suffix
          const [family = "", given = ""] = value.split(";").map(unescape);
          cur.nameFromN = `${given} ${family}`.trim();
        }
        break;
      case "TEL":
        if (!cur.phone) cur.phone = unescape(value);
        break;
      case "EMAIL":
        if (!cur.email) cur.email = unescape(value);
        break;
      case "ORG":
        if (!cur.org) cur.org = unescape(value).replace(/;+$/, "");
        break;
      case "TITLE":
        if (!cur.title) cur.title = unescape(value);
        break;
    }
  }
  return contacts;
}

/** Human-friendly subtitle for a contact (role/company, else phone). */
export function contactSubtitle(c: VCardContact): string | undefined {
  if (c.title && c.org) return `${c.title} · ${c.org}`;
  return c.title || c.org || c.phone || c.email || undefined;
}

/** Convert a selected vCard contact into a Friend draft. */
export function vcardToFriend(c: VCardContact): NewFriendInput {
  const headline =
    c.title && c.org ? `${c.title} at ${c.org}` : c.title || c.org || undefined;
  return {
    name: c.name,
    source: "apple",
    phone: c.phone,
    headline,
    instagramHandle: undefined,
    isSingle: false,
    gender: "unspecified",
    preference: "unspecified",
  };
}
