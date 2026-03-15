chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "phishguard-scan",
    title: "🛡️ Scan with PhishGuard",
    contexts: ["link"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "phishguard-scan") {
    chrome.tabs.create({
      url: `https://phishguard-wine.vercel.app/?url=${encodeURIComponent(info.linkUrl)}`,
    });
  }
});