"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { API_V1_BASE } from "@/lib/config";

interface SupportMessage {
  id: string;
  name: string;
  email: string;
  category: string;
  message: string;
  status: "new" | "read" | "replied";
  admin_reply: string | null;
  created_at: string;
  replied_at: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  new: "bg-red-100 text-red-700 border-red-200",
  read: "bg-amber-100 text-amber-700 border-amber-200",
  replied: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const CATEGORY_LABELS: Record<string, string> = {
  payout: "Payout",
  policy: "Policy",
  account: "Account",
  technical: "Technical",
  other: "Other",
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function SupportInboxPage() {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<SupportMessage | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState<"all" | "new" | "read" | "replied">("all");

  async function fetchMessages() {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      const res = await fetch(`${API_V1_BASE}/support/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Unauthorized");
      const data = await res.json();
      setMessages(data);
    } catch {
      setError("Failed to load messages.");
    } finally {
      setLoading(false);
    }
  }

  async function markRead(id: string) {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    await fetch(`${API_V1_BASE}/support/messages/${id}/read`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    setMessages(prev => prev.map(m => m.id === id && m.status === "new" ? { ...m, status: "read" } : m));
  }

  async function sendReply(id: string) {
    if (!reply.trim()) return;
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    setSending(true);
    try {
      const res = await fetch(`${API_V1_BASE}/support/messages/${id}/reply`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ reply }),
      });
      if (!res.ok) throw new Error("Failed");
      setMessages(prev => prev.map(m => m.id === id ? { ...m, status: "replied", admin_reply: reply } : m));
      setSelected(prev => prev ? { ...prev, status: "replied", admin_reply: reply } : null);
      setReply("");
    } catch {
      // silent
    } finally {
      setSending(false);
    }
  }

  useEffect(() => { fetchMessages(); }, []);

  const filtered = filter === "all" ? messages : messages.filter(m => m.status === filter);
  const newCount = messages.filter(m => m.status === "new").length;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Support Inbox</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {newCount > 0 ? (
              <span className="text-red-600 font-semibold">{newCount} unread message{newCount > 1 ? "s" : ""}</span>
            ) : (
              "All messages read"
            )}
            {" · "}{messages.length} total
          </p>
        </div>
        <button onClick={fetchMessages} className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">
          Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {(["all", "new", "read", "replied"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border capitalize transition-all ${filter === f ? "bg-[#0F2044] text-white border-[#0F2044]" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"}`}>
            {f === "all" ? `All (${messages.length})` : f === "new" ? `New (${messages.filter(m => m.status === "new").length})` : f === "read" ? `Read (${messages.filter(m => m.status === "read").length})` : `Replied (${messages.filter(m => m.status === "replied").length})`}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm mb-5">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-2 border-[#0F2044] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <div className="text-4xl mb-3">📭</div>
          <p className="font-semibold">No messages here</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[380px_1fr] gap-6">
          {/* Message list */}
          <div className="space-y-2 max-h-[calc(100vh-230px)] overflow-y-auto pr-1">
            {filtered.map(msg => (
              <motion.button key={msg.id} layout
                onClick={() => { setSelected(msg); setReply(""); if (msg.status === "new") markRead(msg.id); }}
                className={`w-full text-left p-4 rounded-xl border transition-all ${selected?.id === msg.id ? "bg-[#0F2044] text-white border-[#0F2044] shadow-md" : "bg-white border-slate-200 hover:border-slate-300"}`}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className={`font-bold text-sm truncate ${selected?.id === msg.id ? "text-white" : "text-slate-900"}`}>{msg.name}</span>
                  <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${selected?.id === msg.id ? "bg-white/20 text-white border-white/30" : STATUS_COLORS[msg.status]}`}>
                    {msg.status}
                  </span>
                </div>
                <p className={`text-xs truncate mb-2 ${selected?.id === msg.id ? "text-white/70" : "text-slate-500"}`}>{msg.email}</p>
                <p className={`text-xs line-clamp-2 ${selected?.id === msg.id ? "text-white/80" : "text-slate-600"}`}>{msg.message}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${selected?.id === msg.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                    {CATEGORY_LABELS[msg.category] || msg.category}
                  </span>
                  <span className={`text-[10px] ${selected?.id === msg.id ? "text-white/60" : "text-slate-400"}`}>{formatDate(msg.created_at)}</span>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Detail pane */}
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div key={selected.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-5 max-h-[calc(100vh-230px)] overflow-y-auto">

                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-extrabold text-slate-900 text-lg">{selected.name}</h2>
                    <a href={`mailto:${selected.email}`} className="text-[#0F2044] text-sm font-semibold hover:underline">{selected.email}</a>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border capitalize ${STATUS_COLORS[selected.status]}`}>{selected.status}</span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 capitalize">{CATEGORY_LABELS[selected.category] || selected.category}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-400">Received {formatDate(selected.created_at)}</div>

                {/* Message */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                </div>

                {/* Existing reply */}
                {selected.admin_reply && (
                  <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Your reply</span>
                      <span className="text-xs text-emerald-600">{formatDate(selected.replied_at)}</span>
                    </div>
                    <p className="text-sm text-emerald-800 leading-relaxed whitespace-pre-wrap">{selected.admin_reply}</p>
                  </div>
                )}

                {/* Reply box */}
                {selected.status !== "replied" && (
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Reply to {selected.name}
                    </label>
                    <textarea
                      rows={4}
                      value={reply}
                      onChange={e => setReply(e.target.value)}
                      placeholder="Type your reply here…"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#0F2044] focus:ring-2 focus:ring-[#0F2044]/10 bg-white transition resize-none"
                    />
                    <button
                      onClick={() => sendReply(selected.id)}
                      disabled={sending || !reply.trim()}
                      className="px-5 py-2.5 bg-[#0F2044] text-white font-bold text-sm rounded-xl hover:bg-[#1E3A5F] transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {sending ? "Sending…" : "Send reply →"}
                    </button>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-slate-400 text-sm">
                <div className="text-center">
                  <div className="text-4xl mb-3">👈</div>
                  <p className="font-semibold">Select a message to view</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
