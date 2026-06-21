// Core domain types for CupidList.
// These are intentionally backend-agnostic so the same shapes can be served
// from Local Storage today or a Supabase table tomorrow.

export type Platform = "instagram" | "facebook" | "whatsapp" | "linkedin" | "manual";

export type Gender = "male" | "female" | "nonbinary" | "unspecified";

/** Who a friend is interested in being matched with. */
export type Preference = "men" | "women" | "everyone" | "unspecified";

export interface Friend {
  id: string;
  name: string;
  source: Platform;
  /** Optional Instagram handle, stored without the leading "@". */
  instagramHandle?: string;
  /** Optional LinkedIn profile URL (populated by the Connections.csv import). */
  linkedinUrl?: string;
  /** Optional headline/role, e.g. "Designer at Acme" (from LinkedIn import). */
  headline?: string;
  isSingle: boolean;
  gender: Gender;
  preference: Preference;
  /** Epoch milliseconds. */
  createdAt: number;
}

export interface Match {
  id: string;
  // We snapshot names/handles so history stays readable even if a friend is
  // later edited or removed.
  friendAId: string;
  friendAName: string;
  friendAHandle?: string;
  friendBId: string;
  friendBName: string;
  message: string;
  createdAt: number;
}

/** Shape used by the "Add Friend" form before an id/createdAt is assigned. */
export type NewFriendInput = Omit<Friend, "id" | "createdAt">;
