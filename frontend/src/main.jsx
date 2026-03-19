import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import BulkScanner from "./BulkScanner.jsx";
import "./index.css";
import QRScanner from "./QRScanner.jsx";
import EmailAnalyzer from "./EmailAnalyzer.jsx";
import InstallGuide from "./InstallGuide.jsx";
import About from "./About.jsx";
import AndroidApp from "./AndroidApp.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/bulk" element={<BulkScanner />} />
        <Route path="/qr" element={<QRScanner />} />
        <Route path="/email" element={<EmailAnalyzer />} />
        <Route path="/install" element={<InstallGuide />} />
        <Route path="/about" element={<About />} />
        <Route path="/android" element={<AndroidApp />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
