"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import WorkerSidebar from "../../../components/WorkerSidebar";

interface WorkerProfile {
  name: string;
  phone: string;
  email: string;
  dob: string;
  gender: string;
  address: string;
  city: string;
  zone: string;
  platform: string;
  emergencyName: string;
  emergencyPhone: string;
  emergencyRelation: string;
  bloodGroup: string;
  nomineeName: string;
  nomineeRelation: string;
}

const DEFAULT_PROFILE: WorkerProfile = {
  name: "Raj Demo Worker",
  phone: "+917000000001",
  email: "raj.worker@gigarmor.demo",
  dob: "1998-08-15",
  gender: "Male",
  address: "Flat 304, Andheri West, Mumbai",
  city: "Mumbai",
  zone: "Andheri West",
  platform: "Zomato",
  emergencyName: "Anita Kumar",
  emergencyPhone: "+919930001122",
  emergencyRelation: "Sister",
  bloodGroup: "B+",
  nomineeName: "Rohan Kumar",
  nomineeRelation: "Brother",
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<WorkerProfile>(DEFAULT_PROFILE);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string>("");

  useEffect(() => {
    const raw = localStorage.getItem("gigarmor_user");
    const stored = localStorage.getItem("gigarmor_profile");

    if (raw) {
      const u = JSON.parse(raw);
      setProfile((p) => ({
        ...p,
        name: u.name || p.name,
        phone: u.phone || p.phone,
        city: u.city || p.city,
        zone: u.zone || p.zone,
        platform: u.platform || p.platform,
      }));
    }

    if (stored) {
      try {
        const parsed = JSON.parse(stored) as WorkerProfile;
        setProfile(parsed);
      } catch {
        // ignore malformed local profile
      }
    }
  }, []);

  function update<K extends keyof WorkerProfile>(key: K, value: WorkerProfile[K]) {
    setProfile((prev) => ({ ...prev, [key]: value }));
  }

  async function saveProfile() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    localStorage.setItem("gigarmor_profile", JSON.stringify(profile));
    setSavedAt(new Date().toLocaleTimeString());
    setSaving(false);
  }

  return (
    <div className="flex min-h-screen bg-[#060d1a] text-slate-100">
      <WorkerSidebar />

      <main className="ml-60 flex-1 px-8 py-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex items-center justify-between">
          <div>
            <p className="mb-1 text-xs uppercase tracking-widest text-slate-500">GigArmor / Worker Profile</p>
            <h1 className="text-3xl font-black text-white">👤 Worker Profile & Emergency Details</h1>
            <p className="mt-1 text-sm text-slate-400">Maintain up-to-date personal details for policy validation and support workflows.</p>
          </div>
          <button
            onClick={saveProfile}
            disabled={saving}
            className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:from-cyan-400 hover:to-blue-500 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </motion.div>

        {savedAt && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">
            Profile updated successfully at {savedAt}
          </motion.div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <motion.section initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 space-y-4">
            <h2 className="text-lg font-bold text-white">Personal Information</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {[{k:'name',l:'Full Name'},{k:'phone',l:'Phone Number'},{k:'email',l:'Email'},{k:'dob',l:'Date of Birth'},{k:'gender',l:'Gender'},{k:'bloodGroup',l:'Blood Group'}].map((f) => (
                <label key={f.k} className="text-sm">
                  <span className="mb-1 block text-xs text-slate-500">{f.l}</span>
                  <input
                    value={profile[f.k as keyof WorkerProfile] as string}
                    onChange={(e) => update(f.k as keyof WorkerProfile, e.target.value)}
                    className="w-full rounded-xl border border-white/[0.08] bg-slate-900/70 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500"
                  />
                </label>
              ))}
            </div>
            <label className="text-sm block">
              <span className="mb-1 block text-xs text-slate-500">Address</span>
              <textarea
                value={profile.address}
                onChange={(e) => update("address", e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-white/[0.08] bg-slate-900/70 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500"
              />
            </label>
          </motion.section>

          <motion.section initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 space-y-4">
            <h2 className="text-lg font-bold text-white">Work & Policy Mapping</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {[{k:'platform',l:'Platform'},{k:'city',l:'City'},{k:'zone',l:'Zone'}].map((f) => (
                <label key={f.k} className="text-sm">
                  <span className="mb-1 block text-xs text-slate-500">{f.l}</span>
                  <input
                    value={profile[f.k as keyof WorkerProfile] as string}
                    onChange={(e) => update(f.k as keyof WorkerProfile, e.target.value)}
                    className="w-full rounded-xl border border-white/[0.08] bg-slate-900/70 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500"
                  />
                </label>
              ))}
            </div>

            <h3 className="pt-2 text-base font-semibold text-white">Emergency Contact</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {[{k:'emergencyName',l:'Emergency Contact Name'},{k:'emergencyPhone',l:'Emergency Phone'},{k:'emergencyRelation',l:'Relation'},{k:'nomineeName',l:'Nominee Name'},{k:'nomineeRelation',l:'Nominee Relation'}].map((f) => (
                <label key={f.k} className="text-sm">
                  <span className="mb-1 block text-xs text-slate-500">{f.l}</span>
                  <input
                    value={profile[f.k as keyof WorkerProfile] as string}
                    onChange={(e) => update(f.k as keyof WorkerProfile, e.target.value)}
                    className="w-full rounded-xl border border-white/[0.08] bg-slate-900/70 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500"
                  />
                </label>
              ))}
            </div>
          </motion.section>
        </div>

        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">
          <h3 className="text-sm font-bold text-cyan-300">Profile Usage in Insurance Decisioning</h3>
          <ul className="mt-2 list-disc list-inside text-sm text-slate-300 space-y-1">
            <li>City/zone and platform drive weekly premium personalization.</li>
            <li>Emergency details are used for support escalation workflows.</li>
            <li>Profile consistency helps reduce fraud risk and claim delays.</li>
          </ul>
        </motion.section>
      </main>
    </div>
  );
}
