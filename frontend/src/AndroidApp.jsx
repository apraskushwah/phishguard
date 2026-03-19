import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

function useTilt(intensity = 12) {
  const ref = useRef(null);
  const handleMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${x * intensity}deg) rotateX(${-y * intensity}deg) scale3d(1.025, 1.025, 1.025)`;
    el.style.transition = "transform 0.06s ease";
  }, [intensity]);
  const handleLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg) scale3d(1,1,1)";
    el.style.transition = "transform 0.7s cubic-bezier(0.23,1,0.32,1)";
  }, []);
  return { ref, onMouseMove: handleMove, onMouseLeave: handleLeave };
}

function TiltCard({ children, style, className, intensity = 10 }) {
  const { ref, ...handlers } = useTilt(intensity);
  return (
    <div ref={ref} className={className} style={{ ...style, transformStyle: "preserve-3d", willChange: "transform" }} {...handlers}>
      {children}
    </div>
  );
}

const APK_DOWNLOAD_LINK = "https://drive.google.com/uc?export=download&id=1LWZaMb9dHnzCvvxZQ_DiFObKlw3r9VxL";

export default function AndroidApp() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mousePos, setMousePos] = useState({ x: -9999, y: -9999 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleMouse = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  const features = [
    {
      icon: "🔍",
      title: "URL Scanner",
      desc: "Scan any suspicious link using Google Safe Browsing API combined with 10+ threat detection checks. Get an instant verdict — Safe, Suspicious, or Dangerous — within seconds.",
      color: "#00c8ff",
    },
    {
      icon: "📧",
      title: "Email Analyzer",
      desc: "Paste any suspicious email content and PhishGuard will automatically extract all embedded links, scan each one, detect urgency manipulation words, and identify the sender email address.",
      color: "#00ffb4",
    },
    {
      icon: "⚡",
      title: "Bulk Scanner",
      desc: "Scan up to 20 URLs simultaneously with a real-time animated progress bar. Each URL is analyzed individually and results are displayed instantly as they complete.",
      color: "#ff3c64",
    },
    {
      icon: "📷",
      title: "QR Code Scanner",
      desc: "Use your phone's camera to scan any QR code. PhishGuard will instantly reveal the hidden URL and analyze it for threats before you visit the link.",
      color: "#ffb400",
    },
    {
      icon: "🔔",
      title: "Scan History",
      desc: "Every scan you perform is automatically saved with the URL, date, score, and verdict. You can review past scans anytime and tap any entry to see the full detailed report.",
      color: "#00c8ff",
    },
    {
      icon: "📊",
      title: "Statistics",
      desc: "View detailed analytics of all your scans including animated breakdown charts, protection score, threat detection rate, and activity summary — all in one beautiful dashboard.",
      color: "#00ffb4",
    },
    {
      icon: "📋",
      title: "Clipboard Monitor",
      desc: "Enable background clipboard monitoring and PhishGuard will automatically detect any URL you copy and send you a notification if it appears suspicious or dangerous.",
      color: "#ff3c64",
    },
    {
      icon: "⚙️",
      title: "Smart Settings",
      desc: "Customize your experience — adjust scan sensitivity (Low, Medium, High), toggle notifications, enable background monitoring, manage scan history, and control your data privacy.",
      color: "#ffb400",
    },
  ];

  const steps = [
    {
      step: "01",
      icon: "📥",
      title: "Download the APK",
      desc: "Tap the Download APK button below. Your browser will download the PhishGuard APK file directly to your Android device from Google Drive.",
    },
    {
      step: "02",
      icon: "🔓",
      title: "Allow Unknown Sources",
      desc: "Go to Settings → Security → Install Unknown Apps. Allow your browser to install apps. This is required for APKs not from the Play Store.",
    },
    {
      step: "03",
      icon: "📲",
      title: "Install the App",
      desc: "Open the downloaded APK file from your notifications or file manager. Tap Install and wait for the installation to complete on your device.",
    },
    {
      step: "04",
      icon: "🛡️",
      title: "Start Protecting",
      desc: "Open PhishGuard and start scanning URLs immediately. No login required — the app works instantly right out of the box with full functionality.",
    },
  ];

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300&family=DM+Mono:wght@400;500&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

    .bg-base{position:fixed;inset:0;z-index:0;background:#050a14;}
    .bg-aurora{position:fixed;inset:0;z-index:0;pointer-events:none;
      background:radial-gradient(ellipse 90% 70% at 15% 5%,rgba(0,150,255,0.07) 0%,transparent 55%),
      radial-gradient(ellipse 70% 90% at 85% 85%,rgba(0,255,160,0.05) 0%,transparent 55%),
      radial-gradient(ellipse 50% 50% at 50% 50%,rgba(0,80,200,0.04) 0%,transparent 60%);}
    .bg-grid{position:fixed;inset:0;z-index:0;pointer-events:none;
      background-image:linear-gradient(rgba(0,200,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,200,255,0.025) 1px,transparent 1px);
      background-size:64px 64px;mask-image:radial-gradient(ellipse at center,black 30%,transparent 80%);}

    .cursor-glow{position:fixed;pointer-events:none;z-index:9999;width:480px;height:480px;border-radius:50%;
      background:radial-gradient(circle,rgba(0,200,255,0.045) 0%,transparent 70%);transform:translate(-50%,-50%);}

    .particle{position:fixed;border-radius:50%;pointer-events:none;z-index:0;animation:floatParticle linear infinite;}
    @keyframes floatParticle{0%{transform:translateY(100vh) scale(0);opacity:0}10%{opacity:1}90%{opacity:1}100%{transform:translateY(-120px) scale(1);opacity:0}}

    .content{position:relative;z-index:1;}

    .navbar{position:fixed;top:0;left:0;right:0;z-index:100;padding:0 2rem;transition:all 0.4s cubic-bezier(0.23,1,0.32,1);}
    .navbar.scrolled{background:rgba(5,10,20,0.78);backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);border-bottom:1px solid rgba(255,255,255,0.06);}
    .navbar-inner{max-width:1120px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;height:68px;}
    .navbar-logo{font-family:'Syne',sans-serif;font-size:19px;font-weight:800;
      background:linear-gradient(135deg,#00c8ff,#00ffb4);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;cursor:pointer;transition:opacity 0.2s;}
    .navbar-logo:hover{opacity:0.75;}
    .navbar-links{display:flex;align-items:center;gap:4px;}
    .navbar-link{background:transparent;border:none;color:rgba(255,255,255,0.42);padding:8px 15px;
      font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;border-radius:10px;cursor:pointer;transition:all 0.2s;}
    .navbar-link:hover{color:#fff;background:rgba(255,255,255,0.06);}
    .navbar-cta{background:rgba(0,200,255,0.07);border:1px solid rgba(0,200,255,0.18);color:#00c8ff;padding:8px 18px;
      font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;border-radius:10px;cursor:pointer;
      transition:all 0.3s;backdrop-filter:blur(10px);}
    .navbar-cta:hover{border-color:rgba(0,200,255,0.38);color:#fff;transform:translateY(-1px);box-shadow:0 4px 20px rgba(0,200,255,0.14);}
    .navbar-android{background:linear-gradient(135deg,#00c8ff,#00ffb4);color:#030d18;padding:8px 18px;border:none;
      font-family:'DM Sans',sans-serif;font-size:13px;font-weight:700;border-radius:10px;cursor:pointer;
      transition:all 0.3s cubic-bezier(0.23,1,0.32,1);
      animation:androidPulse 2.5s ease-in-out infinite;}
    @keyframes androidPulse{
      0%,100%{box-shadow:0 0 14px rgba(0,200,255,0.4),0 0 28px rgba(0,255,180,0.15);}
      50%{box-shadow:0 0 24px rgba(0,200,255,0.7),0 0 48px rgba(0,255,180,0.3);}
    }
    .navbar-android:hover{transform:translateY(-2px) scale(1.05);}

    .section{padding:90px 2rem;max-width:1020px;margin:0 auto;}
    .section-tag{display:inline-flex;align-items:center;gap:6px;background:rgba(0,200,255,0.05);border:1px solid rgba(0,200,255,0.1);
      border-radius:999px;padding:5px 15px;margin-bottom:18px;font-size:10px;color:rgba(0,200,255,0.58);letter-spacing:2.5px;font-weight:600;font-family:'DM Sans',sans-serif;}
    .section-title{font-family:'Syne',sans-serif;font-size:clamp(30px,4vw,44px);font-weight:800;color:#fff;margin-bottom:12px;letter-spacing:-1.5px;line-height:1.05;}
    .section-sub{font-size:14px;color:rgba(255,255,255,0.28);margin-bottom:36px;font-weight:300;font-family:'DM Sans',sans-serif;line-height:1.6;}

    .feature-card{padding:32px;background:rgba(255,255,255,0.025);border:1px solid rgba(255,255,255,0.06);
      border-radius:24px;position:relative;overflow:hidden;transform-style:preserve-3d;will-change:transform;}
    .feature-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(0,200,255,0.25),transparent);opacity:0;transition:opacity 0.4s;}
    .feature-card:hover::before{opacity:1;}
    .feature-icon-box{width:52px;height:52px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:20px;
      background:rgba(0,200,255,0.06);border:1px solid rgba(0,200,255,0.1);transition:all 0.4s cubic-bezier(0.23,1,0.32,1);}
    .feature-card:hover .feature-icon-box{transform:scale(1.1);box-shadow:0 8px 28px rgba(0,200,255,0.14);}

    .step-card{background:rgba(255,255,255,0.025);border:1px solid rgba(255,255,255,0.06);border-radius:24px;padding:36px;
      position:relative;overflow:hidden;transform-style:preserve-3d;will-change:transform;}
    .step-num{font-family:'Syne',sans-serif;font-size:60px;font-weight:800;line-height:1;
      background:linear-gradient(135deg,rgba(0,200,255,0.35),rgba(0,255,180,0.15));
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:20px;}

    .download-btn{background:linear-gradient(135deg,#00c8ff,#00ffb4);color:#030d18;border:none;padding:18px 40px;
      font-family:'Syne',sans-serif;font-size:16px;font-weight:800;border-radius:16px;cursor:pointer;
      transition:all 0.3s cubic-bezier(0.23,1,0.32,1);box-shadow:0 4px 30px rgba(0,200,255,0.4);
      letter-spacing:0.3px;position:relative;overflow:hidden;display:inline-flex;align-items:center;gap:10px;
      text-decoration:none;}
    .download-btn:hover{transform:translateY(-3px) scale(1.025);box-shadow:0 14px 44px rgba(0,200,255,0.55);}
    .download-btn:active{transform:translateY(-1px) scale(0.99);}

    .divider{height:1px;background:linear-gradient(90deg,transparent,rgba(0,200,255,0.08),transparent);margin:0 3rem;}

    .footer{border-top:1px solid rgba(255,255,255,0.05);background:rgba(0,0,0,0.22);backdrop-filter:blur(24px);padding:56px 2rem 36px;}
    .footer-inner{max-width:1020px;margin:0 auto;}
    .footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr;gap:56px;margin-bottom:48px;}
    .footer-logo{font-family:'Syne',sans-serif;font-size:22px;font-weight:800;background:linear-gradient(135deg,#00c8ff,#00ffb4);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:14px;}
    .footer-desc{font-size:13px;color:rgba(255,255,255,0.22);line-height:1.75;max-width:270px;font-family:'DM Sans',sans-serif;}
    .footer-heading{font-size:10px;font-weight:600;color:rgba(255,255,255,0.38);letter-spacing:2.5px;margin-bottom:18px;font-family:'DM Sans',sans-serif;}
    .footer-link{display:block;font-size:13px;color:rgba(255,255,255,0.23);margin-bottom:11px;cursor:pointer;transition:all 0.2s;background:none;border:none;text-align:left;font-family:'DM Sans',sans-serif;}
    .footer-link:hover{color:#00c8ff;transform:translateX(3px);}
    .footer-bottom{display:flex;justify-content:space-between;align-items:center;padding-top:28px;border-top:1px solid rgba(255,255,255,0.04);flex-wrap:wrap;gap:14px;}
    .footer-copy{font-size:12px;color:rgba(255,255,255,0.17);font-family:'DM Sans',sans-serif;}
    .footer-tags{display:flex;gap:8px;flex-wrap:wrap;}
    .footer-tag{font-size:10px;color:rgba(0,200,255,0.32);background:rgba(0,200,255,0.04);border:1px solid rgba(0,200,255,0.08);padding:3px 11px;border-radius:6px;font-family:'DM Sans',sans-serif;}

    .pulse{animation:pulse 2s infinite;}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.32}}
    .fade-in{animation:fadeUp 0.8s cubic-bezier(0.23,1,0.32,1) both;}
    @keyframes fadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}

    /* MOBILE RESPONSIVE */
    @media(max-width:768px){
      .navbar-inner{height:58px;}
      .navbar-links{gap:2px;}
      .navbar-link{padding:6px 8px;font-size:11px;}
      .navbar-cta{padding:6px 10px;font-size:11px;}
      .navbar-android{padding:6px 10px;font-size:11px;}
      .section{padding:60px 1.2rem;}
      .footer-grid{grid-template-columns:1fr;gap:32px;}
      .step-card{padding:24px;}
      .step-num{font-size:40px;}
      .feature-card{padding:22px;}
    }
    @media(max-width:480px){
      .navbar-link{display:none;}
      .navbar-inner{padding:0 1rem;}
      .section{padding:48px 1rem;}
      .download-btn{padding:14px 24px;font-size:14px;}
    }
  `;

  return (
    <div style={{ minHeight: "100vh", background: "#050a14", color: "#e2e8f0", fontFamily: "'Syne', sans-serif", position: "relative", overflow: "hidden" }}>
      <style>{CSS}</style>

      <div className="cursor-glow" style={{ left: mousePos.x, top: mousePos.y }} />

      {[...Array(6)].map((_, i) => (
        <div key={i} className="particle" style={{
          width: `${3 + i}px`, height: `${3 + i}px`, left: `${8 + i * 16}%`,
          background: i % 2 === 0 ? "rgba(0,200,255,0.28)" : "rgba(0,255,180,0.28)",
          animationDuration: `${9 + i * 3}s`, animationDelay: `${i * 1.8}s`,
        }} />
      ))}

      <div className="bg-base" />
      <div className="bg-aurora" />
      <div className="bg-grid" />

      <div className="content">

        {/* NAVBAR */}
        <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
          <div className="navbar-inner">
            <div className="navbar-logo" onClick={() => navigate("/")}>🛡️ PhishGuard</div>
            <div className="navbar-links">
              <button className="navbar-link" onClick={() => navigate("/bulk")}>Bulk Scanner</button>
              <button className="navbar-link" onClick={() => navigate("/qr")}>QR Scanner</button>
              <button className="navbar-link" onClick={() => navigate("/email")}>Email Analyzer</button>
              <button className="navbar-link" onClick={() => navigate("/about")}>About</button>
              <button className="navbar-android" onClick={() => navigate("/android")}>📱 Android App</button>
              <button className="navbar-cta" onClick={() => navigate("/install")}>Chrome Extension ↗</button>
            </div>
          </div>
        </nav>

        {/* HERO */}
        <div style={{ padding: "132px 2rem 80px", textAlign: "center", maxWidth: 860, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(0,200,255,0.05)", border: "1px solid rgba(0,200,255,0.1)", borderRadius: 999, padding: "6px 20px", marginBottom: 32 }} className="fade-in">
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#00ffb4", boxShadow: "0 0 10px #00ffb4" }} className="pulse" />
            <span style={{ fontSize: 10, color: "rgba(0,200,255,0.62)", letterSpacing: 2.5, fontWeight: 600, fontFamily: "'DM Sans'" }}>AVAILABLE FOR ANDROID</span>
          </div>

          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(48px,8vw,84px)", fontWeight: 800, letterSpacing: -3, lineHeight: 0.94, background: "linear-gradient(160deg,#ffffff 0%,#a0e4ff 30%,#00ffb4 65%,#ffffff 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: 24 }} className="fade-in">
            PhishGuard<br />Android App
          </h1>

          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 17, color: "rgba(255,255,255,0.36)", marginBottom: 44, lineHeight: 1.65, maxWidth: 520, margin: "0 auto 44px", fontWeight: 300 }} className="fade-in">
            Full-featured cybersecurity protection in your pocket. Scan URLs, detect phishing emails, and stay safe from threats — anytime, anywhere.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap", marginBottom: 60 }} className="fade-in">
            <a href={APK_DOWNLOAD_LINK} className="download-btn" download>
              📥 Download APK
              <span style={{ fontSize: 12, opacity: 0.7, fontWeight: 500 }}>v1.0.0</span>
            </a>
            <button
              onClick={() => navigate("/")}
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.62)", padding: "18px 32px", fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 600, borderRadius: 16, cursor: "pointer", transition: "all 0.3s" }}
              onMouseOver={e => e.target.style.background = "rgba(255,255,255,0.07)"}
              onMouseOut={e => e.target.style.background = "rgba(255,255,255,0.04)"}
            >
              Try Web Version →
            </button>
          </div>

          {/* App Info Chips */}
          <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            {[
              { icon: "🤖", label: "Android 7.0+" },
              { icon: "📦", label: "~40 MB" },
              { icon: "🆓", label: "100% Free" },
              { icon: "🔒", label: "No Login Required" },
            ].map((chip, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 999, padding: "8px 16px" }}>
                <span style={{ fontSize: 14 }}>{chip.icon}</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans'", fontWeight: 500 }}>{chip.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="divider" />

        {/* FEATURES */}
        <div className="section">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div className="section-tag">ALL FEATURES</div>
            <p className="section-title">Everything you need to stay safe</p>
            <p className="section-sub">8 powerful tools packed into one beautiful app</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 18 }}>
            {features.map((f, i) => (
              <TiltCard key={i} intensity={8} className="feature-card">
                <div className="feature-icon-box" style={{ background: `${f.color}08`, borderColor: `${f.color}16` }}>
                  <span>{f.icon}</span>
                </div>
                <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 17, fontWeight: 700, color: "#fff", marginBottom: 12 }}>{f.title}</p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.8, fontFamily: "'DM Sans'", fontWeight: 300 }}>{f.desc}</p>
              </TiltCard>
            ))}
          </div>
        </div>

        <div className="divider" />

        {/* HOW TO INSTALL */}
        <div className="section">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div className="section-tag">INSTALLATION GUIDE</div>
            <p className="section-title">Install in 4 simple steps</p>
            <p className="section-sub">Get PhishGuard running on your Android device in under 2 minutes</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 18 }}>
            {steps.map((s, i) => (
              <TiltCard key={i} intensity={10} className="step-card">
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,rgba(0,200,255,${0.15 + i * 0.1}),transparent)` }} />
                <div className="step-num">{s.step}</div>
                <div style={{ fontSize: 34, marginBottom: 18 }}>{s.icon}</div>
                <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 17, fontWeight: 700, color: "#fff", marginBottom: 12 }}>{s.title}</p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.75, fontFamily: "'DM Sans'", fontWeight: 300 }}>{s.desc}</p>
              </TiltCard>
            ))}
          </div>
        </div>

        <div className="divider" />

        {/* REQUIREMENTS */}
        <div className="section">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div className="section-tag">REQUIREMENTS</div>
            <p className="section-title">System requirements</p>
            <p className="section-sub">PhishGuard is lightweight and works on most Android devices</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 18, maxWidth: 860, margin: "0 auto" }}>
            {[
              { icon: "🤖", title: "Android Version", value: "Android 7.0 (Nougat) or higher", color: "#00c8ff" },
              { icon: "💾", title: "Storage Required", value: "Approximately 40 MB free space", color: "#00ffb4" },
              { icon: "🌐", title: "Internet Connection", value: "Required for real-time URL scanning", color: "#ffb400" },
              { icon: "📷", title: "Camera Access", value: "Optional — needed for QR Scanner only", color: "#ff3c64" },
            ].map((r, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "28px 24px" }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: `${r.color}10`, border: `1px solid ${r.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 16 }}>{r.icon}</div>
                <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 700, color: r.color, marginBottom: 8 }}>{r.title}</p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans'", lineHeight: 1.6 }}>{r.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="divider" />

        {/* CTA */}
        <div style={{ textAlign: "center", padding: "90px 2rem" }}>
          <div className="section-tag" style={{ margin: "0 auto 18px", width: "fit-content" }}>DOWNLOAD NOW</div>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, color: "#fff", marginBottom: 16, letterSpacing: -1.5 }}>
            Ready to stay protected?
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.3)", marginBottom: 40, fontFamily: "'DM Sans'", maxWidth: 480, margin: "0 auto 40px", lineHeight: 1.7 }}>
            Download PhishGuard for free and start protecting yourself from phishing attacks, malicious links, and email scams today.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
            <a href={APK_DOWNLOAD_LINK} className="download-btn" download>
              📥 Download APK Free
            </a>
          </div>
          <p style={{ marginTop: 20, fontSize: 12, color: "rgba(255,255,255,0.18)", fontFamily: "'DM Sans'" }}>
            Free forever • No account needed • Works on Android 7.0+
          </p>
        </div>

        <div className="divider" />

        {/* FOOTER */}
        <footer className="footer">
          <div className="footer-inner">
            <div className="footer-grid">
              <div>
                <div className="footer-logo">🛡️ PhishGuard</div>
                <p className="footer-desc">AI-powered URL threat intelligence platform. Protecting users from phishing, malware, and online scams in real-time.</p>
              </div>
              <div>
                <p className="footer-heading">TOOLS</p>
                <button className="footer-link" onClick={() => navigate("/")}>🏠 Home</button>
                <button className="footer-link" onClick={() => navigate("/bulk")}>Bulk Scanner</button>
                <button className="footer-link" onClick={() => navigate("/qr")}>QR Scanner</button>
                <button className="footer-link" onClick={() => navigate("/email")}>Email Analyzer</button>
                <button className="footer-link" onClick={() => navigate("/android")}>Android App</button>
              </div>
              <div>
                <p className="footer-heading">PROJECT</p>
                <button className="footer-link">BGI Hackathon 2026</button>
                <button className="footer-link">Vision 2047</button>
                <button className="footer-link">Viksit Bharat</button>
                <button className="footer-link">Team PhishGuard</button>
              </div>
            </div>
            <div className="footer-bottom">
              <p className="footer-copy">© 2026 PhishGuard — BGI Hackathon — Built with ❤️ in India</p>
              <div className="footer-tags">
                {["Cybersecurity", "AI Powered", "Open Source", "BGI 2026"].map((t, i) => (
                  <span key={i} className="footer-tag">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
