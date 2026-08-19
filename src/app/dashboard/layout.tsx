"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DashboardThemeProvider, useDashboardTheme } from "./theme-context";

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

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const { theme, toggleTheme, sidebarCollapsed, toggleSidebar } = useDashboardTheme();
  const isDark = theme === 'dark';
  const palette = {
    bg: isDark ? '#020617' : '#F8FAFC',
    panel: isDark ? '#0F172A' : '#FFFFFF',
    panelSoft: isDark ? '#111827' : '#F8FAFC',
    text: isDark ? '#F8FAFC' : '#0F172A',
    muted: isDark ? '#94A3B8' : '#64748B',
    border: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
  };

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
    display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
    gap: sidebarCollapsed ? 0 : 11, padding: sidebarCollapsed ? '10px' : '10px 12px',
    borderRadius: 12, fontSize: 13.5, fontWeight: 600, textDecoration: 'none',
    margin: '2px 0', borderLeft: '3px solid transparent', transition: 'all 0.2s ease',
    whiteSpace: 'nowrap', overflow: 'hidden', position: 'relative',
    ...(isActive(href) ? {
      background: isDark ? 'rgba(79,70,229,0.24)' : 'linear-gradient(90deg,rgba(37,99,235,0.2),rgba(124,58,237,0.15))',
      color: '#fff', borderLeftColor: '#7C3AED', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
    } : {
      color: 'rgba(255,255,255,0.78)',
    }),
  });

  return (
    <div style={{minHeight:'100vh',display:'flex',background:palette.bg,fontFamily:'Inter,system-ui,sans-serif',color:palette.text}}>
      <aside style={{width: sidebarCollapsed ? 84 : 248, background: isDark ? '#020617' : '#111827', color:'#fff', display:'flex', flexDirection:'column', position:'sticky', top:0, height:'100vh', flexShrink:0, transition:'width 0.2s ease'}}>
        <div style={{height:64,display:'flex',alignItems:'center',justifyContent: sidebarCollapsed ? 'center' : 'flex-start',gap:11,padding: sidebarCollapsed ? '0 10px' : '0 18px',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
          <div style={{width:34,height:34,borderRadius:10,background:'linear-gradient(135deg,#2563EB,#7C3AED)',display:'grid',placeItems:'center',flexShrink:0}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{width:18,height:18}}>
              <path d="M6 5v14"/><path d="M11 19V5h7"/><path d="M11 12h5"/>
            </svg>
          </div>
          {!sidebarCollapsed && (
            <span style={{fontWeight:800,fontSize:16,letterSpacing:'-0.35px'}}>
              Invoice<span style={{background:'linear-gradient(90deg,#60A5FA,#A78BFA)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Flow</span>
            </span>
          )}
        </div>

        <div style={{flex:1,overflowY:'auto',padding:'10px 12px'}}>
          <div style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.3)',letterSpacing:'1.5px',padding:'14px 10px 8px',textTransform:'uppercase'}}>{sidebarCollapsed ? '' : 'Principal'}</div>
          {NAV_MAIN.map(n => (
            <Link key={n.href} href={n.href} style={navItemStyle(n.href)} title={sidebarCollapsed ? n.label : undefined}>
              <Icon>{n.icon}</Icon>
              {!sidebarCollapsed && n.label}
            </Link>
          ))}
          <div style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.3)',letterSpacing:'1.5px',padding:'14px 10px 8px',textTransform:'uppercase'}}>{sidebarCollapsed ? '' : 'Outils'}</div>
          {NAV_TOOLS.map(n => (
            <Link key={n.href} href={n.href} style={navItemStyle(n.href)} title={sidebarCollapsed ? n.label : undefined}>
              <Icon>{n.icon}</Icon>
              {!sidebarCollapsed && n.label}
            </Link>
          ))}
        </div>

        <div style={{padding:12,borderTop:'1px solid rgba(255,255,255,0.06)'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent: sidebarCollapsed ? 'center' : 'flex-start',gap:10,padding:8,borderRadius:9}}>
            <div style={{width:34,height:34,borderRadius:'50%',background:'linear-gradient(135deg,#2563EB,#7C3AED)',color:'#fff',fontWeight:700,fontSize:12.5,display:'grid',placeItems:'center',flexShrink:0}}>
              {initials}
            </div>
            {!sidebarCollapsed && (
              <div style={{minWidth:0,flex:1}}>
                <div style={{fontSize:12,color:'#fff',fontWeight:500,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{email || '...'}</div>
              </div>
            )}
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

      <div style={{flex:1,minWidth:0,display:'flex',flexDirection:'column'}}>
        <header style={{height:60,background:'var(--card)',borderBottom:`1px solid ${palette.border}`,position:'sticky',top:0,zIndex:5,display:'flex',alignItems:'center',padding:'0 24px',gap:16}}>
          <button onClick={toggleSidebar} style={{width:36,height:36,borderRadius:10,border:`1px solid ${palette.border}`,background:isDark ? '#0F172A' : '#fff',color:palette.text,display:'grid',placeItems:'center',cursor:'pointer'}} title={sidebarCollapsed ? 'Agrandir la barre' : 'Réduire la barre'}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16}}>
              {sidebarCollapsed ? <><path d="M9 6l6 6-6 6"/><path d="M4 6v12"/></> : <><path d="M15 6l-6 6 6 6"/><path d="M20 6v12"/></>}
            </svg>
          </button>
          <h1 style={{fontSize:16,fontWeight:700,color:palette.text,letterSpacing:'-0.3px',margin:0,flex:1}}>
            {NAV_MAIN.concat(NAV_TOOLS).find(n => isActive(n.href))?.label || 'Dashboard'}
          </h1>
          <div style={{position:'relative',flex:'0 1 280px', display: sidebarCollapsed ? 'none' : 'block'}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',width:14,height:14}}>
              <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
            </svg>
            <input placeholder="Rechercher une facture, client…" style={{width:'100%',height:36,border:`1px solid ${palette.border}`,borderRadius:10,padding:'0 12px 0 34px',fontSize:13,color:palette.text,background:isDark ? '#020617' : '#F8FAFC',outline:'none',fontFamily:'inherit'}}/>
          </div>
          <button onClick={toggleTheme} style={{width:36,height:36,borderRadius:10,border:`1px solid ${palette.border}`,background:isDark ? '#0F172A' : '#fff',color:palette.text,display:'grid',placeItems:'center',cursor:'pointer'}} title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}>
            {theme === 'dark' ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16}}>
                <circle cx="12" cy="12" r="4.5"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M4.93 19.07l1.41-1.41"/><path d="M17.66 6.34l1.41-1.41"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16}}>
                <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/>
              </svg>
            )}
          </button>
          <button style={{width:36,height:36,borderRadius:10,border:`1px solid ${palette.border}`,background:isDark ? '#0F172A' : '#fff',color:palette.text,display:'grid',placeItems:'center',cursor:'pointer',position:'relative'}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16}}>
              <path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.7 21a2 2 0 01-3.4 0"/>
            </svg>
            <span style={{position:'absolute',top:8,right:9,width:6,height:6,borderRadius:'50%',background:'#7C3AED',border:'1.5px solid #fff'}}/>
          </button>
          <div style={{width:34,height:34,borderRadius:'50%',background:'linear-gradient(135deg,#2563EB,#7C3AED)',color:'#fff',fontWeight:700,fontSize:12.5,display:'grid',placeItems:'center'}}>
            {initials}
          </div>
        </header>

        <main style={{padding:'28px 32px',flex:1,background:'var(--background)'}}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardThemeProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </DashboardThemeProvider>
  );
}