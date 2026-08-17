import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "./api";
import Layout from "./Layout";
import Toast from "./components/Toast";

function AITravelAssistant() {
  const navigate = useNavigate();

  const [destination, setDestination] = useState("");
  const [days, setDays] = useState("3");
  const [travelStyle, setTravelStyle] = useState("balanced");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resultItinerary, setResultItinerary] = useState(null);
  const [toast, setToast] = useState({ message: "", type: "success" });

  const handleGenerateItinerary = async (e) => {
    e.preventDefault();
    if (!destination.trim()) {
      setError("Please enter a destination name (e.g. Delhi, Goa, Manali).");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResultItinerary(null);

      const res = await API.post("/destinations/ai-itinerary", {
        destination: destination.trim(),
        days: Number(days),
        travelStyle,
      });

      setResultItinerary(res.data.itinerary);
      setToast({ message: "✨ AI Itinerary generated successfully!", type: "success" });
    } catch (err) {
      console.error("AI itinerary error:", err);
      setError(err.response?.data?.message || "Could not generate itinerary. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateActiveTrip = () => {
    if (!resultItinerary) return;
    navigate(
      `/create-trip?destination=${encodeURIComponent(
        resultItinerary.destination
      )}&days=${resultItinerary.days}`
    );
  };

  return (
    <Layout>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        
        {/* HEADER */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ fontSize: "13px", color: "#8b93a6", marginBottom: "8px" }}>
            🧠 AI TRAVEL ASSISTANT & ITINERARY CONCIERGE
          </div>
          <h2 style={{ margin: "0 0 8px 0" }}>Plan Your Custom AI Trip</h2>
          <p style={{ color: "#8b93a6", margin: 0, lineHeight: 1.6 }}>
            Just enter where you're going and for how many days. Our Google Gemini AI will generate your complete day-by-day travel plan!
          </p>
        </div>

        {/* INPUT CARD */}
        <div className="card" style={{ marginBottom: "28px" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "18px" }}>📍 Trip Inputs</h3>

          <form onSubmit={handleGenerateItinerary}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "20px" }}>
              
              {/* DESTINATION */}
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "13px" }}>
                  Where are you going?
                </label>
                <input
                  type="text"
                  placeholder="e.g. Delhi, Goa, Manali, Jaipur..."
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  disabled={loading}
                  style={{ width: "100%", boxSizing: "border-box" }}
                />
              </div>

              {/* DURATION */}
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "13px" }}>
                  How many days?
                </label>
                <select
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#ffffff",
                  }}
                >
                  <option value="1">1 Day Express Trip</option>
                  <option value="2">2 Days Weekend Getaway</option>
                  <option value="3">3 Days Classic Tour</option>
                  <option value="4">4 Days Extended Exploration</option>
                  <option value="5">5 Days Vacation</option>
                  <option value="7">7 Days Complete Experience</option>
                  <option value="10">10 Days Grand Tour</option>
                </select>
              </div>

              {/* TRAVEL STYLE */}
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "13px" }}>
                  Travel Style
                </label>
                <select
                  value={travelStyle}
                  onChange={(e) => setTravelStyle(e.target.value)}
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#ffffff",
                  }}
                >
                  <option value="balanced">Balanced ⚖️ (Sightseeing + Food)</option>
                  <option value="heritage">Heritage & Culture 🏛️</option>
                  <option value="foodie">Foodie & Local Eats 🍛</option>
                  <option value="adventure">Adventure & Trekking 🏔️</option>
                  <option value="nature">Relaxation & Nature 🌿</option>
                </select>
              </div>

            </div>

            {error && (
              <div style={{ color: "#f87171", fontSize: "13px", marginBottom: "16px", fontWeight: 600 }}>
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "12px 24px",
                borderRadius: "10px",
                background: loading
                  ? "rgba(255,255,255,0.1)"
                  : "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: "14px",
                border: "none",
                cursor: loading ? "wait" : "pointer",
                boxShadow: "0 4px 16px rgba(99, 102, 241, 0.3)",
              }}
            >
              {loading ? "✨ Asking Gemini AI Concierge..." : "✨ Generate AI Itinerary"}
            </button>
          </form>
        </div>

        {/* LOADING ANIMATION SKELETON */}
        {loading && (
          <div className="card" style={{ textAlign: "center", padding: "40px 20px", color: "#8b93a6" }}>
            <div style={{ fontSize: "32px", marginBottom: "12px", animation: "spin 2s linear infinite" }}>🤖</div>
            <h3 style={{ margin: "0 0 8px 0", color: "#818cf8" }}>Gemini AI is crafting your itinerary...</h3>
            <p style={{ margin: 0, fontSize: "13px" }}>Analyzing top spots, morning heritage walks, local food spots & sunset views for {destination}.</p>
          </div>
        )}

        {/* ITINERARY RESULT CARD */}
        {resultItinerary && !loading && (
          <div>
            
            {/* ITINERARY HEADER SUMMARY */}
            <div className="card" style={{ marginBottom: "24px", background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)", border: "1px solid rgba(129, 140, 248, 0.3)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
                <div>
                  <span style={{ fontSize: "12px", color: "#818cf8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    AI GENERATED ITINERARY • {resultItinerary.days} DAYS
                  </span>
                  <h2 style={{ margin: "6px 0 8px 0", fontSize: "26px" }}>
                    {resultItinerary.destination}
                  </h2>
                  <p style={{ margin: 0, color: "#cbd5e1", fontStyle: "italic", fontSize: "14px" }}>
                    "{resultItinerary.tagline}"
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCreateActiveTrip}
                  style={{
                    padding: "10px 18px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #29b6a6, #229688)",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: "13px",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(41, 182, 166, 0.3)",
                  }}
                >
                  ➕ Create Active Trip with Budget
                </button>
              </div>

              <div style={{ display: "flex", gap: "20px", marginTop: "20px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.1)", fontSize: "13px" }}>
                <div>💰 Estimated Budget: <strong style={{ color: "#4ade80" }}>{resultItinerary.estimatedBudgetINR}</strong></div>
                <div>🗓️ Best Season: <strong>{resultItinerary.bestSeason}</strong></div>
              </div>
            </div>

            {/* DAY-BY-DAY ITINERARY CARDS */}
            <h3 style={{ margin: "0 0 16px 0" }}>📅 Day-by-Day Schedule</h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "28px" }}>
              {resultItinerary.itinerary.map((dayPlan) => (
                <div key={dayPlan.day} className="card" style={{ borderLeft: "4px solid #6366f1" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                    <span style={{ padding: "4px 10px", borderRadius: "12px", background: "#6366f1", color: "#ffffff", fontWeight: 700, fontSize: "12px" }}>
                      DAY {dayPlan.day}
                    </span>
                    <h4 style={{ margin: 0, fontSize: "16px" }}>{dayPlan.title}</h4>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px", fontSize: "13px", lineHeight: 1.6 }}>
                    
                    <div style={{ padding: "12px", borderRadius: "8px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ fontWeight: 700, color: "#818cf8", marginBottom: "4px" }}>🏛️ MORNING</div>
                      <div style={{ color: "#cbd5e1" }}>{dayPlan.morning}</div>
                    </div>

                    <div style={{ padding: "12px", borderRadius: "8px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ fontWeight: 700, color: "#fbbf24", marginBottom: "4px" }}>🍛 AFTERNOON</div>
                      <div style={{ color: "#cbd5e1" }}>{dayPlan.afternoon}</div>
                    </div>

                    <div style={{ padding: "12px", borderRadius: "8px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ fontWeight: 700, color: "#f472b6", marginBottom: "4px" }}>🌆 EVENING</div>
                      <div style={{ color: "#cbd5e1" }}>{dayPlan.evening}</div>
                    </div>

                  </div>
                </div>
              ))}
            </div>

            {/* PRO TIPS & RECOMMENDATIONS */}
            {resultItinerary.proTips && resultItinerary.proTips.length > 0 && (
              <div className="card" style={{ marginBottom: "28px" }}>
                <h3 style={{ margin: "0 0 12px 0", fontSize: "16px" }}>💡 Travel Pro Tips for {resultItinerary.destination}</h3>
                <ul style={{ margin: 0, paddingLeft: "20px", color: "#cbd5e1", fontSize: "13px", lineHeight: 1.8 }}>
                  {resultItinerary.proTips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}

          </div>
        )}

      </div>
    </Layout>
  );
}

export default AITravelAssistant;
