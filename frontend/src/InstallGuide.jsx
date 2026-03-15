import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function InstallGuide() {
  const [activeStep, setActiveStep] = useState(0);
  const navigate = useNavigate();

  const steps = [
    {
      num: "01",
      title: "Download Extension",
      desc: "Click the download button below to get the PhishGuard extension ZIP file on your computer.",
      icon: "⬇️",
      action: "Download ZIP",
      detail: "The ZIP file contains all extension files. Save it somewhere you can find easily.",
      color: "#00c8ff",
    },
    {
      num: "02",
      title: "Extract the ZIP",
      desc: "Right click the downloaded ZIP file and select 'Extract All' to unzip the extension folder.",
      icon: "📂",
      action: null,
      detail: "You'll get a folder called 'extension' — keep it safe, don't delete it!",
      color: "#00ffb4",
    },
    {
      num: "03",
      title: "Open Chrome Extensions",
      desc: "Open Google Chrome and go to the Extensions page by clicking the link below.",
      icon: "🔧",
      action: "Open chrome://extensions",
      detail: "Or manually type chrome://extensions in your Chrome address bar and press Enter.",
      color: "#ffb400",
    },
    {
      num: "04",
      title: "Enable Developer Mode",
      desc: "On the Extensions page, toggle ON the 'Developer mode' switch in the top right corner.",
      icon: "⚙️",
      action: null,
      detail: "This allows you to install extensions that aren't from the Chrome Web Store.",
      color: "#00c8ff",
    },
    {
      num: "05",
      title: "Load the Extension",
      desc: "Click 'Load unpacked' button that appears, then select the extracted extension folder.",
      icon: "📦",
      action: null,
      detail: "Select the 'extension' folder — NOT the ZIP file. The folder contains manifest.json.",
      color: "#00ffb4",
    },
    {
      num: "06",
      title: "Pin & Use PhishGuard!",
      desc: "Click the puzzle piece icon 🧩 in Chrome toolbar, find PhishGuard and click the pin icon.",
      icon: "📌",
      action: null,
      detail: "Now PhishGuard appears in your toolbar! Click it on any website to scan URLs instantly.",
      color: "#ff3c64",
    },
  ];

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

        .main { max-width: 900px; margin: 0 auto; padding: 40px 2rem 80px; }

        .step-card { padding: 28px; border-radius: 20px; transition: all .3s; cursor: pointer; border: 1px solid rgba(255,255,255,0.07); background: rgba(255,255,255,0.03); position: relative; overflow: hidden; }
        .step-card:hover { transform: translateY(-2px); }
        .step-card.active { border-color: rgba(0,200,255,0.25); background: rgba(0,200,255,0.05); box-shadow: 0 8px 32px rgba(0,200,255,0.08); }
        .step-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent); }
        .step-card.active::before { background: linear-gradient(90deg, transparent, rgba(0,200,255,0.3), transparent); }

        .step-num { font-family: 'Space Grotesk', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 2px; margin-bottom: 12px; }
        .step-icon { font-size: 36px; margin-bottom: 14px; }
        .step-title { font-family: 'Space Grotesk', sans-serif; font-size: 17px; font-weight: 700; color: #fff; margin-bottom: 10px; }
        .step-desc { font-size: 13px; color: rgba(255,255,255,0.4); line-height: 1.7; }
        .step-detail { font-size: 12px; color: rgba(255,255,255,0.25); line-height: 1.7; margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.06); }

        .action-btn { display: inline-flex; align-items: center; gap: 8px; margin-top: 14px; padding: 8px 18px; background: rgba(0,200,255,0.1); border: 1px solid rgba(0,200,255,0.2); color: #00c8ff; font-family: 'Space Grotesk', sans-serif; font-size: 12px; font-weight: 600; border-radius: 10px; cursor: pointer; transition: all .2s; text-decoration: none; }
        .action-btn:hover { background: rgba(0,200,255,0.18); border-color: rgba(0,200,255,0.4); transform: translateY(-1px); }

        .download-btn { width: 100%; height: 56px; background: linear-gradient(135deg, #00c8ff, #00ffb4); color: #000; border: none; border-radius: 16px; font-family: 'Space Grotesk', sans-serif; font-size: 16px; font-weight: 700; cursor: pointer; transition: all .3s; box-shadow: 0 4px 24px rgba(0,200,255,0.25); display: flex; align-items: center; justify-content: center; gap: 10px; }
        .download-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,200,255,0.4); }

        .progress-bar { height: 3px; background: rgba(255,255,255,0.06); border-radius: 999px; margin-bottom: 40px; overflow: hidden; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #00c8ff, #00ffb4); border-radius: 999px; transition: width .4s ease; box-shadow: 0 0 10px rgba(0,200,255,0.4); }

        .glass { background: rgba(255,255,255,0.04); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; }

        .tip-card { padding: 20px 24px; background: rgba(0,200,255,0.04); border: 1px solid rgba(0,200,255,0.12); border-radius: 16px; margin-bottom: 12px; }

        .fade-in { animation: fadeIn .5s ease; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .pulse { animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }

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
              <button className="navbar-link" onClick={() => navigate("/email")}>Email Analyzer</button>
              <button className="navbar-link navbar-active">Extension</button>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <div className="hero">
          <div className="hero-badge">
            <span style={{ fontSize: 16 }}>🔌</span>
            <span style={{ fontSize: 11, color: "rgba(0,200,255,0.7)", letterSpacing: 2, fontWeight: 500 }}>CHROME EXTENSION</span>
          </div>
          <h1 className="hero-title">Install PhishGuard<br/>in 2 Minutes</h1>
          <p className="hero-sub">Add real-time phishing protection to your Chrome browser. Hover over any link and instantly see if it's safe — no clicking required.</p>
        </div>

        <div className="main">

          {/* Download Card */}
          <div className="glass" style={{ padding: "28px", marginBottom: "32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00ffb4", boxShadow: "0 0 8px #00ffb4" }} className="pulse" />
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: 2, fontWeight: 500 }}>STEP 1 — START HERE</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 20, flexWrap: "wrap" }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Download PhishGuard Extension</p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.7 }}>Get the latest version of PhishGuard extension. Compatible with Chrome, Brave, Edge, and all Chromium browsers.</p>
              </div>
              <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
                {[
                  { label: "v2.0", color: "#00ffb4" },
                  { label: "Free", color: "#00c8ff" },
                  { label: "Open Source", color: "#ffb400" },
                ].map((tag, i) => (
                  <span key={i} style={{ fontSize: 11, color: tag.color, background: `${tag.color}10`, border: `1px solid ${tag.color}25`, padding: "4px 12px", borderRadius: 8, fontWeight: 600 }}>{tag.label}</span>
                ))}
              </div>
            </div>
            <button
              className="download-btn"
              onClick={() => alert("Zip file download hogi jab GitHub pe upload karoge!\n\nAbhi ke liye manually extension folder share karo judges ke saath.")}
            >
              ⬇ Download PhishGuard Extension (.zip)
            </button>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 10, textAlign: "center" }}>Size: ~50KB • No signup required • 100% Free</p>
          </div>

          {/* Progress */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>Installation Progress</span>
              <span style={{ fontSize: 12, color: "#00c8ff", fontWeight: 700 }}>Step {activeStep + 1} of {steps.length}</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }} />
            </div>
          </div>

          {/* Steps Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12, marginBottom: "32px" }}>
            {steps.map((step, i) => (
              <div
                key={i}
                className={`step-card ${activeStep === i ? "active" : ""}`}
                onClick={() => setActiveStep(i)}
              >
                <div className="step-num" style={{ color: step.color }}>{step.num}</div>
                <div className="step-icon">{step.icon}</div>
                <p className="step-title">{step.title}</p>
                <p className="step-desc">{step.desc}</p>
                <p className="step-detail">{step.detail}</p>
                {step.action && (
                  <button
                    className="action-btn"
                    onClick={e => {
                      e.stopPropagation();
                      if (step.action === "Open chrome://extensions") {
                        navigator.clipboard.writeText("chrome://extensions");
                        alert("✅ Copied! Paste this in Chrome address bar:\nchrome://extensions");
                      } else {
                        alert("Download button upar hai! ⬆");
                      }
                    }}
                  >
                    {step.action === "Open chrome://extensions" ? "📋 Copy Link" : "⬇ Download"}
                  </button>
                )}
                {activeStep === i && i < steps.length - 1 && (
                  <button
                    onClick={e => { e.stopPropagation(); setActiveStep(i + 1); }}
                    style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 14, background: `${step.color}12`, border: `1px solid ${step.color}25`, color: step.color, padding: "7px 16px", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    Next Step →
                  </button>
                )}
                {activeStep === i && i === steps.length - 1 && (
                  <button
                    onClick={e => { e.stopPropagation(); navigate("/"); }}
                    style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 14, background: "linear-gradient(135deg, #00c8ff, #00ffb4)", border: "none", color: "#000", padding: "8px 20px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    🛡️ Start Using PhishGuard!
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Tips */}
          <div style={{ marginBottom: "32px" }}>
            <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 16 }}>💡 Pro Tips</p>
            {[
              { icon: "🖱️", tip: "Hover over any link on any website — PhishGuard will show a colored dot instantly", color: "#00ffb4" },
              { icon: "🟢", tip: "Green dot = Safe, Yellow dot = Suspicious, Red dot = Dangerous phishing link", color: "#00c8ff" },
              { icon: "🛡️", tip: "Click the PhishGuard icon in toolbar to scan the current page URL", color: "#ffb400" },
              { icon: "⚡", tip: "Results are cached — same URL won't be scanned twice in the same session", color: "#ff3c64" },
            ].map((t, i) => (
              <div key={i} className="tip-card">
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{t.icon}</span>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>{t.tip}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{ background: "linear-gradient(135deg, rgba(0,200,255,0.08), rgba(0,255,180,0.05))", border: "1px solid rgba(0,200,255,0.15)", borderRadius: 20, padding: "32px", textAlign: "center" }}>
            <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 10 }}>Extension installed? 🎉</p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginBottom: 24 }}>Try the full PhishGuard web app for advanced threat analysis with AI explanation</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button style={{ background: "linear-gradient(135deg, #00c8ff, #00ffb4)", color: "#000", border: "none", padding: "12px 28px", borderRadius: 12, fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 700, cursor: "pointer" }} onClick={() => navigate("/")}>
                Open URL Scanner ↗
              </button>
              <button style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.1)", padding: "12px 28px", borderRadius: 12, fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 600, cursor: "pointer" }} onClick={() => navigate("/bulk")}>
                Try Bulk Scanner →
              </button>
            </div>
          </div>
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