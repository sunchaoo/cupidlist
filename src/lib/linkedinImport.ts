import type { NewFriendInput } from "./types";

/** One parsed row from a LinkedIn Connections.csv export. */
export interface LinkedInConnection {
  firstName: string;
  lastName: string;
  name: string;
  url?: string;
  email?: string;
  company?: string;
  position?: string;
  connectedOn?: string;
}

/**
 * Full CSV tokenizer (RFC-4180-ish): handles quoted fields, escaped quotes
 * (""), and commas/newlines inside quotes. Returns rows of string cells.
 */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  // Normalize newlines.
  const s = text.replace(/\r\n?/g, "\n");

  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inQuotes) {
      if (c === '"') {
        if (s[i + 1] === '"') {
          field += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += c;
    }
  }
  // Flush trailing field/row.
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/** Case/space-insensitive header lookup. */
function indexOfHeader(header: string[], name: string): number {
  const target = name.toLowerCase().trim();
  return header.findIndex((h) => h.toLowerCase().trim() === target);
}

/**
 * Parse the raw text of a LinkedIn `Connections.csv`.
 *
 * LinkedIn prepends a "Notes:" preamble (a few lines) before the real header
 * row, so we scan for the row that actually contains "First Name"/"Last Name".
 */
export function parseLinkedInConnections(text: string): LinkedInConnection[] {
  const rows = parseCsv(text);
  if (!rows.length) return [];

  // Find the header row.
  const headerIdx = rows.findIndex(
    (r) =>
      indexOfHeader(r, "First Name") !== -1 &&
      indexOfHeader(r, "Last Name") !== -1
  );
  if (headerIdx === -1) return [];

  const header = rows[headerIdx];
  const col = {
    first: indexOfHeader(header, "First Name"),
    last: indexOfHeader(header, "Last Name"),
    url: indexOfHeader(header, "URL"),
    email: indexOfHeader(header, "Email Address"),
    company: indexOfHeader(header, "Company"),
    position: indexOfHeader(header, "Position"),
    connected: indexOfHeader(header, "Connected On"),
  };

  const out: LinkedInConnection[] = [];
  for (let i = headerIdx + 1; i < rows.length; i++) {
    const r = rows[i];
    const cell = (idx: number) => (idx >= 0 ? (r[idx] ?? "").trim() : "");
    const firstName = cell(col.first);
    const lastName = cell(col.last);
    const name = `${firstName} ${lastName}`.trim();
    if (!name) continue; // skip blank/garbage rows
    out.push({
      firstName,
      lastName,
      name,
      url: cell(col.url) || undefined,
      email: cell(col.email) || undefined,
      company: cell(col.company) || undefined,
      position: cell(col.position) || undefined,
      connectedOn: cell(col.connected) || undefined,
    });
  }
  return out;
}

/** Human-friendly headline from a connection's role + company. */
export function connectionHeadline(c: LinkedInConnection): string | undefined {
  if (c.position && c.company) return `${c.position} at ${c.company}`;
  return c.position || c.company || undefined;
}

/** Convert a selected connection into a Friend draft. */
export function connectionToFriend(c: LinkedInConnection): NewFriendInput {
  return {
    name: c.name,
    source: "linkedin",
    linkedinUrl: c.url,
    headline: connectionHeadline(c),
    instagramHandle: undefined,
    isSingle: false,
    gender: "unspecified",
    preference: "unspecified",
  };
}
