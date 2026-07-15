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
  live: number;
  region: "usa" | "israel" | "europe";
  color: string;
}

// ─── DATA ───
const CHANNELS: Channel[] = [
  // USA
  { id: "nbc", name: "NBC", logo: "📺", live: 342, region: "usa", color: "#3B82F6" },
  { id: "cbs", name: "CBS", logo: "👁️", live: 189, region: "usa", color: "#6366F1" },
  { id: "abc", name: "ABC", logo: "🔤", live: 256, region: "usa", color: "#F59E0B" },
  { id: "fox", name: "FOX", logo: "🦊", live: 412, region: "usa", color: "#EF4444" },
  { id: "hbo", name: "HBO", logo: "🎬", live: 891, region: "usa", color: "#8B5CF6" },
  { id: "cnn", name: "CNN", logo: "📰", live: 1203, region: "usa", color: "#DC2626" },
  { id: "espn", name: "ESPN", logo: "⚽", live: 2105, region: "usa", color: "#10B981" },
  { id: "netflix", name: "Netflix Live", logo: "🎥", live: 3420, region: "usa", color: "#E11D48" },
  { id: "hulu", name: "Hulu", logo: "💚", live: 567, region: "usa", color: "#22C55E" },
  { id: "amc", name: "AMC", logo: "🎞️", live: 134, region: "usa", color: "#F97316" },
  // Israel
  { id: "ch12", name: "Channel 12", logo: "1️⃣2️⃣", live: 1890, region: "israel", color: "#3B82F6" },
  { id: "ch13", name: "Channel 13", logo: "1️⃣3️⃣", live: 1245, region: "israel", color: "#F97316" },
  { id: "ch11", name: "KAN 11", logo: "📡", live: 432, region: "israel", color: "#8B5CF6" },
  { id: "hot", name: "HOT", logo: "🔥", live: 678, region: "israel", color: "#EF4444" },
  { id: "yes", name: "YES", logo: "✅", live: 521, region: "israel", color: "#22C55E" },
  { id: "sport5", name: "Sport 5", logo: "🏀", live: 2340, region: "israel", color: "#F59E0B" },
  // Europe
  { id: "bbc", name: "BBC", logo: "🇬🇧", live: 4521, region: "europe", color: "#1D4ED8" },
  { id: "itv", name: "ITV", logo: "📺", live: 987, region: "europe", color: "#6366F1" },
  { id: "sky", name: "Sky", logo: "☁️", live: 2341, region: "europe", color: "#0EA5E9" },
  { id: "ard", name: "ARD", logo: "🇩🇪", live: 1123, region: "europe", color: "#3B82F6" },
  { id: "zdf", name: "ZDF", logo: "🇩🇪", live: 876, region: "europe", color: "#F97316" },
  { id: "france2", name: "France 2", logo: "🇫🇷", live: 654, region: "europe", color: "#EF4444" },
  { id: "rai", name: "RAI", logo: "🇮🇹", live: 543, region: "europe", color: "#22C55E" },
];

const AVATARS = ["😎", "🎭", "🔥", "💀", "👑", "🎪", "🌟", "🎯", "🦄", "🐱", "🎸", "🏄", "🤖", "👻", "🎩"];

const FAKE_USERS = [
  "mike_LA", "sarah_nyc", "tv_junkie", "couch_king", "binge_queen",
  "remote_warrior", "channel_surfer", "night_owl", "drama_lover", "plot_twist",
  "snack_break", "rerun_rick", "prime_timer", "stream_beast", "cliffhanger",
  "popcorn_pete", "sofa_sam", "episode_eli", "series_stan", "pilot_patty",
];

const FAKE_MESSAGES = [
  "OMG did you just see that?! 😱", "This show is absolute 🔥🔥🔥",
  "I called it from the first episode", "Plot twist of the year!!",
  "Who else is watching this right now?", "This character is SO annoying 😤",
  "Best episode of the season hands down", "I can't believe they did that",
  "The writing this season is insane", "Anyone else crying rn? 😭",
  "YOOOOO what just happened", "This is way better than I expected",
  "I'm literally shook", "MVP performance right there 👏",
  "OK but why is this so good", "Wait what did I miss??",
  "This deserves an Emmy tbh", "My jaw just hit the floor",
  "Every week this show gets better", "Lol the comments here are killing me 😂",
  "Who's the villain here honestly", "That scene was everything",
  "I need next episode NOW", "This is peak television",
  "Can we talk about that outfit tho 👀", "The soundtrack is incredible",
  "I've been waiting all week for this", "Goosebumps!! Literal goosebumps",
];

const QUICK_EMOJIS = ["🔥", "😂", "😱", "👏", "❤️", "💀"];

type Screen = "splash" | "auth" | "browse" | "chat" | "profile";

// ─── APP ───
export default function CommentV() {
  const [screen, setScreen] = useState<Screen>("splash");
  const [username, setUsername] = useState("");
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [signinEmail, setSigninEmail] = useState("");
  const [signinPassword, setSigninPassword] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<"usa" | "israel" | "europe">("usa");
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
  const msgIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  // Simulate live count changes
  useEffect(() => {
    if (!activeChannel) return;
    setLiveCount(activeChannel.live);
    const interval = setInterval(() => {
      setLiveCount((c) => c + Math.floor(Math.random() * 5) - 2);
    }, 3000);
    return () => clearInterval(interval);
  }, [activeChannel]);

  // Generate fake incoming messages
  const startFakeMessages = useCallback(() => {
    if (msgIntervalRef.current) clearInterval(msgIntervalRef.current);
    // Initial batch
    const initial: Message[] = Array.from({ length: 6 }, (_, i) => ({
      id: `init-${i}`,
      user: FAKE_USERS[Math.floor(Math.random() * FAKE_USERS.length)],
      avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
      text: FAKE_MESSAGES[Math.floor(Math.random() * FAKE_MESSAGES.length)],
      time: Date.now() - (6 - i) * 4000,
    }));
    setMessages(initial);

    msgIntervalRef.current = setInterval(() => {
      const msg: Message = {
        id: `msg-${Date.now()}-${Math.random()}`,
        user: FAKE_USERS[Math.floor(Math.random() * FAKE_USERS.length)],
        avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
        text: FAKE_MESSAGES[Math.floor(Math.random() * FAKE_MESSAGES.length)],
        time: Date.now(),
      };
      setMessages((prev) => [...prev.slice(-50), msg]);
    }, 2000 + Math.random() * 3000);
  }, []);

  const stopFakeMessages = useCallback(() => {
    if (msgIntervalRef.current) {
      clearInterval(msgIntervalRef.current);
      msgIntervalRef.current = null;
    }
  }, []);

  const enterChannel = (ch: Channel) => {
    setActiveChannel(ch);
    setScreen("chat");
    startFakeMessages();
  };

  const leaveChannel = () => {
    stopFakeMessages();
    setActiveChannel(null);
    setMessages([]);
    setScreen("browse");
  };

  const sendMessage = () => {
    if (!inputText.trim()) return;
    const msg: Message = {
      id: `me-${Date.now()}`,
      user: username,
      avatar: myAvatar,
      text: inputText.trim(),
      time: Date.now(),
      isMe: true,
    };
    setMessages((prev) => [...prev.slice(-50), msg]);
    setTotalComments((c) => c + 1);
    setInputText("");
    inputRef.current?.focus();
  };

  const sendEmoji = (emoji: string) => {
    const msg: Message = {
      id: `me-${Date.now()}`,
      user: username,
      avatar: myAvatar,
      text: emoji,
      time: Date.now(),
      isMe: true,
    };
    setMessages((prev) => [...prev.slice(-50), msg]);
    setTotalComments((c) => c + 1);
    // Float animation
    const floatId = `float-${Date.now()}`;
    const x = 20 + Math.random() * 60;
    setFloatingEmojis((prev) => [...prev, { id: floatId, emoji, x }]);
    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((e) => e.id !== floatId));
    }, 1000);
  };

  const timeAgo = (ts: number) => {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 5) return "now";
    if (s < 60) return `${s}s`;
    return `${Math.floor(s / 60)}m`;
  };

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
    setScreen("browse");
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
          {/* Logo */}
          <div className="animate-slide-up mb-2">
            <div className="text-5xl mb-3 text-center">💬</div>
            <h1 className="text-3xl font-bold text-center text-text-primary tracking-tight">
              Comment<span className="text-accent">V</span>
            </h1>
            <p className="text-text-secondary text-center text-sm mt-2">
              Live reactions on every channel.
            </p>
          </div>

          {/* Auth Toggle */}
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

          {/* Form */}
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
              : "Don't have an account? Switch to Create Account."}
          </p>
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
          <div
            key={fe.id}
            className="emoji-float text-3xl z-50"
            style={{ left: `${fe.x}%`, bottom: "120px" }}
          >
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
              <span className="text-xs font-medium text-live-red">{liveCount.toLocaleString()} live</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div ref={chatRef} className="flex-1 chat-scroll px-4 pt-3 pb-2">
          {messages.map((msg, i) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 mb-3 animate-msg ${msg.isMe ? "flex-row-reverse" : ""}`}
              style={{ animationDelay: `${Math.min(i * 0.03, 0.2)}s` }}
            >
              <div className="text-xl flex-shrink-0 mt-0.5">{msg.avatar}</div>
              <div className={`max-w-[75%] ${msg.isMe ? "items-end" : ""}`}>
                <div className="flex items-center gap-2 mb-0.5">
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
        {/* Header */}
        <div className="safe-top px-4 pt-4 pb-2">
          <h1 className="text-xl font-bold text-text-primary">Profile</h1>
        </div>

        <div className="flex-1 px-4 overflow-y-auto pb-24">
          {/* Avatar & Name */}
          <div className="flex flex-col items-center mt-6 mb-8 animate-slide-up">
            <div className="w-20 h-20 bg-bg-card rounded-full flex items-center justify-center text-4xl mb-3 border-2 border-accent">
              {myAvatar}
            </div>
            <h2 className="text-xl font-bold text-text-primary">{username}</h2>
            <p className="text-text-secondary text-sm">@{username.toLowerCase().replace(/\s/g, "_")}</p>
          </div>

          {/* Stats */}
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

          {/* Badge */}
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

          {/* Sign Out */}
          <button
            onClick={() => {
              setUsername("");
              setScreen("auth");
              setTotalComments(0);
            }}
            className="w-full py-3 bg-bg-card border border-border rounded-xl text-live-red text-sm font-medium
                       mt-6 active:scale-[0.97] transition-transform cursor-pointer animate-slide-up stagger-4"
          >
            Sign Out
          </button>
        </div>

        {/* Tab Bar */}
        <TabBar screen={screen} onNavigate={setScreen} />
      </div>
    );
  }

  // ─── BROWSE ───
  return (
    <div className="h-full flex flex-col bg-bg-primary">
      {/* Header */}
      <div className="safe-top px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-text-primary animate-fade">
            💬 Comment<span className="text-accent">V</span>
          </h1>
          <div className="flex items-center gap-1.5 bg-bg-card px-2.5 py-1 rounded-full">
            <div className="live-dot" />
            <span className="text-[11px] text-text-secondary font-medium">
              {CHANNELS.reduce((s, c) => s + c.live, 0).toLocaleString()} watching
            </span>
          </div>
        </div>

        {/* Region Tabs */}
        <div className="flex gap-2 mb-3 animate-slide-up stagger-1">
          {([
            { key: "usa" as const, label: "🇺🇸 USA" },
            { key: "israel" as const, label: "🇮🇱 Israel" },
            { key: "europe" as const, label: "🇪🇺 Europe" },
          ]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => { setSelectedRegion(key); setSearchQuery(""); }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer
                ${selectedRegion === key
                  ? "bg-accent text-white"
                  : "bg-bg-card text-text-secondary"
                }`}
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
                  <span className="text-[10px] text-live-red font-medium">{ch.live.toLocaleString()}</span>
                </div>
              </div>
              <div className="font-semibold text-text-primary text-sm">{ch.name}</div>
              <div className="text-[11px] text-text-muted mt-0.5">Tap to join chat</div>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Bar */}
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
