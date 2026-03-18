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

export default function EmailAnalyzer() {
  const [emailContent, setEmailContent] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mousePos, setMousePos] = useState({ x: -9999, y: -9999 });
  const navigate = useNavigate();

  useEffect(() => {
    const h = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, []);

  const colorMap = {
    safe:   { grad: "linear-gradient(135deg,rgba(0,255,180,0.12),rgba(0,200,150,0.06))",   accent: "#00ffb4", text: "#00ffb4", border: "rgba(0,255,180,0.25)",   glow: "0 8px 40px rgba(0,255,180,0.2)"   },
    warn:   { grad: "linear-gradient(135deg,rgba(255,180,0,0.12),rgba(255,140,0,0.06))",   accent: "#ffb400", text: "#ffb400", border: "rgba(255,180,0,0.25)",   glow: "0 8px 40px rgba(255,180,0,0.2)"   },
    danger: { grad: "linear-gradient(135deg,rgba(255,60,100,0.12),rgba(255,0,60,0.06))",   accent: "#ff3c64", text: "#ff3c64", border: "rgba(255,60,100,0.25)", glow: "0 8px 40px rgba(255,60,100,0.2)" },
  };
  const urlColor = { safe: "#00ffb4", warn: "#ffb400", danger: "#ff3c64" };

  const analyze = async () => {
    if (!emailContent.trim()) { setError("Please paste email content first"); return; }
    setError(""); setLoading(true); setResult(null);
    try {
      const res = await fetch("https://phishguard-backend-6cq9.onrender.com/api/check-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailContent }),
      });
      const data = await res.json();
      setResult(data);
    } catch { setError("Backend offline — start server!"); }
    finally { setLoading(false); }
  };

  const samplePhishing = `From: security@paypa1-verify.com
To: user@gmail.com
Subject: URGENT: Your account has been suspended!

Dear Customer,

Your PayPal account has been suspended due to suspicious activity.
You must verify your account IMMEDIATELY or it will be permanently deleted.

Click here to verify now: http://paypal-login-verify.com/secure/confirm
Or visit: http://amazon-account-update.info/verify

This is a LIMITED TIME offer to restore your account. ACT NOW before it expires!

Winner! You have been selected for a FREE prize. Claim immediately!

Best regards,
PayPal Security Team`;

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

    /* NAVBAR */
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

    /* HERO */
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
      max-width:520px;margin:0 auto;font-weight:300;animation:fadeUp 1s cubic-bezier(0.23,1,0.32,1) 0.2s both;}
    @keyframes fadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}

    .main{max-width:780px;margin:0 auto;padding:40px 2rem 100px;}

    /* GLASS */
    .glass{background:rgba(255,255,255,0.03);backdrop-filter:blur(24px) saturate(150%);
      border:1px solid rgba(255,255,255,0.07);border-radius:22px;}
    .glass-strong{background:rgba(255,255,255,0.04);backdrop-filter:blur(40px) saturate(150%);
      border:1px solid rgba(255,255,255,0.09);border-radius:24px;position:relative;overflow:hidden;}
    .glass-strong::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;
      background:linear-gradient(90deg,transparent,rgba(0,200,255,0.35),transparent);}

    /* TEXTAREA */
    .email-textarea{width:100%;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);
      color:rgba(255,255,255,0.75);font-family:'DM Mono',monospace;font-size:12.5px;
      padding:16px 18px;outline:none;resize:vertical;min-height:210px;
      line-height:1.95;transition:all 0.3s;border-radius:16px;}
    .email-textarea::placeholder{color:rgba(255,255,255,0.14);}
    .email-textarea:focus{border-color:rgba(0,200,255,0.32);background:rgba(0,200,255,0.035);
      box-shadow:0 0 0 4px rgba(0,200,255,0.06);}

    /* BUTTONS */
    .scan-btn{width:100%;height:54px;background:linear-gradient(135deg,#00c8ff,#00ffb4);
      color:#030d18;border:none;border-radius:16px;font-family:'Syne',sans-serif;font-size:15px;font-weight:700;
      cursor:pointer;transition:all 0.3s cubic-bezier(0.23,1,0.32,1);margin-top:14px;
      box-shadow:0 4px 28px rgba(0,200,255,0.28);position:relative;overflow:hidden;}
    .scan-btn::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.22),transparent);opacity:0;transition:opacity 0.3s;}
    .scan-btn:hover{transform:translateY(-3px);box-shadow:0 12px 40px rgba(0,200,255,0.42);}
    .scan-btn:hover::before{opacity:1;}
    .scan-btn:disabled{opacity:0.5;cursor:not-allowed;transform:none;}

    .sample-btn{background:rgba(255,180,0,0.06);border:1px solid rgba(255,180,0,0.15);
      color:rgba(255,180,0,0.7);padding:9px 18px;font-family:'Syne',sans-serif;font-size:12px;font-weight:700;
      border-radius:11px;cursor:pointer;transition:all 0.3s cubic-bezier(0.23,1,0.32,1);position:relative;overflow:hidden;}
    .sample-btn::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,180,0,0.1),transparent);opacity:0;transition:opacity 0.3s;}
    .sample-btn:hover{background:rgba(255,180,0,0.1);border-color:rgba(255,180,0,0.3);color:#ffb400;transform:translateY(-2px);}
    .sample-btn:hover::before{opacity:1;}

    .clear-btn{background:rgba(255,60,100,0.06);border:1px solid rgba(255,60,100,0.15);
      color:rgba(255,60,100,0.6);padding:9px 18px;font-family:'Syne',sans-serif;font-size:12px;font-weight:700;
      border-radius:11px;cursor:pointer;transition:all 0.3s cubic-bezier(0.23,1,0.32,1);}
    .clear-btn:hover{background:rgba(255,60,100,0.1);border-color:rgba(255,60,100,0.3);color:#ff3c64;transform:translateY(-2px);}

    /* RESULT ROWS */
    .url-row{display:flex;align-items:center;gap:12px;padding:13px 0;
      border-bottom:1px solid rgba(255,255,255,0.04);transition:all 0.22s cubic-bezier(0.23,1,0.32,1);}
    .url-row:last-child{border-bottom:none;}
    .url-row:hover{padding-left:8px;}

    /* STAT CARDS */
    .email-stat-card{padding:22px 14px;text-align:center;border-radius:20px;
      position:relative;overflow:hidden;transform-style:preserve-3d;will-change:transform;}
    .email-stat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;
      background:linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent);}
    .email-stat-card::after{content:'';position:absolute;inset:0;border-radius:20px;
      background:radial-gradient(circle at var(--mouse-x,50%) var(--mouse-y,50%),rgba(255,255,255,0.04),transparent 60%);
      opacity:0;transition:opacity 0.3s;}
    .email-stat-card:hover::after{opacity:1;}

    /* URGENCY TAG */
    .urgency-tag{display:inline-block;padding:5px 13px;margin:4px;
      background:rgba(255,60,100,0.07);border:1px solid rgba(255,60,100,0.18);
      color:#ff3c64;font-size:10.5px;font-weight:700;border-radius:8px;letter-spacing:1px;
      font-family:'DM Sans',sans-serif;transition:all 0.2s;}
    .urgency-tag:hover{background:rgba(255,60,100,0.12);transform:translateY(-1px);}

    /* SECTION TAG */
    .section-tag{display:inline-flex;align-items:center;gap:6px;background:rgba(0,200,255,0.05);
      border:1px solid rgba(0,200,255,0.1);border-radius:999px;padding:5px 15px;margin-bottom:10px;
      font-size:10px;color:rgba(0,200,255,0.58);letter-spacing:2.5px;font-weight:600;font-family:'DM Sans',sans-serif;}

    /* SCORE RING */
    .score-ring{transition:stroke-dashoffset 1.8s cubic-bezier(0.23,1,0.32,1);}

    /* FOOTER */
    .footer{border-top:1px solid rgba(255,255,255,0.05);background:rgba(0,0,0,0.22);backdrop-filter:blur(24px);padding:40px 2rem;}
    .footer-inner{max-width:900px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;}
    .footer-logo{font-family:'Syne',sans-serif;font-size:17px;font-weight:800;
      background:linear-gradient(135deg,#00c8ff,#00ffb4);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
    .footer-copy{font-size:12px;color:rgba(255,255,255,0.17);font-family:'DM Sans',sans-serif;}
    .footer-tags{display:flex;gap:8px;}
    .footer-tag{font-size:10px;color:rgba(0,200,255,0.32);background:rgba(0,200,255,0.04);
      border:1px solid rgba(0,200,255,0.08);padding:3px 11px;border-radius:6px;font-family:'DM Sans',sans-serif;}

    /* UTILS */
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

      {/* Cursor glow */}
      <div className="cursor-glow" style={{ left: mousePos.x, top: mousePos.y }} />

      {/* Floating particles */}
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
              <button className="navbar-link" onClick={() => navigate("/bulk")}>Bulk Scanner</button>
              <button className="navbar-link" onClick={() => navigate("/qr")}>QR Scanner</button>
              <button className="navbar-link navbar-active">Email Analyzer</button>
              <button className="navbar-about" onClick={() => navigate("/about")}>✦ About</button>
            </div>
          </div>
        </nav>

        {/* HERO */}
        <div className="hero">
          <div className="hero-badge">
            <span style={{ fontSize: 15 }}>📧</span>
            <span style={{ fontSize: 10, color: "rgba(0,200,255,0.62)", letterSpacing: 2.5, fontWeight: 600, fontFamily: "'DM Sans'" }}>EMAIL THREAT ANALYSIS</span>
          </div>
          <h1 className="hero-title">Detect Phishing<br />Emails Instantly</h1>
          <p className="hero-sub">Paste any suspicious email and we'll scan every link, detect manipulation tactics, and tell you exactly if it's a phishing attempt.</p>
        </div>

        <div className="main">

          {/* INPUT CARD */}
          <TiltCard intensity={4} className="glass-strong" style={{ padding: "32px", marginBottom: "20px" }}>
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00ffb4", boxShadow: "0 0 10px #00ffb4" }} className="pulse" />
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.22)", letterSpacing: 2.5, fontWeight: 600, fontFamily: "'DM Sans'" }}>PASTE FULL EMAIL CONTENT</span>
              </div>

              <textarea
                className="email-textarea"
                value={emailContent}
                onChange={e => { setEmailContent(e.target.value); setError(""); }}
                placeholder={"From: security@suspicious.com\nSubject: URGENT: Verify your account\n\nPaste the full email content here..."}
              />

              <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                <MagneticBtn className="sample-btn" onClick={() => setEmailContent(samplePhishing)}>
                  ⚠ Load Sample Phishing Email
                </MagneticBtn>
                {emailContent && (
                  <MagneticBtn className="clear-btn" onClick={() => { setEmailContent(""); setResult(null); }}>
                    ✕ Clear
                  </MagneticBtn>
                )}
              </div>

              {error && (
                <p style={{ color: "#ff3c64", fontSize: 12, marginTop: 12, fontWeight: 500, fontFamily: "'DM Sans'" }}>⚠ {error}</p>
              )}

              <MagneticBtn className="scan-btn" onClick={analyze} disabled={loading}>
                {loading
                  ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                      <span style={{ width: 16, height: 16, border: "2px solid rgba(0,0,0,0.3)", borderTop: "2px solid #030d18", borderRadius: "50%", display: "inline-block" }} className="spin" />
                      Analyzing Email...
                    </span>
                  : "🔍 Analyze Email"
                }
              </MagneticBtn>

              <div style={{ display: "flex", gap: 18, marginTop: 16, flexWrap: "wrap" }}>
                {["URL Extraction", "Manipulation Detection", "Sender Analysis", "Threat Scoring"].map((t, i) => (
                  <span key={i} style={{ fontSize: 11, color: "rgba(255,255,255,0.19)", display: "flex", alignItems: "center", gap: 6, fontFamily: "'DM Sans'" }}>
                    <span style={{ color: "#00ffb4" }}>✓</span>{t}
                  </span>
                ))}
              </div>
            </div>
          </TiltCard>

          {/* LOADING */}
          {loading && (
            <div className="glass" style={{ textAlign: "center", padding: "3rem", marginBottom: 16 }}>
              <div style={{ position: "relative", width: 60, height: 60, margin: "0 auto 18px" }}>
                <div style={{ width: 60, height: 60, border: "2px solid rgba(0,200,255,0.08)", borderTop: "2px solid #00c8ff", borderRadius: "50%" }} className="spin" />
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 12, height: 12, background: "#00ffb4", borderRadius: "50%", boxShadow: "0 0 14px #00ffb4" }} className="pulse" />
              </div>
              <p style={{ color: "rgba(0,200,255,0.52)", fontSize: 11, letterSpacing: 3, fontWeight: 600, fontFamily: "'DM Sans'" }} className="pulse">SCANNING EMAIL CONTENT</p>
              <p style={{ color: "rgba(255,255,255,0.17)", fontSize: 11, marginTop: 8, fontFamily: "'DM Sans'" }}>Extracting & analyzing all URLs...</p>
            </div>
          )}

          {/* RESULT */}
          {result && !loading && (() => {
            const c = colorMap[result.color] || colorMap.warn;
            const r = result.riskScore / 100;
            const circ = 2 * Math.PI * 42;
            return (
              <div className="fade-in">

                {/* VERDICT CARD */}
                <TiltCard intensity={5} style={{ background: c.grad, backdropFilter: "blur(30px)", border: `1px solid ${c.border}`, borderRadius: 22, padding: "1.75rem", marginBottom: 14, boxShadow: c.glow }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1.75rem" }}>
                    <svg width={104} height={104} viewBox="0 0 100 100" style={{ flexShrink: 0, filter: `drop-shadow(0 0 20px ${c.accent}28)` }}>
                      <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="6" />
                      <circle cx="50" cy="50" r="42" fill="none" stroke={c.accent} strokeWidth="6"
                        strokeDasharray={circ} strokeDashoffset={circ - circ * r}
                        strokeLinecap="round" transform="rotate(-90 50 50)" className="score-ring"
                        style={{ filter: `drop-shadow(0 0 10px ${c.accent})` }} />
                      <text x="50" y="44" textAnchor="middle" fill={c.text} fontSize="22" fontWeight="700" fontFamily="'Syne',sans-serif">{result.riskScore}</text>
                      <text x="50" y="58" textAnchor="middle" fill={c.accent} fontSize="6.5" opacity="0.6" fontFamily="'DM Sans',sans-serif" letterSpacing="1.5">RISK SCORE</text>
                    </svg>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 10, color: "rgba(255,255,255,0.32)", letterSpacing: 3, marginBottom: 8, fontWeight: 600, fontFamily: "'DM Sans'" }}>EMAIL THREAT VERDICT</p>
                      <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 30, fontWeight: 800, color: c.text, letterSpacing: 0.5, marginBottom: 14, textShadow: `0 0 28px ${c.accent}55` }}>
                        {result.verdict?.toUpperCase()}
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {[
                          result.senderEmail || "Unknown sender",
                          `${result.totalUrls} URLs found`,
                          `${result.urgencyWords?.length || 0} urgency words`,
                        ].map((chip, i) => (
                          <span key={i} style={{ fontSize: 11, color: "rgba(255,255,255,0.32)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)", padding: "4px 13px", borderRadius: 9, fontFamily: "'DM Mono'" }}>{chip}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </TiltCard>

                {/* URL STAT CARDS */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 14 }}>
                  {[
                    { label: "Safe URLs",   count: result.urlResults?.filter(u => u.color === "safe").length   || 0, color: "#00ffb4", bg: "rgba(0,255,180,0.05)",   border: "rgba(0,255,180,0.14)",   icon: "✅" },
                    { label: "Suspicious",  count: result.urlResults?.filter(u => u.color === "warn").length   || 0, color: "#ffb400", bg: "rgba(255,180,0,0.05)",   border: "rgba(255,180,0,0.14)",   icon: "⚠️" },
                    { label: "Dangerous",   count: result.urlResults?.filter(u => u.color === "danger").length || 0, color: "#ff3c64", bg: "rgba(255,60,100,0.05)", border: "rgba(255,60,100,0.14)", icon: "🚨" },
                  ].map((s, i) => (
                    <TiltCard key={i} intensity={10} className="email-stat-card" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                      <div style={{ fontSize: 22, marginBottom: 8, transform: "translateZ(14px)", display: "block" }}>{s.icon}</div>
                      <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 40, fontWeight: 800, color: s.color,
                        textShadow: `0 0 24px ${s.color}42`, lineHeight: 1, marginBottom: 8, transform: "translateZ(18px)" }}>
                        {s.count}
                      </p>
                      <p style={{ fontSize: 10, color: s.color, letterSpacing: 2.5, opacity: 0.62, fontWeight: 600, fontFamily: "'DM Sans'", transform: "translateZ(8px)" }}>
                        {s.label.toUpperCase()}
                      </p>
                    </TiltCard>
                  ))}
                </div>

                {/* MANIPULATION TACTICS */}
                {result.urgencyWords?.length > 0 && (
                  <div className="glass" style={{ padding: "22px 26px", marginBottom: 14 }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,60,100,0.06)", border: "1px solid rgba(255,60,100,0.12)", borderRadius: "999px", padding: "5px 15px", marginBottom: 12 }}>
                      <span style={{ fontSize: 10, color: "rgba(255,60,100,0.65)", letterSpacing: 2.5, fontWeight: 600, fontFamily: "'DM Sans'" }}>⚠ MANIPULATION TACTICS DETECTED</span>
                    </div>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.26)", marginBottom: 14, fontFamily: "'DM Sans'", lineHeight: 1.6 }}>
                      These words are commonly used to pressure victims into clicking phishing links
                    </p>
                    <div>
                      {result.urgencyWords.map((w, i) => (
                        <span key={i} className="urgency-tag">{w.toUpperCase()}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* URL RESULTS */}
                {result.urlResults?.length > 0 && (
                  <div className="glass" style={{ padding: "22px 26px" }}>
                    <div className="section-tag">URLS FOUND IN EMAIL</div>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.26)", marginBottom: 18, fontFamily: "'DM Sans'", lineHeight: 1.6 }}>
                      {result.urlResults.length} link{result.urlResults.length > 1 ? "s" : ""} extracted and analyzed
                    </p>
                    {result.urlResults.map((u, i) => (
                      <div key={i} className="url-row">
                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: urlColor[u.color] || "#ffb400", flexShrink: 0, boxShadow: `0 0 10px ${urlColor[u.color] || "#ffb400"}` }} />
                        <span style={{ flex: 1, fontSize: 12, color: "rgba(255,255,255,0.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "'DM Mono'" }}>
                          {u.url}
                        </span>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", minWidth: 52, textAlign: "right", fontFamily: "'DM Mono'" }}>
                          {u.score}/100
                        </span>
                        <span style={{ fontSize: 10, color: urlColor[u.color] || "#ffb400",
                          background: `${urlColor[u.color] || "#ffb400"}10`,
                          border: `1px solid ${urlColor[u.color] || "#ffb400"}22`,
                          padding: "4px 13px", borderRadius: 8, fontWeight: 700, minWidth: 94, textAlign: "center",
                          flexShrink: 0, fontFamily: "'DM Sans'", letterSpacing: 0.5,
                          boxShadow: `0 0 10px ${urlColor[u.color] || "#ffb400"}16` }}>
                          {u.verdict?.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
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
