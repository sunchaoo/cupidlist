import type { Friend, NewFriendInput } from "./types";

/**
 * Realistic dummy friends used by the "Import from Instagram/WhatsApp" button.
 * These are returned as NewFriendInput so the storage layer assigns ids and
 * timestamps consistently.
 */
export const MOCK_IMPORT_FRIENDS: NewFriendInput[] = [
  {
    name: "Maya Patel",
    source: "instagram",
    instagramHandle: "maya.wanders",
    isSingle: true,
    gender: "female",
    preference: "men",
  },
  {
    name: "Diego Romero",
    source: "instagram",
    instagramHandle: "diego.r",
    isSingle: true,
    gender: "male",
    preference: "women",
  },
  {
    name: "Priya Nair",
    source: "whatsapp",
    instagramHandle: "priya.creates",
    isSingle: true,
    gender: "female",
    preference: "everyone",
  },
  {
    name: "Jordan Lee",
    source: "instagram",
    instagramHandle: "jordan.eats",
    isSingle: true,
    gender: "nonbinary",
    preference: "everyone",
  },
  {
    name: "Sofia Marchetti",
    source: "facebook",
    instagramHandle: "sofia.m",
    isSingle: true,
    gender: "female",
    preference: "men",
  },
  {
    name: "Liam O'Connor",
    source: "whatsapp",
    instagramHandle: "liam.climbs",
    isSingle: true,
    gender: "male",
    preference: "women",
  },
  {
    name: "Aisha Mohammed",
    source: "instagram",
    instagramHandle: "aisha.designs",
    isSingle: false,
    gender: "female",
    preference: "men",
  },
  {
    name: "Tom Becker",
    source: "facebook",
    instagramHandle: "tom.b.photo",
    isSingle: true,
    gender: "male",
    preference: "everyone",
  },
];

/** Stable-ish id generator that works without extra deps. */
export function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function withGeneratedFields(input: NewFriendInput): Friend {
  return {
    ...input,
    id: createId(),
    createdAt: Date.now(),
  };
}
