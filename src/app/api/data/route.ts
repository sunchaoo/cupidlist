import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getSupabaseAdmin,
  isSupabaseConfigured,
  USER_DATA_TABLE,
} from "@/lib/supabase";
import type { Friend, Match } from "@/lib/types";

export const dynamic = "force-dynamic";

/** Resolve the signed-in user's stable id, or null if unauthenticated. */
async function currentUserId(): Promise<string | null> {
  const session = await auth();
  const id = (session?.user as { id?: string } | undefined)?.id;
  return id ?? null;
}

// GET /api/data → { friends, matches } for the signed-in user.
export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "cloud-sync-disabled" }, { status: 503 });
  }
  const userId = await currentUserId();
  if (!userId) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const { data, error } = await getSupabaseAdmin()
    .from(USER_DATA_TABLE)
    .select("friends, matches")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({
    friends: (data?.friends as Friend[]) ?? [],
    matches: (data?.matches as Match[]) ?? [],
  });
}

// PUT /api/data { friends?, matches? } → upserts the provided fields, leaving
// the other untouched.
export async function PUT(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "cloud-sync-disabled" }, { status: 503 });
  }
  const userId = await currentUserId();
  if (!userId) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  let body: { friends?: Friend[]; matches?: Match[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Merge with existing so a friends-only save doesn't wipe matches (and v.v.).
  const { data: existing } = await supabase
    .from(USER_DATA_TABLE)
    .select("friends, matches")
    .eq("user_id", userId)
    .maybeSingle();

  const row = {
    user_id: userId,
    friends: body.friends ?? existing?.friends ?? [],
    matches: body.matches ?? existing?.matches ?? [],
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from(USER_DATA_TABLE)
    .upsert(row, { onConflict: "user_id" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
