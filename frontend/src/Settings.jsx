import { useState } from "react";
import Layout from "./Layout";

function Settings() {
  const [theme, setTheme] = useState(localStorage.getItem("appTheme") || "Dark");
  const [precisionMode, setPrecisionMode] = useState(localStorage.getItem("precisionMode") || "Integer-Paise");
  const [aiVision, setAiVision] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [savedMsg, setSavedMsg] = useState("");

  const handleSaveSettings = () => {
    localStorage.setItem("appTheme", theme);
    localStorage.setItem("precisionMode", precisionMode);
    setSavedMsg("⚙️ Settings & System Specifications saved!");
    setTimeout(() => setSavedMsg(""), 3000);
  };

  return (
    <Layout>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        
        {/* HEADER */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ fontSize: "13px", color: "#8b93a6", marginBottom: "8px" }}>
            ⚙️ SYSTEM SPECIFICATIONS & PREFERENCES
          </div>
          <h2 style={{ margin: "0 0 8px 0" }}>Application Settings</h2>
          <p style={{ color: "#8b93a6", margin: 0, lineHeight: 1.6 }}>
            Customize financial calculations, AI vision receipt preferences, theme appearance, and platform specifications.
          </p>
        </div>

        {savedMsg && (
          <div style={{ padding: "14px 18px", borderRadius: "10px", background: "rgba(34, 197, 94, 0.15)", border: "1px solid rgba(34, 197, 94, 0.3)", color: "#4ade80", marginBottom: "24px", fontSize: "14px", fontWeight: 600 }}>
            {savedMsg}
          </div>
        )}

        {/* SETTINGS CARDS GRID */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", marginBottom: "24px" }}>
          
          {/* FINANCIAL ENGINE SPECIFICATIONS */}
          <div className="card">
            <h3 style={{ margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: "8px" }}>
              🧮 Financial Calculation Engine
            </h3>
            
            <p style={{ color: "#8b93a6", fontSize: "13px", lineHeight: 1.6, marginBottom: "20px" }}>
              Safar-E-Life uses integer-paise remainder allocation so 3-way equal splits (e.g. ₹4,000 ÷ 3) never lose ₹0.01 paise in rounding errors.
            </p>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "13px" }}>
                Split Rounding Strategy
              </label>
              <select
                value={precisionMode}
                onChange={(e) => setPrecisionMode(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#ffffff" }}
              >
                <option value="Integer-Paise">Integer-Paise Allocation (₹1,333.34 + ₹1,333.33 + ₹1,333.33)</option>
                <option value="Standard">Standard Rounding (2 Decimal Places)</option>
              </select>
            </div>

            <div style={{ padding: "14px", borderRadius: "8px", background: "rgba(99, 102, 241, 0.1)", border: "1px solid rgba(99, 102, 241, 0.2)", fontSize: "12px", color: "#a5b4fc", lineHeight: 1.5 }}>
              ⚡ <strong>Mathematical Proof</strong>: 3 × ₹1,333.33 = ₹3,999.99. Remainder 1 paisa is deterministically assigned to the first payer share so total stays exact ₹4,000.00.
            </div>
          </div>

          {/* AI VISION & AUTOMATION SPECIFICATIONS */}
          <div className="card">
            <h3 style={{ margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: "8px" }}>
              🤖 AI & Vision Engine
            </h3>

            <p style={{ color: "#8b93a6", fontSize: "13px", lineHeight: 1.6, marginBottom: "20px" }}>
              Integrated with Google Gemini 1.5 Flash Vision for automatic receipt scanning, OCR itemization, and itinerary planning.
            </p>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "16px", marginBottom: "16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: "14px" }}>Gemini Receipt OCR</div>
                <div style={{ fontSize: "12px", color: "#8b93a6" }}>Extract items, dates, and amounts from photos</div>
              </div>
              <input
                type="checkbox"
                checked={aiVision}
                onChange={(e) => setAiVision(e.target.checked)}
                style={{ width: "18px", height: "18px", cursor: "pointer" }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: "14px" }}>Group Activity Notifications</div>
                <div style={{ fontSize: "12px", color: "#8b93a6" }}>Receive alerts when members add expenses</div>
              </div>
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                style={{ width: "18px", height: "18px", cursor: "pointer" }}
              />
            </div>
          </div>

        </div>

        {/* SYSTEM SPECIFICATIONS TABLE CARD */}
        <div className="card" style={{ marginBottom: "24px" }}>
          <h3 style={{ margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: "8px" }}>
            📊 System Specification & Architecture Matrix
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
            <div style={{ padding: "16px", borderRadius: "10px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: "11px", color: "#8b93a6", textTransform: "uppercase", marginBottom: "4px" }}>PLATFORM VERSION</div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#818cf8" }}>v1.2.0 (Production)</div>
            </div>

            <div style={{ padding: "16px", borderRadius: "10px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: "11px", color: "#8b93a6", textTransform: "uppercase", marginBottom: "4px" }}>AI ENGINE</div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#38bdf8" }}>Google Gemini 1.5 Flash</div>
            </div>

            <div style={{ padding: "16px", borderRadius: "10px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: "11px", color: "#8b93a6", textTransform: "uppercase", marginBottom: "4px" }}>DATABASE CLUSTER</div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#4ade80" }}>MongoDB Atlas Sharded</div>
            </div>

            <div style={{ padding: "16px", borderRadius: "10px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: "11px", color: "#8b93a6", textTransform: "uppercase", marginBottom: "4px" }}>DESTINATIONS INDEX</div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#fbbf24" }}>100 Indian Destinations</div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSaveSettings}
          style={{
            padding: "14px 28px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
            color: "#ffffff",
            fontWeight: 700,
            fontSize: "14px",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(99, 102, 241, 0.3)",
          }}
        >
          Save All System Preferences
        </button>

      </div>
    </Layout>
  );
}

export default Settings;
