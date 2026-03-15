import { useState } from "react";
import { useNavigate } from "react-router-dom";

async function realAnalysis(url) {
  const res = await fetch("http://localhost:5000/api/check-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  return await res.json();
}

export default function BulkScanner() {
  const [urls, setUrls] = useState("");
  const [results, setResults] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  const colorMap = {
    safe: { accent: "#00ffb4", text: "#00ffb4", bg: "rgba(0,255,180,0.08)", border: "rgba(0,255,180,0.2)" },
    warn: { accent: "#ffb400", text: "#ffb400", bg: "rgba(255,180,0,0.08)", border: "rgba(255,180,0,0.2)" },
    danger: { accent: "#ff3c64", text: "#ff3c64", bg: "rgba(255,60,100,0.08)", border: "rgba(255,60,100,0.2)" },
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

  const safeCount = results.filter(r => r.color === "safe").length;
  const warnCount = results.filter(r => r.color === "warn").length;
  const dangerCount = results.filter(r => r.color === "danger").length;
  const pct = total > 0 ? Math.round((progress / total) * 100) : 0;

  return (
    <div style={{ minHeight: "100vh", background: "#030d18", color: "#e2e8f0", fontFamily: "'Inter', sans-serif", position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .bg-mesh {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background:
            radial-gradient(ellipse 80% 60% at 20% 10%, rgba(0,180,255,0.07) 0%, transparent 60%),
            radial-gradient(ellipse 60% 80% at 80% 80%, rgba(0,255,180,0.05) 0%, transparent 60%);
          pointer-events: none; z-index: 0;
        }
        .grid-lines {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background-image: linear-gradient(rgba(0,200,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,255,0.025) 1px, transparent 1px);
          background-size: 60px 60px; pointer-events: none; z-index: 0;
        }
        .content { position: relative; z-index: 1; }

        .navbar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          background: rgba(3,13,24,0.85); backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(0,200,255,0.08); padding: 0 2rem;
        }
        .navbar-inner { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; height: 64px; }
        .navbar-logo { font-family: 'Space Grotesk', sans-serif; font-size: 20px; font-weight: 800; background: linear-gradient(135deg, #00c8ff, #00ffb4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; cursor: pointer; }
        .navbar-links { display: flex; align-items: center; gap: 6px; }
        .navbar-link { background: transparent; border: none; color: rgba(255,255,255,0.5); padding: 7px 14px; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; border-radius: 8px; cursor: pointer; transition: all .2s; }
        .navbar-link:hover { color: #fff; background: rgba(255,255,255,0.06); }
        .navbar-active { background: rgba(0,200,255,0.08) !important; color: #00c8ff !important; border: 1px solid rgba(0,200,255,0.15) !important; }

        .hero { padding: 100px 2rem 60px; text-align: center; max-width: 800px; margin: 0 auto; }
        .hero-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,200,255,0.06); border: 1px solid rgba(0,200,255,0.12); border-radius: 999px; padding: 6px 18px; margin-bottom: 24px; }
        .hero-title { font-family: 'Space Grotesk', sans-serif; font-size: clamp(36px,6vw,60px); font-weight: 800; letter-spacing: -2px; line-height: 1.1; background: linear-gradient(135deg, #ffffff 0%, #00c8ff 50%, #00ffb4 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 16px; }
        .hero-sub { font-size: 15px; color: rgba(255,255,255,0.35); margin-bottom: 0; line-height: 1.7; font-weight: 300; }

        .main { max-width: 900px; margin: 0 auto; padding: 40px 2rem 80px; }

        .glass { background: rgba(255,255,255,0.04); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; }
        .glass-strong { background: rgba(255,255,255,0.06); backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; }

        .url-textarea {
          width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.8); font-family: 'Inter', monospace; font-size: 13px;
          padding: 14px 16px; outline: none; resize: vertical; min-height: 160px;
          line-height: 2; transition: all .3s; border-radius: 14px;
        }
        .url-textarea::placeholder { color: rgba(255,255,255,0.15); }
        .url-textarea:focus { border-color: rgba(0,200,255,0.3); background: rgba(255,255,255,0.06); box-shadow: 0 0 0 3px rgba(0,200,255,0.06); }

        .scan-btn {
          width: 100%; height: 52px;
          background: linear-gradient(135deg, #00c8ff, #00ffb4);
          color: #000; border: none; border-radius: 14px;
          font-family: 'Space Grotesk', sans-serif; font-size: 15px;
          font-weight: 700; cursor: pointer; transition: all .3s; margin-top: 12px;
          box-shadow: 0 4px 24px rgba(0,200,255,0.2); letter-spacing: 0.3px;
        }
        .scan-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,200,255,0.35); }
        .scan-btn:disabled { opacity: .5; cursor: not-allowed; transform: none; }

        .progress-wrap { margin-top: 16px; }
        .progress-track { height: 4px; background: rgba(255,255,255,0.06); border-radius: 999px; overflow: hidden; margin-top: 8px; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #00c8ff, #00ffb4); border-radius: 999px; transition: width .4s ease; box-shadow: 0 0 10px rgba(0,200,255,0.4); }

        .stat-card { padding: 20px; text-align: center; border-radius: 16px; transition: all .3s; position: relative; overflow: hidden; }
        .stat-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent); }
        .stat-card:hover { transform: translateY(-3px); }

        .result-row {
          display: flex; align-items: center; gap: 14px;
          padding: 14px 16px; margin-bottom: 8px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px; transition: all .25s;
          animation: rowIn .3s ease;
        }
        .result-row:hover { background: rgba(255,255,255,0.06); border-color: rgba(0,200,255,0.12); transform: translateX(4px); }
        @keyframes rowIn { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }

        .dl-btn {
          background: rgba(0,200,255,0.06); border: 1px solid rgba(0,200,255,0.15);
          color: #00c8ff; padding: 8px 18px; font-family: 'Space Grotesk', sans-serif;
          font-size: 12px; font-weight: 600; border-radius: 10px; cursor: pointer;
          transition: all .2s;
        }
        .dl-btn:hover { background: rgba(0,200,255,0.12); border-color: rgba(0,200,255,0.3); }

        .section-tag { display: inline-flex; align-items: center; gap: 6px; background: rgba(0,200,255,0.06); border: 1px solid rgba(0,200,255,0.12); border-radius: 999px; padding: 4px 14px; margin-bottom: 10px; font-size: 11px; color: rgba(0,200,255,0.7); letter-spacing: 2px; font-weight: 500; }

        .pulse { animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .fade-in { animation: fadeIn .5s ease; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }

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
              <button className="navbar-link navbar-active">Bulk Scanner</button>
              <button className="navbar-link" onClick={() => navigate("/qr")}>QR Scanner</button>
              <button className="navbar-link" onClick={() => navigate("/email")}>Email Analyzer</button>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <div className="hero">
          <div className="hero-badge">
            <span style={{ fontSize: 16 }}>⚡</span>
            <span style={{ fontSize: 11, color: "rgba(0,200,255,0.7)", letterSpacing: 2, fontWeight: 500 }}>BULK THREAT ANALYSIS</span>
          </div>
          <h1 className="hero-title">Scan Multiple URLs<br/>Simultaneously</h1>
          <p className="hero-sub">Paste up to 20 URLs at once — our engine scans all of them in parallel and gives you a detailed threat report with CSV export.</p>
        </div>

        <div className="main">
          {/* Input Card */}
          <div className="glass-strong" style={{ padding: "28px", marginBottom: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00ffb4", boxShadow: "0 0 8px #00ffb4" }} className="pulse" />
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: 2, fontWeight: 500 }}>PASTE URLs — ONE PER LINE — MAX 20</span>
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
                  <span style={{ fontSize: 12, color: "rgba(0,200,255,0.6)", fontWeight: 500 }} className="pulse">Scanning {progress} of {total} URLs...</span>
                  <span style={{ fontSize: 12, color: "#00c8ff", fontWeight: 700 }}>{pct}%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
            )}
            <button className="scan-btn" onClick={scanAll} disabled={scanning}>
              {scanning ? `⚡ Scanning ${progress}/${total}...` : "⚡ Start Bulk Scan"}
            </button>
            <div style={{ display: "flex", gap: 16, marginTop: 14, flexWrap: "wrap" }}>
              {["Up to 20 URLs", "Google Safe Browsing", "CSV Export", "Instant Results"].map((t, i) => (
                <span key={i} style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ color: "#00ffb4" }}>✓</span>{t}
                </span>
              ))}
            </div>
          </div>

          {/* Stats */}
          {results.length > 0 && (
            <div className="fade-in" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
              {[
                { label: "Safe", count: safeCount, color: "#00ffb4", bg: "rgba(0,255,180,0.05)", border: "rgba(0,255,180,0.15)", icon: "✅" },
                { label: "Suspicious", count: warnCount, color: "#ffb400", bg: "rgba(255,180,0,0.05)", border: "rgba(255,180,0,0.15)", icon: "⚠️" },
                { label: "Dangerous", count: dangerCount, color: "#ff3c64", bg: "rgba(255,60,100,0.05)", border: "rgba(255,60,100,0.15)", icon: "🚨" },
              ].map((s, i) => (
                <div key={i} className="stat-card" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
                  <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 36, fontWeight: 800, color: s.color, textShadow: `0 0 20px ${s.color}40`, lineHeight: 1, marginBottom: 8 }}>{s.count}</p>
                  <p style={{ fontSize: 11, color: s.color, letterSpacing: 2, opacity: 0.7, fontWeight: 500 }}>{s.label.toUpperCase()}</p>
                </div>
              ))}
            </div>
          )}

          {/* Results */}
          {results.length > 0 && (
            <div className="fade-in glass" style={{ padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                  <div className="section-tag">SCAN RESULTS</div>
                  <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, color: "#fff", marginTop: 6 }}>{results.length} URLs Analyzed</p>
                </div>
                {!scanning && <button className="dl-btn" onClick={downloadCSV}>⬇ Export CSV</button>}
              </div>

              {/* Table Header */}
              <div style={{ display: "flex", gap: 14, padding: "8px 16px", marginBottom: 8 }}>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", letterSpacing: 2, minWidth: 32 }}>#</span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", letterSpacing: 2, flex: 1 }}>URL</span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", letterSpacing: 2, minWidth: 60, textAlign: "right" }}>SCORE</span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", letterSpacing: 2, minWidth: 100, textAlign: "center" }}>STATUS</span>
              </div>

              {results.map((r, i) => {
                const c = colorMap[r.color] || colorMap.warn;
                return (
                  <div key={i} className="result-row">
                    <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.2)", minWidth: 32 }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.accent, flexShrink: 0, boxShadow: `0 0 8px ${c.accent}` }} />
                    <span style={{ flex: 1, fontSize: 13, color: "rgba(255,255,255,0.5)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.url}</span>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", minWidth: 60, textAlign: "right", fontWeight: 600 }}>{r.score}/100</span>
                    <span style={{ fontSize: 11, color: c.text, background: c.bg, border: `1px solid ${c.border}`, padding: "5px 14px", borderRadius: 8, minWidth: 100, textAlign: "center", fontWeight: 700 }}>
                      {r.verdict?.toUpperCase()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
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