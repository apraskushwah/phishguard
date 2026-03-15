import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import jsQR from "jsqr";

async function realAnalysis(url) {
  const res = await fetch("http://localhost:5000/api/check-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  return await res.json();
}

async function getAIExplanation(url, verdict, score, flags) {
  const res = await fetch("http://localhost:5000/api/ai-explain", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, verdict, score, flags }),
  });
  return await res.json();
}

export default function QRScanner() {
  const [qrResult, setQrResult] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileRef = useRef();
  const navigate = useNavigate();

  const colorMap = {
    safe: { grad: "linear-gradient(135deg, rgba(0,255,180,0.12), rgba(0,200,150,0.06))", accent: "#00ffb4", text: "#00ffb4", border: "rgba(0,255,180,0.25)", glow: "0 8px 40px rgba(0,255,180,0.15)" },
    warn: { grad: "linear-gradient(135deg, rgba(255,180,0,0.12), rgba(255,140,0,0.06))", accent: "#ffb400", text: "#ffb400", border: "rgba(255,180,0,0.25)", glow: "0 8px 40px rgba(255,180,0,0.15)" },
    danger: { grad: "linear-gradient(135deg, rgba(255,60,100,0.12), rgba(255,0,60,0.06))", accent: "#ff3c64", text: "#ff3c64", border: "rgba(255,60,100,0.25)", glow: "0 8px 40px rgba(255,60,100,0.15)" },
  };
  const severityColor = { safe: "#00ffb4", low: "#ffb400", medium: "#ff8c00", high: "#ff3c64" };

  const processImage = useCallback(async (file) => {
    if (!file) return;
    setError(""); setScanResult(null); setQrResult(null); setAiExplanation(null);
    setPreview(URL.createObjectURL(file));
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = async () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width; canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (!code) { setError("No QR code detected — try a clearer image"); return; }
      const extractedUrl = code.data;
      setQrResult(extractedUrl);
      if (!extractedUrl.startsWith("http")) { setError("QR code does not contain a URL"); return; }
      setLoading(true);
      try {
        const r = await realAnalysis(extractedUrl);
        setScanResult(r);
      } catch { setError("Backend offline — start server!"); }
      finally { setLoading(false); }
    };
  }, []);

  const handleFile = (file) => {
    if (file && file.type.startsWith("image/")) processImage(file);
    else setError("Invalid file — upload an image");
  };

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
        .drop-zone { border: 2px dashed rgba(0,200,255,0.15); padding: 48px 24px; text-align: center; cursor: pointer; transition: all .3s; border-radius: 16px; background: rgba(0,200,255,0.02); }
        .drop-zone:hover, .drop-zone.dragover { border-color: rgba(0,200,255,0.4); background: rgba(0,200,255,0.05); box-shadow: 0 0 40px rgba(0,200,255,0.06); }
        .upload-btn { background: linear-gradient(135deg, #00c8ff, #00ffb4); color: #000; border: none; padding: 10px 28px; font-family: 'Space Grotesk', sans-serif; font-size: 13px; font-weight: 700; border-radius: 10px; cursor: pointer; transition: all .3s; margin-top: 20px; display: inline-block; box-shadow: 0 4px 16px rgba(0,200,255,0.2); }
        .upload-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,200,255,0.3); }
        .flag-row { display: flex; align-items: flex-start; gap: 12px; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); transition: all .2s; }
        .flag-row:last-child { border-bottom: none; }
        .flag-row:hover { padding-left: 6px; }
        .ai-btn { width: 100%; height: 46px; background: rgba(0,150,255,0.08); border: 1px solid rgba(0,200,255,0.2); color: #00c8ff; font-family: 'Space Grotesk', sans-serif; font-size: 13px; font-weight: 600; border-radius: 12px; cursor: pointer; transition: all .3s; }
        .ai-btn:hover { background: rgba(0,150,255,0.15); border-color: rgba(0,200,255,0.35); transform: translateY(-1px); }
        .ai-btn:disabled { opacity: .5; cursor: not-allowed; transform: none; }
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
              <button className="navbar-link navbar-active">QR Scanner</button>
              <button className="navbar-link" onClick={() => navigate("/email")}>Email Analyzer</button>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <div className="hero">
          <div className="hero-badge">
            <span style={{ fontSize: 16 }}>📷</span>
            <span style={{ fontSize: 11, color: "rgba(0,200,255,0.7)", letterSpacing: 2, fontWeight: 500 }}>QR THREAT DETECTION</span>
          </div>
          <h1 className="hero-title">Scan QR Codes<br/>Before You Click</h1>
          <p className="hero-sub">QR codes can hide dangerous phishing URLs. Upload any QR code image and we'll extract and analyze the hidden link instantly.</p>
        </div>

        <div className="main">
          {/* Drop Zone */}
          <div className="glass-strong" style={{ padding: "28px", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00ffb4", boxShadow: "0 0 8px #00ffb4" }} className="pulse" />
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: 2, fontWeight: 500 }}>UPLOAD QR CODE IMAGE</span>
            </div>

            <div
              className={`drop-zone ${dragOver ? "dragover" : ""}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
              onClick={() => fileRef.current.click()}
            >
              {preview ? (
                <div>
                  <img src={preview} alt="QR" style={{ maxHeight: 180, maxWidth: "100%", borderRadius: 12, border: "1px solid rgba(0,200,255,0.15)", marginBottom: 16 }} />
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Click to change image</p>
                </div>
              ) : (
                <div>
                  <div style={{ width: 80, height: 80, margin: "0 auto 20px", background: "rgba(0,200,255,0.06)", border: "1px solid rgba(0,200,255,0.12)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>▦</div>
                  <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", fontWeight: 500, marginBottom: 8 }}>Drag & drop QR code here</p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>Supports PNG, JPG, WEBP</p>
                </div>
              )}
              <button className="upload-btn" onClick={e => { e.stopPropagation(); fileRef.current.click(); }}>
                {preview ? "Change Image" : "Browse Files"}
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
            {error && <p style={{ color: "#ff3c64", fontSize: 12, marginTop: 12, fontWeight: 500 }}>⚠ {error}</p>}
            <div style={{ display: "flex", gap: 16, marginTop: 16, flexWrap: "wrap" }}>
              {["Auto URL Extract", "Real-time Analysis", "AI Explanation", "Instant Results"].map((t, i) => (
                <span key={i} style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ color: "#00ffb4" }}>✓</span>{t}
                </span>
              ))}
            </div>
          </div>

          {/* Extracted URL */}
          {qrResult && (
            <div className="fade-in glass" style={{ padding: "20px 24px", marginBottom: 16, borderColor: "rgba(0,200,255,0.15)" }}>
              <div className="section-tag">EXTRACTED URL</div>
              <p style={{ fontSize: 13, color: "rgba(0,200,255,0.7)", wordBreak: "break-all", lineHeight: 1.6, marginTop: 8, fontFamily: "monospace" }}>{qrResult}</p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="glass" style={{ textAlign: "center", padding: "2.5rem", marginBottom: 16 }}>
              <div style={{ position: "relative", width: 56, height: 56, margin: "0 auto 16px" }}>
                <div style={{ width: 56, height: 56, border: "2px solid rgba(0,200,255,0.1)", borderTop: "2px solid #00c8ff", borderRadius: "50%" }} className="spin" />
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 10, height: 10, background: "#00ffb4", borderRadius: "50%", boxShadow: "0 0 12px #00ffb4" }} className="pulse" />
              </div>
              <p style={{ color: "rgba(0,200,255,0.6)", fontSize: 12, letterSpacing: 3, fontWeight: 500 }} className="pulse">ANALYZING QR URL THREAT</p>
              <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, marginTop: 6 }}>Querying Google Safe Browsing...</p>
            </div>
          )}

          {/* Result */}
          {scanResult && !loading && (() => {
            const c = colorMap[scanResult.color] || colorMap.warn;
            const r = scanResult.score / 100;
            const circ = 2 * Math.PI * 42;
            return (
              <div className="fade-in">
                <div style={{ background: c.grad, backdropFilter: "blur(30px)", border: `1px solid ${c.border}`, borderRadius: 20, padding: "1.5rem", marginBottom: 12, boxShadow: c.glow }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                    <svg width={100} height={100} viewBox="0 0 100 100" style={{ flexShrink: 0 }}>
                      <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                      <circle cx="50" cy="50" r="42" fill="none" stroke={c.accent} strokeWidth="6" strokeDasharray={circ} strokeDashoffset={circ - circ * r} strokeLinecap="round" transform="rotate(-90 50 50)" className="score-ring" style={{ filter: `drop-shadow(0 0 8px ${c.accent})` }} />
                      <text x="50" y="46" textAnchor="middle" fill={c.text} fontSize="22" fontWeight="700" fontFamily="'Space Grotesk', sans-serif">{scanResult.score}</text>
                      <text x="50" y="60" textAnchor="middle" fill={c.accent} fontSize="8" opacity="0.7">SCORE</text>
                    </svg>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: 3, marginBottom: 6, fontWeight: 500 }}>QR THREAT ASSESSMENT</p>
                      <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, color: c.text, letterSpacing: 1, marginBottom: 12, textShadow: `0 0 20px ${c.accent}` }}>{scanResult.verdict?.toUpperCase()}</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {[scanResult.domain, scanResult.hasHTTPS ? "🔒 HTTPS" : "⚠ HTTP", `~${scanResult.domainAge}d old`].map((chip, i) => (
                          <span key={i} style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", padding: "4px 12px", borderRadius: 8 }}>{chip}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass" style={{ padding: "1.25rem 1.5rem", marginBottom: 12 }}>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 3, marginBottom: 12, fontWeight: 500 }}>THREAT INDICATORS</p>
                  {scanResult.flags?.map((f, i) => (
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
                  {!aiExplanation && (
                    <button className="ai-btn" disabled={aiLoading} onClick={async () => {
                      setAiLoading(true);
                      try { const data = await getAIExplanation(qrResult, scanResult.verdict, scanResult.score, scanResult.flags); setAiExplanation(data.explanation); }
                      catch { setAiExplanation("AI explanation failed!"); }
                      finally { setAiLoading(false); }
                    }}>{aiLoading ? "🤖 AI Analyzing..." : "🤖 Get AI Explanation"}</button>
                  )}
                  {aiExplanation && (
                    <div className="fade-in">
                      <p style={{ fontSize: 10, color: "rgba(0,200,255,0.5)", letterSpacing: 3, marginBottom: 12, fontWeight: 500 }}>AI THREAT ANALYSIS</p>
                      {aiExplanation.split("\n").filter(l => l.trim()).map((line, i) => (
                        <p key={i} style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, marginBottom: 8, borderLeft: line.match(/^\d\./) ? "2px solid rgba(0,200,255,0.25)" : "none", paddingLeft: line.match(/^\d\./) ? 12 : 0 }}>{line}</p>
                      ))}
                      <button onClick={() => setAiExplanation(null)} style={{ background: "none", border: "none", color: "rgba(0,200,255,0.3)", cursor: "pointer", fontSize: 11, marginTop: 8 }}>✕ Close</button>
                    </div>
                  )}
                </div>
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