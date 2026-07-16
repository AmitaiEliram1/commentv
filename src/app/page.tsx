"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  MessageCircle, Send, ChevronLeft, Search, User, LayoutGrid,
  Flame, Heart, ThumbsUp, Zap, Star, Laugh,
  Globe, ArrowRight, LogOut, Trophy, Mic, CornerDownRight, X,
} from "lucide-react";

// ─── TYPES ───
interface Message {
  id: string;
  user: string;
  color: string;
  text: string;
  time: number;
  isMe?: boolean;
  replyTo?: { user: string; text: string };
}

interface Channel {
  id: string;
  name: string;
  abbr: string;
  country: string;
  color: string;
}

interface Country {
  code: string;
  flag: string;
  name: string;
}

type Screen = "splash" | "auth" | "country" | "browse" | "chat" | "profile";

// ─── COUNTRIES ───
const COUNTRIES: Country[] = [
  { code: "us", flag: "🇺🇸", name: "United States" },
  { code: "il", flag: "🇮🇱", name: "Israel" },
  { code: "gb", flag: "🇬🇧", name: "United Kingdom" },
  { code: "de", flag: "🇩🇪", name: "Germany" },
  { code: "fr", flag: "🇫🇷", name: "France" },
  { code: "it", flag: "🇮🇹", name: "Italy" },
  { code: "es", flag: "🇪🇸", name: "Spain" },
  { code: "nl", flag: "🇳🇱", name: "Netherlands" },
  { code: "se", flag: "🇸🇪", name: "Sweden" },
  { code: "br", flag: "🇧🇷", name: "Brazil" },
  { code: "ca", flag: "🇨🇦", name: "Canada" },
  { code: "au", flag: "🇦🇺", name: "Australia" },
  { code: "jp", flag: "🇯🇵", name: "Japan" },
  { code: "kr", flag: "🇰🇷", name: "South Korea" },
  { code: "in", flag: "🇮🇳", name: "India" },
  { code: "mx", flag: "🇲🇽", name: "Mexico" },
  { code: "ar", flag: "🇦🇷", name: "Argentina" },
  { code: "tr", flag: "🇹🇷", name: "Turkey" },
  { code: "pl", flag: "🇵🇱", name: "Poland" },
  { code: "pt", flag: "🇵🇹", name: "Portugal" },
];

// ─── CHANNELS BY COUNTRY ───
const CHANNELS: Channel[] = [
  // US
  { id: "nbc", name: "NBC", abbr: "NBC", country: "us", color: "#3B82F6" },
  { id: "cbs", name: "CBS", abbr: "CBS", country: "us", color: "#6366F1" },
  { id: "abc", name: "ABC", abbr: "ABC", country: "us", color: "#F59E0B" },
  { id: "fox", name: "FOX", abbr: "FOX", country: "us", color: "#EF4444" },
  { id: "hbo", name: "HBO", abbr: "HBO", country: "us", color: "#8B5CF6" },
  { id: "cnn", name: "CNN", abbr: "CNN", country: "us", color: "#DC2626" },
  { id: "espn", name: "ESPN", abbr: "ESP", country: "us", color: "#10B981" },
  { id: "netflix-us", name: "Netflix", abbr: "NF", country: "us", color: "#E11D48" },
  { id: "hulu", name: "Hulu", abbr: "HU", country: "us", color: "#22C55E" },
  { id: "amc", name: "AMC", abbr: "AMC", country: "us", color: "#F97316" },
  // Israel
  { id: "ch12", name: "Channel 12", abbr: "12", country: "il", color: "#3B82F6" },
  { id: "ch13", name: "Channel 13", abbr: "13", country: "il", color: "#F97316" },
  { id: "kan11", name: "KAN 11", abbr: "11", country: "il", color: "#8B5CF6" },
  { id: "hot", name: "HOT", abbr: "HOT", country: "il", color: "#EF4444" },
  { id: "yes-tv", name: "YES", abbr: "YES", country: "il", color: "#22C55E" },
  { id: "sport5", name: "Sport 5", abbr: "S5", country: "il", color: "#F59E0B" },
  // UK
  { id: "bbc", name: "BBC", abbr: "BBC", country: "gb", color: "#1D4ED8" },
  { id: "itv", name: "ITV", abbr: "ITV", country: "gb", color: "#6366F1" },
  { id: "sky-uk", name: "Sky", abbr: "SKY", country: "gb", color: "#0EA5E9" },
  { id: "ch4", name: "Channel 4", abbr: "C4", country: "gb", color: "#F97316" },
  // Germany
  { id: "ard", name: "ARD", abbr: "ARD", country: "de", color: "#3B82F6" },
  { id: "zdf", name: "ZDF", abbr: "ZDF", country: "de", color: "#F97316" },
  { id: "rtl", name: "RTL", abbr: "RTL", country: "de", color: "#EF4444" },
  { id: "sat1", name: "SAT.1", abbr: "S1", country: "de", color: "#8B5CF6" },
  // France
  { id: "tf1", name: "TF1", abbr: "TF1", country: "fr", color: "#1D4ED8" },
  { id: "france2", name: "France 2", abbr: "F2", country: "fr", color: "#EF4444" },
  { id: "france3", name: "France 3", abbr: "F3", country: "fr", color: "#3B82F6" },
  { id: "m6", name: "M6", abbr: "M6", country: "fr", color: "#F59E0B" },
  // Italy
  { id: "rai1", name: "RAI 1", abbr: "R1", country: "it", color: "#3B82F6" },
  { id: "rai2", name: "RAI 2", abbr: "R2", country: "it", color: "#22C55E" },
  { id: "canale5", name: "Canale 5", abbr: "C5", country: "it", color: "#EF4444" },
  { id: "italia1", name: "Italia 1", abbr: "I1", country: "it", color: "#F59E0B" },
  // Spain
  { id: "tve", name: "TVE", abbr: "TVE", country: "es", color: "#DC2626" },
  { id: "antena3", name: "Antena 3", abbr: "A3", country: "es", color: "#F97316" },
  { id: "telecinco", name: "Telecinco", abbr: "T5", country: "es", color: "#6366F1" },
  // Netherlands
  { id: "npo1", name: "NPO 1", abbr: "N1", country: "nl", color: "#F97316" },
  { id: "rtl4", name: "RTL 4", abbr: "R4", country: "nl", color: "#3B82F6" },
  { id: "sbs6", name: "SBS 6", abbr: "S6", country: "nl", color: "#22C55E" },
  // Sweden
  { id: "svt1", name: "SVT 1", abbr: "SV", country: "se", color: "#3B82F6" },
  { id: "tv4-se", name: "TV4", abbr: "T4", country: "se", color: "#EF4444" },
  // Brazil
  { id: "globo", name: "Globo", abbr: "GLO", country: "br", color: "#EF4444" },
  { id: "sbt", name: "SBT", abbr: "SBT", country: "br", color: "#F59E0B" },
  { id: "record", name: "Record", abbr: "REC", country: "br", color: "#22C55E" },
  // Canada
  { id: "cbc", name: "CBC", abbr: "CBC", country: "ca", color: "#DC2626" },
  { id: "ctv", name: "CTV", abbr: "CTV", country: "ca", color: "#3B82F6" },
  // Australia
  { id: "abc-au", name: "ABC", abbr: "ABC", country: "au", color: "#1D4ED8" },
  { id: "nine", name: "Nine", abbr: "9", country: "au", color: "#6366F1" },
  { id: "seven", name: "Seven", abbr: "7", country: "au", color: "#EF4444" },
  // Japan
  { id: "nhk", name: "NHK", abbr: "NHK", country: "jp", color: "#DC2626" },
  { id: "fuji", name: "Fuji TV", abbr: "FJ", country: "jp", color: "#3B82F6" },
  // South Korea
  { id: "kbs", name: "KBS", abbr: "KBS", country: "kr", color: "#3B82F6" },
  { id: "mbc", name: "MBC", abbr: "MBC", country: "kr", color: "#22C55E" },
  { id: "sbs-kr", name: "SBS", abbr: "SBS", country: "kr", color: "#EF4444" },
  // India
  { id: "star", name: "Star Plus", abbr: "ST", country: "in", color: "#DC2626" },
  { id: "zee", name: "Zee TV", abbr: "ZEE", country: "in", color: "#3B82F6" },
  { id: "colors", name: "Colors", abbr: "CLR", country: "in", color: "#8B5CF6" },
  // Mexico
  { id: "televisa", name: "Televisa", abbr: "TVA", country: "mx", color: "#3B82F6" },
  { id: "azteca", name: "TV Azteca", abbr: "AZT", country: "mx", color: "#F59E0B" },
  // Argentina
  { id: "telefe", name: "Telefe", abbr: "TF", country: "ar", color: "#6366F1" },
  { id: "eltrece", name: "El Trece", abbr: "13", country: "ar", color: "#EF4444" },
  // Turkey
  { id: "trt", name: "TRT", abbr: "TRT", country: "tr", color: "#DC2626" },
  { id: "atv", name: "ATV", abbr: "ATV", country: "tr", color: "#F97316" },
  { id: "show", name: "Show TV", abbr: "SH", country: "tr", color: "#3B82F6" },
  // Poland
  { id: "tvp1", name: "TVP 1", abbr: "TV1", country: "pl", color: "#DC2626" },
  { id: "polsat", name: "Polsat", abbr: "POL", country: "pl", color: "#3B82F6" },
  { id: "tvn", name: "TVN", abbr: "TVN", country: "pl", color: "#22C55E" },
  // Portugal
  { id: "rtp1", name: "RTP 1", abbr: "R1", country: "pt", color: "#3B82F6" },
  { id: "sic", name: "SIC", abbr: "SIC", country: "pt", color: "#EF4444" },
  { id: "tvi", name: "TVI", abbr: "TVI", country: "pt", color: "#F97316" },
];

const USER_COLORS = [
  "#8B5CF6", "#3B82F6", "#10B981", "#F59E0B", "#EF4444",
  "#EC4899", "#06B6D4", "#F97316", "#6366F1", "#14B8A6",
];

const QUICK_REACTIONS = [
  { icon: Flame, label: "fire" },
  { icon: Laugh, label: "haha" },
  { icon: Zap, label: "shock" },
  { icon: ThumbsUp, label: "like" },
  { icon: Heart, label: "love" },
  { icon: Star, label: "star" },
];

// ─── SEED MESSAGES BY COUNTRY ───
const SEED_MESSAGES: Record<string, { user: string; text: string }[]> = {
  us: [
    { user: "mike_LA", text: "OMG did you just see that?!" },
    { user: "sarah_nyc", text: "This show is absolute fire" },
    { user: "couch_king", text: "I called it from the first episode" },
    { user: "binge_queen", text: "Plot twist of the year!!" },
    { user: "tv_junkie", text: "Who else is watching this right now?" },
    { user: "remote_warrior", text: "Best episode of the season hands down" },
    { user: "night_owl", text: "The writing this season is insane" },
    { user: "stream_beast", text: "YOOOOO what just happened" },
  ],
  il: [
    { user: "ori_tlv", text: "אחלה פרק!! לא מאמין מה קרה עכשיו" },
    { user: "michal_jlm", text: "הסדרה הזאת פשוט מטורפת" },
    { user: "dani_haifa", text: "ידעתי מהרגע הראשון שזה יקרה" },
    { user: "shira_rg", text: "מי עוד צופה עכשיו? תגיבו!" },
    { user: "yossi_bs", text: "הפרק הכי טוב העונה בלי ספק" },
    { user: "noa_herzl", text: "אני בשוק מהתפנית הזאת" },
    { user: "itai_nt", text: "השחקנים פה משחקים ברמה אחרת" },
    { user: "roni_rl", text: "מחכה שבוע שלם לפרק הזה" },
  ],
  gb: [
    { user: "james_london", text: "Brilliant episode, absolutely brilliant!" },
    { user: "emma_dublin", text: "Can't believe what just happened!" },
    { user: "oliver_manc", text: "This is proper telly right here" },
    { user: "sophie_edin", text: "Best thing on the box tonight" },
  ],
  de: [
    { user: "hans_berlin", text: "Diese Folge ist unglaublich!" },
    { user: "felix_munich", text: "Wahnsinn! Beste Serie 2026" },
    { user: "lena_hamburg", text: "Ich bin sprachlos nach dem Ende" },
    { user: "max_koeln", text: "Das war die beste Folge bisher!" },
  ],
  fr: [
    { user: "marie_paris", text: "C'est incroyable cette serie!" },
    { user: "chloe_lyon", text: "Je suis choquee par la fin" },
    { user: "louis_nice", text: "Quel episode magnifique!" },
    { user: "camille_mars", text: "J'adore cette saison, vraiment top" },
  ],
  it: [
    { user: "luca_roma", text: "Mamma mia che puntata!!" },
    { user: "marco_milan", text: "Ogni settimana migliora! Fantastico" },
    { user: "giulia_napoli", text: "Non ci posso credere!" },
  ],
  es: [
    { user: "carlos_madrid", text: "Que episodio tan increible!" },
    { user: "lucia_bcn", text: "No puedo creer lo que paso!" },
    { user: "pablo_sevilla", text: "Esta serie es la mejor del ano" },
  ],
  br: [
    { user: "lucas_sp", text: "Que episodio incrivel!" },
    { user: "ana_rio", text: "Nao acredito no que aconteceu!" },
    { user: "pedro_bh", text: "Melhor novela da televisao!" },
  ],
  jp: [
    { user: "yuki_tokyo", text: "すごい展開だった！" },
    { user: "hiro_osaka", text: "最高のエピソードだ！" },
    { user: "sakura_kyo", text: "信じられない結末！" },
  ],
  kr: [
    { user: "minjun_seoul", text: "대박! 이번 회 진짜 최고!" },
    { user: "jiyeon_busan", text: "이 드라마 진짜 미쳤다" },
    { user: "hyun_incheon", text: "반전이 너무 좋았어!" },
  ],
};

// Fallback English seeds for countries without localized messages
const DEFAULT_SEEDS = [
  { user: "viewer_1", text: "Great episode!" },
  { user: "fan_99", text: "This show is amazing" },
  { user: "watcher_x", text: "Can't stop watching" },
  { user: "tv_lover", text: "Best show on TV right now" },
];

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
  const [selectedCountry, setSelectedCountry] = useState<string>("us");
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [myColor] = useState(() => USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)]);
  const [floatingReactions, setFloatingReactions] = useState<{ id: string; label: string; x: number }[]>([]);
  const [replyingTo, setReplyingTo] = useState<{ user: string; text: string } | null>(null);
  const [liveCount, setLiveCount] = useState(0);
  const [totalComments, setTotalComments] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [countrySearch, setCountrySearch] = useState("");
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

    fetch(`/api/messages?channel=${channelId}&_t=${Date.now()}`, { cache: "no-store" })
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

    pollRef.current = setInterval(() => {
      fetch(`/api/messages?channel=${channelId}&since=${lastTimeRef.current}&_t=${Date.now()}`, { cache: "no-store" })
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
    }, 1000);
  }, [username]);

  const stopPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    if (presenceRef.current) { clearInterval(presenceRef.current); presenceRef.current = null; }
  }, []);

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

  const seedMessages = useCallback(async (channelId: string, countryCode: string) => {
    try {
      const res = await fetch(`/api/messages?channel=${channelId}&_t=${Date.now()}`, { cache: "no-store" });
      const data = await res.json();
      if (data.messages?.length > 0) return;
    } catch { /* continue */ }

    const seeds = SEED_MESSAGES[countryCode] || DEFAULT_SEEDS;
    const shuffled = [...seeds].sort(() => Math.random() - 0.5).slice(0, 5);
    for (const seed of shuffled) {
      const color = USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: channelId, user: seed.user, color, text: seed.text }),
      });
      await new Promise((r) => setTimeout(r, 100));
    }
  }, []);

  const enterChannel = async (ch: Channel) => {
    setActiveChannel(ch);
    setScreen("chat");
    await seedMessages(ch.id, ch.country);
    startPolling(ch.id);
    startPresence(ch.id);
  };

  const leaveChannel = () => {
    stopPolling();
    setActiveChannel(null);
    setMessages([]);
    setReplyingTo(null);
    setScreen("browse");
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !activeChannel) return;
    const text = inputText.trim();
    const reply = replyingTo ? { user: replyingTo.user, text: replyingTo.text } : undefined;
    setInputText("");
    setReplyingTo(null);
    inputRef.current?.focus();

    const localMsg: Message = {
      id: `local-${Date.now()}`,
      user: username,
      color: myColor,
      text,
      time: Date.now(),
      isMe: true,
      replyTo: reply,
    };
    seenIdsRef.current.add(localMsg.id);
    setMessages((prev) => [...prev.slice(-80), localMsg]);
    setTotalComments((c) => c + 1);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: activeChannel.id, user: username, color: myColor, text, replyTo: reply,
        }),
      });
      const data = await res.json();
      if (data.message) {
        seenIdsRef.current.add(data.message.id);
        lastTimeRef.current = Math.max(lastTimeRef.current, data.message.time);
      }
    } catch { /* local fallback */ }
  };

  const sendReaction = (label: string) => {
    const text = `[${label}]`;
    const localMsg: Message = {
      id: `local-${Date.now()}`,
      user: username,
      color: myColor,
      text,
      time: Date.now(),
      isMe: true,
    };
    seenIdsRef.current.add(localMsg.id);
    setMessages((prev) => [...prev.slice(-80), localMsg]);
    setTotalComments((c) => c + 1);

    // Float animation
    const floatId = `float-${Date.now()}`;
    const x = 20 + Math.random() * 60;
    setFloatingReactions((prev) => [...prev, { id: floatId, label, x }]);
    setTimeout(() => setFloatingReactions((prev) => prev.filter((e) => e.id !== floatId)), 1000);

    if (activeChannel) {
      fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: activeChannel.id, user: username, color: myColor, text }),
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

  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 5000);
    return () => clearInterval(t);
  }, []);

  const filteredChannels = CHANNELS.filter(
    (ch) => ch.country === selectedCountry &&
      ch.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCountries = COUNTRIES.filter(
    (c) => c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const selectedCountryData = COUNTRIES.find((c) => c.code === selectedCountry);

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

  const ReactionIcon = ({ label }: { label: string }) => {
    const r = QUICK_REACTIONS.find((q) => q.label === label);
    if (!r) return null;
    const Icon = r.icon;
    return <Icon className="w-5 h-5" />;
  };

  // ─── SPLASH ───
  if (screen === "splash") {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-bg-primary safe-top safe-bottom">
        <div className="animate-bounce-in">
          <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center mb-4 mx-auto">
            <MessageCircle className="w-8 h-8 text-accent" />
          </div>
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
            <div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center mb-3 mx-auto">
              <MessageCircle className="w-7 h-7 text-accent" />
            </div>
            <h1 className="text-3xl font-bold text-center text-text-primary tracking-tight">
              Comment<span className="text-accent">V</span>
            </h1>
            <p className="text-text-secondary text-center text-sm mt-2">Live reactions on every channel.</p>
          </div>

          <div className="flex bg-bg-card rounded-xl p-1 mt-8 mb-6 w-full max-w-xs animate-slide-up stagger-1">
            <button onClick={() => setAuthMode("signin")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${authMode === "signin" ? "bg-accent text-white" : "text-text-secondary"}`}>
              Sign In
            </button>
            <button onClick={() => setAuthMode("signup")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${authMode === "signup" ? "bg-accent text-white" : "text-text-secondary"}`}>
              Create Account
            </button>
          </div>

          <div className="w-full max-w-xs space-y-3 animate-slide-up stagger-2">
            {authMode === "signup" && (
              <input type="text" value={signUpName} onChange={(e) => setSignUpName(e.target.value)}
                placeholder="Username" className="w-full px-4 py-3.5 bg-bg-card border border-border rounded-xl text-text-primary text-sm placeholder:text-text-muted" />
            )}
            <input type="email" value={authMode === "signup" ? signUpEmail : signinEmail}
              onChange={(e) => authMode === "signup" ? setSignUpEmail(e.target.value) : setSigninEmail(e.target.value)}
              placeholder="Email" className="w-full px-4 py-3.5 bg-bg-card border border-border rounded-xl text-text-primary text-sm placeholder:text-text-muted" />
            <input type="password" value={authMode === "signup" ? signUpPassword : signinPassword}
              onChange={(e) => authMode === "signup" ? setSignUpPassword(e.target.value) : setSigninPassword(e.target.value)}
              placeholder="Password" className="w-full px-4 py-3.5 bg-bg-card border border-border rounded-xl text-text-primary text-sm placeholder:text-text-muted"
              onKeyDown={(e) => e.key === "Enter" && handleAuth()} />
            <button onClick={handleAuth}
              className="w-full py-3.5 bg-accent text-white font-semibold rounded-xl text-sm hover:bg-accent-hover active:scale-[0.97] transition-all animate-glow cursor-pointer">
              {authMode === "signup" ? "Join CommentV" : "Sign In"}
            </button>
          </div>

          <p className="text-text-muted text-xs mt-6 text-center animate-slide-up stagger-3">
            {authMode === "signup" ? "By joining, you agree to keep it fun and respectful." : "Don\u0027t have an account? Switch to Create Account."}
          </p>
        </div>
      </div>
    );
  }

  // ─── COUNTRY SELECTION ───
  if (screen === "country") {
    return (
      <div className="h-full flex flex-col bg-bg-primary safe-top safe-bottom">
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center gap-3 mb-4 animate-slide-up">
            <Globe className="w-6 h-6 text-accent" />
            <h1 className="text-xl font-bold text-text-primary">Select Your Country</h1>
          </div>
          <div className="relative animate-slide-up stagger-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input type="text" value={countrySearch} onChange={(e) => setCountrySearch(e.target.value)}
              placeholder="Search countries..."
              className="w-full pl-10 pr-4 py-2.5 bg-bg-card border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-8 chat-scroll">
          <div className="space-y-2">
            {filteredCountries.map((c, i) => (
              <button key={c.code}
                onClick={() => { setSelectedCountry(c.code); setCountrySearch(""); setScreen("browse"); }}
                className={`w-full flex items-center gap-4 bg-bg-card border border-border rounded-xl px-4 py-3.5
                           active:scale-[0.97] active:border-accent/50 transition-all cursor-pointer
                           animate-slide-up stagger-${Math.min(i + 1, 6)}`}>
                <span className="text-2xl">{c.flag}</span>
                <span className="font-medium text-text-primary text-sm flex-1 text-left">{c.name}</span>
                <ArrowRight className="w-4 h-4 text-text-muted" />
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
        {/* Floating reactions */}
        {floatingReactions.map((fr) => (
          <div key={fr.id} className="emoji-float text-accent z-50" style={{ left: `${fr.x}%`, bottom: "120px" }}>
            <ReactionIcon label={fr.label} />
          </div>
        ))}

        {/* Header */}
        <div className="glass safe-top border-b border-border z-10">
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={leaveChannel} className="flex items-center gap-2 cursor-pointer">
              <ChevronLeft className="w-5 h-5 text-text-primary" />
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                style={{ backgroundColor: activeChannel.color }}>
                {activeChannel.abbr}
              </div>
              <span className="font-bold text-text-primary text-sm">{activeChannel.name}</span>
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
              <MessageCircle className="w-10 h-10 text-text-muted mb-3" />
              <p className="text-text-secondary text-sm">Loading chat...</p>
            </div>
          )}
          {messages.map((msg) => (
            <SwipeMessage key={msg.id} msg={msg} timeAgo={timeAgo(msg.time)}
              onReply={() => { setReplyingTo({ user: msg.isMe ? "you" : msg.user, text: msg.text }); inputRef.current?.focus(); }} />
          ))}
        </div>

        {/* Quick Reactions */}
        <div className="px-4 py-2 flex gap-2 justify-center">
          {QUICK_REACTIONS.map((r) => {
            const Icon = r.icon;
            return (
              <button key={r.label} onClick={() => sendReaction(r.label)}
                className="w-10 h-10 flex items-center justify-center bg-bg-card rounded-full
                           active:scale-90 transition-transform cursor-pointer hover:bg-bg-input text-text-secondary hover:text-accent">
                <Icon className="w-5 h-5" />
              </button>
            );
          })}
        </div>

        {/* Reply Preview */}
        {replyingTo && (
          <div className="px-4 animate-slide-up">
            <div className="flex items-center gap-2 bg-bg-card border-l-2 border-accent rounded-lg px-3 py-2 mb-1">
              <CornerDownRight className="w-3.5 h-3.5 text-accent flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[10px] text-accent font-semibold">Replying to {replyingTo.user}</div>
                <div className="text-xs text-text-secondary truncate">{replyingTo.text}</div>
              </div>
              <button onClick={() => setReplyingTo(null)} className="text-text-muted cursor-pointer flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="px-4 pb-2 safe-bottom">
          <div className="flex gap-2 items-center">
            <input ref={inputRef} type="text" value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder={replyingTo ? `Reply to ${replyingTo.user}...` : "Say something..."}
              className="flex-1 px-4 py-3 bg-bg-card border border-border rounded-full text-sm text-text-primary placeholder:text-text-muted" />
            <button onClick={sendMessage}
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-all cursor-pointer
                ${inputText.trim() ? "bg-accent active:scale-90" : "bg-bg-card"}`}>
              <Send className={`w-5 h-5 ${inputText.trim() ? "text-white" : "text-text-muted"}`} />
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
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-3 border-2 border-accent"
              style={{ backgroundColor: myColor }}>
              {username.slice(0, 2).toUpperCase()}
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
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-accent" />
            </div>
            <div>
              <div className="font-semibold text-text-primary text-sm">First Steps</div>
              <div className="text-xs text-text-secondary">Joined CommentV - welcome aboard!</div>
            </div>
          </div>

          <div className="bg-bg-card rounded-xl p-4 mb-4 flex items-center gap-4 animate-slide-up stagger-3">
            <div className="w-10 h-10 rounded-full bg-bg-input flex items-center justify-center">
              <Mic className="w-5 h-5 text-text-muted" />
            </div>
            <div>
              <div className="font-semibold text-text-primary text-sm">Voice of the People</div>
              <div className="text-xs text-text-secondary">Leave 10 comments to unlock</div>
            </div>
          </div>

          <button onClick={() => setScreen("country")}
            className="w-full py-3 bg-bg-card border border-border rounded-xl text-text-primary text-sm font-medium
                       mt-2 active:scale-[0.97] transition-transform cursor-pointer animate-slide-up stagger-4 flex items-center justify-center gap-2">
            <Globe className="w-4 h-4" /> Change Country
          </button>

          <button onClick={() => { setUsername(""); setScreen("auth"); setTotalComments(0); stopPolling(); }}
            className="w-full py-3 bg-bg-card border border-border rounded-xl text-live-red text-sm font-medium
                       mt-3 active:scale-[0.97] transition-transform cursor-pointer animate-slide-up stagger-5 flex items-center justify-center gap-2">
            <LogOut className="w-4 h-4" /> Sign Out
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
            <span className="text-accent">Comment</span>V
          </h1>
          <button onClick={() => setScreen("country")}
            className="flex items-center gap-1.5 bg-bg-card px-3 py-1.5 rounded-full cursor-pointer active:scale-95 transition-transform">
            <span className="text-sm">{selectedCountryData?.flag}</span>
            <span className="text-xs text-text-secondary font-medium">{selectedCountryData?.name}</span>
          </button>
        </div>

        <div className="relative animate-slide-up stagger-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search channels..."
            className="w-full pl-10 pr-4 py-2.5 bg-bg-card border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-24 chat-scroll">
        <div className="grid grid-cols-2 gap-3">
          {filteredChannels.map((ch, i) => (
            <button key={ch.id} onClick={() => enterChannel(ch)}
              className={`channel-card bg-bg-card rounded-2xl p-4 text-left border border-border
                         active:border-accent/50 cursor-pointer animate-slide-up stagger-${Math.min(i + 1, 6)}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: ch.color }}>
                  {ch.abbr}
                </div>
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

// ─── SWIPE MESSAGE ───
function SwipeMessage({ msg, timeAgo, onReply }: { msg: Message; timeAgo: string; onReply: () => void }) {
  const [offsetX, setOffsetX] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const startXRef = useRef(0);
  const triggered = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    triggered.current = false;
    setSwiping(true);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swiping) return;
    const dx = e.touches[0].clientX - startXRef.current;
    setOffsetX(Math.max(0, Math.min(dx, 80)));
    if (dx > 60 && !triggered.current) triggered.current = true;
  };
  const handleTouchEnd = () => {
    setSwiping(false);
    if (triggered.current) onReply();
    setOffsetX(0);
  };

  const isReaction = msg.text.startsWith("[") && msg.text.endsWith("]");
  const reactionLabel = isReaction ? msg.text.slice(1, -1) : null;

  return (
    <div className="relative mb-3 overflow-hidden"
      onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      {/* Reply indicator */}
      <div className="absolute left-0 top-0 bottom-0 flex items-center pl-3 transition-opacity"
        style={{ opacity: offsetX > 20 ? Math.min((offsetX - 20) / 40, 1) : 0 }}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${offsetX > 60 ? "bg-accent scale-110" : "bg-bg-card"}`}>
          <CornerDownRight className={`w-4 h-4 ${offsetX > 60 ? "text-white" : "text-text-muted"}`} />
        </div>
      </div>

      <div className={`flex gap-2.5 animate-msg ${msg.isMe ? "flex-row-reverse" : ""}`}
        style={{ transform: `translateX(${offsetX}px)`, transition: swiping ? "none" : "transform 0.2s ease" }}>
        {/* Avatar */}
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5"
          style={{ backgroundColor: msg.color || "#8B5CF6" }}>
          {msg.user.slice(0, 2).toUpperCase()}
        </div>
        <div className={`max-w-[75%] ${msg.isMe ? "items-end" : ""}`}>
          <div className={`flex items-center gap-2 mb-0.5 ${msg.isMe ? "flex-row-reverse" : ""}`}>
            <span className={`text-xs font-semibold ${msg.isMe ? "text-accent" : "text-text-secondary"}`}>
              {msg.isMe ? "you" : msg.user}
            </span>
            <span className="text-[10px] text-text-muted">{timeAgo}</span>
          </div>
          {msg.replyTo && (
            <div className={`border-l-2 border-accent/50 pl-2 mb-1 ${msg.isMe ? "ml-auto" : ""}`}>
              <div className="text-[10px] text-accent/70 font-semibold">{msg.replyTo.user}</div>
              <div className="text-[11px] text-text-muted truncate max-w-[200px]">{msg.replyTo.text}</div>
            </div>
          )}
          {reactionLabel ? (
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${msg.isMe ? "bg-accent/20 text-accent ml-auto" : "bg-bg-card text-text-primary"}`}>
              <ReactionIconStatic label={reactionLabel} />
            </div>
          ) : (
            <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed
              ${msg.isMe ? "bg-accent text-white rounded-tr-sm" : "bg-bg-card text-text-primary rounded-tl-sm"}`}>
              {msg.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReactionIconStatic({ label }: { label: string }) {
  const icons: Record<string, typeof Flame> = { fire: Flame, haha: Laugh, shock: Zap, like: ThumbsUp, love: Heart, star: Star };
  const Icon = icons[label];
  return Icon ? <Icon className="w-5 h-5" /> : <span className="text-sm">{label}</span>;
}

// ─── TAB BAR ───
function TabBar({ screen, onNavigate }: { screen: Screen; onNavigate: (s: Screen) => void }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 glass border-t border-border safe-bottom z-20">
      <div className="flex items-center justify-around px-4 py-2 max-w-lg mx-auto">
        <button onClick={() => onNavigate("browse")}
          className={`tab-item flex flex-col items-center gap-0.5 px-4 py-1 cursor-pointer ${screen === "browse" ? "active" : ""}`}>
          <LayoutGrid className="w-6 h-6" strokeWidth={screen === "browse" ? 2.5 : 1.5} />
          <span className="text-[10px] font-medium">Browse</span>
        </button>
        <button onClick={() => onNavigate("profile")}
          className={`tab-item flex flex-col items-center gap-0.5 px-4 py-1 cursor-pointer ${screen === "profile" ? "active" : ""}`}>
          <User className="w-6 h-6" strokeWidth={screen === "profile" ? 2.5 : 1.5} />
          <span className="text-[10px] font-medium">Profile</span>
        </button>
      </div>
    </div>
  );
}
