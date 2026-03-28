"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

type NavItem = { href: string; icon: React.ReactNode; label: string; adminOnly?: boolean };

function Icon({ d, size = 18 }: { d: string; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>;
}

const ICONS = {
  home:    "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  shield:  "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  bolt:    "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  users:   "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75",
  chart:   "M18 20V10 M12 20V4 M6 20v-6",
  file:    "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
  map:     "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z M12 10a2 2 0 11-4 0 2 2 0 014 0",
  alert:   "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01",
  terminal:"M4 17l6-6-6-6 M12 19h8",
  user:    "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z",
  logout:  "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9",
  policy:  "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2 M9 5a2 2 0 002 2h2a2 2 0 002-2 M9 5a2 2 0 012-2h2a2 2 0 012 2",
};

export default function DashLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<"worker"|"admin">("worker");
  const [tooltip, setTooltip] = useState("");
  const [engineOk, setEngineOk] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (!token) { router.replace("/login"); return; }
    const r = localStorage.getItem("role");
    if (r === "admin") setRole("admin");
    setEngineOk(Math.random() > 0.15);
  }, [router]);

  const workerNav: NavItem[] = [
    { href:"/dashboard",             icon:<Icon d={ICONS.home}/>,    label:"Overview"     },
    { href:"/dashboard/my-policy",   icon:<Icon d={ICONS.shield}/>,  label:"My Policy"    },
    { href:"/dashboard/triggers",    icon:<Icon d={ICONS.bolt}/>,    label:"Live Triggers"},
    { href:"/dashboard/policy-terms",icon:<Icon d={ICONS.policy}/>,  label:"Policy Terms" },
    { href:"/dashboard/profile",     icon:<Icon d={ICONS.user}/>,    label:"Profile"      },
  ];
  const adminNav: NavItem[] = [
    { href:"/dashboard",                icon:<Icon d={ICONS.home}/>,     label:"Overview"       },
    { href:"/dashboard/claims",         icon:<Icon d={ICONS.file}/>,     label:"Claims"         },
    { href:"/dashboard/workers",        icon:<Icon d={ICONS.users}/>,    label:"Workers"        },
    { href:"/dashboard/policies",       icon:<Icon d={ICONS.policy}/>,   label:"Policies"       },
    { href:"/dashboard/analytics",      icon:<Icon d={ICONS.chart}/>,    label:"Analytics"      },
    { href:"/dashboard/risk-map",       icon:<Icon d={ICONS.map}/>,      label:"Risk Map"       },
    { href:"/dashboard/threat-defense", icon:<Icon d={ICONS.alert}/>,    label:"Threat Defense" },
    { href:"/dashboard/control-tower",  icon:<Icon d={ICONS.terminal}/>, label:"Control Tower"  },
  ];
  const nav = role === "admin" ? adminNav : workerNav;

  function logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
    }
    router.push("/login");
  }

  const isActive = (href: string) => href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  return (
    <div className="flex min-h-screen bg-[#0A0806]">

      {/* ── LEFT ICON RAIL ────────────────────────────────────────────────── */}
      <aside className="fixed left-0 top-0 bottom-0 z-40 flex flex-col items-center py-4 gap-1"
        style={{ width:64, background:"#0A0806", borderRight:"1px solid #2A2218" }}
      >
        {/* Logo */}
        <Link href="/dashboard" className="w-10 h-10 rounded-lg bg-amber flex items-center justify-center mb-4 flex-shrink-0">
          <span className="text-[#0A0806] font-black text-sm">GS</span>
        </Link>

        <div className="w-8 h-px bg-[#2A2218] mb-3" />

        {/* Nav icons */}
        <nav className="flex flex-col gap-1.5 flex-1">
          {nav.map(item => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href}
                onMouseEnter={()=>setTooltip(item.label)} onMouseLeave={()=>setTooltip("")}
              >
                <div className={`rail-btn ${active ? "active" : ""}`}>
                  {item.icon}
                  {/* Tooltip */}
                  {tooltip === item.label && (
                    <div className="absolute left-[52px] z-50 pointer-events-none"
                      style={{ background:"#1E1810", border:"1px solid #2A2218", borderRadius:6, padding:"5px 10px", whiteSpace:"nowrap", fontSize:"0.75rem", color:"#F5F0E8", fontWeight:600 }}>
                      {item.label}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom: engine status + logout */}
        <div className="flex flex-col items-center gap-3 mt-auto">
          {/* Engine status dot */}
          <div title={engineOk ? "Engine: Healthy" : "Engine: Degraded"}
            className={`w-2 h-2 rounded-full ${engineOk ? "dot-live" : "dot-warn"}`}
            style={{animation: engineOk ? "pulse-live 2s ease-in-out infinite" : "pulse-amber 2.5s ease-in-out infinite"}}
          />
          <button onClick={logout} className="rail-btn mb-2" title="Logout"
            onMouseEnter={()=>setTooltip("Logout")} onMouseLeave={()=>setTooltip("")}
          >
            <Icon d={ICONS.logout} />
            {tooltip === "Logout" && (
              <div className="absolute left-[52px] z-50 pointer-events-none"
                style={{ background:"#1E1810", border:"1px solid #2A2218", borderRadius:6, padding:"5px 10px", whiteSpace:"nowrap", fontSize:"0.75rem", color:"#EF4444", fontWeight:600 }}>
                Logout
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ──────────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0" style={{ marginLeft:64 }}>
        {/* Top strip: role badge + breadcrumb */}
        <div className="h-11 border-b border-[#2A2218] flex items-center justify-between px-6 bg-[#0A0806] sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <span className="dot dot-live" style={{width:5,height:5}} />
            <span className="lbl">GigShield {role === "admin" ? "Command" : "Worker"} Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`tag ${role === "admin" ? "tag-amber" : "tag-live"}`}>
              {role.toUpperCase()}
            </span>
            <button onClick={()=>{
              if(typeof window==="undefined") return;
              const cur = localStorage.getItem("role");
              const next = cur === "admin" ? "worker" : "admin";
              localStorage.setItem("role", next);
              setRole(next as "worker"|"admin");
              router.push("/dashboard");
            }} className="lbl hover:text-amber cursor-pointer transition-colors">
              [switch view]
            </button>
          </div>
        </div>
        <div className="p-6 xl:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
