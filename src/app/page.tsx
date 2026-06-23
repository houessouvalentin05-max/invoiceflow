export default function HomePage() {
  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --blue: #2563EB;
          --blue-dark: #1D4ED8;
          --navy: #111827;
          --emerald: #10B981;
          --bg: #F8FAFC;
          --bg-alt: #F1F5F9;
          --border: #E2E8F0;
          --text: #0F172A;
          --muted: #64748B;
          --soft: #94A3B8;
          --white: #FFFFFF;
          --radius: 12px;
          --radius-lg: 20px;
        }
        body { font-family: 'Inter', system-ui, -apple-system, sans-serif; background: var(--bg); color: var(--text); -webkit-font-smoothing: antialiased; }

        /* NAV */
        .nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; height: 64px; border-bottom: 1px solid var(--border); background: rgba(248,250,252,0.88); backdrop-filter: blur(12px); display: flex; align-items: center; padding: 0 24px; }
        .nav-inner { width: 100%; max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
        .nav-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; font-weight: 700; font-size: 17px; letter-spacing: -0.3px; color: var(--navy); flex-shrink: 0; }
        .logo-box { width: 32px; height: 32px; background: var(--blue); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 900; color: white; flex-shrink: 0; }
        .logo-word { color: var(--blue); }
        .nav-links { display: flex; align-items: center; gap: 28px; list-style: none; }
        .nav-links a { text-decoration: none; color: var(--muted); font-size: 14px; font-weight: 500; transition: color 0.15s; white-space: nowrap; }
        .nav-links a:hover { color: var(--text); }
        .nav-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .btn-ghost { padding: 8px 14px; border: none; background: none; color: var(--muted); font-size: 14px; font-weight: 500; cursor: pointer; border-radius: 8px; transition: all 0.15s; text-decoration: none; white-space: nowrap; }
        .btn-ghost:hover { background: var(--bg-alt); color: var(--text); }
        .btn-primary { padding: 9px 18px; background: var(--blue); color: white; font-size: 14px; font-weight: 600; border: none; border-radius: 8px; cursor: pointer; transition: all 0.15s; text-decoration: none; white-space: nowrap; }
        .btn-primary:hover { background: var(--blue-dark); box-shadow: 0 4px 12px rgba(37,99,235,0.3); }

        /* HERO */
        .hero { padding: 120px 24px 80px; }
        .hero-inner { max-width: 1200px; margin: 0 auto; text-align: center; }
        .badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; background: rgba(37,99,235,0.08); border: 1px solid rgba(37,99,235,0.2); border-radius: 100px; font-size: 13px; font-weight: 500; color: var(--blue); margin-bottom: 28px; }
        .badge-dot { width: 7px; height: 7px; background: var(--emerald); border-radius: 50%; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(1.4)} }
        .hero h1 { font-size: clamp(36px, 5.5vw, 68px); font-weight: 800; line-height: 1.06; letter-spacing: -2px; color: var(--navy); margin-bottom: 20px; }
        .hero h1 span { color: var(--blue); }
        .hero p { font-size: 18px; color: var(--muted); max-width: 480px; margin: 0 auto 36px; line-height: 1.7; }
        .hero-cta { display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; margin-bottom: 40px; }
        .btn-hero { padding: 14px 28px; background: var(--blue); color: white; font-size: 15px; font-weight: 600; border: none; border-radius: 12px; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 1px 3px rgba(37,99,235,.3),0 4px 16px rgba(37,99,235,.2); transition: all .2s; }
        .btn-hero:hover { background: var(--blue-dark); transform: translateY(-2px); box-shadow: 0 4px 20px rgba(37,99,235,.4); }
        .btn-demo { padding: 14px 28px; background: white; color: var(--text); font-size: 15px; font-weight: 600; border: 1px solid var(--border); border-radius: 12px; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; transition: all .2s; }
        .btn-demo:hover { border-color: #CBD5E1; box-shadow: 0 2px 8px rgba(0,0,0,.06); transform: translateY(-1px); }
        .hero-stats { display: flex; align-items: center; justify-content: center; gap: 32px; flex-wrap: wrap; margin-bottom: 72px; }
        .stat { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--muted); }

        /* DASHBOARD PREVIEW */
        .preview-wrap { position: relative; max-width: 1100px; margin: 0 auto; }
        .preview-glow { position: absolute; inset: -40px; background: radial-gradient(ellipse at 50% 30%, rgba(37,99,235,.12) 0%, transparent 70%); pointer-events: none; z-index: 0; }
        .preview-frame { position: relative; z-index: 1; background: white; border-radius: var(--radius-lg); border: 1px solid var(--border); box-shadow: 0 0 0 1px rgba(0,0,0,.04),0 4px 6px rgba(0,0,0,.04),0 20px 40px rgba(0,0,0,.08),0 40px 80px rgba(0,0,0,.06); overflow: hidden; }
        .preview-bar { background: var(--navy); padding: 12px 20px; display: flex; align-items: center; gap: 8px; }
        .dot { width: 12px; height: 12px; border-radius: 50%; }
        .preview-body { display: grid; grid-template-columns: 200px 1fr; min-height: 380px; }
        .preview-side { background: #FAFBFC; border-right: 1px solid var(--border); padding: 16px; }
        .side-brand { display: flex; align-items: center; gap: 8px; padding: 8px; margin-bottom: 16px; }
        .side-icon { width: 24px; height: 24px; background: var(--blue); border-radius: 6px; font-size: 9px; font-weight: 900; color: white; display: flex; align-items: center; justify-content: center; }
        .side-nav { display: flex; flex-direction: column; gap: 2px; }
        .side-item { display: flex; align-items: center; gap: 8px; padding: 7px 10px; border-radius: 7px; font-size: 12px; font-weight: 500; color: var(--muted); }
        .side-item.active { background: rgba(37,99,235,.08); color: var(--blue); }
        .preview-main { padding: 20px; background: var(--bg); }
        .preview-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
        .preview-title { font-size: 15px; font-weight: 700; color: var(--navy); }
        .preview-sub { font-size: 11px; color: var(--muted); margin-top: 2px; }
        .metrics { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin-bottom: 14px; }
        .metric { background: white; border: 1px solid var(--border); border-radius: var(--radius); padding: 12px 14px; }
        .metric-label { font-size: 10px; color: var(--muted); font-weight: 500; margin-bottom: 4px; }
        .metric-val { font-size: 20px; font-weight: 800; color: var(--navy); letter-spacing: -.5px; }
        .metric-up { font-size: 10px; color: var(--emerald); margin-top: 3px; }
        .metric-warn { font-size: 10px; color: #F59E0B; margin-top: 3px; }
        .inv-table { background: white; border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
        .inv-head { display: grid; grid-template-columns: 1fr 90px 80px 60px; padding: 8px 14px; background: #F8FAFC; border-bottom: 1px solid var(--border); font-size: 10px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: .4px; }
        .inv-row { display: grid; grid-template-columns: 1fr 90px 80px 60px; padding: 9px 14px; font-size: 11px; border-bottom: 1px solid #F1F5F9; align-items: center; }
        .inv-row:last-child { border-bottom: none; }
        .badge-status { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 100px; font-size: 10px; font-weight: 600; }
        .s-paid { background: rgba(16,185,129,.1); color: #059669; }
        .s-pending { background: rgba(245,158,11,.1); color: #D97706; }
        .s-late { background: rgba(239,68,68,.1); color: #DC2626; }

        /* SECTIONS */
        .section { padding: 96px 24px; }
        .section-white { background: white; }
        .section-bg { background: var(--bg); }
        .container { max-width: 1200px; margin: 0 auto; }
        .section-eyebrow { font-size: 12px; font-weight: 600; color: var(--blue); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
        .section-title { font-size: clamp(28px, 3.5vw, 42px); font-weight: 800; letter-spacing: -1px; color: var(--navy); line-height: 1.1; margin-bottom: 14px; }
        .section-desc { font-size: 17px; color: var(--muted); max-width: 480px; line-height: 1.7; }
        .section-center { text-align: center; }
        .section-center .section-desc { margin: 0 auto; }

        /* FEATURES */
        .features-grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(320px,1fr)); gap: 16px; margin-top: 56px; }
        .feature-card { background: white; border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 32px; transition: all .2s; }
        .feature-card:hover { border-color: #CBD5E1; box-shadow: 0 8px 24px rgba(0,0,0,.07); transform: translateY(-2px); }
        .feature-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 18px; }
        .feature-title { font-size: 16px; font-weight: 700; color: var(--navy); margin-bottom: 8px; }
        .feature-desc { font-size: 14px; color: var(--muted); line-height: 1.65; }

        /* PAYMENTS */
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
        .payments-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .pay-card { background: white; border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 24px; text-align: center; transition: all .2s; }
        .pay-card:hover { border-color: var(--blue); box-shadow: 0 4px 16px rgba(37,99,235,.08); transform: translateY(-2px); }
        .pay-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; }
        .pay-name { font-size: 13px; font-weight: 700; color: var(--navy); }
        .pay-tag { font-size: 11px; color: var(--soft); margin-top: 2px; }
        .check-list { list-style: none; display: flex; flex-direction: column; gap: 14px; margin-top: 28px; }
        .check-list li { display: flex; align-items: flex-start; gap: 10px; font-size: 15px; color: var(--muted); line-height: 1.5; }
        .check-icon { width: 20px; height: 20px; background: rgba(16,185,129,.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; }

        /* AUTOMATIONS */
        .auto-demo { background: var(--navy); border-radius: var(--radius-lg); padding: 36px; }
        .auto-label { font-size: 11px; font-weight: 700; color: var(--emerald); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 22px; display: flex; align-items: center; gap: 6px; }
        .auto-block { background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.08); border-radius: 10px; padding: 14px 16px; margin-bottom: 6px; }
        .auto-block-head { font-size: 10px; font-weight: 600; color: rgba(255,255,255,.35); text-transform: uppercase; letter-spacing: .8px; margin-bottom: 6px; }
        .auto-block-content { font-size: 13px; color: rgba(255,255,255,.9); font-weight: 500; }
        .auto-arrow { text-align: center; color: rgba(255,255,255,.2); font-size: 18px; margin: 3px 0; }
        .auto-block-action { background: rgba(16,185,129,.08); border: 1px solid rgba(16,185,129,.25); border-radius: 10px; padding: 14px 16px; }
        .auto-block-action .auto-block-head { color: rgba(52,211,153,.7); }
        .auto-block-action .auto-block-content { color: #34D399; }

        /* PRICING */
        .pricing-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; margin-top: 52px; }
        .price-card { background: white; border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 32px; position: relative; transition: all .2s; display: flex; flex-direction: column; }
        .price-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,.08); }
        .price-card.featured { border-color: var(--blue); box-shadow: 0 0 0 1px var(--blue),0 8px 32px rgba(37,99,235,.15); }
        .price-badge { position: absolute; top: -13px; left: 50%; transform: translateX(-50%); background: var(--blue); color: white; font-size: 11px; font-weight: 700; padding: 4px 14px; border-radius: 100px; white-space: nowrap; }
        .plan-name { font-size: 12px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: .5px; margin-bottom: 8px; }
        .plan-price { font-size: 38px; font-weight: 800; color: var(--navy); letter-spacing: -1.5px; line-height: 1; }
        .plan-price sup { font-size: 14px; font-weight: 500; color: var(--muted); vertical-align: top; margin-top: 8px; display: inline-block; }
        .plan-period { font-size: 13px; color: var(--muted); margin-top: 4px; margin-bottom: 10px; }
        .plan-desc { font-size: 14px; color: var(--muted); margin-bottom: 24px; line-height: 1.5; }
        .plan-feats { list-style: none; display: flex; flex-direction: column; gap: 10px; margin-bottom: 28px; flex: 1; }
        .plan-feats li { display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--text); }
        .btn-plan { display: block; width: 100%; padding: 12px; border-radius: 10px; font-size: 14px; font-weight: 600; border: none; cursor: pointer; transition: all .15s; text-align: center; text-decoration: none; }
        .btn-outline { background: none; border: 1px solid var(--border); color: var(--text); }
        .btn-outline:hover { border-color: var(--blue); color: var(--blue); }
        .btn-filled { background: var(--blue); color: white; box-shadow: 0 2px 8px rgba(37,99,235,.25); }
        .btn-filled:hover { background: var(--blue-dark); }

        /* TESTIMONIALS */
        .testi-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 18px; margin-top: 52px; }
        .testi-card { background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 28px; transition: all .2s; }
        .testi-card:hover { border-color: #CBD5E1; box-shadow: 0 6px 20px rgba(0,0,0,.06); }
        .stars { display: flex; gap: 2px; color: #F59E0B; margin-bottom: 14px; }
        .testi-text { font-size: 15px; color: var(--text); line-height: 1.65; margin-bottom: 20px; }
        .testi-author { display: flex; align-items: center; gap: 12px; }
        .avatar { width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: white; flex-shrink: 0; }
        .author-name { font-size: 13px; font-weight: 700; color: var(--navy); }
        .author-role { font-size: 12px; color: var(--muted); }

        /* FAQ */
        .faq-wrap { display: grid; grid-template-columns: 1fr 1.2fr; gap: 64px; align-items: start; }
        .faq-list { display: flex; flex-direction: column; gap: 10px; }
        .faq-item { background: white; border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
        .faq-q { padding: 17px 20px; font-size: 15px; font-weight: 600; color: var(--navy); cursor: pointer; display: flex; align-items: center; justify-content: space-between; gap: 12px; user-select: none; list-style: none; }
        .faq-q:hover { background: #FAFBFF; }
        .faq-a { padding: 0 20px 16px; font-size: 14px; color: var(--muted); line-height: 1.65; }

        /* CTA */
        .cta-section { background: var(--navy); padding: 96px 24px; text-align: center; }
        .cta-title { font-size: clamp(30px, 4.5vw, 52px); font-weight: 800; color: white; letter-spacing: -1.5px; margin-bottom: 14px; line-height: 1.1; }
        .cta-sub { font-size: 18px; color: rgba(255,255,255,.45); margin-bottom: 40px; }
        .cta-btns { display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; }
        .btn-cta-white { padding: 14px 28px; background: white; color: var(--navy); font-size: 15px; font-weight: 700; border: none; border-radius: 12px; cursor: pointer; text-decoration: none; transition: all .2s; }
        .btn-cta-white:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,.2); }
        .btn-cta-ghost { padding: 14px 28px; background: rgba(255,255,255,.08); color: white; font-size: 15px; font-weight: 600; border: 1px solid rgba(255,255,255,.12); border-radius: 12px; cursor: pointer; text-decoration: none; transition: all .2s; }
        .btn-cta-ghost:hover { background: rgba(255,255,255,.13); }
        .cta-note { font-size: 13px; color: rgba(255,255,255,.28); margin-top: 20px; }

        /* FOOTER */
        .footer { background: var(--navy); border-top: 1px solid rgba(255,255,255,.06); padding: 52px 24px 32px; }
        .footer-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 220px 1fr; gap: 64px; }
        .footer-logo { display: flex; align-items: center; gap: 8px; color: white; font-weight: 700; font-size: 16px; margin-bottom: 12px; text-decoration: none; }
        .footer-tagline { font-size: 13px; color: rgba(255,255,255,.3); line-height: 1.6; max-width: 200px; }
        .footer-cols { display: grid; grid-template-columns: repeat(4,1fr); gap: 24px; }
        .footer-col h4 { font-size: 12px; font-weight: 700; color: rgba(255,255,255,.6); text-transform: uppercase; letter-spacing: .5px; margin-bottom: 14px; }
        .footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 9px; }
        .footer-col a { color: rgba(255,255,255,.35); text-decoration: none; font-size: 13px; transition: color .15s; }
        .footer-col a:hover { color: rgba(255,255,255,.75); }
        .footer-bottom { max-width: 1200px; margin: 32px auto 0; padding-top: 24px; border-top: 1px solid rgba(255,255,255,.06); display: flex; align-items: center; justify-content: space-between; font-size: 13px; color: rgba(255,255,255,.28); }

        /* RESPONSIVE */
        @media(max-width:900px) {
          .nav-links { display: none; }
          .two-col { grid-template-columns: 1fr; gap: 40px; }
          .pricing-grid { grid-template-columns: 1fr; max-width: 420px; margin-left: auto; margin-right: auto; }
          .testi-grid { grid-template-columns: 1fr; }
          .faq-wrap { grid-template-columns: 1fr; }
          .footer-inner { grid-template-columns: 1fr; gap: 40px; }
          .footer-cols { grid-template-columns: repeat(2,1fr); }
          .preview-body { grid-template-columns: 1fr; }
          .preview-side { display: none; }
          .footer-bottom { flex-direction: column; gap: 8px; text-align: center; }
        }
        @media(max-width:600px) {
          .hero { padding: 100px 16px 60px; }
          .section { padding: 72px 16px; }
          .features-grid { grid-template-columns: 1fr; }
          .payments-grid { grid-template-columns: 1fr 1fr; }
          .metrics { grid-template-columns: repeat(3,1fr); }
        }
      `}</style>

      {/* NAV */}
      <nav className="nav">
        <div className="nav-inner">
          <a href="/" className="nav-logo">
            <div className="logo-box">IF</div>
            Invoice<span className="logo-word">Flow</span>
          </a>
          <ul className="nav-links">
            <li><a href="#features">Fonctionnalités</a></li>
            <li><a href="#payments">Paiements</a></li>
            <li><a href="#pricing">Tarifs</a></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>
          <div className="nav-actions">
            <a href="/login" className="btn-ghost">Connexion</a>
            <a href="/register" className="btn-primary">Essai gratuit →</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <div className="badge">
            <span className="badge-dot" />
            Nouveau — Paiements Mobile Money disponibles
          </div>
          <h1>Facturez intelligemment.<br /><span>Soyez payé plus vite.</span></h1>
          <p>La facturation professionnelle pensée pour les freelances et entreprises d&apos;Afrique et d&apos;ailleurs.</p>
          <div className="hero-cta">
            <a href="/register" className="btn-hero">
              Commencer gratuitement
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </a>
            <a href="#demo" className="btn-demo">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Voir la démo
            </a>
          </div>
          <div className="hero-stats">
            {["Aucune carte bancaire requise","Configuration en 4 minutes","XOF / USD / EUR"].map(s => (
              <div className="stat" key={s}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                {s}
              </div>
            ))}
          </div>

          {/* DASHBOARD PREVIEW */}
          <div className="preview-wrap">
            <div className="preview-glow" />
            <div className="preview-frame">
              <div className="preview-bar">
                <div className="dot" style={{background:"#EF4444"}} />
                <div className="dot" style={{background:"#F59E0B"}} />
                <div className="dot" style={{background:"#10B981"}} />
              </div>
              <div className="preview-body">
                <div className="preview-side">
                  <div className="side-brand">
                    <div className="side-icon">IF</div>
                    <span style={{fontSize:13,fontWeight:700,color:"#111827"}}>InvoiceFlow</span>
                  </div>
                  <div className="side-nav">
                    {["Tableau de bord","Factures","Clients","Paiements","Automatisations"].map((item,i) => (
                      <div className={`side-item${i===0?" active":""}`} key={item}>{item}</div>
                    ))}
                  </div>
                </div>
                <div className="preview-main">
                  <div className="preview-head">
                    <div>
                      <div className="preview-title">Tableau de bord</div>
                      <div className="preview-sub">Juin 2026 · Tous les clients</div>
                    </div>
                  </div>
                  <div className="metrics">
                    <div className="metric"><div className="metric-label">Revenu total</div><div className="metric-val">2.4M</div><div className="metric-up">↑ +18.4%</div></div>
                    <div className="metric"><div className="metric-label">En attente</div><div className="metric-val">340K</div><div className="metric-warn">4 factures</div></div>
                    <div className="metric"><div className="metric-label">Payé ce mois</div><div className="metric-val">1.9M</div><div className="metric-up">↑ 12 fact.</div></div>
                  </div>
                  <div className="inv-table">
                    <div className="inv-head"><span>Client</span><span>Montant</span><span>Statut</span><span>Date</span></div>
                    {[
                      {c:"Agence Volta",a:"450 000 F",s:"Payée",cls:"s-paid",d:"14 juin"},
                      {c:"TechHub Dakar",a:"280 000 F",s:"En attente",cls:"s-pending",d:"12 juin"},
                      {c:"Startup Abidjan",a:"175 000 F",s:"En retard",cls:"s-late",d:"1 juin"},
                    ].map(r=>(
                      <div className="inv-row" key={r.c}>
                        <span style={{fontWeight:600}}>{r.c}</span>
                        <span style={{fontWeight:700}}>{r.a}</span>
                        <span><span className={`badge-status ${r.cls}`}>{r.s}</span></span>
                        <span style={{color:"var(--muted)"}}>{r.d}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section section-white" id="features">
        <div className="container">
          <div className="section-center">
            <div className="section-eyebrow">Fonctionnalités</div>
            <h2 className="section-title">Tout ce qu&apos;il faut pour gérer votre facturation.</h2>
            <p className="section-desc">Une boîte à outils complète, de la création de facture au suivi des paiements.</p>
          </div>
          <div className="features-grid">
            {[
              {title:"Générateur de factures",desc:"Créez des factures pro en quelques secondes. Taxes et totaux calculés automatiquement.",color:"#2563EB",bg:"rgba(37,99,235,.1)",icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>},
              {title:"Paiements Mobile Money",desc:"Acceptez MTN, Orange Money, Visa et virements bancaires au même endroit.",color:"#10B981",bg:"rgba(16,185,129,.1)",icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>},
              {title:"Automatisations",desc:"Rappels, factures récurrentes et emails de confirmation envoyés automatiquement.",color:"#8B5CF6",bg:"rgba(139,92,246,.1)",icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>},
              {title:"Analytique de revenus",desc:"Suivez le revenu mensuel, délais de paiement et soldes impayés en un coup d'œil.",color:"#F97316",bg:"rgba(249,115,22,.1)",icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>},
              {title:"Gestion des clients",desc:"Base de données clients complète avec historique de paiement et revenu total.",color:"#EC4899",bg:"rgba(236,72,153,.1)",icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>},
              {title:"Exports PDF & CSV",desc:"Exportez vos factures en PDF, générez des rapports mensuels et résumés fiscaux.",color:"#14B8A6",bg:"rgba(20,184,166,.1)",icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>},
            ].map(f=>(
              <div className="feature-card" key={f.title}>
                <div className="feature-icon" style={{background:f.bg,color:f.color}}>{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PAYMENTS */}
      <section className="section section-bg" id="payments">
        <div className="container">
          <div className="two-col">
            <div>
              <div className="section-eyebrow">Paiements</div>
              <h2 className="section-title">Portée mondiale, méthodes locales.</h2>
              <p className="section-desc">Vos clients paient comme ils le souhaitent. Vous êtes payé le jour même.</p>
              <ul className="check-list">
                {["Notifications de paiement instantanées","Mise à jour automatique du statut des factures","Multi-devises : XOF, USD, EUR, GBP","Transactions sécurisées et chiffrées"].map(b=>(
                  <li key={b}>
                    <span className="check-icon"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <div className="payments-grid">
              {[
                {name:"MTN MoMo",tag:"Mobile Money",color:"#FFCC00",bg:"rgba(255,204,0,.12)"},
                {name:"Orange Money",tag:"Mobile Money",color:"#FF6600",bg:"rgba(255,102,0,.12)"},
                {name:"Visa / Mastercard",tag:"Carte bancaire",color:"#2563EB",bg:"rgba(37,99,235,.1)"},
                {name:"Virement bancaire",tag:"Transfert",color:"#64748B",bg:"rgba(100,116,139,.1)"},
              ].map(p=>(
                <div className="pay-card" key={p.name}>
                  <div className="pay-icon" style={{background:p.bg,color:p.color}}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                  </div>
                  <div className="pay-name">{p.name}</div>
                  <div className="pay-tag">{p.tag}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AUTOMATIONS */}
      <section className="section section-white">
        <div className="container">
          <div className="two-col">
            <div className="auto-demo">
              <div className="auto-label">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                Exemple d&apos;automatisation
              </div>
              <div className="auto-block"><div className="auto-block-head">Déclencheur</div><div className="auto-block-content">Facture impayée après 7 jours</div></div>
              <div className="auto-arrow">↓</div>
              <div className="auto-block"><div className="auto-block-head">Condition</div><div className="auto-block-content">Montant &gt; 50 000 F CFA</div></div>
              <div className="auto-arrow">↓</div>
              <div className="auto-block-action"><div className="auto-block-head">Action</div><div className="auto-block-content">Envoyer un rappel de paiement</div></div>
            </div>
            <div>
              <div className="section-eyebrow">Automatisations</div>
              <h2 className="section-title">Laissez InvoiceFlow travailler pendant votre sommeil.</h2>
              <p className="section-desc">Créez des règles qui gèrent vos relances et factures récurrentes sans lever le petit doigt.</p>
              <ul className="check-list">
                {["Rappels automatiques pour factures en retard","Génération de factures récurrentes","Emails de confirmation de paiement","Générateur trigger → condition → action"].map(b=>(
                  <li key={b}>
                    <span className="check-icon"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="section section-bg" id="pricing">
        <div className="container">
          <div className="section-center">
            <div className="section-eyebrow">Tarifs</div>
            <h2 className="section-title">Simple et transparent.</h2>
            <p className="section-desc">Commencez gratuitement. Évoluez quand vous êtes prêt. Pas de frais cachés.</p>
          </div>
          <div className="pricing-grid">
            {[
              {name:"Free",price:"0",period:"gratuit pour toujours",desc:"Idéal pour démarrer.",feats:["5 factures / mois","2 clients","Export PDF"],cta:"Commencer gratuitement",featured:false,href:"/register"},
              {name:"Pro",price:"9 900",period:"par mois",desc:"Pour freelances en croissance.",feats:["Factures illimitées","Clients illimités","Mobile Money","Automatisations","Support prioritaire"],cta:"Essayer Pro — 14 jours gratuits",featured:true,href:"/register"},
              {name:"Business",price:"24 900",period:"par mois",desc:"Pour les équipes.",feats:["Tout dans Pro","5 membres d'équipe","API access","Compte dédié"],cta:"Contacter les ventes",featured:false,href:"/contact"},
            ].map(p=>(
              <div className={`price-card${p.featured?" featured":""}`} key={p.name}>
                {p.featured && <span className="price-badge">Le plus populaire</span>}
                <div className="plan-name">{p.name}</div>
                <div className="plan-price"><sup>XOF</sup>{p.price}</div>
                <div className="plan-period">{p.period}</div>
                <div className="plan-desc">{p.desc}</div>
                <ul className="plan-feats">
                  {p.feats.map(f=>(
                    <li key={f}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <a href={p.href} className={`btn-plan ${p.featured?"btn-filled":"btn-outline"}`}>{p.cta}</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section section-white">
        <div className="container">
          <div className="section-center">
            <div className="section-eyebrow">Témoignages</div>
            <h2 className="section-title">Utilisé partout en Afrique de l&apos;Ouest.</h2>
          </div>
          <div className="testi-grid">
            {[
              {text:"Avant InvoiceFlow, je passais des heures à relancer mes clients. Maintenant ils paient avant même que j'aie à relancer.",name:"Aminata Konaté",role:"Designer graphique · Abidjan",init:"AK",color:"#2563EB"},
              {text:"Interface propre, rapide, et tout fonctionne. J'ai envoyé ma première facture 5 minutes après l'inscription.",name:"Kwame Diallo",role:"Développeur web · Dakar",init:"KD",color:"#10B981"},
              {text:"Les automatisations ont fait gagner 3 heures par semaine à mon équipe. On se concentre sur le travail.",name:"Sophie Mensah",role:"Fondatrice d'agence · Lomé",init:"SM",color:"#8B5CF6"},
            ].map(t=>(
              <div className="testi-card" key={t.name}>
                <div className="stars">{"★★★★★".split("").map((s,i)=><span key={i}>{s}</span>)}</div>
                <p className="testi-text">&ldquo;{t.text}&rdquo;</p>
                <div className="testi-author">
                  <div className="avatar" style={{background:t.color}}>{t.init}</div>
                  <div><div className="author-name">{t.name}</div><div className="author-role">{t.role}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section section-bg" id="faq">
        <div className="container">
          <div className="faq-wrap">
            <div>
              <div className="section-eyebrow">FAQ</div>
              <h2 className="section-title">Vos questions, nos réponses.</h2>
              <p className="section-desc" style={{marginTop:14}}>Vous ne trouvez pas ? Écrivez à <strong style={{color:"#0f172a"}}>hello@invoiceflow.io</strong></p>
            </div>
            <div className="faq-list">
              {[
                {q:"InvoiceFlow est-il gratuit pour commencer ?",a:"Oui. Notre plan gratuit permet d'envoyer jusqu'à 5 factures par mois et de gérer 2 clients — aucune carte requise."},
                {q:"Quelles devises sont supportées ?",a:"XOF (FCFA), USD, EUR et GBP. Nous ajoutons régulièrement de nouvelles devises."},
                {q:"Comment fonctionne le Mobile Money ?",a:"Votre client reçoit un lien de paiement et peut payer via MTN ou Orange Money. Vous êtes notifié immédiatement."},
                {q:"Puis-je annuler à tout moment ?",a:"Oui. Pas de contrat. Annulez depuis vos paramètres, vos données restent accessibles 30 jours."},
                {q:"Mes données sont-elles sécurisées ?",a:"Chiffrées en transit et au repos via Supabase avec politiques de sécurité au niveau des lignes (RLS)."},
              ].map((f,i)=>(
                <details className="faq-item" key={f.q} open={i===0}>
                  <summary className="faq-q">{f.q}<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg></summary>
                  <div className="faq-a">{f.a}</div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div style={{maxWidth:640,margin:"0 auto"}}>
          <h2 className="cta-title">Prêt à être payé à temps ?</h2>
          <p className="cta-sub">Rejoignez des centaines de freelances et entreprises qui utilisent déjà InvoiceFlow.</p>
          <div className="cta-btns">
            <a href="/register" className="btn-cta-white">Créer votre compte gratuit →</a>
            <a href="/contact" className="btn-cta-ghost">Nous contacter</a>
          </div>
          <p className="cta-note">Gratuit pour toujours. Aucune carte bancaire. 4 minutes pour démarrer.</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div>
            <a href="/" className="footer-logo">
              <div className="logo-box">IF</div>
              Invoice<span className="logo-word">Flow</span>
            </a>
            <p className="footer-tagline">La facturation de classe mondiale pour les entreprises qui visent haut.</p>
          </div>
          <div className="footer-cols">
            {[
              {title:"Produit",links:[["Fonctionnalités","#features"],["Tarifs","#pricing"],["Intégrations","/integrations"],["Nouveautés","/changelog"]]},
              {title:"Entreprise",links:[["À propos","/about"],["Blog","/blog"],["Carrières","/careers"],["Contact","/contact"]]},
              {title:"Légal",links:[["Confidentialité","/privacy"],["Conditions","/terms"],["Sécurité","/security"],["RGPD","/gdpr"]]},
              {title:"Support",links:[["Centre d'aide","/help"],["Docs API","/docs"],["Statut","/status"],["Communauté","/community"]]},
            ].map(col=>(
              <div className="footer-col" key={col.title}>
                <h4>{col.title}</h4>
                <ul>{col.links.map(([label,href])=><li key={label}><a href={href}>{label}</a></li>)}</ul>
              </div>
            ))}
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} InvoiceFlow. Tous droits réservés.</span>
          <span>Conçu avec 🤍 pour les entreprises africaines</span>
        </div>
      </footer>
    </>
  );
}