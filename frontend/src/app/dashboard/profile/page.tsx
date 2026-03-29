"use client";
import { useState } from "react";
import { API_BASE } from "@/lib/config";

const NOTIF_PREFS = [
  "Payout received",
  "Active trigger in your zone",
  "Policy renewal reminder",
  "New coverage added",
];

export default function ProfilePage() {
  const [form, setForm] = useState({ name:"Rahul Kumar", phone:"+91 9999000001", city:"Mumbai", email:"rahul@example.com" });
  const [saved, setSaved] = useState(false);
  const [notifs, setNotifs] = useState<Record<string,boolean>>({
    "Payout received": true,
    "Active trigger in your zone": true,
    "Policy renewal reminder": true,
    "New coverage added": false,
  });

  const upd = (k:string, v:string) => { setForm(p=>({...p,[k]:v})); setSaved(false); };
  const toggleNotif = (n:string) => setNotifs(p=>({...p,[n]:!p[n]}));

  async function save(e:React.FormEvent) {
    e.preventDefault();
    try {
      await fetch(`${API_BASE}/api/v1/workers/me`, {
        method:"PATCH",
        headers:{"Content-Type":"application/json", Authorization:`Bearer ${typeof window!=="undefined"&&localStorage.getItem("token")||""}`},
        body:JSON.stringify(form),
      });
    } catch {}
    setSaved(true);
    setTimeout(()=>setSaved(false), 3000);
  }

  return (
    <div className="max-w-2xl">
      <div className="section-head">
        <div>
          <p className="lbl mb-1">Account</p>
          <h1 className="text-[#F5F0E8] font-bold text-xl" style={{letterSpacing:"-0.03em"}}>Profile & Settings</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="dot" style={{width:8,height:8,background:"#10B981"}} />
          <span className="lbl-live">KYC Verified</span>
        </div>
      </div>

      {/* Avatar row */}
      <div className="panel p-5 mb-5 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-amber/10 border border-amber/30 flex items-center justify-center flex-shrink-0">
          <span className="text-amber font-bold text-2xl">{form.name.charAt(0)}</span>
        </div>
        <div>
          <div className="text-[#F5F0E8] font-bold text-lg">{form.name}</div>
          <div className="lbl mt-0.5">{form.phone} · {form.city}</div>
          <div className="flex gap-2 mt-2">
            <span className="tag tag-neutral">Swiggy</span>
            <span className="tag tag-neutral">Zomato</span>
            <span className="tag tag-neutral">Uber</span>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <form onSubmit={save} className="panel p-5 space-y-4 mb-5">
        <p className="lbl mb-2">Personal information</p>
        <div className="grid md:grid-cols-2 gap-4">
          <div><label className="field-label">Full name</label>
            <input className="field" value={form.name} onChange={e=>upd("name",e.target.value)} /></div>
          <div><label className="field-label">Email (optional)</label>
            <input className="field" type="email" value={form.email} onChange={e=>upd("email",e.target.value)} /></div>
          <div><label className="field-label">Mobile</label>
            <input className="field" value={form.phone} disabled style={{opacity:0.5,cursor:"not-allowed"}} /></div>
          <div>
            <label className="field-label">City</label>
            <select className="field" value={form.city} onChange={e=>upd("city",e.target.value)}>
              {["Mumbai","Delhi","Bengaluru","Hyderabad","Chennai","Pune"].map(c=>(
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="pt-2 flex items-center gap-3">
          <button type="submit" className="btn-amber">Save changes</button>
          {saved && <span className="lbl-live">Changes saved ✓</span>}
        </div>
      </form>

      {/* Notification preferences */}
      <div className="panel p-5">
        <p className="lbl mb-4">Notification preferences</p>
        <div className="space-y-1">
          {NOTIF_PREFS.map(n => (
            <div key={n} className="flex items-center justify-between py-3 border-b border-[#2A2218] last:border-0">
              <span className="text-sm text-[#9A8A72]">{n}</span>
              <button
                type="button"
                onClick={() => toggleNotif(n)}
                className="relative flex-shrink-0 transition-all duration-200"
                style={{
                  width:40, height:22, borderRadius:11,
                  background: notifs[n] ? "#F59E0B" : "#2A2218",
                  border:"none", cursor:"pointer",
                }}
                aria-label={`Toggle ${n}`}
              >
                <div style={{
                  position:"absolute",
                  width:16, height:16,
                  borderRadius:"50%",
                  background:"#0A0806",
                  top:3,
                  left: notifs[n] ? 21 : 3,
                  transition:"left 0.2s",
                }} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
