import type { Friend, Match } from "./types";

/**
 * Data layer abstraction.
 *
 * The rest of the app talks to this `DataStore` interface only — it never reads
 * Local Storage directly. To move to Supabase later, implement this same
 * interface with async Supabase queries (see `SupabaseStore` sketch below) and
 * swap the `getStore()` factory. The React context already awaits every call,
 * so a network-backed implementation drops in without component changes.
 */
export interface DataStore {
  getFriends(): Promise<Friend[]>;
  saveFriends(friends: Friend[]): Promise<void>;
  getMatches(): Promise<Match[]>;
  saveMatches(matches: Match[]): Promise<void>;
}

const FRIENDS_KEY = "cupidlist.friends.v1";
const MATCHES_KEY = "cupidlist.matches.v1";

/** Local Storage implementation — the default for the self-contained MVP. */
class LocalStorageStore implements DataStore {
  private read<T>(key: string): T[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T[]) : [];
    } catch {
      return [];
    }
  }

  private write<T>(key: string, value: T[]): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, JSON.stringify(value));
  }

  async getFriends(): Promise<Friend[]> {
    return this.read<Friend>(FRIENDS_KEY);
  }

  async saveFriends(friends: Friend[]): Promise<void> {
    this.write(FRIENDS_KEY, friends);
  }

  async getMatches(): Promise<Match[]> {
    return this.read<Match>(MATCHES_KEY);
  }

  async saveMatches(matches: Match[]): Promise<void> {
    this.write(MATCHES_KEY, matches);
  }
}

/*
 * --- Future: Supabase implementation ---------------------------------------
 * Drop-in replacement once a backend is wired up:
 *
 * class SupabaseStore implements DataStore {
 *   constructor(private client: SupabaseClient) {}
 *   async getFriends() {
 *     const { data } = await this.client.from("friends").select("*");
 *     return data ?? [];
 *   }
 *   // ...upsert/delete equivalents for the rest
 * }
 *
 * Then: export function getStore() { return new SupabaseStore(supabase); }
 * ---------------------------------------------------------------------------
 */

let store: DataStore | null = null;

export function getStore(): DataStore {
  if (!store) {
    store = new LocalStorageStore();
  }
  return store;
}
