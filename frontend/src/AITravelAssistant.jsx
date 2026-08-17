import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "./api";
import Layout from "./Layout";
import Toast from "./components/Toast";

const QUICK_DESTINATIONS = ["Delhi", "Goa", "Manali", "Jaipur", "Varanasi", "Leh", "Kerala", "Kolkata"];
const DAY_OPTIONS = [1, 2, 3, 4, 5, 7, 10];

const CHECKLIST_ITEMS = [
  "Understanding destination & local vibe",
  "Finding major landmarks & hidden gems",
  "Planning daily routes to minimize travel time",
  "Selecting famous local food & must-try dishes",
  "Balancing morning, afternoon, evening & dinner experiences",
  "Creating your ultimate itinerary",
];

function AITravelAssistant() {
  const navigate = useNavigate();

  const [destination, setDestination] = useState("Delhi");
  const [days, setDays] = useState(3);
  const [loading, setLoading] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [error, setError] = useState("");
  const [resultItinerary, setResultItinerary] = useState(null);
  const [toast, setToast] = useState({ message: "", type: "success" });

  // Animated step progression during AI loading
  useEffect(() => {
    let interval = null;
    if (loading) {
      setActiveStepIndex(0);
      interval = setInterval(() => {
        setActiveStepIndex((prev) => {
          if (prev < CHECKLIST_ITEMS.length - 1) return prev + 1;
          return prev;
        });
      }, 700);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loading]);

  const handlePlanMyTrip = async (e) => {
    if (e) e.preventDefault();
    if (!destination.trim()) {
      setError("Please enter where you are going.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResultItinerary(null);

      const res = await API.post("/destinations/ai-itinerary", {
        destination: destination.trim(),
        days: Number(days),
      });

      setResultItinerary(res.data.itinerary);
      setToast({ message: `✨ ${destination} Trip Planned Successfully!`, type: "success" });
    } catch (err) {
      console.error("AI itinerary error:", err);
      setError(err.response?.data?.message || "Could not plan trip. Please try again.");
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

      <div style={{ maxWidth: "950px", margin: "0 auto" }}>
        
        {/* HERO TITLE */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "36px", marginBottom: "8px" }}>🌍</div>
          <h1 style={{ margin: "0 0 10px 0", fontSize: "28px", background: "linear-gradient(135deg, #818cf8 0%, #c084fc 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            TerraYatra AI Travel Concierge
          </h1>
          <p style={{ color: "#8b93a6", margin: 0, fontSize: "15px", lineHeight: 1.6 }}>
            Just tell us where you're going and for how many days. Our AI plans your route, attractions, and famous local food automatically.
          </p>
        </div>

        {/* INPUT CARD */}
        <div className="card" style={{ padding: "32px", marginBottom: "32px", boxShadow: "0 12px 36px rgba(0,0,0,0.3)" }}>
          <form onSubmit={handlePlanMyTrip}>
            
            {/* 1. WHERE ARE YOU GOING */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", marginBottom: "10px", fontWeight: 700, fontSize: "16px", color: "#f3f4f6" }}>
                📍 Where are you going?
              </label>

              <input
                type="text"
                placeholder="Enter destination (e.g. Delhi, Manali, Goa, Jaipur)..."
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                disabled={loading}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "14px 16px",
                  fontSize: "16px",
                  borderRadius: "10px",
                  marginBottom: "12px",
                }}
              />

              {/* QUICK DESTINATION PILLS */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {QUICK_DESTINATIONS.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setDestination(city)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "16px",
                      fontSize: "12px",
                      fontWeight: 600,
                      background: destination.toLowerCase() === city.toLowerCase()
                        ? "rgba(129, 140, 248, 0.2)"
                        : "rgba(255,255,255,0.04)",
                      color: destination.toLowerCase() === city.toLowerCase() ? "#818cf8" : "#94a3b8",
                      border: destination.toLowerCase() === city.toLowerCase()
                        ? "1px solid #818cf8"
                        : "1px solid rgba(255,255,255,0.08)",
                      cursor: "pointer",
                    }}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. HOW MANY DAYS */}
            <div style={{ marginBottom: "28px" }}>
              <label style={{ display: "block", marginBottom: "10px", fontWeight: 700, fontSize: "16px", color: "#f3f4f6" }}>
                📅 How many days?
              </label>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {DAY_OPTIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDays(d)}
                    style={{
                      padding: "10px 20px",
                      borderRadius: "10px",
                      fontSize: "14px",
                      fontWeight: 700,
                      background: days === d
                        ? "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)"
                        : "rgba(255, 255, 255, 0.05)",
                      color: days === d ? "#ffffff" : "#94a3b8",
                      border: days === d ? "1px solid #818cf8" : "1px solid rgba(255, 255, 255, 0.1)",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {d} {d === 1 ? "Day" : "Days"}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div style={{ color: "#f87171", fontSize: "14px", marginBottom: "16px", fontWeight: 600 }}>
                ⚠️ {error}
              </div>
            )}

            {/* CTA BUTTON */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "12px",
                background: loading
                  ? "rgba(255,255,255,0.1)"
                  : "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                color: "#ffffff",
                fontWeight: 800,
                fontSize: "16px",
                letterSpacing: "0.5px",
                border: "none",
                cursor: loading ? "wait" : "pointer",
                boxShadow: "0 6px 20px rgba(99, 102, 241, 0.4)",
              }}
            >
              {loading ? "✨ AI IS BUILDING YOUR TRIP..." : "✨ PLAN MY TRIP"}
            </button>
          </form>
        </div>

        {/* ANIMATED AI THINKING STATE */}
        {loading && (
          <div className="card" style={{ padding: "32px", marginBottom: "32px", textAlign: "left", background: "rgba(15, 23, 42, 0.8)", border: "1px solid rgba(129, 140, 248, 0.3)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <div style={{ fontSize: "24px" }}>🧠</div>
              <div>
                <h3 style={{ margin: 0, fontSize: "18px", color: "#818cf8" }}>BUILDING YOUR {destination.toUpperCase()} TRIP</h3>
                <div style={{ fontSize: "12px", color: "#94a3b8" }}>Optimizing routes, activities & famous dining spots...</div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {CHECKLIST_ITEMS.map((item, idx) => {
                const isDone = idx <= activeStepIndex;
                return (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      fontSize: "14px",
                      color: isDone ? "#4ade80" : "#475569",
                      fontWeight: isDone ? 600 : 400,
                      transition: "all 0.3s ease",
                    }}
                  >
                    <span>{isDone ? "✓" : "○"}</span>
                    <span>{item}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STRUCTURED ITINERARY RESULT */}
        {resultItinerary && !loading && (
          <div>
            
            {/* TRIP SUMMARY HEADER CARD */}
            <div className="card" style={{ marginBottom: "24px", padding: "28px", background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)", border: "1px solid rgba(129, 140, 248, 0.4)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
                <div>
                  <div style={{ fontSize: "12px", color: "#818cf8", fontWeight: 800, letterSpacing: "1px" }}>
                    ✈️ YOUR {resultItinerary.destination.toUpperCase()} TRIP • {resultItinerary.days} DAYS
                  </div>

                  <h1 style={{ margin: "6px 0 6px 0", fontSize: "28px" }}>
                    {resultItinerary.destination}
                  </h1>

                  <p style={{ margin: "0 0 14px 0", color: "#cbd5e1", fontStyle: "italic", fontSize: "15px" }}>
                    "{resultItinerary.tagline}"
                  </p>

                  <p style={{ margin: 0, color: "#94a3b8", fontSize: "14px", lineHeight: 1.6, maxWidth: "600px" }}>
                    {resultItinerary.summary}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCreateActiveTrip}
                  style={{
                    padding: "12px 20px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #29b6a6, #229688)",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: "14px",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(41, 182, 166, 0.3)",
                  }}
                >
                  ➕ Create Active Trip with Budget
                </button>
              </div>

              <div style={{ display: "flex", gap: "24px", marginTop: "20px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.1)", fontSize: "14px" }}>
                <div>💰 Estimated Budget: <strong style={{ color: "#4ade80" }}>{resultItinerary.estimatedBudgetINR}</strong></div>
                <div>🗓️ Best Season: <strong>{resultItinerary.bestSeason}</strong></div>
              </div>
            </div>

            {/* DAY BY DAY STRUCTURED SLOTS */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "28px" }}>
              {resultItinerary.itinerary.map((dayPlan) => (
                <div key={dayPlan.day} className="card" style={{ padding: "24px", borderLeft: "5px solid #6366f1" }}>
                  
                  {/* DAY HEADER */}
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px" }}>
                    <span style={{ padding: "6px 14px", borderRadius: "20px", background: "linear-gradient(135deg, #6366f1, #4f46e5)", color: "#ffffff", fontWeight: 800, fontSize: "13px" }}>
                      DAY {dayPlan.day}
                    </span>
                    <h3 style={{ margin: 0, fontSize: "18px" }}>{dayPlan.title}</h3>
                  </div>

                  {/* 5-SLOT GRID */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    
                    {/* MORNING */}
                    {dayPlan.morning && (
                      <div style={{ padding: "14px 16px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{ fontWeight: 700, color: "#818cf8", fontSize: "13px", marginBottom: "4px" }}>
                          🏛️ MORNING — {dayPlan.morning.place || dayPlan.morning}
                        </div>
                        {dayPlan.morning.details && <div style={{ color: "#cbd5e1", fontSize: "13px", marginBottom: "4px" }}>{dayPlan.morning.details}</div>}
                        {dayPlan.morning.whyWorthSeeing && (
                          <div style={{ fontSize: "12px", color: "#94a3b8", fontStyle: "italic" }}>
                            ✨ Why it's worth seeing: {dayPlan.morning.whyWorthSeeing}
                          </div>
                        )}
                      </div>
                    )}

                    {/* LUNCH */}
                    {dayPlan.lunch && (
                      <div style={{ padding: "14px 16px", borderRadius: "10px", background: "rgba(251, 191, 36, 0.08)", border: "1px solid rgba(251, 191, 36, 0.2)" }}>
                        <div style={{ fontWeight: 700, color: "#fbbf24", fontSize: "13px", marginBottom: "4px" }}>
                          🍛 LUNCH — {dayPlan.lunch.spot || dayPlan.lunch}
                        </div>
                        {dayPlan.lunch.foodToTry && (
                          <div style={{ color: "#fef08a", fontSize: "13px", fontWeight: 600 }}>
                            🍽️ Must-try food: {dayPlan.lunch.foodToTry}
                          </div>
                        )}
                      </div>
                    )}

                    {/* AFTERNOON */}
                    {dayPlan.afternoon && (
                      <div style={{ padding: "14px 16px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{ fontWeight: 700, color: "#38bdf8", fontSize: "13px", marginBottom: "4px" }}>
                          🏛️ AFTERNOON — {dayPlan.afternoon.place || dayPlan.afternoon}
                        </div>
                        {dayPlan.afternoon.details && <div style={{ color: "#cbd5e1", fontSize: "13px", marginBottom: "4px" }}>{dayPlan.afternoon.details}</div>}
                        {dayPlan.afternoon.whyWorthSeeing && (
                          <div style={{ fontSize: "12px", color: "#94a3b8", fontStyle: "italic" }}>
                            ✨ Why it's worth seeing: {dayPlan.afternoon.whyWorthSeeing}
                          </div>
                        )}
                      </div>
                    )}

                    {/* EVENING */}
                    {dayPlan.evening && (
                      <div style={{ padding: "14px 16px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{ fontWeight: 700, color: "#f472b6", fontSize: "13px", marginBottom: "4px" }}>
                          🌆 EVENING — {dayPlan.evening.activity || dayPlan.evening}
                        </div>
                        {dayPlan.evening.details && <div style={{ color: "#cbd5e1", fontSize: "13px" }}>{dayPlan.evening.details}</div>}
                      </div>
                    )}

                    {/* DINNER */}
                    {dayPlan.dinner && (
                      <div style={{ padding: "14px 16px", borderRadius: "10px", background: "rgba(244, 114, 182, 0.08)", border: "1px solid rgba(244, 114, 182, 0.2)" }}>
                        <div style={{ fontWeight: 700, color: "#f472b6", fontSize: "13px", marginBottom: "4px" }}>
                          🍽️ DINNER — {dayPlan.dinner.spot || dayPlan.dinner}
                        </div>
                        {dayPlan.dinner.foodToTry && (
                          <div style={{ color: "#fbcfe8", fontSize: "13px", fontWeight: 600 }}>
                            🍨 Signature delicacy: {dayPlan.dinner.foodToTry}
                          </div>
                        )}
                      </div>
                    )}

                  </div>

                </div>
              ))}
            </div>

            {/* WHY THIS TRIP? AI FINAL RECOMMENDATION */}
            {resultItinerary.finalRecommendation && (
              <div className="card" style={{ padding: "28px", marginBottom: "32px", background: "rgba(34, 197, 94, 0.08)", border: "1px solid rgba(34, 197, 94, 0.2)" }}>
                <h3 style={{ margin: "0 0 10px 0", color: "#4ade80", fontSize: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
                  ✨ Why This Trip? — AI Final Recommendation
                </h3>
                <p style={{ margin: 0, color: "#cbd5e1", fontSize: "14px", lineHeight: 1.7 }}>
                  {resultItinerary.finalRecommendation}
                </p>
              </div>
            )}

          </div>
        )}

      </div>
    </Layout>
  );
}

export default AITravelAssistant;
