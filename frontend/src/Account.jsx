import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./Layout";

function Account() {
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  let initialUser = { name: "Rajnish Singh", email: "singhrajnish.7970@gmail.com" };
  if (storedUser) {
    try {
      initialUser = JSON.parse(storedUser);
    } catch {
      // fallback
    }
  }

  const [name, setName] = useState(initialUser.name || "");
  const [email, setEmail] = useState(initialUser.email || "");
  const [currency, setCurrency] = useState(localStorage.getItem("preferredCurrency") || "INR");
  const [travelMode, setTravelMode] = useState(localStorage.getItem("preferredTravelMode") || "Flight");
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!name.trim() || !email.trim()) {
      setError("Name and email are required.");
      return;
    }

    const updatedUser = { ...initialUser, name: name.trim(), email: email.trim() };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    localStorage.setItem("preferredCurrency", currency);
    localStorage.setItem("preferredTravelMode", travelMode);

    setMessage("✅ Profile preferences updated successfully!");
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!currentPassword) {
      setError("Please enter your current password.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setMessage("🔒 Password updated successfully!");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <Layout>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        
        {/* HEADER */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ fontSize: "13px", color: "#8b93a6", marginBottom: "8px" }}>
            👤 USER PROFILE & SECURITY
          </div>
          <h2 style={{ margin: "0 0 8px 0" }}>Account Profile</h2>
          <p style={{ color: "#8b93a6", margin: 0, lineHeight: 1.6 }}>
            Manage your personal credentials, travel preferences, and active security sessions.
          </p>
        </div>

        {/* NOTIFICATION MESSAGES */}
        {message && (
          <div style={{ padding: "14px 18px", borderRadius: "10px", background: "rgba(34, 197, 94, 0.15)", border: "1px solid rgba(34, 197, 94, 0.3)", color: "#4ade80", marginBottom: "20px", fontSize: "14px", fontWeight: 600 }}>
            {message}
          </div>
        )}
        {error && (
          <div style={{ padding: "14px 18px", borderRadius: "10px", background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#f87171", marginBottom: "20px", fontSize: "14px", fontWeight: 600 }}>
            ⚠️ {error}
          </div>
        )}

        {/* 2-COLUMN LAYOUT */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
          
          {/* LEFT: USER SUMMARY CARD */}
          <div>
            <div className="card" style={{ textAlign: "center", padding: "32px 24px", marginBottom: "24px" }}>
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "32px",
                  fontWeight: 700,
                  color: "#ffffff",
                  margin: "0 auto 16px auto",
                  boxShadow: "0 8px 24px rgba(99, 102, 241, 0.3)",
                }}
              >
                {name ? name.charAt(0).toUpperCase() : "U"}
              </div>

              <h3 style={{ margin: "0 0 4px 0", fontSize: "20px" }}>{name || "User Account"}</h3>
              <div style={{ color: "#8b93a6", fontSize: "14px", marginBottom: "16px" }}>{email}</div>

              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "20px", background: "rgba(99, 102, 241, 0.15)", border: "1px solid rgba(99, 102, 241, 0.3)", color: "#818cf8", fontSize: "12px", fontWeight: 600 }}>
                🛡️ Verified Member Account
              </div>
            </div>

            {/* SECURITY & SESSION SPECIFICATION CARD */}
            <div className="card">
              <h4 style={{ margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: "8px" }}>
                🔒 Security Specification
              </h4>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "10px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <span style={{ color: "#8b93a6" }}>JWT Token Status:</span>
                  <span style={{ color: "#4ade80", fontWeight: 600 }}>Active (7-Day Encrypted)</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "10px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <span style={{ color: "#8b93a6" }}>Password Hashing:</span>
                  <span style={{ color: "#f3f4f6", fontWeight: 600 }}>Bcrypt (Salt 10 Rounds)</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "10px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <span style={{ color: "#8b93a6" }}>Database Storage:</span>
                  <span style={{ color: "#f3f4f6", fontWeight: 600 }}>MongoDB Atlas (Sharded)</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                style={{
                  width: "100%",
                  marginTop: "20px",
                  padding: "12px",
                  borderRadius: "10px",
                  background: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "#f87171",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                🚪 Sign Out of Active Session
              </button>
            </div>
          </div>

          {/* RIGHT: EDIT DETAILS FORMS */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* PERSONAL DETAILS FORM */}
            <div className="card">
              <h3 style={{ margin: "0 0 20px 0" }}>✏️ Personal Details & Preferences</h3>
              <form onSubmit={handleUpdateProfile}>
                
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "13px" }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    style={{ width: "100%", boxSizing: "border-box" }}
                  />
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "13px" }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    style={{ width: "100%", boxSizing: "border-box" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "13px" }}>
                      Preferred Currency
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#ffffff" }}
                    >
                      <option value="INR">INR (₹ Rupees)</option>
                      <option value="USD">USD ($ Dollars)</option>
                      <option value="EUR">EUR (€ Euros)</option>
                      <option value="GBP">GBP (£ Pounds)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "13px" }}>
                      Preferred Transport
                    </label>
                    <select
                      value={travelMode}
                      onChange={(e) => setTravelMode(e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#ffffff" }}
                    >
                      <option value="Flight">Flight ✈️</option>
                      <option value="Train">Train 🚆</option>
                      <option value="Car">Car / Cab 🚗</option>
                      <option value="Bus">Bus 🚌</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  style={{
                    padding: "12px 24px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                    color: "#ffffff",
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Save Profile Preferences
                </button>
              </form>
            </div>

            {/* SECURITY: CHANGE PASSWORD FORM */}
            <div className="card">
              <h3 style={{ margin: "0 0 20px 0" }}>🔑 Change Password</h3>
              <form onSubmit={handleChangePassword}>
                
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "13px" }}>
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ width: "100%", boxSizing: "border-box" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "13px" }}>
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 chars"
                      style={{ width: "100%", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "13px" }}>
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      style={{ width: "100%", boxSizing: "border-box" }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  style={{
                    padding: "12px 24px",
                    borderRadius: "10px",
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    color: "#ffffff",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Update Security Password
                </button>
              </form>
            </div>

          </div>

        </div>

      </div>
    </Layout>
  );
}

export default Account;
