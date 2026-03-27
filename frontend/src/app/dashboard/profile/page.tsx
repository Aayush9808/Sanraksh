"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface UserProfile {
  name?: string;
  phone?: string;
  email?: string;
  platform?: string;
  city?: string;
  zone?: string;
  role?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile>({});
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<UserProfile>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("gigarmor_user");
    if (raw) { const u = JSON.parse(raw); setUser(u); setForm(u); }
  }, []);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const updated = { ...user, ...form };
    setUser(updated);
    localStorage.setItem("gigarmor_user", JSON.stringify(updated));
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const fields: { key: keyof UserProfile; label: string; editable: boolean }[] = [
    { key: "name", label: "Full name", editable: true },
    { key: "phone", label: "Phone number", editable: false },
    { key: "email", label: "Email address", editable: true },
    { key: "platform", label: "Delivery platform", editable: false },
    { key: "city", label: "Work city", editable: false },
    { key: "zone", label: "Work zone", editable: false },
    { key: "role", label: "Account type", editable: false },
  ];

  return (
    <div className="p-6 xl:p-8 max-w-[800px]">
      <div className="border-b border-[#1a1a1a] pb-5 mb-8 flex items-end justify-between">
        <div>
          <p className="mono-label mb-1.5">Account</p>
          <h1 className="text-2xl font-black text-white tracking-tight">Profile</h1>
        </div>
        {saved && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="font-mono text-[10px] tracking-widest uppercase text-[#00FF87]">
            Changes saved
          </motion.span>
        )}
      </div>

      {/* Avatar + name */}
      <div className="flex items-center gap-5 mb-10 pb-8 border-b border-[#1a1a1a]">
        <div className="w-14 h-14 border border-[#2a2a2a] flex items-center justify-center font-mono text-xl font-black text-white">
          {user.name?.charAt(0).toUpperCase() || "?"}
        </div>
        <div>
          <div className="text-lg font-bold text-white">{user.name || "Unknown"}</div>
          <div className="mono-label mt-1">{user.platform} \u2014 {user.city}</div>
        </div>
      </div>

      {/* Fields */}
      <form onSubmit={handleSave} className="space-y-0 border-t border-[#1a1a1a]">
        {fields.map((f, i) => (
          <motion.div key={f.key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
            className="grid grid-cols-[180px_1fr] border-b border-[#1a1a1a] py-5">
            <p className="field-label self-center">{f.label}</p>
            {editing && f.editable ? (
              <input
                value={(form[f.key] as string) || ""}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                className="field max-w-[300px]"
              />
            ) : (
              <p className="text-sm text-white self-center font-medium">
                {(user[f.key] as string) || <span className="text-[#333]">Not set</span>}
              </p>
            )}
          </motion.div>
        ))}

        <div className="pt-6 flex gap-4">
          {editing ? (
            <>
              <button type="submit" className="btn-wire" style={{ width: "auto", paddingLeft: "2rem", paddingRight: "2rem" }}>
                SAVE CHANGES
              </button>
              <button type="button" onClick={() => setEditing(false)} className="btn-ghost">
                CANCEL
              </button>
            </>
          ) : (
            <button type="button" onClick={() => setEditing(true)} className="btn-ghost">
              EDIT PROFILE
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
