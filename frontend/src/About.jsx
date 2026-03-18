import { useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// ─── HOOKS ───────────────────────────────────────────────
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

function TiltCard({ children, style, className, intensity = 10 }) {
  const { ref, ...handlers } = useTilt(intensity);
  return (
    <div ref={ref} className={className}
      style={{ ...style, transformStyle: "preserve-3d", willChange: "transform" }}
      {...handlers}>
      {children}
    </div>
  );
}

// ─── TEAM DATA — YAHAN APNA DATA DAALO ──────────────────
const TEAM = [
  {
    // TODO: Replace with your name
    name: "Arjun Sharma",
    // TODO: Replace with your role (e.g. "Full Stack Developer", "AI Engineer")
    role: "Team Lead & Backend Dev",
    // TODO: Write a short 1-2 line bio (1-2 lines)
    bio: "Architected the backend threat engine and Google Safe Browsing integration.",
    // TODO: Set initials or use photo: "/your-photo.jpg" — photo ke liye: photo: "/your-photo.jpg"
    initials: "AS",
    // TODO: Change gradient color if needed
    color: "#00c8ff",
    grad: "linear-gradient(135deg, #00c8ff, #00ffb4)",
    // TODO: Add your social links (ya empty string chhod do to hide)
    github: "https://github.com",   // GitHub URL
    linkedin: "https://linkedin.com", // LinkedIn URL
  },
  {
    // TODO: Replace with your name
    name: "Priya Verma",
    // TODO: Replace with your role
    role: "Frontend Developer",
    // TODO: Write a short 1-2 line bio
    bio: "Built the entire React UI with animations, dark theme and Apple-level design system.",
    // TODO: Initials ya photo URL
    initials: "PV",
    color: "#00ffb4",
    grad: "linear-gradient(135deg, #00ffb4, #00c8ff)",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
  },
  {
    // TODO: Replace with your name
    name: "Rahul Gupta",
    // TODO: Replace with your role
    role: "AI & ML Engineer",
    // TODO: Write a short 1-2 line bio
    bio: "Integrated Gemma AI for threat explanation and trained custom phishing detection models.",
    // TODO: Initials ya photo URL
    initials: "RG",
    color: "#a78bfa",
    grad: "linear-gradient(135deg, #a78bfa, #00c8ff)",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
  },
  {
    // TODO: Replace with your name
    name: "Sneha Patel",
    // TODO: Replace with your role
    role: "Security Researcher",
    // TODO: Write a short 1-2 line bio
    bio: "Researched phishing patterns, built threat scoring algorithm and QR code detection.",
    // TODO: Initials ya photo URL
    initials: "SP",
    color: "#ff3c64",
    grad: "linear-gradient(135deg, #ff3c64, #ffb400)",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
  },
  {
    // TODO: Replace with your name
    name: "Karan Mehta",
    // TODO: Replace with your role
    role: "Chrome Extension Dev",
    // TODO: Write a short 1-2 line bio
    bio: "Developed the real-time Chrome extension with hover badges and live threat indicators.",
    // TODO: Initials ya photo URL
    initials: "KM",
    color: "#ffb400",
    grad: "linear-gradient(135deg, #ffb400, #ff3c64)",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
  },
];

// ─── MISSION & VISION — YAHAN CHANGE KARO ───────────────
const MISSION = {
  // TODO: Update mission text
  text: "PhishGuard's mission is to provide every internet user in India and around the world with real-time protection against phishing, malware, and online scams — completely free, completely instant.",
};

const VISION = {
  // TODO: Update vision text
  text: "A future where anyone can verify a suspicious link before clicking it. We believe cybersecurity should not be limited to experts — it should be accessible to every person, everywhere.",
};

// ─── STATS — YAHAN CHANGE KARO ──────────────────────────
const STATS = [
  // TODO: Update values and labels
  { value: "2.8M+",   label: "URLs Scanned",     color: "#00c8ff", icon: "🔍" },
  { value: "847K+",   label: "Threats Blocked",  color: "#ff3c64", icon: "🛡️" },
  { value: "99%",     label: "Accuracy Rate",    color: "#00ffb4", icon: "✅" },
  { value: "BGI '26", label: "Hackathon",        color: "#ffb400", icon: "🏆" },
];

// ─── MAIN COMPONENT ──────────────────────────────────────
export default function About() {
  const navigate = useNavigate();
  const mousePosRef = useRef({ x: -9999, y: -9999 });
  const glowRef = useRef(null);

  useEffect(() => {
    const h = (e) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
      if (glowRef.current) {
        glowRef.current.style.left = e.clientX + "px";
        glowRef.current.style.top = e.clientY + "px";
      }
    };
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, []);

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

    .bg-base{position:fixed;inset:0;z-index:0;background:#050a14;}
    .bg-aurora{position:fixed;inset:0;z-index:0;pointer-events:none;
      background:
        radial-gradient(ellipse 90% 70% at 15% 5%,rgba(0,150,255,0.07) 0%,transparent 55%),
        radial-gradient(ellipse 70% 90% at 85% 85%,rgba(0,255,160,0.05) 0%,transparent 55%),
        radial-gradient(ellipse 60% 40% at 50% 50%,rgba(120,60,255,0.03) 0%,transparent 60%);}
    .bg-grid{position:fixed;inset:0;z-index:0;pointer-events:none;
      background-image:linear-gradient(rgba(0,200,255,0.025) 1px,transparent 1px),
        linear-gradient(90deg,rgba(0,200,255,0.025) 1px,transparent 1px);
      background-size:64px 64px;
      mask-image:radial-gradient(ellipse at center,black 30%,transparent 80%);}
    .cursor-glow{position:fixed;pointer-events:none;z-index:9999;width:500px;height:500px;
      border-radius:50%;background:radial-gradient(circle,rgba(0,200,255,0.04) 0%,transparent 70%);
      transform:translate(-50%,-50%);transition:left 0.05s,top 0.05s;}
    .particle{position:fixed;border-radius:50%;pointer-events:none;z-index:0;animation:floatP linear infinite;}
    @keyframes floatP{0%{transform:translateY(100vh) scale(0);opacity:0}10%{opacity:1}90%{opacity:1}100%{transform:translateY(-120px) scale(1);opacity:0}}
    .content{position:relative;z-index:1;}

    /* NAVBAR */
    .navbar{position:fixed;top:0;left:0;right:0;z-index:100;
      background:rgba(5,10,20,0.78);backdrop-filter:blur(24px) saturate(180%);
      border-bottom:1px solid rgba(255,255,255,0.06);padding:0 2rem;}
    .navbar-inner{max-width:1120px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;height:68px;}
    .navbar-logo{font-family:'Syne',sans-serif;font-size:19px;font-weight:800;
      background:linear-gradient(135deg,#00c8ff,#00ffb4);-webkit-background-clip:text;
      -webkit-text-fill-color:transparent;background-clip:text;cursor:pointer;transition:opacity 0.2s;}
    .navbar-logo:hover{opacity:0.75;}
    .navbar-links{display:flex;align-items:center;gap:4px;}
    .navbar-link{background:transparent;border:none;color:rgba(255,255,255,0.42);padding:8px 15px;
      font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;border-radius:10px;cursor:pointer;transition:all 0.2s;}
    .navbar-link:hover{color:#fff;background:rgba(255,255,255,0.06);}
    .navbar-active{background:rgba(0,200,255,0.08)!important;color:#00c8ff!important;border:1px solid rgba(0,200,255,0.18)!important;}
    .navbar-cta{background:rgba(0,200,255,0.07);border:1px solid rgba(0,200,255,0.18);color:#00c8ff;padding:8px 18px;
      font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;border-radius:10px;cursor:pointer;
      transition:all 0.3s;backdrop-filter:blur(10px);}
    .navbar-cta:hover{border-color:rgba(0,200,255,0.38);color:#fff;transform:translateY(-1px);box-shadow:0 4px 20px rgba(0,200,255,0.14);}

    /* HERO */
    .hero{padding:140px 2rem 80px;text-align:center;max-width:860px;margin:0 auto;}
    .hero-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(0,200,255,0.05);
      border:1px solid rgba(0,200,255,0.1);border-radius:999px;padding:6px 20px;margin-bottom:32px;
      backdrop-filter:blur(12px);animation:badgeDrop 0.8s cubic-bezier(0.23,1,0.32,1) both;}
    @keyframes badgeDrop{from{opacity:0;transform:translateY(-18px)}to{opacity:1;transform:translateY(0)}}
    .hero-title{font-family:'Syne',sans-serif;font-size:clamp(48px,8vw,86px);font-weight:800;
      letter-spacing:-4px;line-height:0.94;
      background:linear-gradient(160deg,#ffffff 0%,#a0e4ff 30%,#00ffb4 65%,#ffffff 100%);
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
      margin-bottom:24px;animation:titleReveal 1s cubic-bezier(0.23,1,0.32,1) 0.1s both;}
    @keyframes titleReveal{from{opacity:0;transform:translateY(32px) skewY(2deg)}to{opacity:1;transform:translateY(0) skewY(0)}}
    .hero-sub{font-family:'DM Sans',sans-serif;font-size:17px;color:rgba(255,255,255,0.34);
      line-height:1.7;max-width:520px;margin:0 auto;font-weight:300;
      animation:fadeUp 1s cubic-bezier(0.23,1,0.32,1) 0.2s both;}
    @keyframes fadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}

    /* SECTIONS */
    .section{padding:80px 2rem;max-width:1060px;margin:0 auto;}
    .section-tag{display:inline-flex;align-items:center;gap:6px;background:rgba(0,200,255,0.05);
      border:1px solid rgba(0,200,255,0.1);border-radius:999px;padding:5px 16px;margin-bottom:18px;
      font-size:10px;color:rgba(0,200,255,0.58);letter-spacing:2.5px;font-weight:600;font-family:'DM Sans',sans-serif;}
    .section-title{font-family:'Syne',sans-serif;font-size:clamp(28px,4vw,42px);font-weight:800;
      color:#fff;margin-bottom:12px;letter-spacing:-1.5px;line-height:1.05;}
    .section-sub{font-size:14px;color:rgba(255,255,255,0.28);font-weight:300;
      font-family:'DM Sans',sans-serif;line-height:1.65;margin-bottom:40px;}

    /* GLASS */
    .glass{background:rgba(255,255,255,0.03);backdrop-filter:blur(24px) saturate(150%);
      border:1px solid rgba(255,255,255,0.07);border-radius:22px;}

    /* MISSION / VISION CARDS */
    .mv-card{padding:36px;border-radius:24px;position:relative;overflow:hidden;
      transform-style:preserve-3d;will-change:transform;}
    .mv-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;
      background:linear-gradient(90deg,transparent,rgba(0,200,255,0.35),transparent);}
    .mv-card::after{content:'';position:absolute;inset:0;border-radius:24px;
      background:radial-gradient(circle at var(--mouse-x,50%) var(--mouse-y,50%),rgba(0,200,255,0.05),transparent 65%);
      opacity:0;transition:opacity 0.3s;pointer-events:none;}
    .mv-card:hover::after{opacity:1;}

    /* STAT CARDS */
    .stat-card{padding:30px 20px;text-align:center;border-radius:24px;
      position:relative;overflow:hidden;transform-style:preserve-3d;will-change:transform;}
    .stat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;
      background:linear-gradient(90deg,transparent,rgba(0,200,255,0.4),transparent);}
    .stat-card::after{content:'';position:absolute;inset:0;border-radius:24px;
      background:radial-gradient(circle at var(--mouse-x,50%) var(--mouse-y,50%),rgba(0,200,255,0.06),transparent 60%);
      opacity:0;transition:opacity 0.3s;}
    .stat-card:hover::after{opacity:1;}

    /* TEAM CARDS */
    .team-card{padding:32px 28px;border-radius:24px;
      background:rgba(255,255,255,0.025);border:1px solid rgba(255,255,255,0.06);
      position:relative;overflow:hidden;transform-style:preserve-3d;will-change:transform;
      transition:border-color 0.3s;}
    .team-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;
      background:linear-gradient(90deg,transparent,rgba(0,200,255,0.2),transparent);
      opacity:0;transition:opacity 0.4s;}
    .team-card::after{content:'';position:absolute;inset:0;border-radius:24px;
      background:radial-gradient(circle at var(--mouse-x,50%) var(--mouse-y,50%),rgba(0,200,255,0.04),transparent 60%);
      opacity:0;transition:opacity 0.3s;}
    .team-card:hover{border-color:rgba(0,200,255,0.15);}
    .team-card:hover::before,.team-card:hover::after{opacity:1;}

    /* AVATAR */
    .avatar{width:72px;height:72px;border-radius:20px;display:flex;align-items:center;
      justify-content:center;font-family:'Syne',sans-serif;font-size:22px;font-weight:800;
      color:#fff;margin-bottom:20px;flex-shrink:0;
      transition:all 0.4s cubic-bezier(0.23,1,0.32,1);transform:translateZ(20px);
      position:relative;overflow:hidden;}
    .avatar::before{content:'';position:absolute;inset:0;
      background:linear-gradient(135deg,rgba(255,255,255,0.2),transparent);
      border-radius:inherit;}
    .team-card:hover .avatar{transform:translateZ(30px) scale(1.08);}

    /* SOCIAL LINKS */
    .social-link{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;
      border-radius:9px;font-size:11px;font-weight:600;font-family:'DM Sans',sans-serif;
      cursor:pointer;text-decoration:none;transition:all 0.25s cubic-bezier(0.23,1,0.32,1);
      border:1px solid rgba(255,255,255,0.07);background:rgba(255,255,255,0.04);
      color:rgba(255,255,255,0.4);}
    .social-link:hover{background:rgba(0,200,255,0.08);border-color:rgba(0,200,255,0.2);
      color:#00c8ff;transform:translateY(-2px);}

    /* DIVIDER */
    .divider{height:1px;background:linear-gradient(90deg,transparent,rgba(0,200,255,0.08),transparent);margin:0 3rem;}

    /* FOOTER */
    .footer{border-top:1px solid rgba(255,255,255,0.05);background:rgba(0,0,0,0.22);
      backdrop-filter:blur(24px);padding:40px 2rem;}
    .footer-inner{max-width:1060px;margin:0 auto;display:flex;justify-content:space-between;
      align-items:center;flex-wrap:wrap;gap:16px;}
    .footer-logo{font-family:'Syne',sans-serif;font-size:17px;font-weight:800;
      background:linear-gradient(135deg,#00c8ff,#00ffb4);-webkit-background-clip:text;
      -webkit-text-fill-color:transparent;background-clip:text;}
    .footer-copy{font-size:12px;color:rgba(255,255,255,0.17);font-family:'DM Sans',sans-serif;}
    .footer-tags{display:flex;gap:8px;}
    .footer-tag{font-size:10px;color:rgba(0,200,255,0.32);background:rgba(0,200,255,0.04);
      border:1px solid rgba(0,200,255,0.08);padding:3px 11px;border-radius:6px;font-family:'DM Sans',sans-serif;}

    /* UTILS */
    .pulse{animation:pulse 2s infinite;}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.32}}
    .fade-in-up{animation:fadeInUp 0.6s cubic-bezier(0.23,1,0.32,1) both;}
    @keyframes fadeInUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
    ::-webkit-scrollbar{width:3px;}
    ::-webkit-scrollbar-track{background:transparent;}
    ::-webkit-scrollbar-thumb{background:rgba(0,200,255,0.12);border-radius:2px;}
  `;

  return (
    <div style={{ minHeight: "100vh", background: "#050a14", color: "#e2e8f0", fontFamily: "'Syne',sans-serif", position: "relative", overflow: "hidden" }}>
      <style>{CSS}</style>

      {/* Cursor glow */}
      <div ref={glowRef} className="cursor-glow" />

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <div key={i} className="particle" style={{
          width: `${3 + i}px`, height: `${3 + i}px`, left: `${8 + i * 16}%`,
          background: i % 2 === 0 ? "rgba(0,200,255,0.26)" : "rgba(0,255,180,0.26)",
          animationDuration: `${9 + i * 3}s`, animationDelay: `${i * 1.8}s`,
        }} />
      ))}

      <div className="bg-base" /><div className="bg-aurora" /><div className="bg-grid" />

      <div className="content">

        {/* ─── NAVBAR ─── */}
        <nav className="navbar">
          <div className="navbar-inner">
            <div className="navbar-logo" onClick={() => navigate("/")}>🛡️ PhishGuard</div>
            <div className="navbar-links">
              <button className="navbar-link" onClick={() => navigate("/")}>🏠 Home</button>
              <button className="navbar-link" onClick={() => navigate("/bulk")}>Bulk Scanner</button>
              <button className="navbar-link" onClick={() => navigate("/qr")}>QR Scanner</button>
              <button className="navbar-link" onClick={() => navigate("/email")}>Email Analyzer</button>
              <button className="navbar-cta" onClick={() => navigate("/install")}>Chrome Extension ↗</button>
            </div>
          </div>
        </nav>

        {/* ─── HERO ─── */}
        <div className="hero">
          <div className="hero-badge">
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#00ffb4", boxShadow: "0 0 10px #00ffb4" }} className="pulse" />
            <span style={{ fontSize: 10, color: "rgba(0,200,255,0.62)", letterSpacing: 2.5, fontWeight: 600, fontFamily: "'DM Sans'" }}>BGI HACKATHON 2026</span>
          </div>
          {/* TODO: Update page title if needed */}
          <h1 className="hero-title">Built by<br />Humans,<br />For Humans.</h1>
          {/* TODO: Update subtitle */}
          <p className="hero-sub">
            PhishGuard is an open-source cybersecurity project built by passionate developers to make India safer — created for BGI Hackathon 2026.
          </p>
        </div>

        {/* ─── STATS ─── */}
        <div style={{ padding: "0 2rem 80px", maxWidth: 1060, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
            {STATS.map((s, i) => (
              <TiltCard key={i} intensity={9} className="stat-card"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: 28, marginBottom: 12, transform: "translateZ(18px)", display: "block" }}>{s.icon}</div>
                <p style={{ fontSize: "clamp(24px,2.5vw,32px)", fontWeight: 800, color: s.color,
                  fontFamily: "'Syne',sans-serif", marginBottom: 8,
                  textShadow: `0 0 28px ${s.color}48`, letterSpacing: -1, transform: "translateZ(14px)", lineHeight: 1 }}>
                  {s.value}
                </p>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.26)", letterSpacing: 2.5,
                  fontWeight: 600, fontFamily: "'DM Sans'", transform: "translateZ(8px)" }}>
                  {s.label.toUpperCase()}
                </p>
              </TiltCard>
            ))}
          </div>
        </div>

        <div className="divider" />

        {/* ─── MISSION & VISION ─── */}
        <div className="section">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div className="section-tag">OUR PURPOSE</div>
            <p className="section-title">Mission & Vision</p>
            <p className="section-sub">This project is not just a hackathon entry — it is a commitment.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>

            {/* MISSION */}
            <TiltCard intensity={7} className="mv-card"
              style={{ background: "linear-gradient(135deg,rgba(0,200,255,0.06),rgba(0,255,180,0.03))", border: "1px solid rgba(0,200,255,0.12)" }}>
              <div style={{ transform: "translateZ(10px)" }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(0,200,255,0.08)",
                  border: "1px solid rgba(0,200,255,0.15)", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 26, marginBottom: 20 }}>🎯</div>
                <p style={{ fontSize: 10, color: "rgba(0,200,255,0.55)", letterSpacing: 2.5,
                  fontWeight: 600, fontFamily: "'DM Sans'", marginBottom: 14 }}>OUR MISSION</p>
                <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 700,
                  color: "#fff", marginBottom: 16, letterSpacing: -0.5, lineHeight: 1.2 }}>
                  Protect Every Click
                </p>
                {/* TODO: Update mission text inside the MISSION object above */}
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.42)", lineHeight: 1.8,
                  fontFamily: "'DM Sans'", fontWeight: 300 }}>
                  {MISSION.text}
                </p>
              </div>
            </TiltCard>

            {/* VISION */}
            <TiltCard intensity={7} className="mv-card"
              style={{ background: "linear-gradient(135deg,rgba(0,255,180,0.06),rgba(0,200,255,0.03))", border: "1px solid rgba(0,255,180,0.12)" }}>
              <div style={{ transform: "translateZ(10px)" }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(0,255,180,0.08)",
                  border: "1px solid rgba(0,255,180,0.15)", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 26, marginBottom: 20 }}>🔭</div>
                <p style={{ fontSize: 10, color: "rgba(0,255,180,0.55)", letterSpacing: 2.5,
                  fontWeight: 600, fontFamily: "'DM Sans'", marginBottom: 14 }}>OUR VISION</p>
                <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 700,
                  color: "#fff", marginBottom: 16, letterSpacing: -0.5, lineHeight: 1.2 }}>
                  A Safer Internet
                </p>
                {/* TODO: Update vision text inside the VISION object above */}
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.42)", lineHeight: 1.8,
                  fontFamily: "'DM Sans'", fontWeight: 300 }}>
                  {VISION.text}
                </p>
              </div>
            </TiltCard>
          </div>

          {/* Values strip */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginTop: 18 }}>
            {[
              // TODO: Update values if needed
              { icon: "🔓", title: "Open Source",  desc: "Every line of code is public — anyone can contribute and audit" },
              { icon: "⚡", title: "Always Free",   desc: "No subscriptions, no paywalls — free forever for everyone" },
              { icon: "🇮🇳", title: "Made in India", desc: "Built with the vision of Viksit Bharat, for India and the world" },
            ].map((v, i) => (
              <TiltCard key={i} intensity={8}
                style={{ padding: "24px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 20, transformStyle: "preserve-3d", willChange: "transform" }}>
                <div style={{ fontSize: 28, marginBottom: 14, transform: "translateZ(12px)", display: "block" }}>{v.icon}</div>
                <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 8, transform: "translateZ(8px)" }}>{v.title}</p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.28)", lineHeight: 1.7, fontFamily: "'DM Sans'", fontWeight: 300 }}>{v.desc}</p>
              </TiltCard>
            ))}
          </div>
        </div>

        <div className="divider" />

        {/* ─── TEAM ─── */}
        <div className="section">
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div className="section-tag">THE BUILDERS</div>
            <p className="section-title">Meet the Team</p>
            {/* TODO: Update team tagline */}
            <p className="section-sub">Passionate developers, researchers and designers — united by a common goal.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
            {TEAM.map((member, i) => (
              <TiltCard key={i} intensity={8} className="team-card"
                style={{ animationDelay: `${i * 0.1}s` }}>

                {/* Avatar */}
                {/* TODO: To use a photo instead: <img src={member.photo} ... /> */}
                <div className="avatar" style={{ background: member.grad, boxShadow: `0 8px 32px ${member.color}25` }}>
                  {member.initials}
                </div>

                {/* Info */}
                <div style={{ transform: "translateZ(8px)" }}>
                  {/* TODO: Update name in the TEAM array above */}
                  <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700,
                    color: "#fff", marginBottom: 4, letterSpacing: -0.3 }}>
                    {member.name}
                  </p>
                  {/* TODO: Update role in the TEAM array above */}
                  <p style={{ fontSize: 11, color: member.color, fontWeight: 600,
                    fontFamily: "'DM Sans'", letterSpacing: 1, marginBottom: 14, opacity: 0.85 }}>
                    {member.role.toUpperCase()}
                  </p>
                  {/* TODO: Update bio in the TEAM array above */}
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.32)", lineHeight: 1.75,
                    fontFamily: "'DM Sans'", fontWeight: 300, marginBottom: 20 }}>
                    {member.bio}
                  </p>

                  {/* Social Links */}
                  {/* TODO: Update GitHub/LinkedIn URLs in TEAM array. Leave empty string "" to hide the link */}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {member.github && (
                      <a href={member.github} target="_blank" rel="noopener noreferrer" className="social-link">
                        <span>⌥</span> GitHub
                      </a>
                    )}
                    {member.linkedin && (
                      <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="social-link">
                        <span>in</span> LinkedIn
                      </a>
                    )}
                  </div>
                </div>

                {/* Decorative glow dot */}
                <div style={{ position: "absolute", top: 28, right: 28, width: 8, height: 8,
                  borderRadius: "50%", background: member.color,
                  boxShadow: `0 0 12px ${member.color}` }} className="pulse" />
              </TiltCard>
            ))}
          </div>
        </div>

        <div className="divider" />

        {/* ─── HACKATHON BANNER ─── */}
        <div style={{ padding: "80px 2rem", maxWidth: 1060, margin: "0 auto" }}>
          <TiltCard intensity={5}
            style={{ padding: "52px 48px", borderRadius: 28, textAlign: "center",
              background: "linear-gradient(135deg,rgba(0,200,255,0.07),rgba(0,255,180,0.04))",
              border: "1px solid rgba(0,200,255,0.14)",
              boxShadow: "0 32px 80px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
              position: "relative", overflow: "hidden" }}>
            {/* Top shimmer line */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1,
              background: "linear-gradient(90deg,transparent,rgba(0,200,255,0.5),transparent)" }} />

            <div style={{ fontSize: 52, marginBottom: 20 }}>🏆</div>
            {/* TODO: Update event name */}
            <p style={{ fontSize: 11, color: "rgba(0,200,255,0.55)", letterSpacing: 3,
              fontWeight: 600, fontFamily: "'DM Sans'", marginBottom: 16 }}>BGI HACKATHON 2026</p>
            <p style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(24px,3.5vw,38px)",
              fontWeight: 800, color: "#fff", letterSpacing: -1.5, marginBottom: 16, lineHeight: 1.1 }}>
              {/* TODO: Update banner title */}
              Built for Viksit Bharat,<br />Vision 2047
            </p>
            {/* TODO: Update banner description */}
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", lineHeight: 1.75,
              maxWidth: 520, margin: "0 auto 32px", fontFamily: "'DM Sans'", fontWeight: 300 }}>
              PhishGuard was built as part of BGI Hackathon 2026 — addressing India's growing cybersecurity challenge. Every day, millions of Indians fall victim to phishing attacks. We built the solution.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
              {/* TODO: Update tags if needed */}
              {["Cybersecurity", "AI Powered", "Open Source", "Made in India", "BGI 2026"].map((t, i) => (
                <span key={i} style={{ fontSize: 11, color: "rgba(0,200,255,0.5)",
                  background: "rgba(0,200,255,0.06)", border: "1px solid rgba(0,200,255,0.12)",
                  padding: "5px 14px", borderRadius: 8, fontFamily: "'DM Sans'", fontWeight: 600 }}>
                  {t}
                </span>
              ))}
            </div>
          </TiltCard>
        </div>

        {/* ─── FOOTER ─── */}
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
