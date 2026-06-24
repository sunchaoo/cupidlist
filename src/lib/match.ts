import type { Friend } from "./types";

/** Normalize a handle for display, ensuring a single leading "@". */
export function formatHandle(handle?: string): string {
  if (!handle) return "";
  const clean = handle.replace(/^@+/, "").trim();
  return clean ? `@${clean}` : "";
}

/**
 * Build the friendly, pre-written introduction message.
 * `friendA` is the person being introduced; `friendB` is the recipient.
 */
export function buildMatchMessage(friendA: Friend, friendB: Friend): string {
  const handle = formatHandle(friendA.instagramHandle);
  const igLine = handle
    ? ` Here's their Instagram: ${handle}.`
    : "";
  return (
    `Hey ${friendB.name}, I think you'd really get along with my friend ${friendA.name}!` +
    `${igLine} You two should chat! 💘`
  );
}

/**
 * Encode the message into a WhatsApp deep link (wa.me). If a phone number is
 * known (e.g. from a vCard import), target that person directly; otherwise open
 * WhatsApp's share sheet so the user can pick a recipient.
 */
export function whatsappShareUrl(message: string, phone?: string): string {
  const digits = phone?.replace(/\D/g, "");
  const base = digits ? `https://wa.me/${digits}` : "https://wa.me/";
  return `${base}?text=${encodeURIComponent(message)}`;
}

/** Open the recipient's Instagram DM thread (best-effort deep link). */
export function instagramDirectUrl(friendB: Friend): string {
  const handle = friendB.instagramHandle?.replace(/^@+/, "").trim();
  return handle
    ? `https://ig.me/m/${handle}`
    : "https://www.instagram.com/direct/inbox/";
}

/**
 * Friends compatible with `friendA` as introduction targets.
 * For MVP this is a light preference filter: must be single, not the same
 * person, and preferences must not obviously conflict. If preferences are
 * unspecified we stay permissive.
 */
export function compatibleTargets(friendA: Friend, all: Friend[]): Friend[] {
  return all.filter((f) => {
    if (f.id === friendA.id) return false;
    if (!f.isSingle) return false;
    return preferencesCompatible(friendA, f);
  });
}

function preferencesCompatible(a: Friend, b: Friend): boolean {
  return aWantsB(a, b) && aWantsB(b, a);
}

/** Does `a`'s stated preference include `b`'s gender? Permissive on unknowns. */
function aWantsB(a: Friend, b: Friend): boolean {
  if (a.preference === "unspecified" || a.preference === "everyone") return true;
  if (b.gender === "unspecified" || b.gender === "nonbinary") return true;
  if (a.preference === "men") return b.gender === "male";
  if (a.preference === "women") return b.gender === "female";
  return true;
}
