const colorMap = {
  safe:   { bg: "rgba(0,255,180,0.08)",   accent: "#00ffb4", text: "#00ffb4", border: "rgba(0,255,180,0.2)",   glow: "rgba(0,255,180,0.15)"   },
  warn:   { bg: "rgba(255,180,0,0.08)",   accent: "#ffb400", text: "#ffb400", border: "rgba(255,180,0,0.2)",   glow: "rgba(255,180,0,0.15)"   },
  danger: { bg: "rgba(255,60,100,0.08)",  accent: "#ff3c64", text: "#ff3c64", border: "rgba(255,60,100,0.2)", glow: "rgba(255,60,100,0.15)" },
};

const severityColor = {
  safe:   "#00ffb4",
  low:    "#ffb400",
  medium: "#ff8c00",
  high:   "#ff3c64",
};

async function analyzeURL(url) {
  const res = await fetch("https://phishguard-backend-6cq9.onrender.com/api/check-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  return await res.json();
}

function showLoader(show) {
  document.getElementById("loader").style.display = show ? "block" : "none";
  document.getElementById("scanBtn").disabled = show;
  if (show) document.getElementById("result").style.display = "none";
}

function showResult(data) {
  const resultEl = document.getElementById("result");
  const c = colorMap[data.color] || colorMap.warn;
  const score = data.score || 0;
  const r = score / 100;
  const circ = 2 * Math.PI * 26;
  const offset = circ - circ * r;

  const flagsHTML = (data.flags || []).map(f => `
    <div class="flag-item">
      <div class="flag-dot" style="background:${severityColor[f.severity]};box-shadow:0 0 8px ${severityColor[f.severity]}80"></div>
      <div class="flag-content">
        <div class="flag-label">${f.label}</div>
        <div class="flag-detail">${f.detail}</div>
      </div>
      <span class="flag-badge" style="color:${severityColor[f.severity]};background:${severityColor[f.severity]}18;border:1px solid ${severityColor[f.severity]}30">
        ${f.severity.toUpperCase()}
      </span>
    </div>
  `).join("");

  resultEl.innerHTML = `
    <div class="result-card" style="background:${c.bg};border:1px solid ${c.border};box-shadow:0 8px 32px ${c.glow};">
      <div class="result-inner">
        <svg class="score-svg" width="68" height="68" viewBox="0 0 68 68" style="color:${c.accent}">
          <circle cx="34" cy="34" r="26" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="4"/>
          <circle cx="34" cy="34" r="26" fill="none" stroke="${c.accent}" stroke-width="4"
            stroke-dasharray="${circ}" stroke-dashoffset="${offset}"
            stroke-linecap="round" transform="rotate(-90 34 34)"
            class="score-ring" style="filter:drop-shadow(0 0 6px ${c.accent})"/>
          <text x="34" y="30" text-anchor="middle" fill="${c.text}" font-size="16" font-weight="800" font-family="Syne,sans-serif">${score}</text>
          <text x="34" y="42" text-anchor="middle" fill="${c.accent}" font-size="6" opacity="0.6" font-family="DM Sans,sans-serif" letter-spacing="1">SCORE</text>
        </svg>
        <div class="verdict-section">
          <div class="verdict-label">THREAT ASSESSMENT</div>
          <div class="verdict-text" style="color:${c.text};text-shadow:0 0 20px ${c.accent}60">${(data.verdict || "Unknown").toUpperCase()}</div>
          <div class="verdict-chips">
            <span class="chip">${data.domain || "unknown"}</span>
            <span class="chip">${data.hasHTTPS ? "🔒 HTTPS" : "⚠ HTTP"}</span>
            <span class="chip">~${data.domainAge || 0}d</span>
          </div>
        </div>
      </div>
    </div>
    <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:12px 14px;">
      <div class="flags-title">THREAT INDICATORS</div>
      <div>${flagsHTML}</div>
    </div>
  `;

  resultEl.style.display = "block";
}

document.addEventListener("DOMContentLoaded", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab?.url || "";

  const urlEl = document.getElementById("currentUrl");
  urlEl.textContent = url || "Unknown";

  document.getElementById("scanBtn").addEventListener("click", async () => {
    if (!url) return;
    showLoader(true);
    try {
      const data = await analyzeURL(url);
      showResult(data);
    } catch (err) {
      showResult({
        score: 0, verdict: "Error", color: "warn",
        flags: [{ label: "Connection Error", detail: "Backend unreachable — check your connection", severity: "high" }],
        domain: "", hasHTTPS: false, domainAge: 0,
      });
    } finally {
      showLoader(false);
    }
  });

  document.getElementById("openApp").addEventListener("click", () => {
    chrome.tabs.create({ url: "https://phishguard-wine.vercel.app/" });
  });
});
