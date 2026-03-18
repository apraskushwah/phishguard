import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

async function realAnalysis(url) {
  const res = await fetch("https://phishguard-backend-6cq9.onrender.com/api/check-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  return await res.json();
}

function useTilt(intensity = 12) {
  const ref = useRef(null);
  const handleMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${x * intensity}deg) rotateX(${-y * intensity}deg) scale3d(1.025,1.025,1.025)`;
    el.style.transition = "transform 0.06s ease";
    el.style.setProperty("--mouse-x", `${(x + 0.5) * 100}%`);
    el.style.setProperty("--mouse-y", `${(y + 0.5) * 100}%`);
  }, [intensity]);
  const handleLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg) scale3d(1,1,1)";
    el.style.transition = "transform 0.7s cubic-bezier(0.23,1,0.32,1)";
  }, []);
  return { ref, onMouseMove: handleMove, onMouseLeave: handleLeave };
}

function useMagnetic(strength = 0.38) {
  const ref = useRef(null);
  const handleMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = (e.clientX - rect.left - rect.width / 2) * strength;
    const dy = (e.clientY - rect.top - rect.height / 2) * strength;
    el.style.transform = `translate(${dx}px,${dy}px)`;
    el.style.transition = "transform 0.18s ease";
  }, [strength]);
  const handleLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "translate(0,0)";
    el.style.transition = "transform 0.55s cubic-bezier(0.23,1,0.32,1)";
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

function MagneticBtn({ children, className, onClick, disabled, style }) {
  const { ref, ...handlers } = useMagnetic(0.35);
  return (
    <button ref={ref} className={className} onClick={onClick} disabled={disabled} style={style} {...handlers}>
      {children}
    </button>
  );
}

export default function BulkScanner() {
  const [urls, setUrls] = useState("");
  const [results, setResults] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const [mousePos, setMousePos] = useState({ x: -9999, y: -9999 });
  const navigate = useNavigate();

  useEffect(() => {
    const h = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, []);

  const colorMap = {
    safe:   { accent: "#00ffb4", text: "#00ffb4", bg: "rgba(0,255,180,0.07)",   border: "rgba(0,255,180,0.18)"  },
    warn:   { accent: "#ffb400", text: "#ffb400", bg: "rgba(255,180,0,0.07)",   border: "rgba(255,180,0,0.18)"  },
    danger: { accent: "#ff3c64", text: "#ff3c64", bg: "rgba(255,60,100,0.07)", border: "rgba(255,60,100,0.18)" },
  };

  const scanAll = async () => {
    const list = urls.split("\n").map(u => u.trim()).filter(u => u.length > 0);
    if (list.length === 0) return;
    if (list.length > 20) { alert("MAX 20 URLs!"); return; }
    setResults([]); setScanning(true); setProgress(0); setTotal(list.length);
    const out = [];
    for (let i = 0; i < list.length; i++) {
      let url = list[i];
      if (!/^https?:\/\//i.test(url)) url = "http://" + url;
      try {
        const r = await realAnalysis(url);
        out.push({ url, ...r });
      } catch {
        out.push({ url, verdict: "Error", color: "warn", score: 0, flags: [] });
      }
      setProgress(i + 1);
      setResults([...out]);
    }
    setScanning(false);
  };

  const downloadCSV = () => {
    const header = "URL,Score,Verdict\n";
    const rows = results.map(r => `"${r.url}",${r.score},${r.verdict}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "phishguard-report.csv";
    a.click();
  };

  const safeCount   = results.filter(r => r.color === "safe").length;
  const warnCount   = results.filter(r => r.color === "warn").length;
  const dangerCount = results.filter(r => r.color === "danger").length;
  const pct = total > 0 ? Math.round((progress / total) * 100) : 0;

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    .bg-base{position:fixed;inset:0;z-index:0;background:#050a14;}
    .bg-aurora{position:fixed;inset:0;z-index:0;pointer-events:none;
      background:radial-gradient(ellipse 90% 70% at 15% 5%,rgba(0,150,255,0.07) 0%,transparent 55%),
      radial-gradient(ellipse 70% 90% at 85% 85%,rgba(0,255,160,0.05) 0%,transparent 55%);}
    .bg-grid{position:fixed;inset:0;z-index:0;pointer-events:none;
      background-image:linear-gradient(rgba(0,200,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,200,255,0.025) 1px,transparent 1px);
      background-size:64px 64px;mask-image:radial-gradient(ellipse at center,black 30%,transparent 80%);}
    .cursor-glow{position:fixed;pointer-events:none;z-index:9999;width:480px;height:480px;border-radius:50%;
      background:radial-gradient(circle,rgba(0,200,255,0.045) 0%,transparent 70%);transform:translate(-50%,-50%);}
    .particle{position:fixed;border-radius:50%;pointer-events:none;z-index:0;animation:floatP linear infinite;}
    @keyframes floatP{0%{transform:translateY(100vh) scale(0);opacity:0}10%{opacity:1}90%{opacity:1}100%{transform:translateY(-120px) scale(1);opacity:0}}
    .content{position:relative;z-index:1;}

    .navbar{position:fixed;top:0;left:0;right:0;z-index:100;
      background:rgba(5,10,20,0.78);backdrop-filter:blur(24px) saturate(180%);
      border-bottom:1px solid rgba(255,255,255,0.06);padding:0 2rem;}
    .navbar-inner{max-width:1120px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;height:68px;}
    .navbar-logo{font-family:'Syne',sans-serif;font-size:19px;font-weight:800;
      background:linear-gradient(135deg,#00c8ff,#00ffb4);-webkit-background-clip:text;-webkit-text-fill-color:transparent;
      background-clip:text;cursor:pointer;transition:opacity 0.2s;}
    .navbar-logo:hover{opacity:0.75;}
    .navbar-links{display:flex;align-items:center;gap:4px;}
    .navbar-link{background:transparent;border:none;color:rgba(255,255,255,0.42);padding:8px 15px;
      font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;border-radius:10px;cursor:pointer;transition:all 0.2s;}
    .navbar-link:hover{color:#fff;background:rgba(255,255,255,0.06);}
    .navbar-active{background:rgba(0,200,255,0.08)!important;color:#00c8ff!important;border:1px solid rgba(0,200,255,0.18)!important;}
    .navbar-about{background:linear-gradient(135deg,#00c8ff,#00ffb4);color:#030d18;padding:8px 18px;border:none;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:700;border-radius:10px;cursor:pointer;position:relative;overflow:hidden;transition:all 0.3s cubic-bezier(0.23,1,0.32,1);animation:aboutPulseGlow 2.5s ease-in-out infinite;}
    @keyframes aboutPulseGlow{0%,100%{box-shadow:0 0 14px rgba(0,200,255,0.4),0 0 28px rgba(0,255,180,0.15);}50%{box-shadow:0 0 24px rgba(0,200,255,0.7),0 0 48px rgba(0,255,180,0.3);}}
    .navbar-about:hover{transform:translateY(-2px) scale(1.05);box-shadow:0 0 28px rgba(0,200,255,0.8),0 0 56px rgba(0,255,180,0.35);}

    .hero{padding:132px 2rem 72px;text-align:center;max-width:800px;margin:0 auto;}
    .hero-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(0,200,255,0.05);
      border:1px solid rgba(0,200,255,0.1);border-radius:999px;padding:6px 20px;margin-bottom:28px;backdrop-filter:blur(12px);
      animation:badgeDrop 0.8s cubic-bezier(0.23,1,0.32,1) both;}
    @keyframes badgeDrop{from{opacity:0;transform:translateY(-18px)}to{opacity:1;transform:translateY(0)}}
    .hero-title{font-family:'Syne',sans-serif;font-size:clamp(40px,7vw,72px);font-weight:800;letter-spacing:-3px;line-height:0.96;
      background:linear-gradient(160deg,#ffffff 0%,#a0e4ff 30%,#00ffb4 65%,#ffffff 100%);
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:20px;
      animation:titleReveal 1s cubic-bezier(0.23,1,0.32,1) 0.1s both;}
    @keyframes titleReveal{from{opacity:0;transform:translateY(28px) skewY(2deg)}to{opacity:1;transform:translateY(0) skewY(0)}}
    .hero-sub{font-family:'DM Sans',sans-serif;font-size:16px;color:rgba(255,255,255,0.34);line-height:1.65;
      max-width:500px;margin:0 auto;font-weight:300;animation:fadeUp 1s cubic-bezier(0.23,1,0.32,1) 0.2s both;}
    @keyframes fadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}

    .main{max-width:900px;margin:0 auto;padding:40px 2rem 100px;}

    .glass{background:rgba(255,255,255,0.03);backdrop-filter:blur(24px) saturate(150%);
      border:1px solid rgba(255,255,255,0.07);border-radius:22px;}
    .glass-strong{background:rgba(255,255,255,0.04);backdrop-filter:blur(40px) saturate(150%);
      border:1px solid rgba(255,255,255,0.09);border-radius:24px;position:relative;overflow:hidden;}
    .glass-strong::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;
      background:linear-gradient(90deg,transparent,rgba(0,200,255,0.35),transparent);}

    .url-textarea{width:100%;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);
      color:rgba(255,255,255,0.78);font-family:'DM Mono',monospace;font-size:13px;
      padding:16px 18px;outline:none;resize:vertical;min-height:180px;
      line-height:2.1;transition:all 0.3s;border-radius:16px;}
    .url-textarea::placeholder{color:rgba(255,255,255,0.14);}
    .url-textarea:focus{border-color:rgba(0,200,255,0.32);background:rgba(0,200,255,0.035);
      box-shadow:0 0 0 4px rgba(0,200,255,0.06);}

    .scan-btn{width:100%;height:54px;background:linear-gradient(135deg,#00c8ff,#00ffb4);
      color:#030d18;border:none;border-radius:16px;font-family:'Syne',sans-serif;font-size:15px;font-weight:700;
      cursor:pointer;transition:all 0.3s cubic-bezier(0.23,1,0.32,1);margin-top:14px;
      box-shadow:0 4px 28px rgba(0,200,255,0.28);position:relative;overflow:hidden;}
    .scan-btn::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.22),transparent);opacity:0;transition:opacity 0.3s;}
    .scan-btn:hover{transform:translateY(-3px);box-shadow:0 12px 40px rgba(0,200,255,0.42);}
    .scan-btn:hover::before{opacity:1;}
    .scan-btn:disabled{opacity:0.5;cursor:not-allowed;transform:none;}

    .progress-wrap{margin-top:18px;}
    .progress-track{height:3px;background:rgba(255,255,255,0.05);border-radius:999px;overflow:hidden;margin-top:10px;}
    .progress-fill{height:100%;background:linear-gradient(90deg,#00c8ff,#00ffb4);border-radius:999px;
      transition:width 0.4s ease;box-shadow:0 0 12px rgba(0,200,255,0.5);}

    .bulk-stat-card{padding:24px 16px;text-align:center;border-radius:22px;
      position:relative;overflow:hidden;transform-style:preserve-3d;will-change:transform;}
    .bulk-stat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;
      background:linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent);}
    .bulk-stat-card::after{content:'';position:absolute;inset:0;border-radius:22px;
      background:radial-gradient(circle at var(--mouse-x,50%) var(--mouse-y,50%),rgba(255,255,255,0.04),transparent 60%);
      opacity:0;transition:opacity 0.3s;}
    .bulk-stat-card:hover::after{opacity:1;}

    .result-row{display:flex;align-items:center;gap:14px;padding:14px 18px;margin-bottom:8px;
      background:rgba(255,255,255,0.025);border:1px solid rgba(255,255,255,0.05);border-radius:14px;
      transition:all 0.25s cubic-bezier(0.23,1,0.32,1);animation:rowIn 0.35s cubic-bezier(0.23,1,0.32,1);}
    .result-row:hover{background:rgba(255,255,255,0.05);border-color:rgba(0,200,255,0.14);transform:translateX(5px);
      box-shadow:0 4px 20px rgba(0,0,0,0.2);}
    @keyframes rowIn{from{opacity:0;transform:translateX(-14px)}to{opacity:1;transform:translateX(0)}}

    .dl-btn{background:rgba(0,200,255,0.06);border:1px solid rgba(0,200,255,0.16);
      color:#00c8ff;padding:9px 20px;font-family:'Syne',sans-serif;font-size:12px;font-weight:700;
      border-radius:11px;cursor:pointer;transition:all 0.3s cubic-bezier(0.23,1,0.32,1);position:relative;overflow:hidden;}
    .dl-btn::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(0,200,255,0.1),transparent);opacity:0;transition:opacity 0.3s;}
    .dl-btn:hover{background:rgba(0,200,255,0.12);border-color:rgba(0,200,255,0.3);transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,200,255,0.14);}
    .dl-btn:hover::before{opacity:1;}

    .section-tag{display:inline-flex;align-items:center;gap:6px;background:rgba(0,200,255,0.05);
      border:1px solid rgba(0,200,255,0.1);border-radius:999px;padding:5px 15px;margin-bottom:10px;
      font-size:10px;color:rgba(0,200,255,0.58);letter-spacing:2.5px;font-weight:600;font-family:'DM Sans',sans-serif;}

    .footer{border-top:1px solid rgba(255,255,255,0.05);background:rgba(0,0,0,0.22);backdrop-filter:blur(24px);padding:40px 2rem;}
    .footer-inner{max-width:900px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;}
    .footer-logo{font-family:'Syne',sans-serif;font-size:17px;font-weight:800;
      background:linear-gradient(135deg,#00c8ff,#00ffb4);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
    .footer-copy{font-size:12px;color:rgba(255,255,255,0.17);font-family:'DM Sans',sans-serif;}
    .footer-tags{display:flex;gap:8px;}
    .footer-tag{font-size:10px;color:rgba(0,200,255,0.32);background:rgba(0,200,255,0.04);
      border:1px solid rgba(0,200,255,0.08);padding:3px 11px;border-radius:6px;font-family:'DM Sans',sans-serif;}

    .pulse{animation:pulse 2s infinite;}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.32}}
    .spin{animation:spin 1s linear infinite;}
    @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
    .fade-in{animation:fadeInUp 0.5s cubic-bezier(0.23,1,0.32,1);}
    @keyframes fadeInUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
    ::-webkit-scrollbar{width:3px;}
    ::-webkit-scrollbar-track{background:transparent;}
    ::-webkit-scrollbar-thumb{background:rgba(0,200,255,0.12);border-radius:2px;}
  `;

  return (
    <div style={{ minHeight: "100vh", background: "#050a14", color: "#e2e8f0", fontFamily: "'Syne',sans-serif", position: "relative", overflow: "hidden" }}>
      <style>{CSS}</style>

      <div className="cursor-glow" style={{ left: mousePos.x, top: mousePos.y }} />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="particle" style={{
          width: `${3 + i}px`, height: `${3 + i}px`, left: `${10 + i * 18}%`,
          background: i % 2 === 0 ? "rgba(0,200,255,0.26)" : "rgba(0,255,180,0.26)",
          animationDuration: `${9 + i * 3}s`, animationDelay: `${i * 1.8}s`,
        }} />
      ))}
      <div className="bg-base" /><div className="bg-aurora" /><div className="bg-grid" />

      <div className="content">

        {/* NAVBAR */}
        <nav className="navbar">
          <div className="navbar-inner">
            <div className="navbar-logo" onClick={() => navigate("/")}>🛡️ PhishGuard</div>
            <div className="navbar-links">
              <button className="navbar-link" onClick={() => navigate("/")}>🏠 Home</button>
              <button className="navbar-link navbar-active">Bulk Scanner</button>
              <button className="navbar-link" onClick={() => navigate("/qr")}>QR Scanner</button>
              <button className="navbar-link" onClick={() => navigate("/email")}>Email Analyzer</button>
              <button className="navbar-about" onClick={() => navigate("/about")}>✦ About</button>
            </div>
          </div>
        </nav>

        {/* HERO */}
        <div className="hero">
          <div className="hero-badge">
            <span style={{ fontSize: 15 }}>⚡</span>
            <span style={{ fontSize: 10, color: "rgba(0,200,255,0.62)", letterSpacing: 2.5, fontWeight: 600, fontFamily: "'DM Sans'" }}>BULK THREAT ANALYSIS</span>
          </div>
          <h1 className="hero-title">Scan Multiple URLs<br />Simultaneously</h1>
          <p className="hero-sub">Paste up to 20 URLs at once — our engine scans all of them and gives you a detailed threat report with CSV export.</p>
        </div>

        <div className="main">

          {/* INPUT CARD */}
          <TiltCard intensity={4} className="glass-strong" style={{ padding: "32px", marginBottom: "24px" }}>
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00ffb4", boxShadow: "0 0 10px #00ffb4" }} className="pulse" />
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.22)", letterSpacing: 2.5, fontWeight: 600, fontFamily: "'DM Sans'" }}>PASTE URLs — ONE PER LINE — MAX 20</span>
              </div>

              <textarea
                className="url-textarea"
                value={urls}
                onChange={e => setUrls(e.target.value)}
                placeholder={"https://google.com\nhttp://paypal-login-verify.com\nhttps://suspicious-site.xyz/login"}
              />

              {scanning && (
                <div className="progress-wrap">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "rgba(0,200,255,0.55)", fontWeight: 600, fontFamily: "'DM Sans'" }} className="pulse">
                      Scanning {progress} of {total} URLs...
                    </span>
                    <span style={{ fontSize: 13, color: "#00c8ff", fontWeight: 800, fontFamily: "'Syne'" }}>{pct}%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )}

              <MagneticBtn className="scan-btn" onClick={scanAll} disabled={scanning}>
                {scanning
                  ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                      <span style={{ width: 16, height: 16, border: "2px solid rgba(0,0,0,0.3)", borderTop: "2px solid #030d18", borderRadius: "50%", display: "inline-block" }} className="spin" />
                      Scanning {progress}/{total}...
                    </span>
                  : "⚡ Start Bulk Scan"
                }
              </MagneticBtn>

              <div style={{ display: "flex", gap: 18, marginTop: 16, flexWrap: "wrap" }}>
                {["Up to 20 URLs", "Google Safe Browsing", "CSV Export", "Instant Results"].map((t, i) => (
                  <span key={i} style={{ fontSize: 11, color: "rgba(255,255,255,0.19)", display: "flex", alignItems: "center", gap: 6, fontFamily: "'DM Sans'" }}>
                    <span style={{ color: "#00ffb4" }}>✓</span>{t}
                  </span>
                ))}
              </div>
            </div>
          </TiltCard>

          {/* STAT CARDS */}
          {results.length > 0 && (
            <div className="fade-in" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 24 }}>
              {[
                { label: "Safe",       count: safeCount,   color: "#00ffb4", bg: "rgba(0,255,180,0.05)",   border: "rgba(0,255,180,0.14)",   icon: "✅" },
                { label: "Suspicious", count: warnCount,   color: "#ffb400", bg: "rgba(255,180,0,0.05)",   border: "rgba(255,180,0,0.14)",   icon: "⚠️" },
                { label: "Dangerous",  count: dangerCount, color: "#ff3c64", bg: "rgba(255,60,100,0.05)", border: "rgba(255,60,100,0.14)", icon: "🚨" },
              ].map((s, i) => (
                <TiltCard key={i} intensity={10} className="bulk-stat-card" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                  <div style={{ fontSize: 26, marginBottom: 10, transform: "translateZ(16px)", display: "block" }}>{s.icon}</div>
                  <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 48, fontWeight: 800, color: s.color,
                    textShadow: `0 0 28px ${s.color}45`, lineHeight: 1, marginBottom: 10, transform: "translateZ(20px)" }}>
                    {s.count}
                  </p>
                  <p style={{ fontSize: 10, color: s.color, letterSpacing: 2.5, opacity: 0.65, fontWeight: 600, fontFamily: "'DM Sans'", transform: "translateZ(8px)" }}>
                    {s.label.toUpperCase()}
                  </p>
                </TiltCard>
              ))}
            </div>
          )}

          {/* RESULTS TABLE */}
          {results.length > 0 && (
            <div className="fade-in glass" style={{ padding: "28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <div>
                  <div className="section-tag">SCAN RESULTS</div>
                  <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 700, color: "#fff", marginTop: 8, letterSpacing: -0.5 }}>
                    {results.length} URLs Analyzed
                  </p>
                </div>
                {!scanning && <MagneticBtn className="dl-btn" onClick={downloadCSV}>⬇ Export CSV</MagneticBtn>}
              </div>

              <div style={{ display: "flex", gap: 14, padding: "8px 18px", marginBottom: 10, borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: 12 }}>
                {[["#", 32, "left"], ["URL", "1", "left"], ["SCORE", 60, "right"], ["STATUS", 110, "center"]].map(([label, w, align], i) => (
                  <span key={i} style={{ fontSize: 10, color: "rgba(255,255,255,0.18)", letterSpacing: 2.5, fontFamily: "'DM Sans'", fontWeight: 600,
                    ...(w === "1" ? { flex: 1 } : { minWidth: w, textAlign: align }) }}>
                    {label}
                  </span>
                ))}
              </div>

              {results.map((r, i) => {
                const c = colorMap[r.color] || colorMap.warn;
                return (
                  <div key={i} className="result-row">
                    <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.18)", minWidth: 32 }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: c.accent, flexShrink: 0, boxShadow: `0 0 10px ${c.accent}` }} />
                    <span style={{ flex: 1, fontSize: 13, color: "rgba(255,255,255,0.45)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "'DM Mono',monospace" }}>
                      {r.url}
                    </span>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.22)", minWidth: 60, textAlign: "right", fontWeight: 600, fontFamily: "'DM Mono'" }}>
                      {r.score}/100
                    </span>
                    <span style={{ fontSize: 10, color: c.text, background: c.bg, border: `1px solid ${c.border}`,
                      padding: "5px 14px", borderRadius: 8, minWidth: 110, textAlign: "center", fontWeight: 700,
                      fontFamily: "'DM Sans'", letterSpacing: 0.5, boxShadow: `0 0 12px ${c.accent}18` }}>
                      {r.verdict?.toUpperCase()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* EMPTY STATE */}
          {results.length === 0 && !scanning && (
            <div style={{ textAlign: "center", padding: "70px 2rem", color: "rgba(255,255,255,0.1)" }}>
              <div style={{ fontSize: 52, marginBottom: 18, opacity: 0.35 }}>⚡</div>
              <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 17, fontWeight: 600, marginBottom: 10 }}>Ready to scan</p>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 300 }}>Paste URLs above and hit Start Bulk Scan</p>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <footer className="footer">
          <div className="footer-inner">
            <div className="footer-logo">🛡️ PhishGuard</div>
            <p className="footer-copy">© 2026 PhishGuard — BGI Hackathon — Built with ❤️ in India</p>
            <div className="footer-tags">
              {["Cybersecurity", "AI Powered", "BGI 2026"].map((t, i) => (
                <span key={i} className="footer-tag">{t}</span>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
