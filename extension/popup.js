const colorMap = {
  safe: { bg: "#0d2e1a", accent: "#22c55e", text: "#4ade80" },
  warn: { bg: "#2d1f00", accent: "#f59e0b", text: "#fbbf24" },
  danger: { bg: "#2d0a0a", accent: "#ef4444", text: "#f87171" },
};

const severityColor = {
  safe: "#22c55e",
  low: "#f59e0b",
  medium: "#f97316",
  high: "#ef4444",
};

async function analyzeURL(url) {
  const res = await fetch("http://https://phishguard-backend-6cq9.onrender.com/api/check-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  return await res.json();
}

function showLoader(show) {
  document.getElementById("loader").style.display = show ? "block" : "none";
  document.getElementById("scanBtn").disabled = show;
}

function showResult(data) {
  const resultEl = document.getElementById("result");
  const c = colorMap[data.color] || colorMap.warn;

  const flagsHTML = (data.flags || []).map(f => `
    <div class="flag-item">
      <div class="flag-dot" style="background:${severityColor[f.severity]};box-shadow:0 0 6px ${severityColor[f.severity]}66"></div>
      <div>
        <span class="flag-label">${f.label}</span>
        <div class="flag-detail">${f.detail}</div>
      </div>
      <span class="flag-badge" style="color:${severityColor[f.severity]};background:${severityColor[f.severity]}18;border:1px solid ${severityColor[f.severity]}33">
        ${f.severity.toUpperCase()}
      </span>
    </div>
  `).join("");

  resultEl.innerHTML = `
    <div class="result-header" style="background:${c.bg};border:1px solid ${c.accent}33">
      <div class="score-circle" style="color:${c.text};border-color:${c.accent}">
        <span class="score-num" style="color:${c.text}">${data.score}</span>
        <span class="score-label" style="color:${c.accent}">SCORE</span>
      </div>
      <div>
        <div class="verdict-text" style="color:${c.text}">${data.verdict?.toUpperCase()}</div>
        <div class="verdict-domain">${data.domain || ""}</div>
        <div style="font-size:10px;color:#4a7a8a;margin-top:4px">
          ${data.hasHTTPS ? "🔒 HTTPS" : "⚠ HTTP"} &nbsp;|&nbsp; ~${data.domainAge} days old
        </div>
      </div>
    </div>
    <div class="flags">${flagsHTML}</div>
  `;

  resultEl.style.display = "block";
}

// Get current tab URL
document.addEventListener("DOMContentLoaded", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab?.url || "";

  const urlEl = document.getElementById("currentUrl");
  urlEl.textContent = url || "Unknown";

  // Scan button
  document.getElementById("scanBtn").addEventListener("click", async () => {
    if (!url) return;
    showLoader(true);
    document.getElementById("result").style.display = "none";
    try {
      const data = await analyzeURL(url);
      showResult(data);
    } catch (err) {
      showResult({
        score: 0, verdict: "Error", color: "warn",
        flags: [{ label: "Connection Error", detail: "Make sure backend is running!", severity: "high" }],
        domain: "", hasHTTPS: false, domainAge: 0,
      });
    } finally {
      showLoader(false);
    }
  });

  // Open full app
  document.getElementById("openApp").addEventListener("click", () => {
    chrome.tabs.create({ url: "http://localhost:5173" });
  });
});