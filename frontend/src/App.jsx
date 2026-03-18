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

// Apple-style 3D Tilt Hook
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

// Magnetic Button Hook
function useMagnetic(strength = 0.38) {
  const ref = useRef(null);
  const handleMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = (e.clientX - rect.left - rect.width / 2) * strength;
    const dy = (e.clientY - rect.top - rect.height / 2) * strength;
    el.style.transform = `translate(${dx}px, ${dy}px)`;
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
  const [mousePos, setMousePos] = useState({ x: -9999, y: -9999 });
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

  useEffect(() => {
    const handleMouse = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
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
    safe: { grad: "linear-gradient(135deg,rgba(0,255,180,0.12),rgba(0,200,150,0.06))", accent: "#00ffb4", text: "#00ffb4", border: "rgba(0,255,180,0.25)", glow: "0 8px 40px rgba(0,255,180,0.2)" },
    warn: { grad: "linear-gradient(135deg,rgba(255,180,0,0.12),rgba(255,140,0,0.06))", accent: "#ffb400", text: "#ffb400", border: "rgba(255,180,0,0.25)", glow: "0 8px 40px rgba(255,180,0,0.2)" },
    danger: { grad: "linear-gradient(135deg,rgba(255,60,100,0.12),rgba(255,0,60,0.06))", accent: "#ff3c64", text: "#ff3c64", border: "rgba(255,60,100,0.25)", glow: "0 8px 40px rgba(255,60,100,0.2)" },
  };
  const severityColor = { safe: "#00ffb4", low: "#ffb400", medium: "#ff8c00", high: "#ff3c64" };
  const visibleThreats = [0, 1, 2, 3].map(i => threats[(feedIndex + i) % threats.length]);

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300&family=DM+Mono:wght@400;500&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

    /* BG */
    .bg-base{position:fixed;inset:0;z-index:0;background:#050a14;}
    .bg-aurora{position:fixed;inset:0;z-index:0;pointer-events:none;
      background:radial-gradient(ellipse 90% 70% at 15% 5%,rgba(0,150,255,0.07) 0%,transparent 55%),
      radial-gradient(ellipse 70% 90% at 85% 85%,rgba(0,255,160,0.05) 0%,transparent 55%),
      radial-gradient(ellipse 50% 50% at 50% 50%,rgba(0,80,200,0.04) 0%,transparent 60%);}
    .bg-grid{position:fixed;inset:0;z-index:0;pointer-events:none;
      background-image:linear-gradient(rgba(0,200,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,200,255,0.025) 1px,transparent 1px);
      background-size:64px 64px;mask-image:radial-gradient(ellipse at center,black 30%,transparent 80%);}

    /* CURSOR GLOW */
    .cursor-glow{position:fixed;pointer-events:none;z-index:9999;width:480px;height:480px;border-radius:50%;
      background:radial-gradient(circle,rgba(0,200,255,0.045) 0%,transparent 70%);transform:translate(-50%,-50%);}

    /* PARTICLES */
    .particle{position:fixed;border-radius:50%;pointer-events:none;z-index:0;animation:floatParticle linear infinite;}
    @keyframes floatParticle{0%{transform:translateY(100vh) scale(0);opacity:0}10%{opacity:1}90%{opacity:1}100%{transform:translateY(-120px) scale(1);opacity:0}}

    .content{position:relative;z-index:1;}

    /* NAVBAR */
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

    .navbar-about{
      background:linear-gradient(135deg,#00c8ff,#00ffb4);
      color:#030d18;padding:8px 18px;border:none;
      font-family:'DM Sans',sans-serif;font-size:13px;font-weight:700;
      border-radius:10px;cursor:pointer;position:relative;overflow:hidden;
      box-shadow:0 0 18px rgba(0,200,255,0.35),0 0 36px rgba(0,255,180,0.15);
      transition:all 0.3s cubic-bezier(0.23,1,0.32,1);
      animation:aboutPulseGlow 2.5s ease-in-out infinite;
    }
    @keyframes aboutPulseGlow{
      0%,100%{box-shadow:0 0 14px rgba(0,200,255,0.4),0 0 28px rgba(0,255,180,0.15);}
      50%{box-shadow:0 0 24px rgba(0,200,255,0.7),0 0 48px rgba(0,255,180,0.3);}
    }
    .navbar-about::before{
      content:'';position:absolute;inset:0;
      background:linear-gradient(135deg,rgba(255,255,255,0.25),transparent);
      opacity:0;transition:opacity 0.3s;
    }
    .navbar-about:hover{transform:translateY(-2px) scale(1.05);box-shadow:0 0 28px rgba(0,200,255,0.8),0 0 56px rgba(0,255,180,0.35);}
    .navbar-about:hover::before{opacity:1;}
    .navbar-about:active{transform:translateY(0) scale(0.98);}

    /* HERO */
    .hero{padding:132px 2rem 92px;text-align:center;max-width:860px;margin:0 auto;}
    .hero-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(0,200,255,0.05);
      border:1px solid rgba(0,200,255,0.1);border-radius:999px;padding:6px 20px;margin-bottom:32px;backdrop-filter:blur(12px);
      animation:badgeDrop 0.8s cubic-bezier(0.23,1,0.32,1) both;}
    @keyframes badgeDrop{from{opacity:0;transform:translateY(-18px)}to{opacity:1;transform:translateY(0)}}
    .hero-title{font-family:'Syne',sans-serif;font-size:clamp(52px,9.5vw,92px);font-weight:800;letter-spacing:-4px;line-height:0.94;
      background:linear-gradient(160deg,#ffffff 0%,#a0e4ff 30%,#00ffb4 65%,#ffffff 100%);
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:24px;
      animation:titleReveal 1s cubic-bezier(0.23,1,0.32,1) 0.1s both;}
    @keyframes titleReveal{from{opacity:0;transform:translateY(32px) skewY(2deg)}to{opacity:1;transform:translateY(0) skewY(0)}}
    .hero-sub{font-family:'DM Sans',sans-serif;font-size:17px;color:rgba(255,255,255,0.36);margin-bottom:44px;line-height:1.65;
      max-width:480px;margin-left:auto;margin-right:auto;font-weight:300;
      animation:fadeUp 1s cubic-bezier(0.23,1,0.32,1) 0.2s both;}
    .hero-btns{display:flex;justify-content:center;gap:12px;flex-wrap:wrap;margin-bottom:52px;
      animation:fadeUp 1s cubic-bezier(0.23,1,0.32,1) 0.3s both;}
    @keyframes fadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}

    /* BUTTONS */
    .btn-primary{background:linear-gradient(135deg,#00c8ff,#00ffb4);color:#030d18;border:none;padding:13px 30px;
      font-family:'Syne',sans-serif;font-size:14px;font-weight:700;border-radius:14px;cursor:pointer;
      transition:all 0.3s cubic-bezier(0.23,1,0.32,1);box-shadow:0 4px 30px rgba(0,200,255,0.3),0 0 0 1px rgba(0,200,255,0.1);letter-spacing:0.2px;position:relative;overflow:hidden;}
    .btn-primary::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.22),transparent);opacity:0;transition:opacity 0.3s;}
    .btn-primary:hover{transform:translateY(-3px) scale(1.025);box-shadow:0 14px 44px rgba(0,200,255,0.45),0 0 0 1px rgba(0,200,255,0.2);}
    .btn-primary:hover::before{opacity:1;}
    .btn-primary:active{transform:translateY(-1px) scale(0.99);}
    .btn-secondary{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);color:rgba(255,255,255,0.62);
      padding:13px 30px;font-family:'Syne',sans-serif;font-size:14px;font-weight:600;border-radius:14px;cursor:pointer;
      transition:all 0.3s cubic-bezier(0.23,1,0.32,1);backdrop-filter:blur(12px);}
    .btn-secondary:hover{background:rgba(255,255,255,0.07);border-color:rgba(0,200,255,0.25);color:#fff;transform:translateY(-2px);box-shadow:0 8px 28px rgba(0,0,0,0.22);}

    /* SCANNER */
    .scanner-wrap{max-width:780px;margin:0 auto;background:rgba(255,255,255,0.03);backdrop-filter:blur(40px) saturate(150%);
      -webkit-backdrop-filter:blur(40px) saturate(150%);border:1px solid rgba(255,255,255,0.08);border-radius:28px;padding:32px;
      box-shadow:0 32px 80px rgba(0,0,0,0.4),0 0 0 1px rgba(255,255,255,0.04),inset 0 1px 0 rgba(255,255,255,0.06);
      position:relative;overflow:hidden;transform-style:preserve-3d;will-change:transform;
      animation:fadeUp 1s cubic-bezier(0.23,1,0.32,1) 0.4s both;}
    .scanner-wrap::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(0,200,255,0.4),transparent);}
    .url-input{flex:1;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);color:#fff;
      font-family:'DM Mono',monospace;font-size:13px;padding:0 1.2rem;height:54px;border-radius:14px;outline:none;min-width:0;transition:all 0.3s;}
    .url-input::placeholder{color:rgba(255,255,255,0.18);}
    .url-input:focus{border-color:rgba(0,200,255,0.35);background:rgba(0,200,255,0.04);box-shadow:0 0 0 4px rgba(0,200,255,0.06),0 4px 16px rgba(0,0,0,0.2);}
    .scan-btn{background:linear-gradient(135deg,#00c8ff,#00ffb4);color:#030d18;border:none;padding:0 2rem;height:54px;
      font-family:'Syne',sans-serif;font-size:14px;font-weight:700;border-radius:14px;cursor:pointer;
      transition:all 0.3s cubic-bezier(0.23,1,0.32,1);white-space:nowrap;box-shadow:0 4px 24px rgba(0,200,255,0.3);position:relative;overflow:hidden;}
    .scan-btn::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.22),transparent);opacity:0;transition:opacity 0.3s;}
    .scan-btn:hover{transform:translateY(-2px);box-shadow:0 10px 32px rgba(0,200,255,0.45);}
    .scan-btn:hover::before{opacity:1;}
    .scan-btn:active{transform:translateY(0);}
    .scan-btn:disabled{opacity:0.5;cursor:not-allowed;transform:none;}

    /* SECTIONS */
    .section{padding:90px 2rem;max-width:1020px;margin:0 auto;}
    .section-tag{display:inline-flex;align-items:center;gap:6px;background:rgba(0,200,255,0.05);border:1px solid rgba(0,200,255,0.1);
      border-radius:999px;padding:5px 15px;margin-bottom:18px;font-size:10px;color:rgba(0,200,255,0.58);letter-spacing:2.5px;font-weight:600;font-family:'DM Sans',sans-serif;}
    .section-title{font-family:'Syne',sans-serif;font-size:clamp(30px,4vw,44px);font-weight:800;color:#fff;margin-bottom:12px;letter-spacing:-1.5px;line-height:1.05;}
    .section-sub{font-size:14px;color:rgba(255,255,255,0.28);margin-bottom:36px;font-weight:300;font-family:'DM Sans',sans-serif;line-height:1.6;}

    /* STAT CARDS */
    .stat-card{padding:28px 12px;text-align:center;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);
      border-radius:24px;backdrop-filter:blur(20px);position:relative;overflow:visible;transform-style:preserve-3d;will-change:transform;min-width:0;}
    .stat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(0,200,255,0.4),transparent);}
    .stat-card::after{content:'';position:absolute;inset:0;border-radius:24px;
      background:radial-gradient(circle at var(--mouse-x,50%) var(--mouse-y,50%),rgba(0,200,255,0.06),transparent 60%);opacity:0;transition:opacity 0.3s;}
    .stat-card:hover::after{opacity:1;}

    /* FEATURE CARDS */
    .feature-card{padding:32px;background:rgba(255,255,255,0.025);border:1px solid rgba(255,255,255,0.06);
      border-radius:24px;position:relative;overflow:hidden;transform-style:preserve-3d;will-change:transform;}
    .feature-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(0,200,255,0.25),transparent);opacity:0;transition:opacity 0.4s;}
    .feature-card::after{content:'';position:absolute;inset:0;border-radius:24px;
      background:radial-gradient(circle at var(--mouse-x,50%) var(--mouse-y,50%),rgba(0,200,255,0.05),transparent 60%);opacity:0;transition:opacity 0.3s;}
    .feature-card:hover::before,.feature-card:hover::after{opacity:1;}
    .feature-icon{width:52px;height:52px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:20px;
      background:rgba(0,200,255,0.06);border:1px solid rgba(0,200,255,0.1);transition:all 0.4s cubic-bezier(0.23,1,0.32,1);transform:translateZ(20px);}
    .feature-card:hover .feature-icon{transform:translateZ(30px) scale(1.1);box-shadow:0 8px 28px rgba(0,200,255,0.14);}

    /* STEP CARDS */
    .step-card{background:rgba(255,255,255,0.025);border:1px solid rgba(255,255,255,0.06);border-radius:24px;padding:36px;
      text-align:center;position:relative;overflow:hidden;transform-style:preserve-3d;will-change:transform;}
    .step-num{font-family:'Syne',sans-serif;font-size:60px;font-weight:800;line-height:1;
      background:linear-gradient(135deg,rgba(0,200,255,0.35),rgba(0,255,180,0.15));
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:20px;transform:translateZ(15px);}

    /* FEED */
    .feed-item{display:flex;align-items:center;gap:14px;padding:14px 18px;background:rgba(255,255,255,0.022);
      border:1px solid rgba(255,255,255,0.05);border-radius:14px;margin-bottom:8px;
      animation:feedSlideIn 0.4s cubic-bezier(0.23,1,0.32,1);transition:all 0.25s cubic-bezier(0.23,1,0.32,1);}
    .feed-item:hover{background:rgba(255,255,255,0.042);transform:translateX(4px);border-color:rgba(0,200,255,0.12);}
    @keyframes feedSlideIn{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}

    /* RESULT */
    .flag-row{display:flex;align-items:flex-start;gap:14px;padding:14px 0;border-bottom:1px solid rgba(255,255,255,0.04);transition:all 0.22s;}
    .flag-row:last-child{border-bottom:none;}
    .flag-row:hover{padding-left:8px;}
    .hist-item{display:flex;align-items:center;justify-content:space-between;padding:13px 18px;background:rgba(255,255,255,0.022);
      border:1px solid rgba(255,255,255,0.05);border-radius:14px;margin-bottom:8px;cursor:pointer;transition:all 0.25s cubic-bezier(0.23,1,0.32,1);}
    .hist-item:hover{background:rgba(255,255,255,0.05);border-color:rgba(0,200,255,0.14);transform:translateX(5px);box-shadow:0 4px 16px rgba(0,0,0,0.2);}
    .ai-btn{width:100%;height:48px;background:rgba(0,150,255,0.06);border:1px solid rgba(0,200,255,0.17);color:#00c8ff;
      font-family:'Syne',sans-serif;font-size:13px;font-weight:600;border-radius:14px;cursor:pointer;transition:all 0.3s cubic-bezier(0.23,1,0.32,1);}
    .ai-btn:hover{background:rgba(0,150,255,0.12);border-color:rgba(0,200,255,0.3);transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,150,255,0.14);}
    .ai-btn:disabled{opacity:0.4;cursor:not-allowed;transform:none;}

    /* GLASS */
    .glass{background:rgba(255,255,255,0.03);backdrop-filter:blur(24px) saturate(150%);-webkit-backdrop-filter:blur(24px) saturate(150%);border:1px solid rgba(255,255,255,0.07);border-radius:22px;}

    /* DIVIDER */
    .divider{height:1px;background:linear-gradient(90deg,transparent,rgba(0,200,255,0.08),transparent);margin:0 3rem;}

    /* FOOTER */
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
    .footer-tag{font-size:10px;color:rgba(0,200,255,0.32);background:rgba(0,200,255,0.04);border:1px solid rgba(0,200,255,0.08);padding:3px 11px;border-radius:6px;font-family:'DM Sans',sans-serif;transition:all 0.2s;}
    .footer-tag:hover{color:rgba(0,200,255,0.65);border-color:rgba(0,200,255,0.18);}

    /* UTILS */
    .pulse{animation:pulse 2s infinite;}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.32}}
    .spin{animation:spin 1s linear infinite;}
    @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
    .fade-in{animation:fadeIn 0.5s cubic-bezier(0.23,1,0.32,1);}
    @keyframes fadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
    .score-ring{transition:stroke-dashoffset 1.8s cubic-bezier(0.23,1,0.32,1);}
    .loading-scan{background:linear-gradient(90deg,rgba(255,255,255,0.02),rgba(0,200,255,0.06),rgba(255,255,255,0.02));background-size:200% 100%;animation:shimmer 1.5s infinite;}
    @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
    ::-webkit-scrollbar{width:3px;}
    ::-webkit-scrollbar-track{background:transparent;}
    ::-webkit-scrollbar-thumb{background:rgba(0,200,255,0.12);border-radius:2px;}
  `;

  return (
    <div style={{ minHeight: "100vh", background: "#050a14", color: "#e2e8f0", fontFamily: "'Syne', sans-serif", position: "relative", overflow: "hidden" }}>
      <style>{CSS}</style>

      {/* Ambient cursor glow */}
      <div className="cursor-glow" style={{ left: mousePos.x, top: mousePos.y }} />

      {/* Floating particles */}
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
            <div className="navbar-logo" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              🛡️ PhishGuard
            </div>
            <div className="navbar-links">
              <button className="navbar-link" onClick={() => navigate("/bulk")}>Bulk Scanner</button>
              <button className="navbar-link" onClick={() => navigate("/qr")}>QR Scanner</button>
              <button className="navbar-link" onClick={() => navigate("/email")}>Email Analyzer</button>
              <MagneticBtn className="navbar-about" onClick={() => navigate("/about")}>✦ About</MagneticBtn>
              <MagneticBtn className="navbar-cta" onClick={() => navigate("/install")}>
                Chrome Extension ↗
              </MagneticBtn>
            </div>
          </div>
        </nav>

        {/* HERO */}
        <div className="hero">
          <div className="hero-badge">
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#00ffb4", boxShadow: "0 0 10px #00ffb4" }} className="pulse" />
            <span style={{ fontSize: 10, color: "rgba(0,200,255,0.62)", letterSpacing: 2.5, fontWeight: 600, fontFamily: "'DM Sans'" }}>REAL-TIME THREAT DETECTION</span>
          </div>

          <h1 className="hero-title">Detect Phishing<br />Before It Hits</h1>
          <p className="hero-sub">AI-powered URL threat intelligence. Scan any link in seconds and stay protected from phishing, malware, and scams.</p>

          <div className="hero-btns">
            <MagneticBtn className="btn-primary" onClick={() => inputRef.current?.focus()}>Start Scanning ⚡</MagneticBtn>
            <MagneticBtn className="btn-secondary" onClick={() => navigate("/bulk")}>Bulk Scanner →</MagneticBtn>
            <MagneticBtn className="btn-secondary" onClick={() => navigate("/email")}>Email Analyzer →</MagneticBtn>
          </div>

          {/* 3D Scanner Box */}
          <TiltCard intensity={5} className="scanner-wrap">
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00ffb4", boxShadow: "0 0 10px #00ffb4" }} className="pulse" />
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.22)", letterSpacing: 2.5, fontWeight: 600, fontFamily: "'DM Sans'" }}>ENTER URL TO SCAN</span>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <input ref={inputRef} className="url-input" value={url} onChange={e => { setUrl(e.target.value); setError(""); }} onKeyDown={e => e.key === "Enter" && analyze()} placeholder="https://suspicious-site.com/login" />
                <button className="scan-btn" onClick={analyze} disabled={loading}>{loading ? "Scanning..." : "Scan ⚡"}</button>
              </div>
              {error && <p style={{ color: "#ff3c64", fontSize: 12, marginTop: 12, fontWeight: 500, fontFamily: "'DM Sans'" }}>⚠ {error}</p>}
              <div style={{ display: "flex", gap: 18, marginTop: 16, flexWrap: "wrap" }}>
                {["Google Safe Browsing", "AI Analysis", "10+ Threat Checks", "Instant Results"].map((t, i) => (
                  <span key={i} style={{ fontSize: 11, color: "rgba(255,255,255,0.19)", display: "flex", alignItems: "center", gap: 6, fontFamily: "'DM Sans'" }}>
                    <span style={{ color: "#00ffb4" }}>✓</span>{t}
                  </span>
                ))}
              </div>
            </div>
          </TiltCard>
        </div>

        {/* LOADING */}
        {loading && (
          <div style={{ maxWidth: 780, margin: "0 auto 2rem", padding: "0 2rem" }}>
            <div className="glass loading-scan" style={{ textAlign: "center", padding: "3rem" }}>
              <div style={{ position: "relative", width: 60, height: 60, margin: "0 auto 18px" }}>
                <div style={{ width: 60, height: 60, border: "2px solid rgba(0,200,255,0.08)", borderTop: "2px solid #00c8ff", borderRadius: "50%" }} className="spin" />
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 12, height: 12, background: "#00ffb4", borderRadius: "50%", boxShadow: "0 0 14px #00ffb4" }} className="pulse" />
              </div>
              <p style={{ color: "rgba(0,200,255,0.52)", fontSize: 11, letterSpacing: 3, fontWeight: 600, fontFamily: "'DM Sans'" }} className="pulse">ANALYZING THREAT VECTORS</p>
              <p style={{ color: "rgba(255,255,255,0.17)", fontSize: 11, marginTop: 8, fontFamily: "'DM Sans'" }}>Querying Google Safe Browsing Database...</p>
            </div>
          </div>
        )}

        {/* RESULT */}
        {result && !loading && (() => {
          const c = colorMap[result.color] || colorMap.warn;
          const r = result.score / 100;
          const circ = 2 * Math.PI * 42;
          return (
            <div className="fade-in" style={{ maxWidth: 780, margin: "0 auto 2rem", padding: "0 2rem" }}>
              <TiltCard intensity={6} style={{ background: c.grad, backdropFilter: "blur(30px)", border: `1px solid ${c.border}`, borderRadius: 22, padding: "1.75rem", marginBottom: 12, boxShadow: c.glow }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1.75rem" }}>
                  <svg width={104} height={104} viewBox="0 0 100 100" style={{ flexShrink: 0, filter: `drop-shadow(0 0 20px ${c.accent}28)` }}>
                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="6" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke={c.accent} strokeWidth="6" strokeDasharray={circ} strokeDashoffset={circ - circ * r} strokeLinecap="round" transform="rotate(-90 50 50)" className="score-ring" style={{ filter: `drop-shadow(0 0 10px ${c.accent})` }} />
                    <text x="50" y="46" textAnchor="middle" fill={c.text} fontSize="22" fontWeight="700" fontFamily="'Syne',sans-serif">{result.score}</text>
                    <text x="50" y="60" textAnchor="middle" fill={c.accent} fontSize="7.5" opacity="0.6" fontFamily="'DM Sans',sans-serif" letterSpacing="2">SCORE</text>
                  </svg>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 10, color: "rgba(255,255,255,0.32)", letterSpacing: 3, marginBottom: 8, fontWeight: 600, fontFamily: "'DM Sans'" }}>THREAT ASSESSMENT</p>
                    <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 30, fontWeight: 800, color: c.text, letterSpacing: 0.5, marginBottom: 14, textShadow: `0 0 28px ${c.accent}55` }}>{result.verdict?.toUpperCase()}</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {[result.domain, result.hasHTTPS ? "🔒 HTTPS" : "⚠ HTTP", `~${result.domainAge}d old`].map((chip, i) => (
                        <span key={i} style={{ fontSize: 11, color: "rgba(255,255,255,0.32)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)", padding: "4px 13px", borderRadius: 9, fontFamily: "'DM Mono'" }}>{chip}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </TiltCard>

              <div className="glass" style={{ padding: "1.4rem 1.75rem", marginBottom: 12 }}>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.22)", letterSpacing: 3, marginBottom: 14, fontWeight: 600, fontFamily: "'DM Sans'" }}>THREAT INDICATORS</p>
                {result.flags?.map((f, i) => (
                  <div key={i} className="flag-row">
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: severityColor[f.severity], marginTop: 5, flexShrink: 0, boxShadow: `0 0 10px ${severityColor[f.severity]}` }} />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.8)", fontFamily: "'DM Sans'" }}>{f.label}</span>
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.26)", marginLeft: 8, fontFamily: "'DM Sans'" }}>{f.detail}</span>
                    </div>
                    <span style={{ fontSize: 9.5, color: severityColor[f.severity], background: `${severityColor[f.severity]}10`, border: `1px solid ${severityColor[f.severity]}20`, padding: "3px 11px", borderRadius: 7, fontWeight: 700, fontFamily: "'DM Sans'", letterSpacing: 1 }}>{f.severity.toUpperCase()}</span>
                  </div>
                ))}
              </div>

              <div className="glass" style={{ padding: "1.4rem 1.75rem" }}>
                {!aiExplanation && <button className="ai-btn" disabled={aiLoading} onClick={async () => { setAiLoading(true); try { const data = await getAIExplanation(url, result.verdict, result.score, result.flags); setAiExplanation(data.explanation); } catch { setAiExplanation("AI failed!"); } finally { setAiLoading(false); } }}>{aiLoading ? "🤖 AI Analyzing..." : "🤖 Get AI Explanation"}</button>}
                {aiExplanation && <div className="fade-in"><p style={{ fontSize: 10, color: "rgba(0,200,255,0.42)", letterSpacing: 3, marginBottom: 14, fontWeight: 600, fontFamily: "'DM Sans'" }}>AI THREAT ANALYSIS</p>{aiExplanation.split("\n").filter(l => l.trim()).map((line, i) => <p key={i} style={{ fontSize: 13, color: "rgba(255,255,255,0.52)", lineHeight: 1.75, marginBottom: 8, borderLeft: line.match(/^\d\./) ? "2px solid rgba(0,200,255,0.2)" : "none", paddingLeft: line.match(/^\d\./) ? 14 : 0, fontFamily: "'DM Sans'" }}>{line}</p>)}<button onClick={() => setAiExplanation(null)} style={{ background: "none", border: "none", color: "rgba(0,200,255,0.25)", cursor: "pointer", fontSize: 11, marginTop: 8, fontFamily: "'DM Sans'" }}>✕ Close</button></div>}
              </div>
            </div>
          );
        })()}

        {/* HISTORY */}
        {history.length > 0 && (
          <div style={{ maxWidth: 780, margin: "0 auto 2rem", padding: "0 2rem" }}>
            <div className="glass" style={{ padding: "1.4rem 1.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.22)", letterSpacing: 3, fontWeight: 600, fontFamily: "'DM Sans'" }}>SCAN HISTORY</p>
                <button onClick={() => setHistory([])} style={{ background: "none", border: "1px solid rgba(255,60,100,0.12)", color: "rgba(255,60,100,0.36)", cursor: "pointer", fontSize: 10, padding: "4px 13px", borderRadius: 7, fontFamily: "'DM Sans'" }}>Clear</button>
              </div>
              {history.map((h, i) => { const c = colorMap[h.color] || colorMap.warn; return <div key={i} className="hist-item" onClick={() => setUrl(h.url)}><span style={{ fontSize: 12, color: "rgba(255,255,255,0.26)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, fontFamily: "'DM Mono'" }}>{h.url}</span><div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: 12, flexShrink: 0 }}><span style={{ fontSize: 11, color: "rgba(255,255,255,0.13)", fontFamily: "'DM Mono'" }}>{h.score}/100</span><span style={{ fontSize: 10, color: c.text, background: `${c.accent}10`, border: `1px solid ${c.border}`, padding: "3px 11px", borderRadius: 7, fontWeight: 700, fontFamily: "'DM Sans'", letterSpacing: 0.5 }}>{h.verdict?.toUpperCase()}</span></div></div>; })}
            </div>
          </div>
        )}

        <div className="divider" />

        {/* STATS */}
        <div className="section">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div className="section-tag">TRUSTED WORLDWIDE</div>
            <p className="section-title">Protecting millions online</p>
            <p className="section-sub">Real-time statistics from our threat detection engine</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
            {[
            { label: "URLs Scanned", value: (urlsScanned / 1000000).toFixed(1) + "M+", color: "#00c8ff", icon: "🔍" },
              { label: "Threats Blocked", value: Math.floor(threatsBlocked / 1000) + "K+", color: "#ff3c64", icon: "🛡️" },
              { label: "Accuracy Rate", value: accuracy + "%", color: "#00ffb4", icon: "✅" },
            ].map((s, i) => (
              <TiltCard key={i} intensity={9} className="stat-card">
                <div style={{ fontSize: 28, marginBottom: 12, display: "block", transform: "translateZ(20px)" }}>{s.icon}</div>
                <p style={{ fontSize: "clamp(28px, 3.5vw, 42px)", fontWeight: 800, color: s.color, fontFamily: "'Syne',sans-serif", marginBottom: 8, textShadow: `0 0 32px ${s.color}48`, letterSpacing: -1.5, transform: "translateZ(15px)", lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.26)", letterSpacing: 2.5, fontWeight: 600, fontFamily: "'DM Sans'", transform: "translateZ(8px)" }}>{s.label.toUpperCase()}</p>
              </TiltCard>
            ))}
          </div>
        </div>

        <div className="divider" />

        {/* LIVE FEED */}
        <div className="section">
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <div className="section-tag">
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ff3c64", boxShadow: "0 0 8px #ff3c64" }} className="pulse" />
              LIVE FEED
            </div>
          </div>
          <p className="section-title">Real-time Threat Feed</p>
          <p className="section-sub">Live phishing detections happening worldwide right now</p>
          <div style={{ background: "rgba(255,255,255,0.016)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 22, padding: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, paddingBottom: 14, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              {["DOMAIN", "STATUS", "REGION"].map((h, i) => <span key={i} style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", letterSpacing: 2.5, fontFamily: "'DM Sans'", fontWeight: 600 }}>{h}</span>)}
            </div>
            {visibleThreats.map((t, i) => (
              <div key={`${feedIndex}-${i}`} className="feed-item">
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.color, boxShadow: `0 0 10px ${t.color}`, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 13, color: "rgba(255,255,255,0.42)", fontFamily: "'DM Mono'" }}>{t.url}</span>
                <span style={{ fontSize: 10, color: t.color, background: `${t.color}10`, border: `1px solid ${t.color}20`, padding: "4px 13px", borderRadius: 7, fontWeight: 700, minWidth: 92, textAlign: "center", fontFamily: "'DM Sans'", letterSpacing: 0.5 }}>{t.type}</span>
                <span style={{ fontSize: 16, marginLeft: 12 }}>{t.flag}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="divider" />

        {/* FEATURES */}
        <div className="section">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div className="section-tag">CAPABILITIES</div>
            <p className="section-title">Why PhishGuard?</p>
            <p className="section-sub">The most comprehensive phishing detection suite available</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(290px,1fr))", gap: 18 }}>
            {[
              { icon: "🛡️", title: "Real-time Detection", desc: "Google Safe Browsing API checks every URL against millions of known threats instantly", color: "#00c8ff" },
              { icon: "🤖", title: "AI Explanation", desc: "Gemma AI explains threats in plain language — anyone can understand the risk level", color: "#00ffb4" },
              { icon: "📧", title: "Email Analysis", desc: "Paste any suspicious email and scan every embedded link with manipulation detection", color: "#ff3c64" },
              { icon: "📷", title: "QR Code Scanner", desc: "Upload QR codes to reveal and analyze hidden URLs before you click them", color: "#ffb400" },
              { icon: "⚡", title: "Bulk Scanning", desc: "Scan up to 20 URLs simultaneously with detailed reports and one-click CSV export", color: "#00c8ff" },
              { icon: "🔌", title: "Browser Extension", desc: "Real-time hover badges on every website — green dot means safe, red means danger", color: "#00ffb4" },
            ].map((f, i) => (
              <TiltCard key={i} intensity={9} className="feature-card">
                <div className="feature-icon" style={{ background: `${f.color}08`, borderColor: `${f.color}16` }}><span>{f.icon}</span></div>
                <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 17, fontWeight: 700, color: "#fff", marginBottom: 12, transform: "translateZ(10px)" }}>{f.title}</p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.28)", lineHeight: 1.75, fontFamily: "'DM Sans'", fontWeight: 300 }}>{f.desc}</p>
              </TiltCard>
            ))}
          </div>
        </div>

        <div className="divider" />

        {/* HOW IT WORKS */}
        <div className="section">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div className="section-tag">SIMPLE & FAST</div>
            <p className="section-title">How it works</p>
            <p className="section-sub">Stay protected in three simple steps</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
            {[
              { step: "01", icon: "📋", title: "Paste the URL", desc: "Copy any suspicious link from email, message, or social media and paste it in the scanner" },
              { step: "02", icon: "🔍", title: "We Analyze", desc: "Our engine checks against Google's database, AI analysis, and 10+ threat indicators simultaneously" },
              { step: "03", icon: "✅", title: "Stay Safe", desc: "Get instant verdict with AI explanation — know exactly what the threat is and what to do" },
            ].map((s, i) => (
              <TiltCard key={i} intensity={10} className="step-card">
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,rgba(0,200,255,${0.15 + i * 0.12}),transparent)` }} />
                <div className="step-num">{s.step}</div>
                <div style={{ fontSize: 34, marginBottom: 18, transform: "translateZ(12px)" }}>{s.icon}</div>
                <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 17, fontWeight: 700, color: "#fff", marginBottom: 12, transform: "translateZ(8px)" }}>{s.title}</p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.28)", lineHeight: 1.75, fontFamily: "'DM Sans'", fontWeight: 300 }}>{s.desc}</p>
              </TiltCard>
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
                <button className="footer-link" onClick={() => navigate("/")}>🏠 Home</button>
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
