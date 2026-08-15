import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "./api";

function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isSignup) {
      if (!name.trim()) {
        setError("Name is required");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
    }

    setLoading(true);

    try {
      const endpoint = isSignup ? "/auth/signup" : "/auth/login";
      const payload = isSignup ? { name, email, password } : { email, password };

      const res = await API.post(endpoint, payload);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0b0f19 0%, #111827 100%)",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "940px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          borderRadius: "24px",
          overflow: "hidden",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          background: "rgba(17, 24, 39, 0.8)",
          backdropFilter: "blur(16px)",
        }}
      >
        {/* LEFT HERO PANEL */}
        <div
          style={{
            padding: "48px",
            background: "linear-gradient(135deg, rgba(123, 110, 246, 0.15) 0%, rgba(41, 182, 166, 0.15) 100%)",
            borderRight: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "#ffffff", marginBottom: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
              🌴 Safar-E-Life
            </div>
            <p style={{ color: "#94a3b8", fontSize: "15px", lineHeight: 1.6, margin: 0 }}>
              Plan smarter. Travel together. Split expenses effortlessly with AI financial intelligence.
            </p>
          </div>

          <div style={{ margin: "40px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
              <span style={{ fontSize: "20px" }}>🌍</span>
              <span style={{ color: "#cbd5e1", fontSize: "14px" }}>Discover curated travel destinations</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
              <span style={{ fontSize: "20px" }}>🧭</span>
              <span style={{ color: "#cbd5e1", fontSize: "14px" }}>Plan group itineraries & budgets</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
              <span style={{ fontSize: "20px" }}>💰</span>
              <span style={{ color: "#cbd5e1", fontSize: "14px" }}>Deterministic equal & custom expense splits</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <span style={{ fontSize: "20px" }}>🤖</span>
              <span style={{ color: "#cbd5e1", fontSize: "14px" }}>AI financial insights & receipt scanning</span>
            </div>
          </div>

          <div style={{ fontSize: "12px", color: "#64748b" }}>
            © 2026 Safar-E-Life. All rights reserved.
          </div>
        </div>

        {/* RIGHT FORM CARD */}
        <div style={{ padding: "48px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h2 style={{ margin: "0 0 8px 0", fontSize: "24px", color: "#ffffff" }}>
            {isSignup ? "Create an account" : "Welcome back"}
          </h2>
          <p style={{ margin: "0 0 28px 0", fontSize: "14px", color: "#8b93a6" }}>
            {isSignup
              ? "Sign up to start planning your group trips"
              : "Enter your details to access your trips"}
          </p>

          <form onSubmit={handleSubmit}>
            {isSignup && (
              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "12px", color: "#8b93a6", marginBottom: "6px", display: "block" }}>Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rajnish Singh"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: "100%", backgroundColor: "#1e293b", border: "1px solid rgba(255, 255, 255, 0.1)" }}
                  required
                />
              </div>
            )}

            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "12px", color: "#8b93a6", marginBottom: "6px", display: "block" }}>Email address</label>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: "100%", backgroundColor: "#1e293b", border: "1px solid rgba(255, 255, 255, 0.1)" }}
                required
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "12px", color: "#8b93a6", marginBottom: "6px", display: "block" }}>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: "100%", backgroundColor: "#1e293b", border: "1px solid rgba(255, 255, 255, 0.1)" }}
                required
              />
            </div>

            {error && <p className="error-text" style={{ marginBottom: "16px" }}>{error}</p>}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "14px",
                fontWeight: 700,
                background: "linear-gradient(135deg, #7b6ef6 0%, #5b8cff 100%)",
                boxShadow: "0 8px 20px rgba(123, 110, 246, 0.3)",
              }}
            >
              {loading ? (isSignup ? "Creating account..." : "Signing in...") : (isSignup ? "Sign Up" : "Sign In")}
            </button>
          </form>

          <div style={{ marginTop: "24px", textAlign: "center", fontSize: "13px", color: "#8b93a6" }}>
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              className="link-button"
              onClick={() => {
                setIsSignup(!isSignup);
                setError("");
              }}
              style={{ color: "#7b6ef6", fontWeight: 700, cursor: "pointer", background: "none", border: "none" }}
            >
              {isSignup ? "Sign In" : "Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;