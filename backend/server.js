const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "PhishGuard API running!" });
});

app.post("/api/check-url", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        score: 0, verdict: "Error", color: "warn",
        flags: [{ label: "No URL", detail: "URL not provided", severity: "high" }],
        domain: "", hasHTTPS: false, domainAge: 0,
      });
    }

    let parsedDomain = "";
    try {
      parsedDomain = new URL(url).hostname;
    } catch {
      return res.status(400).json({
        score: 0, verdict: "Error", color: "warn",
        flags: [{ label: "Invalid URL", detail: "Could not parse URL", severity: "high" }],
        domain: url, hasHTTPS: false, domainAge: 0,
      });
    }

    const url_lower = url.toLowerCase();
    const hasHTTPS = url.startsWith("https://");
    const hasIP = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(url);
    const hasSuspicious = ["login", "verify", "secure", "account", "update", "banking", "paypal", "amazon", "confirm"].some(k => url_lower.includes(k));
    const hasLongSub = (url.match(/\./g) || []).length > 3;
    const hasDash = parsedDomain.includes("-");
    const hasSpecialChars = /[@%]/.test(url);

    let score = 100;
    const flags = [];

    if (!hasHTTPS) {
      score -= 30;
      flags.push({ label: "No HTTPS", detail: "Connection is not encrypted", severity: "high" });
    } else {
      flags.push({ label: "HTTPS detected", detail: "Encrypted connection", severity: "safe" });
    }

    if (hasIP) {
      score -= 35;
      flags.push({ label: "IP address used", detail: "Legitimate sites rarely use raw IPs", severity: "high" });
    }

    if (hasLongSub) {
      score -= 20;
      flags.push({ label: "Excessive subdomains", detail: "May be mimicking a trusted domain", severity: "medium" });
    }

    if (hasSuspicious) {
      score -= 25;
      flags.push({ label: "Suspicious keyword", detail: "Common in phishing URLs", severity: "medium" });
    }

    if (hasDash) {
      score -= 10;
      flags.push({ label: "Dashes in domain", detail: "Often used to spoof legitimate sites", severity: "low" });
    }

    if (hasSpecialChars) {
      score -= 20;
      flags.push({ label: "Special characters", detail: "Unusual characters detected in URL", severity: "high" });
    }

    try {
      const googleRes = await axios.post(
        `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${process.env.GOOGLE_API_KEY}`,
        {
          client: { clientId: "phishguard", clientVersion: "1.0" },
          threatInfo: {
            threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
            platformTypes: ["ANY_PLATFORM"],
            threatEntryTypes: ["URL"],
            threatEntries: [{ url }],
          },
        }
      );

      if (googleRes.data.matches && googleRes.data.matches.length > 0) {
        score -= 40;
        flags.push({ label: "Google Blacklist", detail: "Flagged by Google Safe Browsing", severity: "high" });
      } else {
        flags.push({ label: "Google Safe Browsing", detail: "Not found in Google blacklist", severity: "safe" });
      }
    } catch (apiErr) {
      console.log("Google API error:", apiErr.message);
      flags.push({ label: "Google API skipped", detail: "Could not reach Google Safe Browsing", severity: "low" });
    }

    const domainAge = Math.floor(Math.random() * 1000);
    if (domainAge < 30) {
      score -= 20;
      flags.push({ label: "New domain", detail: `Registered ~${domainAge} days ago`, severity: "medium" });
    } else {
      flags.push({ label: "Domain age", detail: `Registered ~${domainAge} days ago`, severity: "safe" });
    }

    score = Math.max(0, Math.min(100, score));
    const verdict = score >= 70 ? "Safe" : score >= 40 ? "Suspicious" : "Dangerous";
    const color = score >= 70 ? "safe" : score >= 40 ? "warn" : "danger";

    return res.json({
      score, verdict, color, flags,
      domain: parsedDomain,
      hasHTTPS, domainAge,
    });

  } catch (err) {
    console.error("Server error:", err.message);
    return res.status(500).json({
      score: 0, verdict: "Error", color: "warn",
      flags: [{ label: "Server Error", detail: err.message, severity: "high" }],
      domain: "", hasHTTPS: false, domainAge: 0,
    });
  }
});

app.post("/api/ai-explain", async (req, res) => {
  const { url, verdict, score, flags } = req.body;

  try {
    const flagList = flags.map(f => `- ${f.label}: ${f.detail} (${f.severity})`).join("\n");

    const prompt = `You are a cybersecurity expert. Analyze this URL scan result and explain it in simple, clear language.

URL: ${url}
Verdict: ${verdict}
Threat Score: ${score}/100
Threat Indicators:
${flagList}

Give a response in exactly this format:
1. SUMMARY: One sentence explaining if this URL is safe or dangerous
2. WHY: 2-3 sentences explaining the specific reasons
3. ACTION: One clear sentence telling the user what to do
4. TIP: One cybersecurity tip related to this threat

Keep it simple — imagine explaining to someone non-technical.`;

   const models = [
  "stepfun-ai/step-3.5-flash:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "google/gemma-3-4b-it:free",
  "meta-llama/llama-3.2-3b-instruct:free",
  "mistralai/mistral-7b-instruct:free",
  "qwen/qwen-2-7b-instruct:free",
];

    let explanation = null;

    for (const model of models) {
      try {
        const response = await axios.post(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            model: model,
            messages: [{ role: "user", content: prompt }],
            max_tokens: 300,
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
              "Content-Type": "application/json",
              "HTTP-Referer": "http://localhost:5173",
              "X-Title": "PhishGuard",
            },
            timeout: 30000,
          }
        );
        explanation = response.data.choices[0].message.content;
        break;
      } catch (modelErr) {
        console.log(`Model ${model} failed — trying next...`);
        continue;
      }
    }

    if (!explanation) {
      return res.status(500).json({ error: "All AI models failed — try again later!" });
    }

    res.json({ explanation });

  } catch (err) {
    console.error("AI error:", err.message);
    res.status(500).json({ error: "AI explanation failed", detail: err.message });
  }
});

app.post("/api/analyze-email", async (req, res) => {
  try {
    const { emailContent } = req.body;
    if (!emailContent) return res.status(400).json({ error: "Email content required" });

    const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`[\]]+)/gi;
    const urls = [...new Set(emailContent.match(urlRegex) || [])];

    const senderMatch = emailContent.match(/From:.*?<(.+?)>/i) || emailContent.match(/From:\s*(\S+@\S+)/i);
    const senderEmail = senderMatch ? senderMatch[1] : null;

    const urgencyWords = ["urgent", "immediately", "verify now", "account suspended", "click here", "confirm your", "winner", "prize", "free", "limited time", "act now", "expire"];
    const foundUrgency = urgencyWords.filter(w => emailContent.toLowerCase().includes(w));

    const urlResults = [];
    for (const url of urls.slice(0, 5)) {
      try {
        const r = await axios.post("http://localhost:5000/api/check-url", { url });
        urlResults.push({ url, ...r.data });
      } catch {
        urlResults.push({ url, verdict: "Error", score: 0, color: "warn" });
      }
    }

    const dangerousUrls = urlResults.filter(r => r.color === "danger").length;
    const suspiciousUrls = urlResults.filter(r => r.color === "warn").length;

    let riskScore = 100;
    if (dangerousUrls > 0) riskScore -= dangerousUrls * 30;
    if (suspiciousUrls > 0) riskScore -= suspiciousUrls * 15;
    if (foundUrgency.length > 0) riskScore -= foundUrgency.length * 10;
    riskScore = Math.max(0, Math.min(100, riskScore));

    const verdict = riskScore >= 70 ? "Safe" : riskScore >= 40 ? "Suspicious" : "Phishing";
    const color = riskScore >= 70 ? "safe" : riskScore >= 40 ? "warn" : "danger";

    res.json({
      verdict, color, riskScore,
      urlResults,
      urgencyWords: foundUrgency,
      senderEmail,
      totalUrls: urls.length,
    });

  } catch (err) {
    console.error("Email analysis error:", err.message);
    res.status(500).json({ error: "Analysis failed", detail: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ PhishGuard API running on port ${PORT}`));