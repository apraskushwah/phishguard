import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function EmailAnalyzer() {
  const [emailContent, setEmailContent] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const colorMap = {
    safe: { grad: "linear-gradient(135deg, rgba(0,255,180,0.12), rgba(0,200,150,0.06))", accent: "#00ffb4", text: "#00ffb4", border: "rgba(0,255,180,0.25)", glow: "0 8px 40px rgba(0,255,180,0.15)" },
    warn: { grad: "linear-gradient(135deg, rgba(255,180,0,0.12), rgba(255,140,0,0.06))", accent: "#ffb400", text: "#ffb400", border: "rgba(255,180,0,0.25)", glow: "0 8px 40px rgba(255,180,0,0.15)" },
    danger: { grad: "linear-gradient(135deg, rgba(255,60,100,0.12), rgba(255,0,60,0.06))", accent: "#ff3c64", text: "#ff3c64", border: "rgba(255,60,100,0.25)", glow: "0 8px 40px rgba(255,60,100,0.15)" },
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

  return (
    <div style={{ minHeight: "100vh", background: "#030d18", color: "#e2e8f0", fontFamily: "'Inter', sans-serif", position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .bg-mesh { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: radial-gradient(ellipse 80% 60% at 20% 10%, rgba(0,180,255,0.07) 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 80% 80%, rgba(0,255,180,0.05) 0%, transparent 60%); pointer-events: none; z-index: 0; }
        .grid-lines { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-image: linear-gradient(rgba(0,200,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,255,0.025) 1px, transparent 1px); background-size: 60px 60px; pointer-events: none; z-index: 0; }
        .content { position: relative; z-index: 1; }
        .navbar { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: rgba(3,13,24,0.85); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(0,200,255,0.08); padding: 0 2rem; }
        .navbar-inner { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; height: 64px; }
        .navbar-logo { font-family: 'Space Grotesk', sans-serif; font-size: 20px; font-weight: 800; background: linear-gradient(135deg, #00c8ff, #00ffb4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; cursor: pointer; }
        .navbar-links { display: flex; align-items: center; gap: 6px; }
        .navbar-link { background: transparent; border: none; color: rgba(255,255,255,0.5); padding: 7px 14px; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; border-radius: 8px; cursor: pointer; transition: all .2s; }
        .navbar-link:hover { color: #fff; background: rgba(255,255,255,0.06); }
        .navbar-active { background: rgba(0,200,255,0.08) !important; color: #00c8ff !important; border: 1px solid rgba(0,200,255,0.15) !important; }
        .hero { padding: 100px 2rem 60px; text-align: center; max-width: 800px; margin: 0 auto; }
        .hero-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,200,255,0.06); border: 1px solid rgba(0,200,255,0.12); border-radius: 999px; padding: 6px 18px; margin-bottom: 24px; }
        .hero-title { font-family: 'Space Grotesk', sans-serif; font-size: clamp(36px,6vw,60px); font-weight: 800; letter-spacing: -2px; line-height: 1.1; background: linear-gradient(135deg, #ffffff 0%, #00c8ff 50%, #00ffb4 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 16px; }
        .hero-sub { font-size: 15px; color: rgba(255,255,255,0.35); line-height: 1.7; font-weight: 300; }
        .main { max-width: 760px; margin: 0 auto; padding: 40px 2rem 80px; }
        .glass { background: rgba(255,255,255,0.04); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; }
        .glass-strong { background: rgba(255,255,255,0.06); backdrop-filter: blur(30px); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; }
        .email-textarea { width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.75); font-family: 'Inter', monospace; font-size: 12px; padding: 14px 16px; outline: none; resize: vertical; min-height: 200px; line-height: 1.9; transition: all .3s; border-radius: 14px; }
        .email-textarea::placeholder { color: rgba(255,255,255,0.15); }
        .email-textarea:focus { border-color: rgba(0,200,255,0.3); background: rgba(255,255,255,0.06); box-shadow: 0 0 0 3px rgba(0,200,255,0.06); }
        .scan-btn { width: 100%; height: 52px; background: linear-gradient(135deg, #00c8ff, #00ffb4); color: #000; border: none; border-radius: 14px; font-family: 'Space Grotesk', sans-serif; font-size: 15px; font-weight: 700; cursor: pointer; transition: all .3s; margin-top: 12px; box-shadow: 0 4px 24px rgba(0,200,255,0.2); }
        .scan-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,200,255,0.35); }
        .scan-btn:disabled { opacity: .5; cursor: not-allowed; transform: none; }
        .sample-btn { background: rgba(255,180,0,0.06); border: 1px solid rgba(255,180,0,0.15); color: rgba(255,180,0,0.7); padding: 8px 18px; font-family: 'Space Grotesk', sans-serif; font-size: 12px; font-weight: 600; border-radius: 10px; cursor: pointer; transition: all .2s; }
        .sample-btn:hover { background: rgba(255,180,0,0.1); border-color: rgba(255,180,0,0.3); color: #ffb400; }
        .clear-btn { background: rgba(255,60,100,0.06); border: 1px solid rgba(255,60,100,0.15); color: rgba(255,60,100,0.6); padding: 8px 18px; font-family: 'Space Grotesk', sans-serif; font-size: 12px; font-weight: 600; border-radius: 10px; cursor: pointer; transition: all .2s; }
        .clear-btn:hover { background: rgba(255,60,100,0.1); border-color: rgba(255,60,100,0.3); color: #ff3c64; }
        .url-row { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); transition: all .2s; }
        .url-row:last-child { border-bottom: none; }
        .url-row:hover { padding-left: 6px; }
        .urgency-tag { display: inline-block; padding: 4px 12px; margin: 4px; background: rgba(255,60,100,0.08); border: 1px solid rgba(255,60,100,0.2); color: #ff3c64; font-size: 11px; font-weight: 600; border-radius: 8px; letter-spacing: 0.5px; }
        .stat-card { padding: 20px; text-align: center; border-radius: 16px; transition: all .3s; position: relative; overflow: hidden; }
        .stat-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent); }
        .stat-card:hover { transform: translateY(-3px); }
        .section-tag { display: inline-flex; align-items: center; gap: 6px; background: rgba(0,200,255,0.06); border: 1px solid rgba(0,200,255,0.12); border-radius: 999px; padding: 4px 14px; margin-bottom: 10px; font-size: 11px; color: rgba(0,200,255,0.7); letter-spacing: 2px; font-weight: 500; }
        .pulse { animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .fade-in { animation: fadeIn .5s ease; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .score-ring { transition: stroke-dashoffset 1.5s cubic-bezier(.4,0,.2,1); }
        .footer { border-top: 1px solid rgba(255,255,255,0.06); background: rgba(0,0,0,0.3); backdrop-filter: blur(20px); padding: 32px 2rem; }
        .footer-inner { max-width: 900px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
        .footer-logo { font-family: 'Space Grotesk', sans-serif; font-size: 16px; font-weight: 800; background: linear-gradient(135deg, #00c8ff, #00ffb4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .footer-copy { font-size: 12px; color: rgba(255,255,255,0.2); }
        .footer-tags { display: flex; gap: 8px; }
        .footer-tag { font-size: 11px; color: rgba(0,200,255,0.4); background: rgba(0,200,255,0.05); border: 1px solid rgba(0,200,255,0.1); padding: 3px 10px; border-radius: 6px; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,200,255,0.15); border-radius: 2px; }
      `}</style>

      <div className="bg-mesh" /><div className="grid-lines" />

      <div className="content">
        {/* Navbar */}
        <nav className="navbar">
          <div className="navbar-inner">
            <div className="navbar-logo" onClick={() => navigate("/")}>🛡️ PhishGuard</div>
            <div className="navbar-links">
              <button className="navbar-link" onClick={() => navigate("/")}>URL Scanner</button>
              <button className="navbar-link" onClick={() => navigate("/bulk")}>Bulk Scanner</button>
              <button className="navbar-link" onClick={() => navigate("/qr")}>QR Scanner</button>
              <button className="navbar-link navbar-active">Email Analyzer</button>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <div className="hero">
          <div className="hero-badge">
            <span style={{ fontSize: 16 }}>📧</span>
            <span style={{ fontSize: 11, color: "rgba(0,200,255,0.7)", letterSpacing: 2, fontWeight: 500 }}>EMAIL THREAT ANALYSIS</span>
          </div>
          <h1 className="hero-title">Detect Phishing<br/>Emails Instantly</h1>
          <p className="hero-sub">Paste any suspicious email and we'll scan every link, detect manipulation tactics, and tell you exactly if it's a phishing attempt.</p>
        </div>

        <div className="main">
          {/* Input Card */}
          <div className="glass-strong" style={{ padding: "28px", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00ffb4", boxShadow: "0 0 8px #00ffb4" }} className="pulse" />
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: 2, fontWeight: 500 }}>PASTE FULL EMAIL CONTENT</span>
            </div>
            <textarea
              className="email-textarea"
              value={emailContent}
              onChange={e => { setEmailContent(e.target.value); setError(""); }}
              placeholder={"From: security@suspicious.com\nSubject: URGENT: Verify your account\n\nPaste the full email content here..."}
            />
            <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
              <button className="sample-btn" onClick={() => setEmailContent(samplePhishing)}>⚠ Load Sample Phishing Email</button>
              {emailContent && <button className="clear-btn" onClick={() => { setEmailContent(""); setResult(null); }}>✕ Clear</button>}
            </div>
            {error && <p style={{ color: "#ff3c64", fontSize: 12, marginTop: 12, fontWeight: 500 }}>⚠ {error}</p>}
            <button className="scan-btn" onClick={analyze} disabled={loading}>
              {loading ? "🔍 Analyzing Email..." : "🔍 Analyze Email"}
            </button>
            <div style={{ display: "flex", gap: 16, marginTop: 14, flexWrap: "wrap" }}>
              {["URL Extraction", "Manipulation Detection", "Sender Analysis", "Threat Scoring"].map((t, i) => (
                <span key={i} style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ color: "#00ffb4" }}>✓</span>{t}
                </span>
              ))}
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="glass" style={{ textAlign: "center", padding: "2.5rem", marginBottom: 16 }}>
              <div style={{ position: "relative", width: 56, height: 56, margin: "0 auto 16px" }}>
                <div style={{ width: 56, height: 56, border: "2px solid rgba(0,200,255,0.1)", borderTop: "2px solid #00c8ff", borderRadius: "50%" }} className="spin" />
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 10, height: 10, background: "#00ffb4", borderRadius: "50%", boxShadow: "0 0 12px #00ffb4" }} className="pulse" />
              </div>
              <p style={{ color: "rgba(0,200,255,0.6)", fontSize: 12, letterSpacing: 3, fontWeight: 500 }} className="pulse">SCANNING EMAIL CONTENT</p>
              <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, marginTop: 6 }}>Extracting & analyzing all URLs...</p>
            </div>
          )}

          {/* Result */}
          {result && !loading && (() => {
            const c = colorMap[result.color] || colorMap.warn;
            const r = result.riskScore / 100;
            const circ = 2 * Math.PI * 42;
            return (
              <div className="fade-in">
                {/* Verdict */}
                <div style={{ background: c.grad, backdropFilter: "blur(30px)", border: `1px solid ${c.border}`, borderRadius: 20, padding: "1.5rem", marginBottom: 12, boxShadow: c.glow }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                    <svg width={100} height={100} viewBox="0 0 100 100" style={{ flexShrink: 0 }}>
                      <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                      <circle cx="50" cy="50" r="42" fill="none" stroke={c.accent} strokeWidth="6" strokeDasharray={circ} strokeDashoffset={circ - circ * r} strokeLinecap="round" transform="rotate(-90 50 50)" className="score-ring" style={{ filter: `drop-shadow(0 0 8px ${c.accent})` }} />
                      <text x="50" y="46" textAnchor="middle" fill={c.text} fontSize="22" fontWeight="700" fontFamily="'Space Grotesk', sans-serif">{result.riskScore}</text>
                      <text x="50" y="60" textAnchor="middle" fill={c.accent} fontSize="8" opacity="0.7">RISK SCORE</text>
                    </svg>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: 3, marginBottom: 6, fontWeight: 500 }}>EMAIL THREAT VERDICT</p>
                      <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, color: c.text, letterSpacing: 1, marginBottom: 12, textShadow: `0 0 20px ${c.accent}` }}>{result.verdict?.toUpperCase()}</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {[
                          result.senderEmail || "Unknown sender",
                          `${result.totalUrls} URLs found`,
                          `${result.urgencyWords?.length || 0} urgency words`,
                        ].map((chip, i) => (
                          <span key={i} style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", padding: "4px 12px", borderRadius: 8 }}>{chip}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 12 }}>
                  {[
                    { label: "Safe URLs", count: result.urlResults?.filter(u => u.color === "safe").length || 0, color: "#00ffb4", bg: "rgba(0,255,180,0.05)", border: "rgba(0,255,180,0.15)", icon: "✅" },
                    { label: "Suspicious", count: result.urlResults?.filter(u => u.color === "warn").length || 0, color: "#ffb400", bg: "rgba(255,180,0,0.05)", border: "rgba(255,180,0,0.15)", icon: "⚠️" },
                    { label: "Dangerous", count: result.urlResults?.filter(u => u.color === "danger").length || 0, color: "#ff3c64", bg: "rgba(255,60,100,0.05)", border: "rgba(255,60,100,0.15)", icon: "🚨" },
                  ].map((s, i) => (
                    <div key={i} className="stat-card" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                      <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
                      <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 800, color: s.color, textShadow: `0 0 16px ${s.color}40`, lineHeight: 1, marginBottom: 6 }}>{s.count}</p>
                      <p style={{ fontSize: 10, color: s.color, letterSpacing: 2, opacity: 0.7, fontWeight: 500 }}>{s.label.toUpperCase()}</p>
                    </div>
                  ))}
                </div>

                {/* Urgency Words */}
                {result.urgencyWords?.length > 0 && (
                  <div className="glass" style={{ padding: "20px 24px", marginBottom: 12 }}>
                    <div className="section-tag" style={{ background: "rgba(255,60,100,0.06)", borderColor: "rgba(255,60,100,0.12)" }}>
                      <span style={{ color: "rgba(255,60,100,0.7)" }}>⚠ MANIPULATION TACTICS DETECTED</span>
                    </div>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 12 }}>These words are commonly used to pressure victims into clicking phishing links</p>
                    <div>
                      {result.urgencyWords.map((w, i) => <span key={i} className="urgency-tag">{w.toUpperCase()}</span>)}
                    </div>
                  </div>
                )}

                {/* URL Results */}
                {result.urlResults?.length > 0 && (
                  <div className="glass" style={{ padding: "20px 24px", marginBottom: 12 }}>
                    <div className="section-tag">URLS FOUND IN EMAIL</div>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 16 }}>{result.urlResults.length} link{result.urlResults.length > 1 ? "s" : ""} extracted and analyzed</p>
                    {result.urlResults.map((u, i) => (
                      <div key={i} className="url-row">
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: urlColor[u.color] || "#ffb400", flexShrink: 0, boxShadow: `0 0 8px ${urlColor[u.color] || "#ffb400"}` }} />
                        <span style={{ flex: 1, fontSize: 12, color: "rgba(255,255,255,0.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.url}</span>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", minWidth: 48, textAlign: "right" }}>{u.score}/100</span>
                        <span style={{ fontSize: 11, color: urlColor[u.color] || "#ffb400", background: `${urlColor[u.color] || "#ffb400"}12`, border: `1px solid ${urlColor[u.color] || "#ffb400"}25`, padding: "4px 12px", borderRadius: 8, fontWeight: 700, minWidth: 90, textAlign: "center", flexShrink: 0 }}>
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

        {/* Footer */}
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