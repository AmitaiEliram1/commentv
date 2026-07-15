"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ─── TYPES ───
interface Message {
  id: string;
  user: string;
  avatar: string;
  text: string;
  time: number;
  isMe?: boolean;
}

interface Channel {
  id: string;
  name: string;
  logo: string;
  region: "usa" | "israel" | "europe";
  color: string;
}

type Region = "usa" | "israel" | "europe";
type Screen = "splash" | "auth" | "country" | "browse" | "chat" | "profile";

// ─── CHANNELS ───
const CHANNELS: Channel[] = [
  { id: "nbc", name: "NBC", logo: "📺", region: "usa", color: "#3B82F6" },
  { id: "cbs", name: "CBS", logo: "👁️", region: "usa", color: "#6366F1" },
  { id: "abc", name: "ABC", logo: "🔤", region: "usa", color: "#F59E0B" },
  { id: "fox", name: "FOX", logo: "🦊", region: "usa", color: "#EF4444" },
  { id: "hbo", name: "HBO", logo: "🎬", region: "usa", color: "#8B5CF6" },
  { id: "cnn", name: "CNN", logo: "📰", region: "usa", color: "#DC2626" },
  { id: "espn", name: "ESPN", logo: "⚽", region: "usa", color: "#10B981" },
  { id: "netflix", name: "Netflix Live", logo: "🎥", region: "usa", color: "#E11D48" },
  { id: "hulu", name: "Hulu", logo: "💚", region: "usa", color: "#22C55E" },
  { id: "amc", name: "AMC", logo: "🎞️", region: "usa", color: "#F97316" },
  { id: "ch12", name: "Channel 12", logo: "1️⃣2️⃣", region: "israel", color: "#3B82F6" },
  { id: "ch13", name: "Channel 13", logo: "1️⃣3️⃣", region: "israel", color: "#F97316" },
  { id: "kan11", name: "KAN 11", logo: "📡", region: "israel", color: "#8B5CF6" },
  { id: "hot", name: "HOT", logo: "🔥", region: "israel", color: "#EF4444" },
  { id: "yes-tv", name: "YES", logo: "✅", region: "israel", color: "#22C55E" },
  { id: "sport5", name: "Sport 5", logo: "🏀", region: "israel", color: "#F59E0B" },
  { id: "bbc", name: "BBC", logo: "🇬🇧", region: "europe", color: "#1D4ED8" },
  { id: "itv", name: "ITV", logo: "📺", region: "europe", color: "#6366F1" },
  { id: "sky", name: "Sky", logo: "☁️", region: "europe", color: "#0EA5E9" },
  { id: "ard", name: "ARD", logo: "🇩🇪", region: "europe", color: "#3B82F6" },
  { id: "zdf", name: "ZDF", logo: "🇩🇪", region: "europe", color: "#F97316" },
  { id: "france2", name: "France 2", logo: "🇫🇷", region: "europe", color: "#EF4444" },
  { id: "rai", name: "RAI", logo: "🇮🇹", region: "europe", color: "#22C55E" },
];

const AVATARS = ["😎", "🎭", "🔥", "💀", "👑", "🎪", "🌟", "🎯", "🦄", "🐱", "🎸", "🏄", "🤖", "👻", "🎩"];
const QUICK_EMOJIS = ["🔥", "😂", "😱", "👏", "❤️", "💀"];

// ─── LOCALIZED SEED MESSAGES ───
const SEED_MESSAGES: Record<Region, { user: string; text: string }[]> = {
  usa: [
    { user: "mike_LA", text: "OMG did you just see that?! 😱" },
    { user: "sarah_nyc", text: "This show is absolute 🔥🔥🔥" },
    { user: "couch_king", text: "I called it from the first episode" },
    { user: "binge_queen", text: "Plot twist of the year!!" },
    { user: "tv_junkie", text: "Who else is watching this right now?" },
    { user: "remote_warrior", text: "Best episode of the season hands down" },
    { user: "night_owl", text: "The writing this season is insane 🤯" },
    { user: "stream_beast", text: "YOOOOO what just happened" },
    { user: "popcorn_pete", text: "This deserves an Emmy tbh" },
    { user: "cliffhanger", text: "Every week this show gets better 👏" },
  ],
  israel: [
    { user: "אורי_תא", text: "אחלה פרק!! לא מאמין מה קרה עכשיו 😱" },
    { user: "מיכל_ירושלים", text: "הסדרה הזאת פשוט מטורפת 🔥🔥" },
    { user: "דני_חיפה", text: "ידעתי מהרגע הראשון שזה יקרה" },
    { user: "שירה_רמתגן", text: "מי עוד צופה עכשיו? תגיבו!" },
    { user: "יוסי_באר_שבע", text: "הפרק הכי טוב העונה בלי ספק 👑" },
    { user: "נועה_הרצליה", text: "אני בשוק מהתפנית הזאת" },
    { user: "איתי_נתניה", text: "השחקנים פה משחקים ברמה אחרת" },
    { user: "רוני_ראשון", text: "מחכה שבוע שלם לפרק הזה 😂" },
    { user: "גל_אשדוד", text: "וואלה תכל'ס סדרה שווה!!" },
    { user: "תמר_פתח_תקווה", text: "הסוף הזה!!! 😮 לא ייאמן" },
  ],
  europe: [
    { user: "james_london", text: "Brilliant episode, absolutely brilliant! 🇬🇧" },
    { user: "hans_berlin", text: "Diese Folge ist unglaublich! 🔥" },
    { user: "marie_paris", text: "C'est incroyable cette série! 😱" },
    { user: "luca_roma", text: "Mamma mia che puntata!! 🇮🇹" },
    { user: "emma_dublin", text: "Can't believe what just happened! 👏" },
    { user: "carlos_madrid", text: "¡Qué episodio tan increíble! 🔥🔥" },
    { user: "sophie_amsterdam", text: "This show keeps getting better wow" },
    { user: "felix_munich", text: "Wahnsinn! Beste Serie 2026 💯" },
    { user: "chloe_lyon", text: "Je suis choquée par la fin 😮" },
    { user: "marco_milan", text: "Ogni settimana migliora! Fantastico 👑" },
  ],
};

// ─── APP ───
export default function CommentV() {
  const [screen, setScreen] = useState<Screen>("splash");
  const [username, setUsername] = useState("");
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signinEmail, setSigninEmail] = useState("");
  const [signinPassword, setSigninPassword] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<Region>("usa");
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [myAvatar] = useState(() => AVATARS[Math.floor(Math.random() * AVATARS.length)]);
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: string; emoji: string; x: number }[]>([]);
  const [liveCount, setLiveCount] = useState(0);
  const [totalComments, setTotalComments] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const presenceRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTimeRef = useRef(0);
  const seenIdsRef = useRef<Set<string>>(new Set());

  // Splash auto-advance
  useEffect(() => {
    const t = setTimeout(() => setScreen("auth"), 2200);
    return () => clearTimeout(t);
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // ─── REAL-TIME POLLING ───
  const startPolling = useCallback((channelId: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    lastTimeRef.current = 0;
    seenIdsRef.current = new Set();

    // Initial fetch
    fetch(`/api/messages?channel=${channelId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.messages?.length) {
          const msgs = data.messages.map((m: Message) => ({ ...m, isMe: m.user === username }));
          msgs.forEach((m: Message) => seenIdsRef.current.add(m.id));
          setMessages(msgs);
          lastTimeRef.current = Math.max(...msgs.map((m: Message) => m.time));
        }
      })
      .catch(() => {});

    // Poll every 1.5s
    pollRef.current = setInterval(() => {
      fetch(`/api/messages?channel=${channelId}&since=${lastTimeRef.current}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.messages?.length) {
            const newMsgs = data.messages.filter(
              (m: Message) => !seenIdsRef.current.has(m.id)
            ).map((m: Message) => ({ ...m, isMe: m.user === username }));

            if (newMsgs.length > 0) {
              newMsgs.forEach((m: Message) => seenIdsRef.current.add(m.id));
              setMessages((prev) => [...prev.slice(-80), ...newMsgs]);
              lastTimeRef.current = Math.max(...newMsgs.map((m: Message) => m.time));
            }
          }
        })
        .catch(() => {});
    }, 1500);
  }, [username]);

  const stopPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    if (presenceRef.current) { clearInterval(presenceRef.current); presenceRef.current = null; }
  }, []);

  // ─── PRESENCE ───
  const startPresence = useCallback((channelId: string) => {
    if (presenceRef.current) clearInterval(presenceRef.current);

    const heartbeat = () => {
      fetch("/api/presence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: channelId, user: username }),
      })
        .then((r) => r.json())
        .then((data) => setLiveCount(data.count || 1))
        .catch(() => {});
    };

    heartbeat();
    presenceRef.current = setInterval(heartbeat, 8000);
  }, [username]);

  // ─── SEED DEMO MESSAGES ───
  const seedMessages = useCallback(async (channelId: string, region: Region) => {
    // Check if channel already has messages
    try {
      const res = await fetch(`/api/messages?channel=${channelId}`);
      const data = await res.json();
      if (data.messages?.length > 0) return; // already seeded
    } catch {
      // continue to seed
    }

    const seeds = SEED_MESSAGES[region];
    const shuffled = [...seeds].sort(() => Math.random() - 0.5).slice(0, 5);

    for (const seed of shuffled) {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: channelId,
          user: seed.user,
          avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
          text: seed.text,
        }),
      });
      // Small delay between seeds
      await new Promise((r) => setTimeout(r, 100));
    }
  }, []);

  const enterChannel = async (ch: Channel) => {
    setActiveChannel(ch);
    setScreen("chat");
    await seedMessages(ch.id, ch.region);
    startPolling(ch.id);
    startPresence(ch.id);
  };

  const leaveChannel = () => {
    stopPolling();
    setActiveChannel(null);
    setMessages([]);
    setScreen("browse");
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !activeChannel) return;
    const text = inputText.trim();
    setInputText("");
    inputRef.current?.focus();

    // Optimistic local add
    const localMsg: Message = {
      id: `local-${Date.now()}`,
      user: username,
      avatar: myAvatar,
      text,
      time: Date.now(),
      isMe: true,
    };
    seenIdsRef.current.add(localMsg.id);
    setMessages((prev) => [...prev.slice(-80), localMsg]);
    setTotalComments((c) => c + 1);

    // Send to server
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: activeChannel.id,
          user: username,
          avatar: myAvatar,
          text,
        }),
      });
      const data = await res.json();
      if (data.message) {
        seenIdsRef.current.add(data.message.id);
        // Update the last time so we don't re-fetch our own message
        lastTimeRef.current = Math.max(lastTimeRef.current, data.message.time);
      }
    } catch {
      // Message still shows locally
    }
  };

  const sendEmoji = (emoji: string) => {
    setInputText("");
    const localMsg: Message = {
      id: `local-${Date.now()}`,
      user: username,
      avatar: myAvatar,
      text: emoji,
      time: Date.now(),
      isMe: true,
    };
    seenIdsRef.current.add(localMsg.id);
    setMessages((prev) => [...prev.slice(-80), localMsg]);
    setTotalComments((c) => c + 1);

    // Float animation
    const floatId = `float-${Date.now()}`;
    const x = 20 + Math.random() * 60;
    setFloatingEmojis((prev) => [...prev, { id: floatId, emoji, x }]);
    setTimeout(() => setFloatingEmojis((prev) => prev.filter((e) => e.id !== floatId)), 1000);

    // Send to server
    if (activeChannel) {
      fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: activeChannel.id,
          user: username,
          avatar: myAvatar,
          text: emoji,
        }),
      }).then((r) => r.json()).then((data) => {
        if (data.message) seenIdsRef.current.add(data.message.id);
      }).catch(() => {});
    }
  };

  const timeAgo = (ts: number) => {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 5) return "now";
    if (s < 60) return `${s}s`;
    return `${Math.floor(s / 60)}m`;
  };

  // Re-render time-ago every 5 seconds
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 5000);
    return () => clearInterval(t);
  }, []);

  const filteredChannels = CHANNELS.filter(
    (ch) =>
      ch.region === selectedRegion &&
      ch.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAuth = () => {
    if (authMode === "signup") {
      if (!signUpName.trim() || !signUpEmail.trim() || !signUpPassword.trim()) return;
      setUsername(signUpName.trim());
    } else {
      if (!signinEmail.trim() || !signinPassword.trim()) return;
      setUsername(signinEmail.split("@")[0]);
    }
    setScreen("country");
  };

  // ─── SPLASH ───
  if (screen === "splash") {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-bg-primary safe-top safe-bottom">
        <div className="animate-bounce-in">
          <div className="text-6xl mb-4 text-center">💬</div>
        </div>
        <h1 className="text-4xl font-bold text-text-primary tracking-tight animate-fade" style={{ animationDelay: "0.3s", opacity: 0 }}>
          Comment<span className="text-accent">V</span>
        </h1>
        <p className="text-text-secondary mt-3 text-sm animate-fade" style={{ animationDelay: "0.6s", opacity: 0 }}>
          Say what you really think.
        </p>
        <div className="mt-12 animate-fade" style={{ animationDelay: "1s", opacity: 0 }}>
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // ─── AUTH ───
  if (screen === "auth") {
    return (
      <div className="h-full flex flex-col bg-bg-primary safe-top safe-bottom overflow-y-auto">
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
          <div className="animate-slide-up mb-2">
            <div className="text-5xl mb-3 text-center">💬</div>
            <h1 className="text-3xl font-bold text-center text-text-primary tracking-tight">
              Comment<span className="text-accent">V</span>
            </h1>
            <p className="text-text-secondary text-center text-sm mt-2">
              Live reactions on every channel.
            </p>
          </div>

          <div className="flex bg-bg-card rounded-xl p-1 mt-8 mb-6 w-full max-w-xs animate-slide-up stagger-1">
            <button
              onClick={() => setAuthMode("signin")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer
                ${authMode === "signin" ? "bg-accent text-white" : "text-text-secondary"}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setAuthMode("signup")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer
                ${authMode === "signup" ? "bg-accent text-white" : "text-text-secondary"}`}
            >
              Create Account
            </button>
          </div>

          <div className="w-full max-w-xs space-y-3 animate-slide-up stagger-2">
            {authMode === "signup" && (
              <input
                type="text"
                value={signUpName}
                onChange={(e) => setSignUpName(e.target.value)}
                placeholder="Username"
                className="w-full px-4 py-3.5 bg-bg-card border border-border rounded-xl text-text-primary text-sm placeholder:text-text-muted"
              />
            )}
            <input
              type="email"
              value={authMode === "signup" ? signUpEmail : signinEmail}
              onChange={(e) => authMode === "signup" ? setSignUpEmail(e.target.value) : setSigninEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-4 py-3.5 bg-bg-card border border-border rounded-xl text-text-primary text-sm placeholder:text-text-muted"
            />
            <input
              type="password"
              value={authMode === "signup" ? signUpPassword : signinPassword}
              onChange={(e) => authMode === "signup" ? setSignUpPassword(e.target.value) : setSigninPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3.5 bg-bg-card border border-border rounded-xl text-text-primary text-sm placeholder:text-text-muted"
              onKeyDown={(e) => e.key === "Enter" && handleAuth()}
            />
            <button
              onClick={handleAuth}
              className="w-full py-3.5 bg-accent text-white font-semibold rounded-xl text-sm
                         hover:bg-accent-hover active:scale-[0.97] transition-all animate-glow cursor-pointer"
            >
              {authMode === "signup" ? "Join CommentV" : "Sign In"}
            </button>
          </div>

          <p className="text-text-muted text-xs mt-6 text-center animate-slide-up stagger-3">
            {authMode === "signup"
              ? "By joining, you agree to keep it fun and respectful."
              : "Don\u0027t have an account? Switch to Create Account."}
          </p>
        </div>
      </div>
    );
  }

  // ─── COUNTRY SELECTION ───
  if (screen === "country") {
    const countries: { key: Region; flag: string; name: string; desc: string }[] = [
      { key: "usa", flag: "🇺🇸", name: "United States", desc: "NBC, CBS, FOX, HBO, ESPN & more" },
      { key: "israel", flag: "🇮🇱", name: "Israel", desc: "Channel 12, 13, KAN, HOT, YES & more" },
      { key: "europe", flag: "🇪🇺", name: "Europe", desc: "BBC, Sky, ARD, France 2, RAI & more" },
    ];

    return (
      <div className="h-full flex flex-col bg-bg-primary safe-top safe-bottom">
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="animate-slide-up mb-8 text-center">
            <div className="text-4xl mb-3">🌍</div>
            <h1 className="text-2xl font-bold text-text-primary">Where are you watching?</h1>
            <p className="text-text-secondary text-sm mt-2">Select your country to see local channels</p>
          </div>

          <div className="w-full max-w-sm space-y-3">
            {countries.map((c, i) => (
              <button
                key={c.key}
                onClick={() => {
                  setSelectedRegion(c.key);
                  setScreen("browse");
                }}
                className={`w-full flex items-center gap-4 bg-bg-card border border-border rounded-2xl p-5
                           active:scale-[0.97] active:border-accent/50 transition-all cursor-pointer
                           animate-slide-up stagger-${i + 1}`}
              >
                <div className="text-4xl">{c.flag}</div>
                <div className="text-left flex-1">
                  <div className="font-bold text-text-primary">{c.name}</div>
                  <div className="text-xs text-text-secondary mt-0.5">{c.desc}</div>
                </div>
                <svg className="w-5 h-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── CHAT ───
  if (screen === "chat" && activeChannel) {
    return (
      <div className="h-full flex flex-col bg-bg-primary relative">
        {/* Floating emojis */}
        {floatingEmojis.map((fe) => (
          <div key={fe.id} className="emoji-float text-3xl z-50" style={{ left: `${fe.x}%`, bottom: "120px" }}>
            {fe.emoji}
          </div>
        ))}

        {/* Header */}
        <div className="glass safe-top border-b border-border z-10">
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={leaveChannel} className="flex items-center gap-2 cursor-pointer">
              <svg className="w-5 h-5 text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-lg">{activeChannel.logo}</span>
              <span className="font-bold text-text-primary">{activeChannel.name}</span>
            </button>
            <div className="flex items-center gap-2 bg-bg-card/80 px-3 py-1.5 rounded-full">
              <div className="live-dot" />
              <span className="text-xs font-medium text-live-red">
                {liveCount > 0 ? `${liveCount} live` : "connecting..."}
              </span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div ref={chatRef} className="flex-1 chat-scroll px-4 pt-3 pb-2">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center animate-fade">
              <div className="text-4xl mb-3">💬</div>
              <p className="text-text-secondary text-sm">Loading chat...</p>
            </div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 mb-3 animate-msg ${msg.isMe ? "flex-row-reverse" : ""}`}
            >
              <div className="text-xl flex-shrink-0 mt-0.5">{msg.avatar}</div>
              <div className={`max-w-[75%] ${msg.isMe ? "items-end" : ""}`}>
                <div className={`flex items-center gap-2 mb-0.5 ${msg.isMe ? "flex-row-reverse" : ""}`}>
                  <span className={`text-xs font-semibold ${msg.isMe ? "text-accent" : "text-text-secondary"}`}>
                    {msg.isMe ? "you" : msg.user}
                  </span>
                  <span className="text-[10px] text-text-muted">{timeAgo(msg.time)}</span>
                </div>
                <div
                  className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed
                    ${msg.isMe
                      ? "bg-accent text-white rounded-tr-sm"
                      : "bg-bg-card text-text-primary rounded-tl-sm"
                    }`}
                >
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Emoji Bar */}
        <div className="px-4 py-2 flex gap-2 justify-center">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => sendEmoji(emoji)}
              className="w-10 h-10 flex items-center justify-center bg-bg-card rounded-full text-lg
                         active:scale-90 transition-transform cursor-pointer hover:bg-bg-input"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="px-4 pb-2 safe-bottom">
          <div className="flex gap-2 items-center">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Say something..."
              className="flex-1 px-4 py-3 bg-bg-card border border-border rounded-full text-sm text-text-primary placeholder:text-text-muted"
            />
            <button
              onClick={sendMessage}
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-all cursor-pointer
                ${inputText.trim() ? "bg-accent active:scale-90" : "bg-bg-card"}`}
            >
              <svg className={`w-5 h-5 ${inputText.trim() ? "text-white" : "text-text-muted"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── PROFILE ───
  if (screen === "profile") {
    return (
      <div className="h-full flex flex-col bg-bg-primary">
        <div className="safe-top px-4 pt-4 pb-2">
          <h1 className="text-xl font-bold text-text-primary">Profile</h1>
        </div>

        <div className="flex-1 px-4 overflow-y-auto pb-24 chat-scroll">
          <div className="flex flex-col items-center mt-6 mb-8 animate-slide-up">
            <div className="w-20 h-20 bg-bg-card rounded-full flex items-center justify-center text-4xl mb-3 border-2 border-accent">
              {myAvatar}
            </div>
            <h2 className="text-xl font-bold text-text-primary">{username}</h2>
            <p className="text-text-secondary text-sm">@{username.toLowerCase().replace(/\s/g, "_")}</p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-8 animate-slide-up stagger-1">
            <div className="bg-bg-card rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-accent">{totalComments}</div>
              <div className="text-xs text-text-secondary mt-1">Comments</div>
            </div>
            <div className="bg-bg-card rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-text-primary">1</div>
              <div className="text-xs text-text-secondary mt-1">Channels</div>
            </div>
            <div className="bg-bg-card rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-success">New</div>
              <div className="text-xs text-text-secondary mt-1">Status</div>
            </div>
          </div>

          <div className="bg-bg-card rounded-xl p-4 mb-4 flex items-center gap-4 animate-slide-up stagger-2">
            <div className="text-3xl">🏆</div>
            <div>
              <div className="font-semibold text-text-primary text-sm">First Steps</div>
              <div className="text-xs text-text-secondary">Joined CommentV - welcome aboard!</div>
            </div>
          </div>

          <div className="bg-bg-card rounded-xl p-4 mb-4 flex items-center gap-4 animate-slide-up stagger-3">
            <div className="text-3xl">🎤</div>
            <div>
              <div className="font-semibold text-text-primary text-sm">Voice of the People</div>
              <div className="text-xs text-text-secondary">Leave 10 comments to unlock</div>
            </div>
          </div>

          {/* Change Country */}
          <button
            onClick={() => setScreen("country")}
            className="w-full py-3 bg-bg-card border border-border rounded-xl text-text-primary text-sm font-medium
                       mt-2 active:scale-[0.97] transition-transform cursor-pointer animate-slide-up stagger-4 flex items-center justify-center gap-2"
          >
            🌍 Change Country
          </button>

          <button
            onClick={() => {
              setUsername("");
              setScreen("auth");
              setTotalComments(0);
              stopPolling();
            }}
            className="w-full py-3 bg-bg-card border border-border rounded-xl text-live-red text-sm font-medium
                       mt-3 active:scale-[0.97] transition-transform cursor-pointer animate-slide-up stagger-5"
          >
            Sign Out
          </button>
        </div>

        <TabBar screen={screen} onNavigate={setScreen} />
      </div>
    );
  }

  // ─── BROWSE ───
  return (
    <div className="h-full flex flex-col bg-bg-primary">
      <div className="safe-top px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-text-primary animate-fade">
            💬 Comment<span className="text-accent">V</span>
          </h1>
          <button
            onClick={() => setScreen("country")}
            className="text-lg cursor-pointer active:scale-90 transition-transform"
          >
            {selectedRegion === "usa" ? "🇺🇸" : selectedRegion === "israel" ? "🇮🇱" : "🇪🇺"}
          </button>
        </div>

        {/* Region Tabs */}
        <div className="flex gap-2 mb-3 animate-slide-up stagger-1">
          {([
            { key: "usa" as Region, label: "🇺🇸 USA" },
            { key: "israel" as Region, label: "🇮🇱 Israel" },
            { key: "europe" as Region, label: "🇪🇺 Europe" },
          ]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => { setSelectedRegion(key); setSearchQuery(""); }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer
                ${selectedRegion === key ? "bg-accent text-white" : "bg-bg-card text-text-secondary"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative animate-slide-up stagger-2">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search channels..."
            className="w-full pl-10 pr-4 py-2.5 bg-bg-card border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted"
          />
        </div>
      </div>

      {/* Channel Grid */}
      <div className="flex-1 overflow-y-auto px-4 pt-2 pb-24 chat-scroll">
        <div className="grid grid-cols-2 gap-3">
          {filteredChannels.map((ch, i) => (
            <button
              key={ch.id}
              onClick={() => enterChannel(ch)}
              className={`channel-card bg-bg-card rounded-2xl p-4 text-left border border-border
                         active:border-accent/50 cursor-pointer animate-slide-up stagger-${Math.min(i + 1, 6)}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-3xl">{ch.logo}</div>
                <div className="flex items-center gap-1">
                  <div className="live-dot" style={{ width: 6, height: 6 }} />
                  <span className="text-[10px] text-live-red font-medium">LIVE</span>
                </div>
              </div>
              <div className="font-semibold text-text-primary text-sm">{ch.name}</div>
              <div className="text-[11px] text-text-muted mt-0.5">Tap to join chat</div>
            </button>
          ))}
        </div>
      </div>

      <TabBar screen={screen} onNavigate={setScreen} />
    </div>
  );
}

// ─── TAB BAR ───
function TabBar({ screen, onNavigate }: { screen: Screen; onNavigate: (s: Screen) => void }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 glass border-t border-border safe-bottom z-20">
      <div className="flex items-center justify-around px-4 py-2 max-w-lg mx-auto">
        <button
          onClick={() => onNavigate("browse")}
          className={`tab-item flex flex-col items-center gap-0.5 px-4 py-1 cursor-pointer ${screen === "browse" ? "active" : ""}`}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={screen === "browse" ? 2.5 : 1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
          </svg>
          <span className="text-[10px] font-medium">Browse</span>
        </button>
        <button
          onClick={() => onNavigate("profile")}
          className={`tab-item flex flex-col items-center gap-0.5 px-4 py-1 cursor-pointer ${screen === "profile" ? "active" : ""}`}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={screen === "profile" ? 2.5 : 1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          <span className="text-[10px] font-medium">Profile</span>
        </button>
      </div>
    </div>
  );
}
