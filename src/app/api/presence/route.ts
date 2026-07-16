import { NextResponse } from "next/server";
import { put, head } from "@vercel/blob";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

interface Presence {
  [channelId: string]: { [userId: string]: number };
}

async function getPresence(): Promise<Presence> {
  try {
    const blob = await head("presence/active.json");
    if (!blob) return {};
    const res = await fetch(blob.downloadUrl, { cache: "no-store" });
    if (!res.ok) return {};
    return await res.json();
  } catch {
    return {};
  }
}

async function savePresence(presence: Presence) {
  await put("presence/active.json", JSON.stringify(presence), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

// POST - heartbeat
export async function POST(request: Request) {
  try {
    const { channel, user } = await request.json();
    if (!channel || !user) {
      return NextResponse.json({ error: "missing fields" }, { status: 400 });
    }

    const presence = await getPresence();
    if (!presence[channel]) presence[channel] = {};
    presence[channel][user] = Date.now();

    // Clean stale users (no heartbeat in 15s)
    const now = Date.now();
    for (const ch of Object.keys(presence)) {
      for (const u of Object.keys(presence[ch])) {
        if (now - presence[ch][u] > 15000) delete presence[ch][u];
      }
      if (Object.keys(presence[ch]).length === 0) delete presence[ch];
    }

    await savePresence(presence);
    const count = Object.keys(presence[channel] || {}).length;
    return NextResponse.json({ count });
  } catch (error) {
    console.error("Presence error:", error);
    return NextResponse.json({ count: 0 });
  }
}
