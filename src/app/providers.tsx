"use client";

import { SessionProvider } from "next-auth/react";
import { FriendsProvider } from "@/context/FriendsContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <FriendsProvider>{children}</FriendsProvider>
    </SessionProvider>
  );
}
