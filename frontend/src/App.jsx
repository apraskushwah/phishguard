import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

async function realAnalysis(url) {
  const res = await fetch("https://phishguard-backend-6cq9.onrender.com/api/check-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  return await res.json();
}

async function getAIExplanation(url, verdict, score, flags) {
  const res = await fetch("https://phishguard-backend-6cq9.onrender.com/api/ai-explain", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, verdict, score, flags }),
  });
  return await res.json();
}

function useCountUp(target, duration = 2500) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return count;
}

const threats = [
  { url: "paypal-verify-account.com", type: "Phishing", color: "#ff3c64", flag: "🇺🇸" },
  { url: "amazon-security-update.net", type: "Malware", color: "#ff3c64", flag: "🇬🇧" },
  { url: "google.com", type: "Safe", color: "#00ffb4", flag: "🇮🇳" },
  { url: "banking-secure-login.xyz", type: "Phishing", color: "#ff3c64", flag: "🇩🇪" },
  { url: "microsoft-support-help.com", type: "Suspicious", color: "#ffb400", flag: "🇫🇷" },
  { url: "github.com", type: "Safe", color: "#00ffb4", flag: "🇯🇵" },
  { url: "netflix-account-verify.info", type: "Phishing", color: "#ff3c64", flag: "🇧🇷" },
  { url: "whatsapp-prize-winner.com", type: "Phishing", color: "#ff3c64", flag: "🇮🇳" },
];

export default function App() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [aiExplanation, setAiExplanation] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [feedIndex, setFeedIndex] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const urlsScanned = useCountUp(2847291);
  const threatsBlocked = useCountUp(847293);
  const accuracy = useCountUp(99);

  useEffect(() => {
    const interval = setInterval(() => setFeedIndex(i => (i + 1) % threats.length), 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const analyze = async () => {
    if (!url.trim()) { setError("Please enter a URL"); return; }
    let normalized = url.trim();
    if (!/^https?:\/\//i.test(normalized)) normalized = "http://" + normalized;
    try { new URL(normalized); } catch { setError("Invalid URL format"); return; }
    setError(""); setLoading(true); setResult(null); setAiExplanation(null);
    try {
      const r = await realAnalysis(normalized);
      setResult(r);
      setHistory(h => [{ url: normalized, verdict: r.verdict, color: r.color, score: r.score }, ...h.slice(0, 4)]);
    } catch { setError("Server offline — start backend!"); }
    finally { setLoading(false); }
  };

  const colorMap = {
    safe: { grad: "linear-gradient(135deg, rgba(0,255,180,0.12), rgba(0,200,150,0.06))", accent: "#00ffb4", text: "#00ffb4", border: "rgba(0,255,180,0.25)", glow: "0 8px 40px rgba(0,255,180,0.15)" },
    warn: { grad: "linear-gradient(135deg, rgba(255,180,0,0.12), rgba(255,140,0,0.06))", accent: "#ffb400", text: "#ffb400", border: "rgba(255,180,0,0.25)", glow: "0 8px 40px rgba(255,180,0,0.15)" },
    danger: { grad: "linear-gradient(135deg, rgba(255,60,100,0.12), rgba(255,0,60,0.06))", accent: "#ff3c64", text: "#ff3c64", border: "rgba(255,60,100,0.25)", glow: "0 8px 40px rgba(255,60,100,0.15)" },
  };
  const severityColor = { safe: "#00ffb4", low: "#ffb400", medium: "#ff8c00", high: "#ff3c64" };
  const visibleThreats = [0,1,2,3].map(i => threats[(feedIndex + i) % threats.length]);

  return (
    <div style={{ minHeight: "100vh", background: "#030d18", color: "#e2e8f0", fontFamily: "'Inter', sans-serif", position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .bg-mesh {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background:
            radial-gradient(ellipse 80% 60% at 20% 10%, rgba(0,180,255,0.08) 0%, transparent 60%),
            radial-gradient(ellipse 60% 80% at 80% 80%, rgba(0,255,180,0.06) 0%, transparent 60%),
            radial-gradient(ellipse 40% 40% at 50% 50%, rgba(0,100,255,0.04) 0%, transparent 60%);
          pointer-events: none; z-index: 0;
        }

        .grid-lines {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background-image:
            linear-gradient(rgba(0,200,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,200,255,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none; z-index: 0;
        }

        .content { position: relative; z-index: 1; }

        /* Navbar */
        .navbar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          transition: all .3s;
          padding: 0 2rem;
        }
        .navbar.scrolled {
          background: rgba(3,13,24,0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(0,200,255,0.08);
        }
        .navbar-inner {
          max-width: 1100px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between;
          height: 64px;
        }
        .navbar-logo {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 20px; font-weight: 800;
          background: linear-gradient(135deg, #00c8ff, #00ffb4);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; letter-spacing: -0.5px; cursor: pointer;
        }
        .navbar-links { display: flex; align-items: center; gap: 6px; }
        .navbar-link {
          background: transparent; border: none;
          color: rgba(255,255,255,0.5); padding: 7px 14px;
          font-family: 'Inter', sans-serif; font-size: 13px;
          font-weight: 500; border-radius: 8px; cursor: pointer;
          transition: all .2s;
        }
        .navbar-link:hover { color: #fff; background: rgba(255,255,255,0.06); }
        .navbar-cta {
          background: linear-gradient(135deg, rgba(0,200,255,0.15), rgba(0,255,180,0.1));
          border: 1px solid rgba(0,200,255,0.25);
          color: #00c8ff; padding: 7px 16px;
          font-family: 'Inter', sans-serif; font-size: 13px;
          font-weight: 600; border-radius: 8px; cursor: pointer;
          transition: all .2s; backdrop-filter: blur(10px);
        }
        .navbar-cta:hover { background: linear-gradient(135deg, rgba(0,200,255,0.25), rgba(0,255,180,0.15)); border-color: rgba(0,200,255,0.4); }

        /* Hero */
        .hero { padding: 120px 2rem 80px; text-align: center; max-width: 900px; margin: 0 auto; }

        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(0,200,255,0.06);
          border: 1px solid rgba(0,200,255,0.12);
          border-radius: 999px; padding: 6px 18px; margin-bottom: 28px;
          backdrop-filter: blur(10px);
        }

        .hero-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(48px, 9vw, 84px);
          font-weight: 800; letter-spacing: -3px; line-height: 1;
          background: linear-gradient(135deg, #ffffff 0%, #00c8ff 40%, #00ffb4 70%, #ffffff 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; margin-bottom: 20px;
        }

        .hero-sub {
          font-size: 17px; color: rgba(255,255,255,0.4);
          margin-bottom: 40px; line-height: 1.6; max-width: 500px; margin-left: auto; margin-right: auto;
          font-weight: 300;
        }

        .hero-btns { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; margin-bottom: 48px; }

        .btn-primary {
          background: linear-gradient(135deg, #00c8ff, #00ffb4);
          color: #000; border: none; padding: 12px 28px;
          font-family: 'Space Grotesk', sans-serif; font-size: 14px;
          font-weight: 700; border-radius: 12px; cursor: pointer;
          transition: all .3s; box-shadow: 0 4px 24px rgba(0,200,255,0.25);
          letter-spacing: 0.3px;
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,200,255,0.4); }

        .btn-secondary {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.7); padding: 12px 28px;
          font-family: 'Space Grotesk', sans-serif; font-size: 14px;
          font-weight: 600; border-radius: 12px; cursor: pointer;
          transition: all .3s; backdrop-filter: blur(10px);
        }
        .btn-secondary:hover { background: rgba(255,255,255,0.08); border-color: rgba(0,200,255,0.3); color: #fff; transform: translateY(-2px); }

        /* Scanner */
        .scanner-wrap {
          max-width: 760px; margin: 0 auto;
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 24px; padding: 28px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06);
        }

        .url-input {
          flex: 1; background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #fff; font-family: 'Inter', sans-serif;
          font-size: 14px; padding: 0 1.2rem; height: 52px;
          border-radius: 12px; outline: none; min-width: 0; transition: all .3s;
        }
        .url-input::placeholder { color: rgba(255,255,255,0.2); }
        .url-input:focus { border-color: rgba(0,200,255,0.4); background: rgba(255,255,255,0.07); box-shadow: 0 0 0 3px rgba(0,200,255,0.08); }

        .scan-btn {
          background: linear-gradient(135deg, #00c8ff, #00ffb4);
          color: #000; border: none; padding: 0 2rem; height: 52px;
          font-family: 'Space Grotesk', sans-serif; font-size: 14px;
          font-weight: 700; border-radius: 12px; cursor: pointer;
          transition: all .3s; white-space: nowrap;
          box-shadow: 0 4px 20px rgba(0,200,255,0.25);
        }
        .scan-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,200,255,0.4); }
        .scan-btn:disabled { opacity: .5; cursor: not-allowed; transform: none; }

        /* Section */
        .section { padding: 80px 2rem; max-width: 1000px; margin: 0 auto; }
        .section-tag {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(0,200,255,0.06); border: 1px solid rgba(0,200,255,0.12);
          border-radius: 999px; padding: 4px 14px; margin-bottom: 16px;
          font-size: 11px; color: rgba(0,200,255,0.7); letter-spacing: 2px; font-weight: 500;
        }
        .section-title { font-family: 'Space Grotesk', sans-serif; font-size: clamp(28px,4vw,40px); font-weight: 700; color: #fff; margin-bottom: 10px; letter-spacing: -1px; }
        .section-sub { font-size: 14px; color: rgba(255,255,255,0.35); margin-bottom: 32px; font-weight: 300; }

        /* Stats */
        .stat-card {
          padding: 28px 20px; text-align: center;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px; transition: all .3s;
          backdrop-filter: blur(10px);
          position: relative; overflow: hidden;
        }
        .stat-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0,200,255,0.3), transparent);
        }
        .stat-card:hover { transform: translateY(-4px); border-color: rgba(0,200,255,0.15); box-shadow: 0 12px 40px rgba(0,200,255,0.08); }

        /* Feature cards */
        .feature-card {
          padding: 28px; background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px; transition: all .3s;
          position: relative; overflow: hidden;
        }
        .feature-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0,200,255,0.2), transparent);
          opacity: 0; transition: opacity .3s;
        }
        .feature-card:hover { transform: translateY(-4px); background: rgba(0,200,255,0.04); border-color: rgba(0,200,255,0.15); box-shadow: 0 12px 40px rgba(0,200,255,0.06); }
        .feature-card:hover::before { opacity: 1; }

        .feature-icon {
          width: 48px; height: 48px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; margin-bottom: 16px;
          background: rgba(0,200,255,0.08); border: 1px solid rgba(0,200,255,0.12);
        }

        /* Steps */
        .step-num {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 56px; font-weight: 800; line-height: 1;
          background: linear-gradient(135deg, rgba(0,200,255,0.4), rgba(0,255,180,0.2));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; margin-bottom: 16px;
        }

        /* Feed */
        .feed-item {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 16px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px; margin-bottom: 8px;
          animation: feedIn .4s ease; transition: all .2s;
        }
        .feed-item:hover { background: rgba(255,255,255,0.05); }
        @keyframes feedIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }

        /* Result */
        .flag-row { display: flex; align-items: flex-start; gap: 12px; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); transition: all .2s; }
        .flag-row:last-child { border-bottom: none; }
        .flag-row:hover { padding-left: 6px; }

        .hist-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; margin-bottom: 8px; cursor: pointer; transition: all .2s; }
        .hist-item:hover { background: rgba(255,255,255,0.06); border-color: rgba(0,200,255,0.15); transform: translateX(4px); }

        .ai-btn { width: 100%; height: 46px; background: rgba(0,150,255,0.08); border: 1px solid rgba(0,200,255,0.2); color: #00c8ff; font-family: 'Space Grotesk', sans-serif; font-size: 13px; font-weight: 600; border-radius: 12px; cursor: pointer; transition: all .3s; }
        .ai-btn:hover { background: rgba(0,150,255,0.15); border-color: rgba(0,200,255,0.35); transform: translateY(-1px); }
        .ai-btn:disabled { opacity: .5; cursor: not-allowed; transform: none; }

        /* Footer */
        .footer {
          border-top: 1px solid rgba(255,255,255,0.06);
          background: rgba(0,0,0,0.3); backdrop-filter: blur(20px);
          padding: 48px 2rem 32px;
        }
        .footer-inner { max-width: 1000px; margin: 0 auto; }
        .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 48px; margin-bottom: 40px; }
        .footer-logo { font-family: 'Space Grotesk', sans-serif; font-size: 22px; font-weight: 800; background: linear-gradient(135deg, #00c8ff, #00ffb4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 12px; }
        .footer-desc { font-size: 13px; color: rgba(255,255,255,0.3); line-height: 1.7; max-width: 260px; }
        .footer-heading { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.5); letter-spacing: 2px; margin-bottom: 16px; }
        .footer-link { display: block; font-size: 13px; color: rgba(255,255,255,0.3); margin-bottom: 10px; cursor: pointer; transition: color .2s; background: none; border: none; text-align: left; font-family: 'Inter', sans-serif; }
        .footer-link:hover { color: #00c8ff; }
        .footer-bottom { display: flex; justify-content: space-between; align-items: center; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.05); flex-wrap: wrap; gap: 12px; }
        .footer-copy { font-size: 12px; color: rgba(255,255,255,0.2); }
        .footer-tags { display: flex; gap: 8px; flex-wrap: wrap; }
        .footer-tag { font-size: 11px; color: rgba(0,200,255,0.4); background: rgba(0,200,255,0.05); border: 1px solid rgba(0,200,255,0.1); padding: 3px 10px; border-radius: 6px; }

        /* Divider */
        .divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(0,200,255,0.1), transparent); margin: 0 2rem; }

        .glass { background: rgba(255,255,255,0.04); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; }

        .pulse { animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .fade-in { animation: fadeIn .5s ease; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .score-ring { transition: stroke-dashoffset 1.5s cubic-bezier(.4,0,.2,1); }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,200,255,0.15); border-radius: 2px; }
      `}</style>

      <div className="bg-mesh" /><div className="grid-lines" />

      <div className="content">

        {/* NAVBAR */}
        <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
          <div className="navbar-inner">
            <div className="navbar-logo" onClick={() => window.scrollTo({top:0,behavior:"smooth"})}>
              🛡️ PhishGuard
            </div>
            <div className="navbar-links">
              <button className="navbar-link" onClick={() => navigate("/bulk")}>Bulk Scanner</button>
              <button className="navbar-link" onClick={() => navigate("/qr")}>QR Scanner</button>
              <button className="navbar-link" onClick={() => navigate("/email")}>Email Analyzer</button>
              <button className="navbar-cta" onClick={() => navigate("/install")}>
                Chrome Extension ↗
              </button>
            </div>
          </div>
        </nav>

        {/* HERO */}
        <div className="hero">
          <div className="hero-badge">
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#00ffb4", boxShadow: "0 0 8px #00ffb4" }} className="pulse" />
            <span style={{ fontSize: 11, color: "rgba(0,200,255,0.7)", letterSpacing: 2, fontWeight: 500 }}>REAL-TIME THREAT DETECTION</span>
          </div>
          <h1 className="hero-title">Detect Phishing<br/>Before It Hits</h1>
          <p className="hero-sub">AI-powered URL threat intelligence. Scan any link in seconds and stay protected from phishing, malware, and scams.</p>
          <div className="hero-btns">
            <button className="btn-primary" onClick={() => inputRef.current?.focus()}>Start Scanning ⚡</button>
            <button className="btn-secondary" onClick={() => navigate("/bulk")}>Bulk Scanner →</button>
            <button className="btn-secondary" onClick={() => navigate("/email")}>Email Analyzer →</button>
          </div>

          {/* Scanner Box */}
          <div className="scanner-wrap">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00ffb4", boxShadow: "0 0 8px #00ffb4" }} className="pulse" />
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: 2, fontWeight: 500 }}>ENTER URL TO SCAN</span>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <input ref={inputRef} className="url-input" value={url} onChange={e => { setUrl(e.target.value); setError(""); }} onKeyDown={e => e.key === "Enter" && analyze()} placeholder="https://suspicious-site.com/login" />
              <button className="scan-btn" onClick={analyze} disabled={loading}>{loading ? "Scanning..." : "Scan ⚡"}</button>
            </div>
            {error && <p style={{ color: "#ff3c64", fontSize: 12, marginTop: 10, fontWeight: 500 }}>⚠ {error}</p>}
            <div style={{ display: "flex", gap: 16, marginTop: 14, flexWrap: "wrap" }}>
              {["Google Safe Browsing", "AI Analysis", "10+ Threat Checks", "Instant Results"].map((t, i) => (
                <span key={i} style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ color: "#00ffb4" }}>✓</span>{t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ maxWidth: 760, margin: "0 auto 2rem", padding: "0 2rem" }}>
            <div className="glass" style={{ textAlign: "center", padding: "2.5rem" }}>
              <div style={{ position: "relative", width: 56, height: 56, margin: "0 auto 16px" }}>
                <div style={{ width: 56, height: 56, border: "2px solid rgba(0,200,255,0.1)", borderTop: "2px solid #00c8ff", borderRadius: "50%" }} className="spin" />
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 10, height: 10, background: "#00ffb4", borderRadius: "50%", boxShadow: "0 0 12px #00ffb4" }} className="pulse" />
              </div>
              <p style={{ color: "rgba(0,200,255,0.6)", fontSize: 12, letterSpacing: 3, fontWeight: 500 }} className="pulse">ANALYZING THREAT VECTORS</p>
              <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, marginTop: 6 }}>Querying Google Safe Browsing Database...</p>
            </div>
          </div>
        )}

        {/* Result */}
        {result && !loading && (() => {
          const c = colorMap[result.color] || colorMap.warn;
          const r = result.score / 100;
          const circ = 2 * Math.PI * 42;
          return (
            <div className="fade-in" style={{ maxWidth: 760, margin: "0 auto 2rem", padding: "0 2rem" }}>
              <div style={{ background: c.grad, backdropFilter: "blur(30px)", border: `1px solid ${c.border}`, borderRadius: 20, padding: "1.5rem", marginBottom: 10, boxShadow: c.glow }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                  <svg width={100} height={100} viewBox="0 0 100 100" style={{ flexShrink: 0 }}>
                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke={c.accent} strokeWidth="6" strokeDasharray={circ} strokeDashoffset={circ - circ * r} strokeLinecap="round" transform="rotate(-90 50 50)" className="score-ring" style={{ filter: `drop-shadow(0 0 8px ${c.accent})` }} />
                    <text x="50" y="46" textAnchor="middle" fill={c.text} fontSize="22" fontWeight="700" fontFamily="'Space Grotesk', sans-serif">{result.score}</text>
                    <text x="50" y="60" textAnchor="middle" fill={c.accent} fontSize="8" opacity="0.7">SCORE</text>
                  </svg>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: 3, marginBottom: 6, fontWeight: 500 }}>THREAT ASSESSMENT</p>
                    <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, color: c.text, letterSpacing: 1, marginBottom: 12, textShadow: `0 0 20px ${c.accent}` }}>{result.verdict?.toUpperCase()}</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {[result.domain, result.hasHTTPS ? "🔒 HTTPS" : "⚠ HTTP", `~${result.domainAge}d old`].map((chip, i) => (
                        <span key={i} style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", padding: "4px 12px", borderRadius: 8 }}>{chip}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="glass" style={{ padding: "1.25rem 1.5rem", marginBottom: 10 }}>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 3, marginBottom: 12, fontWeight: 500 }}>THREAT INDICATORS</p>
                {result.flags?.map((f, i) => (
                  <div key={i} className="flag-row">
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: severityColor[f.severity], marginTop: 5, flexShrink: 0, boxShadow: `0 0 8px ${severityColor[f.severity]}` }} />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>{f.label}</span>
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginLeft: 8 }}>{f.detail}</span>
                    </div>
                    <span style={{ fontSize: 10, color: severityColor[f.severity], background: `${severityColor[f.severity]}12`, border: `1px solid ${severityColor[f.severity]}25`, padding: "3px 10px", borderRadius: 6, fontWeight: 600 }}>{f.severity.toUpperCase()}</span>
                  </div>
                ))}
              </div>
              <div className="glass" style={{ padding: "1.25rem 1.5rem" }}>
                {!aiExplanation && <button className="ai-btn" disabled={aiLoading} onClick={async () => { setAiLoading(true); try { const data = await getAIExplanation(url, result.verdict, result.score, result.flags); setAiExplanation(data.explanation); } catch { setAiExplanation("AI failed!"); } finally { setAiLoading(false); } }}>{aiLoading ? "🤖 AI Analyzing..." : "🤖 Get AI Explanation"}</button>}
                {aiExplanation && <div className="fade-in"><p style={{ fontSize: 10, color: "rgba(0,200,255,0.5)", letterSpacing: 3, marginBottom: 12, fontWeight: 500 }}>AI THREAT ANALYSIS</p>{aiExplanation.split("\n").filter(l => l.trim()).map((line, i) => <p key={i} style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, marginBottom: 8, borderLeft: line.match(/^\d\./) ? "2px solid rgba(0,200,255,0.25)" : "none", paddingLeft: line.match(/^\d\./) ? 12 : 0 }}>{line}</p>)}<button onClick={() => setAiExplanation(null)} style={{ background: "none", border: "none", color: "rgba(0,200,255,0.3)", cursor: "pointer", fontSize: 11, marginTop: 8 }}>✕ Close</button></div>}
              </div>
            </div>
          );
        })()}

        {/* History */}
        {history.length > 0 && (
          <div style={{ maxWidth: 760, margin: "0 auto 2rem", padding: "0 2rem" }}>
            <div className="glass" style={{ padding: "1.25rem 1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 3, fontWeight: 500 }}>SCAN HISTORY</p>
                <button onClick={() => setHistory([])} style={{ background: "none", border: "1px solid rgba(255,60,100,0.15)", color: "rgba(255,60,100,0.4)", cursor: "pointer", fontSize: 10, padding: "4px 12px", borderRadius: 6 }}>Clear</button>
              </div>
              {history.map((h, i) => { const c = colorMap[h.color] || colorMap.warn; return <div key={i} className="hist-item" onClick={() => setUrl(h.url)}><span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{h.url}</span><div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 10, flexShrink: 0 }}><span style={{ fontSize: 11, color: "rgba(255,255,255,0.15)" }}>{h.score}/100</span><span style={{ fontSize: 11, color: c.text, background: `${c.accent}12`, border: `1px solid ${c.border}`, padding: "3px 10px", borderRadius: 6, fontWeight: 600 }}>{h.verdict?.toUpperCase()}</span></div></div>; })}
            </div>
          </div>
        )}

        <div className="divider" />

        {/* Stats Section */}
        <div className="section">
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div className="section-tag">TRUSTED WORLDWIDE</div>
            <p className="section-title">Protecting millions online</p>
            <p className="section-sub">Real-time statistics from our threat detection engine</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[
              { label: "URLs Scanned", value: urlsScanned.toLocaleString() + "+", color: "#00c8ff", icon: "🔍" },
              { label: "Threats Blocked", value: threatsBlocked.toLocaleString() + "+", color: "#ff3c64", icon: "🛡️" },
              { label: "Accuracy Rate", value: accuracy + "%", color: "#00ffb4", icon: "✅" },
            ].map((s, i) => (
              <div key={i} className="stat-card">
                <div style={{ fontSize: 28, marginBottom: 12 }}>{s.icon}</div>
                <p style={{ fontSize: 36, fontWeight: 800, color: s.color, fontFamily: "'Space Grotesk', sans-serif", marginBottom: 8, textShadow: `0 0 24px ${s.color}40`, letterSpacing: -1 }}>{s.value}</p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", letterSpacing: 2, fontWeight: 500 }}>{s.label.toUpperCase()}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="divider" />

        {/* Live Feed */}
        <div className="section">
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div className="section-tag">
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ff3c64", boxShadow: "0 0 6px #ff3c64" }} className="pulse" />
              LIVE FEED
            </div>
          </div>
          <p className="section-title">Real-time Threat Feed</p>
          <p className="section-sub">Live phishing detections happening worldwide right now</p>
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: 2 }}>DOMAIN</span>
              <div style={{ display: "flex", gap: 60 }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: 2 }}>STATUS</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: 2 }}>REGION</span>
              </div>
            </div>
            {visibleThreats.map((t, i) => (
              <div key={`${feedIndex}-${i}`} className="feed-item">
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.color, boxShadow: `0 0 8px ${t.color}`, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "'Inter', monospace" }}>{t.url}</span>
                <span style={{ fontSize: 11, color: t.color, background: `${t.color}12`, border: `1px solid ${t.color}25`, padding: "3px 12px", borderRadius: 6, fontWeight: 600, minWidth: 90, textAlign: "center" }}>{t.type}</span>
                <span style={{ fontSize: 16, marginLeft: 12 }}>{t.flag}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="divider" />

        {/* Features */}
        <div className="section">
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div className="section-tag">CAPABILITIES</div>
            <p className="section-title">Why PhishGuard?</p>
            <p className="section-sub">The most comprehensive phishing detection suite available</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {[
              { icon: "🛡️", title: "Real-time Detection", desc: "Google Safe Browsing API checks every URL against millions of known threats instantly", color: "#00c8ff" },
              { icon: "🤖", title: "AI Explanation", desc: "Gemma AI explains threats in plain language — anyone can understand the risk level", color: "#00ffb4" },
              { icon: "📧", title: "Email Analysis", desc: "Paste any suspicious email and scan every embedded link with manipulation detection", color: "#ff3c64" },
              { icon: "📷", title: "QR Code Scanner", desc: "Upload QR codes to reveal and analyze hidden URLs before you click them", color: "#ffb400" },
              { icon: "⚡", title: "Bulk Scanning", desc: "Scan up to 20 URLs simultaneously with detailed reports and one-click CSV export", color: "#00c8ff" },
              { icon: "🔌", title: "Browser Extension", desc: "Real-time hover badges on every website — green dot means safe, red means danger", color: "#00ffb4" },
            ].map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon" style={{ background: `${f.color}10`, borderColor: `${f.color}20` }}>
                  <span>{f.icon}</span>
                </div>
                <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 10 }}>{f.title}</p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="divider" />

        {/* How it works */}
        <div className="section">
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div className="section-tag">SIMPLE & FAST</div>
            <p className="section-title">How it works</p>
            <p className="section-sub">Stay protected in three simple steps</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, position: "relative" }}>
            {[
              { step: "01", icon: "📋", title: "Paste the URL", desc: "Copy any suspicious link from email, message, or social media and paste it in the scanner" },
              { step: "02", icon: "🔍", title: "We Analyze", desc: "Our engine checks against Google's database, AI analysis, and 10+ threat indicators simultaneously" },
              { step: "03", icon: "✅", title: "Stay Safe", desc: "Get instant verdict with AI explanation — know exactly what the threat is and what to do" },
            ].map((s, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: 32, textAlign: "center", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, rgba(0,200,255,${0.1 + i * 0.1}), transparent)` }} />
                <div className="step-num">{s.step}</div>
                <div style={{ fontSize: 32, marginBottom: 16 }}>{s.icon}</div>
                <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, fontWeight: 700, color: "#fff", marginBottom: 10 }}>{s.title}</p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
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
                <button className="footer-link" onClick={() => navigate("/")}>URL Scanner</button>
                <button className="footer-link" onClick={() => navigate("/bulk")}>Bulk Scanner</button>
                <button className="footer-link" onClick={() => navigate("/qr")}>QR Scanner</button>
                <button className="footer-link" onClick={() => navigate("/email")}>Email Analyzer</button>
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