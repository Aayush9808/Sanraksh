"use client";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { API_V1_BASE } from "@/lib/config";

const FAQS = [
  { q: "How does automatic payout work?", a: "GigInsu₹ monitors weather APIs, platform status, and government alerts 24/7. When a qualifying event hits your registered zone, the payout triggers automatically — no claim required. Money arrives in your UPI account within 24–72 hours." },
  { q: "I didn't receive my payout. What do I do?", a: "First, confirm the event occurred in your registered zone and exceeded the trigger threshold for your plan. If it did, check that your UPI ID is correct in your profile. If the issue persists, use the contact form below with your phone number and the event date." },
  { q: "How do I change my registered zone?", a: "Go to Dashboard → My Policy → Edit Profile. Zone changes take effect from the next billing week, not mid-week." },
  { q: "Can I pause or cancel my policy?", a: "Yes. Go to Dashboard → My Policy → Cancel Policy. Cancellation takes effect at end of the current week. You'll continue to be covered until then." },
  { q: "Is this real insurance?", a: "GigInsu₹ is a parametric income protection product, not a traditional insurance policy. It does not require IRDAI registration as it is an indemnity-based income support product. Coverage details are outlined in our Terms & Conditions." },
  { q: "What platforms are supported?", a: "Swiggy, Zomato, Uber Eats, Ola, Blinkit, Dunzo, Zepto, and Rapido. More platforms are added regularly." },
  { q: "What if I work on multiple platforms?", a: "You can register all platforms during sign-up. GigInsu₹ calculates zone risk across all your platforms and pays out if any qualifying event hits your zone." },
  { q: "How is fraud detected?", a: "GigInsu₹ uses AI models that analyze GPS jump patterns, device reuse across accounts, route feasibility, and peer-event correlation. Legitimate claims are never affected — the system only flags coordinated fraud rings." },
];

const CATEGORIES = [
  { id: "payout", label: "Payout issue", icon: "₹" },
  { id: "policy", label: "Policy question", icon: "🛡" },
  { id: "account", label: "Account / login", icon: "👤" },
  { id: "technical", label: "Technical issue", icon: "⚙" },
  { id: "other", label: "Other", icon: "💬" },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(v => !v)}
        className="w-full text-left flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
        <span className="font-semibold text-slate-800 text-sm">{q}</span>
        <span className={`text-slate-400 transition-transform flex-shrink-0 ${open ? "rotate-45" : ""}`} style={{ transition: "transform 0.2s" }}>+</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
            <div className="px-5 pb-4 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-3">{a}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SupportPage() {
  const [category, setCategory] = useState("");
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !category || !form.message) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_V1_BASE}/support/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, category, message: form.message }),
      });
      if (!res.ok) throw new Error("Server error");
      setSent(true);
    } catch {
      setError("Failed to send. Please email us at support@giginsur.in directly.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 h-14 flex items-center px-4 sm:px-6">
        <div className="max-w-5xl mx-auto w-full flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#0F2044] flex items-center justify-center">
              <span className="text-white font-black text-xs">GA</span>
            </div>
            <span className="font-bold text-slate-900 tracking-tight">GigInsu₹</span>
          </Link>
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-900 font-medium transition-colors">← Back to home</Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        {/* Title */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-4">
            We reply within 24 hours
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">Support Center</h1>
          <p className="text-slate-500 max-w-xl mx-auto">We're here to help. Browse the FAQs or drop us a message — we'll get back to you quickly.</p>
        </div>

        {/* Quick info cards */}
        <div className="grid sm:grid-cols-3 gap-4 mb-12">
          {[
            { icon: "📧", title: "Email support", desc: "support@giginsur.in", sub: "Response within 24 hours" },
            { icon: "💬", title: "In-app message", desc: "Dashboard → Profile → Help", sub: "Fastest for active policy issues" },
            { icon: "📞", title: "Callback request", desc: "Leave your number below", sub: "We call back in 2–4 hours" },
          ].map(c => (
            <div key={c.title} className="border border-slate-200 rounded-2xl p-5 bg-slate-50">
              <span className="text-2xl mb-3 block">{c.icon}</span>
              <h3 className="font-bold text-slate-900 text-sm mb-1">{c.title}</h3>
              <p className="text-[#0F2044] font-semibold text-sm mb-1">{c.desc}</p>
              <p className="text-slate-400 text-xs">{c.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_420px] gap-10">
          {/* FAQ */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-5">Frequently Asked Questions</h2>
            <div className="space-y-2">
              {FAQS.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
            </div>
          </div>

          {/* Contact form */}
          <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50 h-fit">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Send us a message</h2>
            <p className="text-slate-500 text-sm mb-5">We read every message and reply within one business day.</p>

            {sent ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8">
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">✓</span>
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Message received!</h3>
                <p className="text-slate-500 text-sm">We'll get back to you within 24 hours at the email address you provided.</p>
                <button onClick={() => { setSent(false); setForm({ name: "", email: "", message: "" }); setCategory(""); setError(""); }}
                  className="mt-5 text-[#0F2044] font-semibold text-sm hover:underline">Send another message</button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Your name</label>
                  <input type="text" placeholder="Full name" value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#0F2044] focus:ring-2 focus:ring-[#0F2044]/10 bg-white transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Email address</label>
                  <input type="email" placeholder="you@example.com" value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#0F2044] focus:ring-2 focus:ring-[#0F2044]/10 bg-white transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(c => (
                      <button type="button" key={c.id} onClick={() => setCategory(c.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${category === c.id ? "bg-[#0F2044] text-white border-[#0F2044]" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"}`}>
                        <span>{c.icon}</span>{c.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Message</label>
                  <textarea placeholder="Describe your issue in detail..." value={form.message} rows={4}
                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#0F2044] focus:ring-2 focus:ring-[#0F2044]/10 bg-white transition resize-none" />
                </div>
                {error && <p className="text-red-500 text-xs">{error}</p>}
                <button type="submit" disabled={loading || !form.name || !form.email || !category || !form.message}
                  className="w-full py-3 bg-[#0F2044] text-white font-bold text-sm rounded-xl hover:bg-[#1E3A5F] transition disabled:opacity-40 disabled:cursor-not-allowed">
                  {loading ? "Sending…" : "Send message →"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-12 py-6 px-4 sm:px-6 text-center text-slate-400 text-sm">
        <Link href="/terms" className="hover:text-slate-700 transition-colors">Terms & Conditions</Link>
        <span className="mx-3">·</span>
        <Link href="/" className="hover:text-slate-700 transition-colors">GigInsu₹ Home</Link>
        <span className="mx-3">·</span>
        <span>© 2026 GigInsu₹</span>
      </footer>
    </div>
  );
}
