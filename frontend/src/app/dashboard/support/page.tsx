"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { API_V1_BASE } from "@/lib/config";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Ticket {
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

// ── Constants ─────────────────────────────────────────────────────────────────

const FAQS = [
  { q: "My payout didn't arrive. What should I do?", a: "First, verify the event occurred in your registered zone. Then check your UPI ID under Profile → Edit. If both are correct, file a ticket below — we'll investigate within 24 hours." },
  { q: "How do I upgrade or change my plan?", a: "Go to My Policy → Change Plan. Upgrades take effect immediately. Downgrades apply from the next billing cycle." },
  { q: "How do I update my UPI or bank details?", a: "Go to Profile → Edit Profile → Payout Details. Changes are verified within 1 hour before payouts route to the new account." },
  { q: "Can I cancel my policy?", a: "Yes. Go to My Policy → Cancel. You'll remain covered until the end of the current billing week. No penalties." },
  { q: "Why was my payout less than expected?", a: "Payouts are calculated based on the event severity, your plan type, and the number of covered platforms. Check the payout breakdown in Live Triggers." },
  { q: "I'm seeing an error on my dashboard", a: "Try refreshing the page. If the error persists, clear your browser cache or try a different browser. Still stuck? File a ticket below." },
];

const CATEGORIES = [
  { id: "payout", label: "Payout issue", icon: "₹", color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
  { id: "policy", label: "Policy question", icon: "🛡", color: "bg-blue-50 border-blue-200 text-blue-700" },
  { id: "account", label: "Account / login", icon: "👤", color: "bg-purple-50 border-purple-200 text-purple-700" },
  { id: "technical", label: "Technical issue", icon: "⚙", color: "bg-orange-50 border-orange-200 text-orange-700" },
  { id: "other", label: "Other", icon: "💬", color: "bg-slate-50 border-slate-200 text-slate-700" },
];

const STATUS_BADGE: Record<string, string> = {
  new: "bg-amber-100 text-amber-700 border-amber-200",
  read: "bg-blue-100 text-blue-700 border-blue-200",
  replied: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const STATUS_LABEL: Record<string, string> = {
  new: "Submitted",
  read: "Under review",
  replied: "Replied",
};

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      <button onClick={() => setOpen(v => !v)}
        className="w-full text-left flex items-center justify-between gap-4 px-4 py-3.5 hover:bg-slate-50 transition-colors">
        <span className="font-semibold text-slate-800 text-sm">{q}</span>
        <motion.span animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }}
          className="text-slate-400 text-lg flex-shrink-0 font-light">+</motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
            <p className="px-4 pb-3.5 text-sm text-slate-500 leading-relaxed border-t border-slate-100 pt-3">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function WorkerSupportPage() {
  const [tab, setTab] = useState<"help" | "tickets" | "new">("help");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // New ticket form
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState("");

  function getToken() {
    return typeof window !== "undefined" ? localStorage.getItem("token") : null;
  }

  async function loadTickets() {
    setLoadingTickets(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_V1_BASE}/support/my-messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setTickets(await res.json());
      }
    } catch {}
    setLoadingTickets(false);
  }

  async function submitTicket(e: React.FormEvent) {
    e.preventDefault();
    if (!category || !message.trim()) { setFormError("Please select a category and describe your issue."); return; }
    setFormError(""); setSending(true);
    try {
      const res = await fetch(`${API_V1_BASE}/support/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Worker",
          email: "worker@giginsur.in",
          category,
          message: message.trim(),
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setSent(true);
      setMessage(""); setCategory("");
      // Refresh tickets
      setTimeout(() => loadTickets(), 500);
    } catch {
      setFormError("Failed to submit. Please try again or email support@giginsur.in.");
    } finally {
      setSending(false);
    }
  }

  useEffect(() => {
    loadTickets();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Customer Care</h1>
            <p className="text-slate-500 text-sm">Get help, track your tickets, or browse FAQs</p>
          </div>
        </div>
      </div>

      {/* Quick contact bar */}
      <div className="grid sm:grid-cols-3 gap-3 mb-6">
        {[
          { icon: "📧", label: "Email us", value: "support@giginsur.in", href: "mailto:support@giginsur.in" },
          { icon: "📞", label: "Request callback", value: "Free · within 2 hours", href: "#new-ticket" },
          { icon: "🕐", label: "Response time", value: "< 24 hours", href: "#" },
        ].map(c => (
          <a key={c.label} href={c.href}
            className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-3.5 hover:border-[#0F2044]/20 hover:shadow-sm transition-all group">
            <span className="text-xl flex-shrink-0">{c.icon}</span>
            <div>
              <div className="text-slate-800 font-semibold text-xs group-hover:text-[#0F2044] transition-colors">{c.label}</div>
              <div className="text-slate-400 text-[11px]">{c.value}</div>
            </div>
          </a>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 mb-6 w-fit">
        {([
          { id: "help", label: "FAQs & Help", icon: "📖" },
          { id: "tickets", label: `My Tickets${tickets.length ? ` (${tickets.length})` : ""}`, icon: "📋" },
          { id: "new", label: "New Ticket", icon: "✏️" },
        ] as const).map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); if (t.id === "tickets") loadTickets(); if (t.id === "new") { setSent(false); setFormError(""); } }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t.id ? "bg-[#0F2044] text-white shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}>
            <span className="text-sm">{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── FAQs & Help Tab ─────────────────────────────────────── */}
        {tab === "help" && (
          <motion.div key="help" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <div className="grid lg:grid-cols-[1fr_340px] gap-6">
              <div>
                <h2 className="font-bold text-slate-900 text-lg mb-4">Frequently Asked Questions</h2>
                <div className="space-y-2">
                  {FAQS.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5">
                  <h3 className="font-bold text-slate-900 text-sm mb-3">Quick Actions</h3>
                  <div className="space-y-2">
                    {[
                      { label: "Check my payout status", href: "/dashboard/triggers", icon: "⚡" },
                      { label: "Update my bank/UPI details", href: "/dashboard/profile", icon: "🏦" },
                      { label: "View my policy details", href: "/dashboard/my-policy", icon: "🛡️" },
                      { label: "View premium history", href: "/dashboard/my-premium", icon: "₹" },
                    ].map(a => (
                      <Link key={a.label} href={a.href}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group">
                        <span className="text-base">{a.icon}</span>
                        <span className="text-slate-700 text-sm font-medium group-hover:text-[#0F2044] transition-colors">{a.label}</span>
                        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 ml-auto"><path d="M9 18l6-6-6-6"/></svg>
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-emerald-700 font-bold text-xs uppercase tracking-wider">Support Online</span>
                  </div>
                  <p className="text-emerald-700 text-sm leading-relaxed mb-3">Our support team is available 7 days a week. Most issues are resolved within 24 hours.</p>
                  <button onClick={() => setTab("new")}
                    className="w-full py-2.5 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-700 transition-all">
                    Contact support →
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── My Tickets Tab ──────────────────────────────────────── */}
        {tab === "tickets" && (
          <motion.div key="tickets" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {loadingTickets ? (
              <div className="flex items-center justify-center h-40">
                <div className="w-6 h-6 border-2 border-[#0F2044] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">📭</div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">No tickets yet</h3>
                <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">You haven&apos;t submitted any support requests. If you need help, create a new ticket.</p>
                <button onClick={() => setTab("new")}
                  className="bg-[#0F2044] text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-[#1E3A5F] transition-all">
                  Create a ticket →
                </button>
              </div>
            ) : (
              <div className="grid lg:grid-cols-[380px_1fr] gap-6">
                {/* Ticket list */}
                <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto pr-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-500 text-sm font-medium">{tickets.length} ticket{tickets.length !== 1 ? "s" : ""}</span>
                    <button onClick={loadTickets} className="text-xs text-[#0F2044] font-semibold hover:underline">Refresh</button>
                  </div>
                  {tickets.map(t => (
                    <button key={t.id} onClick={() => setSelectedTicket(t)}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${selectedTicket?.id === t.id ? "bg-[#0F2044] text-white border-[#0F2044] shadow-md" : "bg-white border-slate-200 hover:border-slate-300"}`}>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border capitalize ${selectedTicket?.id === t.id ? "bg-white/20 text-white border-white/30" : STATUS_BADGE[t.status]}`}>
                          {STATUS_LABEL[t.status] || t.status}
                        </span>
                        <span className={`text-[10px] flex-shrink-0 ${selectedTicket?.id === t.id ? "text-white/60" : "text-slate-400"}`}>
                          {formatDate(t.created_at)}
                        </span>
                      </div>
                      <p className={`text-sm line-clamp-2 ${selectedTicket?.id === t.id ? "text-white/90" : "text-slate-700"}`}>{t.message}</p>
                      <div className="mt-2">
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md capitalize ${selectedTicket?.id === t.id ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"}`}>
                          {t.category}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
                {/* Detail pane */}
                {selectedTicket ? (
                  <motion.div key={selectedTicket.id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                    className="bg-white border border-slate-200 rounded-2xl p-6 max-h-[calc(100vh-300px)] overflow-y-auto">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border capitalize ${STATUS_BADGE[selectedTicket.status]}`}>
                          {STATUS_LABEL[selectedTicket.status] || selectedTicket.status}
                        </span>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 capitalize ml-2">
                          {selectedTicket.category}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">{formatDate(selectedTicket.created_at)}</span>
                    </div>
                    {/* Your message */}
                    <div className="mb-5">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Your message</div>
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedTicket.message}</p>
                      </div>
                    </div>
                    {/* Admin reply */}
                    {selectedTicket.admin_reply ? (
                      <div>
                        <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">Support reply</div>
                        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                          <p className="text-sm text-emerald-800 leading-relaxed whitespace-pre-wrap">{selectedTicket.admin_reply}</p>
                          <div className="text-xs text-emerald-600 mt-2">{formatDate(selectedTicket.replied_at)}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                          <span className="text-amber-700 font-bold text-xs">Awaiting response</span>
                        </div>
                        <p className="text-amber-600 text-sm">Our team is reviewing your request. You&apos;ll receive a reply within 24 hours.</p>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <div className="flex items-center justify-center h-60 bg-white border border-slate-200 rounded-2xl">
                    <div className="text-center">
                      <div className="text-3xl mb-2">👈</div>
                      <p className="text-slate-400 text-sm">Select a ticket to view details</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* ── New Ticket Tab ──────────────────────────────────────── */}
        {tab === "new" && (
          <motion.div key="new" id="new-ticket" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <div className="max-w-xl mx-auto">
              <div className="bg-white border border-slate-200 rounded-2xl p-6">
                {sent ? (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                      <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-xl mb-2">Ticket submitted!</h3>
                    <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">We&apos;ve received your request and will reply within 24 hours. You can track your ticket in the &ldquo;My Tickets&rdquo; tab.</p>
                    <div className="flex items-center gap-3 justify-center">
                      <button onClick={() => setTab("tickets")}
                        className="px-5 py-2.5 bg-[#0F2044] text-white font-bold text-sm rounded-xl hover:bg-[#1E3A5F] transition-all">
                        View my tickets
                      </button>
                      <button onClick={() => { setSent(false); setFormError(""); }}
                        className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-200 transition-all">
                        Submit another
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={submitTicket} className="space-y-5">
                    <div>
                      <h2 className="font-extrabold text-slate-900 text-xl mb-1">Submit a support ticket</h2>
                      <p className="text-slate-500 text-sm">Describe your issue and we&apos;ll get back to you within 24 hours.</p>
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">What do you need help with?</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {CATEGORIES.map(c => (
                          <button type="button" key={c.id} onClick={() => setCategory(c.id)}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all ${category === c.id ? "bg-[#0F2044] text-white border-[#0F2044] shadow-sm" : `${c.color} hover:shadow-sm`}`}>
                            <span>{c.icon}</span>{c.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Describe your issue</label>
                      <textarea value={message} onChange={e => setMessage(e.target.value)} rows={5}
                        placeholder="Please describe the issue in detail. Include any relevant dates, amounts, or error messages..."
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#0F2044] focus:ring-2 focus:ring-[#0F2044]/10 bg-white transition resize-none leading-relaxed" />
                    </div>

                    {formError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{formError}</div>
                    )}

                    <button type="submit" disabled={sending || !category || !message.trim()}
                      className="w-full py-3.5 bg-[#0F2044] text-white font-bold text-sm rounded-xl hover:bg-[#1E3A5F] transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                      {sending ? (
                        <span className="flex items-center gap-2 justify-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Submitting…
                        </span>
                      ) : "Submit ticket →"}
                    </button>

                    <p className="text-center text-xs text-slate-400">
                      Or email us directly at <a href="mailto:support@giginsur.in" className="text-[#0F2044] font-semibold hover:underline">support@giginsur.in</a>
                    </p>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
