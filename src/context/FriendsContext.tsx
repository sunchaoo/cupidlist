"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Friend, Match, NewFriendInput } from "@/lib/types";
import { getStore } from "@/lib/storage";
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
  recordMatch: (match: Omit<Match, "id" | "createdAt">) => void;
  clearAll: () => void;
}

const FriendsContext = createContext<FriendsContextValue | null>(null);

export function FriendsProvider({ children }: { children: React.ReactNode }) {
  const store = getStore();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  // Hydrate from the data store on mount.
  useEffect(() => {
    let active = true;
    (async () => {
      const [f, m] = await Promise.all([
        store.getFriends(),
        store.getMatches(),
      ]);
      if (!active) return;
      setFriends(f);
      setMatches(m);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [store]);

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

  const importMockFriends = useCallback(() => {
    // Skip anyone already imported (match on name) to avoid duplicates.
    const existingNames = new Set(friends.map((f) => f.name.toLowerCase()));
    const toAdd = MOCK_IMPORT_FRIENDS.filter(
      (m) => !existingNames.has(m.name.toLowerCase())
    ).map(withGeneratedFields);
    if (toAdd.length) {
      persistFriends([...toAdd, ...friends]);
    }
    return toAdd.length;
  }, [friends, persistFriends]);

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
