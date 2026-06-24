"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSession } from "next-auth/react";
import type { Friend, Match, NewFriendInput } from "@/lib/types";
import { cloudSyncEnabled, getStore } from "@/lib/storage";
import {
  MOCK_IMPORT_FRIENDS,
  createId,
  withGeneratedFields,
} from "@/lib/mockData";

interface FriendsContextValue {
  friends: Friend[];
  matches: Match[];
  loading: boolean;
  singleFriends: Friend[];
  addFriend: (input: NewFriendInput) => void;
  updateFriend: (id: string, patch: Partial<NewFriendInput>) => void;
  removeFriend: (id: string) => void;
  toggleSingle: (id: string) => void;
  importMockFriends: () => number;
  /** Bulk-add friends, skipping anyone whose name already exists. Returns count added. */
  importFriends: (inputs: NewFriendInput[]) => number;
  recordMatch: (match: Omit<Match, "id" | "createdAt">) => void;
  clearAll: () => void;
}

const FriendsContext = createContext<FriendsContextValue | null>(null);

export function FriendsProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const authenticated = status === "authenticated";

  // Per-user cloud store when signed in (and cloud sync is on); Local Storage
  // otherwise. Switching auth state swaps the store and re-hydrates below.
  const store = useMemo(() => getStore(authenticated), [authenticated]);

  const [friends, setFriends] = useState<Friend[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  // Hydrate whenever the active store changes (mount, sign-in, sign-out).
  useEffect(() => {
    // Don't load until the session is resolved, so we pick the right store.
    if (status === "loading") return;
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const [f, m] = await Promise.all([
          store.getFriends(),
          store.getMatches(),
        ]);
        if (!active) return;

        // First sign-in seeding: if the cloud is empty but the user already
        // built a list as a guest, push that local data up so nothing is lost.
        if (
          authenticated &&
          cloudSyncEnabled() &&
          f.length === 0 &&
          m.length === 0
        ) {
          const local = getStore(false);
          const [lf, lm] = await Promise.all([
            local.getFriends(),
            local.getMatches(),
          ]);
          if (lf.length || lm.length) {
            await Promise.all([store.saveFriends(lf), store.saveMatches(lm)]);
            if (!active) return;
            setFriends(lf);
            setMatches(lm);
            setLoading(false);
            return;
          }
        }

        setFriends(f);
        setMatches(m);
        setLoading(false);
      } catch {
        // On any load error, fail safe to an empty (but usable) state.
        if (active) {
          setFriends([]);
          setMatches([]);
          setLoading(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [store, authenticated, status]);

  // Persist helpers keep state and storage in sync.
  const persistFriends = useCallback(
    (next: Friend[]) => {
      setFriends(next);
      void store.saveFriends(next);
    },
    [store]
  );

  const persistMatches = useCallback(
    (next: Match[]) => {
      setMatches(next);
      void store.saveMatches(next);
    },
    [store]
  );

  const addFriend = useCallback(
    (input: NewFriendInput) => {
      persistFriends([withGeneratedFields(input), ...friends]);
    },
    [friends, persistFriends]
  );

  const updateFriend = useCallback(
    (id: string, patch: Partial<NewFriendInput>) => {
      persistFriends(
        friends.map((f) => (f.id === id ? { ...f, ...patch } : f))
      );
    },
    [friends, persistFriends]
  );

  const removeFriend = useCallback(
    (id: string) => {
      persistFriends(friends.filter((f) => f.id !== id));
    },
    [friends, persistFriends]
  );

  const toggleSingle = useCallback(
    (id: string) => {
      persistFriends(
        friends.map((f) =>
          f.id === id ? { ...f, isSingle: !f.isSingle } : f
        )
      );
    },
    [friends, persistFriends]
  );

  const importFriends = useCallback(
    (inputs: NewFriendInput[]) => {
      // Skip anyone already present (match on name) to avoid duplicates.
      const existingNames = new Set(friends.map((f) => f.name.toLowerCase()));
      const toAdd = inputs
        .filter((m) => {
          const key = m.name.toLowerCase();
          if (!m.name.trim() || existingNames.has(key)) return false;
          existingNames.add(key); // also dedupe within the batch
          return true;
        })
        .map(withGeneratedFields);
      if (toAdd.length) {
        persistFriends([...toAdd, ...friends]);
      }
      return toAdd.length;
    },
    [friends, persistFriends]
  );

  const importMockFriends = useCallback(
    () => importFriends(MOCK_IMPORT_FRIENDS),
    [importFriends]
  );

  const recordMatch = useCallback(
    (match: Omit<Match, "id" | "createdAt">) => {
      const full: Match = { ...match, id: createId(), createdAt: Date.now() };
      persistMatches([full, ...matches]);
    },
    [matches, persistMatches]
  );

  const clearAll = useCallback(() => {
    persistFriends([]);
    persistMatches([]);
  }, [persistFriends, persistMatches]);

  const singleFriends = useMemo(
    () => friends.filter((f) => f.isSingle),
    [friends]
  );

  const value = useMemo<FriendsContextValue>(
    () => ({
      friends,
      matches,
      loading,
      singleFriends,
      addFriend,
      updateFriend,
      removeFriend,
      toggleSingle,
      importMockFriends,
      importFriends,
      recordMatch,
      clearAll,
    }),
    [
      friends,
      matches,
      loading,
      singleFriends,
      addFriend,
      updateFriend,
      removeFriend,
      toggleSingle,
      importMockFriends,
      importFriends,
      recordMatch,
      clearAll,
    ]
  );

  return (
    <FriendsContext.Provider value={value}>{children}</FriendsContext.Provider>
  );
}

export function useFriends(): FriendsContextValue {
  const ctx = useContext(FriendsContext);
  if (!ctx) {
    throw new Error("useFriends must be used within a FriendsProvider");
  }
  return ctx;
}
