import { NextResponse } from "next/server";
import { put, head } from "@vercel/blob";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

interface ChatMessage {
  id: string;
  user: string;
  avatar: string;
  text: string;
  time: number;
}

async function getMessages(channelId: string): Promise<ChatMessage[]> {
  try {
    const blobPath = `chat/${channelId}/messages.json`;
    // Use head() to check if blob exists and get its downloadUrl
    const blob = await head(blobPath);
    if (!blob) return [];
    // Fetch with downloadUrl which bypasses CDN cache
    const res = await fetch(blob.downloadUrl, { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

async function saveMessages(channelId: string, messages: ChatMessage[]) {
  const trimmed = messages.slice(-100);
  await put(`chat/${channelId}/messages.json`, JSON.stringify(trimmed), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

// GET - fetch messages for a channel (polling)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const channel = searchParams.get("channel");
  const since = parseInt(searchParams.get("since") || "0");

  if (!channel) {
    return NextResponse.json({ error: "channel required" }, { status: 400 });
  }

  const messages = await getMessages(channel);
  const newMessages = since > 0
    ? messages.filter((m) => m.time > since)
    : messages.slice(-30);

  return NextResponse.json(
    { messages: newMessages, count: messages.length },
    {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    }
  );
}

// POST - send a message
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { channel, user, avatar, text } = body;

    if (!channel || !user || !text) {
      return NextResponse.json({ error: "missing fields" }, { status: 400 });
    }

    const messages = await getMessages(channel);

    const newMsg: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      user,
      avatar,
      text: text.slice(0, 500),
      time: Date.now(),
    };

    messages.push(newMsg);
    await saveMessages(channel, messages);

    return NextResponse.json({ success: true, message: newMsg });
  } catch (error) {
    console.error("Message error:", error);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
