"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Profile {
  name: string; phone: string; email: string; dob: string; gender: string; address: string;
  city: string; zone: string; platform: string;
  emergencyName: string; emergencyPhone: string; emergencyRelation: string; bloodGroup: string;
  nomineeName: string; nomineeRelation: string;
}

const DEFAULTS: Profile = {
  name: "Raj Demo Worker", phone: "+917000000001", email: "raj@gigarmor.demo", dob: "1998-08-15",
  gender: "Male", address: "Flat 304, Andheri West, Mumbai", city: "Mumbai", zone: "Andheri West",
  platform: "Zomato", emergencyName: "Anita Kumar", emergencyPhone: "+919930001122", emergencyRelation: "Sister",
  bloodGroup: "B+", nomineeName: "Rohan Kumar", nomineeRelation: "Brother",
};

export default function ProfilePage() {
  const [p, setP] = useState<Profile>(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("gigarmor_user");
    const stored = localStorage.getItem("gigarmor_profile");
    if (raw) {
      const u = JSON.parse(raw);
      setP(prev => ({ ...prev, name: u.name || prev.name, phone: u.phone || prev.phone, city: u.city || prev.city, zone: u.zone || prev.zone, platform: u.platform || prev.platform }));
    }
    if (stored) try { setP(JSON.parse(stored)); } catch { /* ignore */ }
  }, []);

  function upd<K extends keyof Profile>(k: K, v: Profile[K]) { setP(prev => ({ ...prev, [k]: v })); }

  async function save() {
    setSaving(true); await new Promise(r => setTimeout(r, 800));
    localStorage.setItem("gigarmor_profile", JSON.stringify(p));
    setSavedAt(new Date().toLocaleTimeString()); setSaving(false);
  }

  const card = "rounded-2xl bg-surface-1 border border-white/[0.04] p-5";
  const inp = "w-full bg-surface-2 border border-white/[0.06] text-text-primary placeholder-text-muted/40 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-accent-amber/50 focus:ring-2 focus:ring-accent-amber/10 transition-all";
  const lbl = "text-[10px] font-medium text-text-muted uppercase tracking-wider mb-1.5 block";
  const b = (d: number) => ({ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { delay: d * 0.06 } } as const);

  return (
    <motion.div className="p-6 space-y-5 max-w-[1400px] mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Profile</h1>
          <p className="text-sm text-text-secondary mt-0.5">Personal details for policy validation</p>
        </div>
        <motion.button onClick={save} disabled={saving} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-amber to-accent-ember text-sm font-semibold text-surface-0 disabled:opacity-50 shadow-lg shadow-accent-amber/15">
          {saving ? "Saving..." : "Save Profile"}
        </motion.button>
      </div>

      {savedAt && (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-state-success/10 border border-state-success/20 px-4 py-2 text-sm text-state-success">
          Updated at {savedAt}
        </motion.div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <motion.section {...b(1)} className={`${card} space-y-4`}>
          <h2 className="text-sm font-semibold text-text-primary">Personal Information</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {([
              ["name","Full Name"],["phone","Phone"],["email","Email"],
              ["dob","Date of Birth"],["gender","Gender"],["bloodGroup","Blood Group"]
            ] as [keyof Profile,string][]).map(([k,l]) => (
              <label key={k}><span className={lbl}>{l}</span>
                <input value={p[k]} onChange={e => upd(k, e.target.value)} className={inp} />
              </label>
            ))}
          </div>
          <label><span className={lbl}>Address</span>
            <textarea value={p.address} onChange={e => upd("address", e.target.value)} rows={3} className={inp} />
          </label>
        </motion.section>

        <motion.section {...b(2)} className={`${card} space-y-4`}>
          <h2 className="text-sm font-semibold text-text-primary">Work & Policy</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {([
              ["platform","Platform"],["city","City"],["zone","Zone"]
            ] as [keyof Profile,string][]).map(([k,l]) => (
              <label key={k}><span className={lbl}>{l}</span>
                <input value={p[k]} onChange={e => upd(k, e.target.value)} className={inp} />
              </label>
            ))}
          </div>
          <h3 className="text-sm font-semibold text-text-primary pt-2">Emergency Contact</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {([
              ["emergencyName","Name"],["emergencyPhone","Phone"],["emergencyRelation","Relation"],
              ["nomineeName","Nominee"],["nomineeRelation","Nominee Relation"]
            ] as [keyof Profile,string][]).map(([k,l]) => (
              <label key={k}><span className={lbl}>{l}</span>
                <input value={p[k]} onChange={e => upd(k, e.target.value)} className={inp} />
              </label>
            ))}
          </div>
        </motion.section>
      </div>

      <motion.div {...b(3)} className="rounded-2xl bg-accent-amber/[0.05] border border-accent-amber/15 p-5">
        <h3 className="text-xs font-semibold text-accent-amber mb-2">Profile Usage</h3>
        <p className="text-[11px] text-text-muted leading-relaxed">
          Your profile data is used for AI premium calculation, fraud detection GPS matching, emergency contact for critical claim scenarios, and nominee payouts. Keep information accurate and up-to-date.
        </p>
      </motion.div>
    </motion.div>
  );
}
