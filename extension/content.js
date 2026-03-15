const cache = {};

function getBadge(color) {
  const colors = {
    safe: { bg: "#00ff88", border: "#00cc66" },
    warn: { bg: "#ffaa00", border: "#cc8800" },
    danger: { bg: "#ff003c", border: "#cc0030" },
  };
  return colors[color] || { bg: "#1a1a2e", border: "#00ff88" };
}

let pgCounter = 0;

function createBadge(link) {
  const existing = link._pgBadgeHost;
  if (existing) existing.remove();

  const host = document.createElement("span");
  host.style.cssText = "all: initial; display: inline-block; vertical-align: middle; margin-left: 5px;";

  const shadow = host.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = `
    .badge {
      all: initial;
      display: inline-block !important;
      width: 12px !important;
      height: 12px !important;
      border-radius: 50% !important;
      pointer-events: none !important;
      background: #333 !important;
      border: 2px solid #555 !important;
      box-sizing: border-box !important;
    }
    .safe {
      background: #00ff88 !important;
      border-color: #00cc66 !important;
      box-shadow: 0 0 6px #00ff88 !important;
    }
    .warn {
      background: #ffaa00 !important;
      border-color: #cc8800 !important;
      box-shadow: 0 0 6px #ffaa00 !important;
    }
    .danger {
      background: #ff003c !important;
      border-color: #cc0030 !important;
      box-shadow: 0 0 6px #ff003c !important;
    }
    .loading {
      all: initial;
      display: inline-block !important;
      width: 12px !important;
      height: 12px !important;
      border-radius: 50% !important;
      border: 2px solid #333 !important;
      border-top: 2px solid #00ff88 !important;
      box-sizing: border-box !important;
      animation: spin 1s linear infinite !important;
      pointer-events: none !important;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;

  const badge = document.createElement("span");
  badge.className = "loading";

  shadow.appendChild(style);
  shadow.appendChild(badge);

  link._pgBadgeHost = host;
  link._pgBadge = badge;
  link._pgShadow = shadow;

  link.after(host);
  return { host, badge, shadow };
}

function setBadgeResult(link, color) {
  if (!link._pgShadow) return;
  const old = link._pgShadow.querySelector(".loading, .badge");
  if (!old) return;

  const newBadge = document.createElement("span");
  newBadge.className = `badge ${color}`;
  old.replaceWith(newBadge);
  link._pgBadge = newBadge;
}

async function checkURL(url) {
  if (cache[url]) return cache[url];
  try {
    const res = await fetch("http://localhost:5000/api/check-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    cache[url] = data;
    return data;
  } catch {
    return null;
  }
}

function applyOutline(link, color) {
  if (color === "danger") {
    link.style.outline = "2px solid #ff003c";
    link.style.outlineOffset = "2px";
  } else if (color === "warn") {
    link.style.outline = "2px solid #ffaa00";
    link.style.outlineOffset = "2px";
  } else {
    link.style.outline = "2px solid #00ff88";
    link.style.outlineOffset = "2px";
  }
}

function handleLink(link) {
  if (link._phishguard) return;

  const linkText = link.textContent.trim();
  const isURLText = /^https?:\/\//.test(linkText) || /^www\./.test(linkText);
  if (isURLText) return;
  if (linkText.length < 3) return;

  link._phishguard = true;
  link._pgid = ++pgCounter;

  link.addEventListener("mouseenter", async () => {
    const href = link.href;
    if (!href || !href.startsWith("http")) return;

    createBadge(link);

    if (cache[href]) {
      setBadgeResult(link, cache[href].color);
      applyOutline(link, cache[href].color);
      return;
    }

    const result = await checkURL(href);

    if (!result) {
      setBadgeResult(link, "warn");
      return;
    }

    setBadgeResult(link, result.color);
    applyOutline(link, result.color);
  });

  link.addEventListener("mouseleave", () => {
    if (link._pgBadgeHost) {
      link._pgBadgeHost.remove();
      link._pgBadgeHost = null;
      link._pgBadge = null;
      link._pgShadow = null;
    }
    link.style.outline = "";
    link._phishguard = false;
  });
}

function scanAllLinks() {
  document.querySelectorAll("a[href]").forEach(handleLink);
}

scanAllLinks();

const observer = new MutationObserver(() => scanAllLinks());
observer.observe(document.body, { childList: true, subtree: true });