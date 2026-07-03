"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const NAV_MAIN = [
  { label: "Dashboard", href: "/dashboard", icon: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></> },
  { label: "Factures", href: "/dashboard/invoices", icon: <><path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h4"/></> },
  { label: "Clients", href: "/dashboard/clients", icon: <><circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3 2.4-5.4 6-5.4s6 2.4 6 5.4"/><path d="M16 8a3 3 0 010 6"/><path d="M21 20c0-2.5-1.8-4.2-4-4.8"/></> },
  { label: "Paiements", href: "/dashboard/payments", icon: <><rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19M6 15h4"/></> },
  { label: "Analytique", href: "/dashboard/analytics", icon: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></> },
];

const NAV_TOOLS = [
  { label: "Automatisations", href: "/dashboard/automations", icon: <><path d="M13 3L4 14h7l-1 7 9-11h-7l1-7z"/></> },
  { label: "Rapports", href: "/dashboard/reports", icon: <><path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h4"/></> },
  { label: "Paramètres", href: "/dashboard/settings", icon: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></> },
];

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:17,height:17,flexShrink:0}}>
      {children}
    </svg>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState('');

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setEmail(data.user?.email || ''));
  }, []);

  const initials = (email || 'U').slice(0, 2).toUpperCase();

  async function handleLogout() {
    await createClient().auth.signOut();
    router.push('/login');
  }

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname === href || pathname.startsWith(href + '/');

  const navItemStyle = (href: string): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 11, padding: '9px 10px',
    borderRadius: 9, fontSize: 13.5, fontWeight: 500, textDecoration: 'none',
    margin: '1px 0', borderLeft: '3px solid transparent', transition: 'all 0.2s ease',
    ...(isActive(href) ? {
      background: 'linear-gradient(90deg,rgba(37,99,235,0.2),rgba(124,58,237,0.15))',
      color: '#A78BFA', borderLeftColor: '#7C3AED',
    } : {
      color: 'rgba(255,255,255,0.55)',
    }),
  });

  return (
    <div style={{minHeight:'100vh',display:'flex',background:'#F8FAFC',fontFamily:'Inter,system-ui,sans-serif',color:'#0F172A'}}>

      {/* SIDEBAR */}
      <aside style={{width:248,background:'#111827',color:'#fff',display:'flex',flexDirection:'column',position:'sticky',top:0,height:'100vh',flexShrink:0}}>

        {/* Logo */}
        <div style={{height:64,display:'flex',alignItems:'center',gap:11,padding:'0 18px',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
          <div style={{width:34,height:34,borderRadius:10,background:'linear-gradient(135deg,#2563EB,#7C3AED)',display:'grid',placeItems:'center',flexShrink:0}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{width:18,height:18}}>
              <path d="M6 5v14"/><path d="M11 19V5h7"/><path d="M11 12h5"/>
            </svg>
          </div>
          <span style={{fontWeight:800,fontSize:16,letterSpacing:'-0.35px'}}>
            Invoice<span style={{background:'linear-gradient(90deg,#60A5FA,#A78BFA)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Flow</span>
          </span>
        </div>

        {/* Nav */}
        <div style={{flex:1,overflowY:'auto',padding:'18px 12px'}}>
          <div style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.3)',letterSpacing:'1.5px',padding:'14px 10px 8px',textTransform:'uppercase'}}>Principal</div>
          {NAV_MAIN.map(n => (
            <Link key={n.href} href={n.href} style={navItemStyle(n.href)}>
              <Icon>{n.icon}</Icon>
              {n.label}
            </Link>
          ))}
          <div style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.3)',letterSpacing:'1.5px',padding:'14px 10px 8px',textTransform:'uppercase'}}>Outils</div>
          {NAV_TOOLS.map(n => (
            <Link key={n.href} href={n.href} style={navItemStyle(n.href)}>
              <Icon>{n.icon}</Icon>
              {n.label}
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div style={{padding:12,borderTop:'1px solid rgba(255,255,255,0.06)'}}>
          <div style={{display:'flex',alignItems:'center',gap:10,padding:8,borderRadius:9}}>
            <div style={{width:34,height:34,borderRadius:'50%',background:'linear-gradient(135deg,#2563EB,#7C3AED)',color:'#fff',fontWeight:700,fontSize:12.5,display:'grid',placeItems:'center',flexShrink:0}}>
              {initials}
            </div>
            <div style={{minWidth:0,flex:1}}>
              <div style={{fontSize:12,color:'#fff',fontWeight:500,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{email || '...'}</div>
            </div>
            <button onClick={handleLogout} style={{background:'none',border:0,color:'rgba(255,255,255,0.45)',cursor:'pointer',padding:4,display:'grid',placeItems:'center',borderRadius:6}} title="Déconnexion">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16}}>
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{flex:1,minWidth:0,display:'flex',flexDirection:'column'}}>
        {/* Topbar */}
        <header style={{height:60,background:'#fff',borderBottom:'1px solid #E2E8F0',position:'sticky',top:0,zIndex:5,display:'flex',alignItems:'center',padding:'0 32px',gap:16}}>
          <h1 style={{fontSize:16,fontWeight:700,color:'#0F172A',letterSpacing:'-0.3px',margin:0,flex:1}}>
            {NAV_MAIN.concat(NAV_TOOLS).find(n => isActive(n.href))?.label || 'Dashboard'}
          </h1>
          <div style={{position:'relative',flex:'0 1 280px'}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',width:14,height:14}}>
              <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
            </svg>
            <input placeholder="Rechercher une facture, client…" style={{width:'100%',height:36,border:'1px solid #E2E8F0',borderRadius:10,padding:'0 12px 0 34px',fontSize:13,color:'#0F172A',background:'#F8FAFC',outline:'none',fontFamily:'inherit'}}/>
          </div>
          <button style={{width:36,height:36,borderRadius:10,border:'1px solid #E2E8F0',background:'#fff',color:'#475569',display:'grid',placeItems:'center',cursor:'pointer',position:'relative'}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16}}>
              <path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.7 21a2 2 0 01-3.4 0"/>ssssss
            </svg>
            <span style={{position:'absolute',top:8,right:9,width:6,height:6,borderRadius:'50%',background:'#7C3AED',border:'1.5px solid #fff'}}/>
          </button>
          <div style={{width:34,height:34,borderRadius:'50%',background:'linear-gradient(135deg,#2563EB,#7C3AED)',color:'#fff',fontWeight:700,fontSize:12.5,display:'grid',placeItems:'center'}}>
            {initials}
          </div>
        </header>

        <main style={{padding:'28px 32px',flex:1}}>
          {children}
        </main>
      </div>
    </div>
  );
}