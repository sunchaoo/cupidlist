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

/**
 * Cloud implementation — used when the user is signed in and cloud sync is
 * enabled. Talks to our `/api/data` route, which authenticates the request and
 * scopes every read/write to the signed-in user (data follows them across
 * devices). The browser never touches Supabase directly.
 */
class ApiStore implements DataStore {
  // One in-flight GET is shared between getFriends/getMatches and cleared on
  // any save, so the initial hydrate hits the network once, not twice.
  private cache: Promise<{ friends: Friend[]; matches: Match[] }> | null = null;

  private fetchData() {
    if (!this.cache) {
      this.cache = fetch("/api/data", { cache: "no-store" })
        .then(async (r) => {
          if (!r.ok) throw new Error(`load failed: ${r.status}`);
          return (await r.json()) as { friends: Friend[]; matches: Match[] };
        })
        .catch((e) => {
          this.cache = null; // allow retry on next call
          throw e;
        });
    }
    return this.cache;
  }

  private async save(body: { friends?: Friend[]; matches?: Match[] }) {
    this.cache = null;
    const r = await fetch("/api/data", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error(`save failed: ${r.status}`);
  }

  async getFriends(): Promise<Friend[]> {
    return (await this.fetchData()).friends;
  }
  async getMatches(): Promise<Match[]> {
    return (await this.fetchData()).matches;
  }
  async saveFriends(friends: Friend[]): Promise<void> {
    await this.save({ friends });
  }
  async saveMatches(matches: Match[]): Promise<void> {
    await this.save({ matches });
  }
}

/** True when the deploy is configured for per-user cloud sync. */
export function cloudSyncEnabled(): boolean {
  return process.env.NEXT_PUBLIC_CLOUD_SYNC === "true";
}

let localStore: DataStore | null = null;
let apiStore: DataStore | null = null;

/**
 * Pick the data store. When `authenticated` (and cloud sync is enabled) we use
 * the per-user cloud store; otherwise we fall back to browser Local Storage so
 * the guest/demo experience keeps working with zero setup.
 */
export function getStore(authenticated = false): DataStore {
  if (authenticated && cloudSyncEnabled()) {
    if (!apiStore) apiStore = new ApiStore();
    return apiStore;
  }
  if (!localStore) localStore = new LocalStorageStore();
  return localStore;
}
