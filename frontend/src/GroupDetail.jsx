import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "./api";
import Layout from "./Layout";
import Toast from "./components/Toast";
import { formatMoney } from "./utils/formatMoney";

const AVATAR_COLORS = [
  "#f2a33c",
  "#29b6a6",
  "#8c7aff",
  "#ff6b5c",
  "#5cc8ff",
];

const CATEGORY_ICONS = {
  stay: "🏨",
  food: "🍕",
  travel: "✈️",
  activities: "🎟️",
  misc: "📦",
};

const CATEGORY_COLORS = {
  stay: "#8c7aff",
  food: "#f2a33c",
  travel: "#29b6a6",
  activities: "#ff6b5c",
  misc: "#5cc8ff",
};

function toTitleCase(str) {
  if (!str) return "";
  return String(str).replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

function getNormalizedSplits(exp) {
  const rawList = Array.isArray(exp?.splitBetween) ? exp.splitBetween : [];
  if (rawList.length === 0) return [];

  const expAmount = Number(exp?.amount || 0);

  if (exp?.splitMode !== "custom") {
    const totalCents = Math.round(expAmount * 100);
    const count = rawList.length;
    const baseCents = Math.floor(totalCents / count);
    let remainder = totalCents - baseCents * count;

    return rawList.map((split, idx) => ({
      ...split,
      share: (baseCents + (idx < remainder ? 1 : 0)) / 100,
    }));
  }

  return rawList;
}

function getInitials(name) {
  if (!name) return "?";

  const parts = name.trim().split(" ");

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (
    parts[0].charAt(0) +
    parts[parts.length - 1].charAt(0)
  ).toUpperCase();
}

function getAvatarColor(name) {
  if (!name) return AVATAR_COLORS[0];

  let sum = 0;

  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }

  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

function renderAIText(text) {
  const parts = String(text || "").split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong
          key={index}
          style={{
            fontWeight: 800,
            color: "#ffffff",
          }}
        >
          {part.slice(2, -2)}
        </strong>
      );
    }

    const lines = part.split("\n");

    return (
      <span key={index}>
        {lines.map((line, lineIndex) => (
          <span key={lineIndex}>
            {line}
            {lineIndex < lines.length - 1 && <br />}
          </span>
        ))}
      </span>
    );
  });
}

function GroupDetail() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  let currentUser = null;
  if (storedUser) {
    try {
      currentUser = JSON.parse(storedUser);
    } catch {
      currentUser = null;
    }
  }

  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [settlement, setSettlement] = useState([]);
  const [settlementHistory, setSettlementHistory] = useState([]);
  const [summary, setSummary] = useState(null);
  const [insights, setInsights] = useState([]);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("misc");
  const [splitMode, setSplitMode] = useState("equal");
  const [customShares, setCustomShares] = useState({});
  const [error, setError] = useState("");

  const [groupError, setGroupError] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [receiptFile, setReceiptFile] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [extractedReceipt, setExtractedReceipt] = useState(null);
  const [scanError, setScanError] = useState("");

  const [memberEmail, setMemberEmail] = useState("");
  const [memberError, setMemberError] = useState("");

  const [toast, setToast] = useState({ message: "", type: "success" });

  // AI CHAT STATE
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [asking, setAsking] = useState(false);
  const chatEndRef = useRef(null);

  // FETCH ALL GROUP DATA
  const fetchAll = async () => {
    try {
      setGroupError("");
      setError("");

      const groupRes = await API.get("/groups/" + groupId);
      setGroup(groupRes.data.group);

      const expensesRes = await API.get("/expenses/group/" + groupId);
      setExpenses(expensesRes.data.expenses);

      const settlementRes = await API.get(
        "/expenses/group/" + groupId + "/settlement"
      );
      setSettlement(settlementRes.data.transactions);

      try {
        const historyRes = await API.get(
          "/expenses/group/" + groupId + "/settlements"
        );
        setSettlementHistory(historyRes.data.settlements || []);
      } catch {
        setSettlementHistory([]);
      }

      const summaryRes = await API.get(
        "/expenses/group/" + groupId + "/summary"
      );
      setSummary(summaryRes.data);

      const insightsRes = await API.get(
        "/expenses/group/" + groupId + "/insights"
      );
      setInsights(insightsRes.data.insights);
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setGroupError(
          "You are not a member of this trip, so you do not have permission to view it."
        );
      } else if (err.response && err.response.status === 404) {
        setGroupError("This trip could not be found.");
      } else if (err.response && err.response.status === 401) {
        setGroupError("Your login session has expired. Please log in again.");
      } else {
        setGroupError("Unable to load this trip. Please try again.");
      }
    }
  };

  useEffect(() => {
    fetchAll();
    setChatHistory([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, asking]);

  // RECEIPT SCANNING WITH REVIEW STEP
  const handleScanReceipt = async () => {
    if (!receiptFile) {
      setScanError("Please select a receipt image file first.");
      return;
    }

    setScanError("");
    setScanning(true);
    setExtractedReceipt(null);

    try {
      const formData = new FormData();
      formData.append("receipt", receiptFile);

      const res = await API.post("/receipts/scan", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const extracted = res.data.extracted;
      setExtractedReceipt(extracted);
      setToast({ message: "Receipt analyzed! Review details below.", type: "success" });
    } catch (err) {
      setScanError("Could not scan receipt. Try entering details manually.");
    } finally {
      setScanning(false);
    }
  };

  const applyExtractedReceipt = () => {
    if (!extractedReceipt) return;
    if (extractedReceipt.description) setDescription(extractedReceipt.description);
    if (extractedReceipt.amount) setAmount(String(extractedReceipt.amount));
    if (extractedReceipt.category) setCategory(extractedReceipt.category);
    setExtractedReceipt(null);
    setToast({ message: "Applied receipt details to expense form!", type: "success" });

    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  // MARK AS PAID SETTLEMENT HANDLER
  const handleMarkAsPaid = async (tx) => {
    const confirmed = window.confirm(
      `Confirm settlement payment: ${toTitleCase(tx.fromName)} pays ${toTitleCase(tx.toName)} ${formatMoney(tx.amount)}?`
    );
    if (!confirmed) return;

    try {
      await API.post("/expenses/group/" + groupId + "/settle", {
        fromUser: tx.from,
        toUser: tx.to,
        amount: tx.amount,
      });

      setToast({
        message: `Settlement of ${formatMoney(tx.amount)} recorded!`,
        type: "success",
      });
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || "Could not record settlement payment");
    }
  };

  // DETERMINISTIC EQUAL SHARES CALCULATION IN PAISE (CENTS)
  const calculateEqualShares = () => {
    if (!group || !group.members || group.members.length === 0) return {};

    const total = Number(amount);
    if (!total || total <= 0) return {};

    const totalCents = Math.round(total * 100);
    const memberCount = group.members.length;
    const baseCents = Math.floor(totalCents / memberCount);
    let remainder = totalCents - baseCents * memberCount;

    const shares = {};
    group.members.forEach((member, index) => {
      const shareCents = baseCents + (index < remainder ? 1 : 0);
      shares[member._id] = shareCents / 100;
    });

    return shares;
  };

  const calculateCustomTotal = () => {
    return Object.values(customShares).reduce(
      (sum, value) => sum + Number(value || 0),
      0
    );
  };

  const resetForm = () => {
    setDescription("");
    setAmount("");
    setCategory("misc");
    setSplitMode("equal");
    setCustomShares({});
    setReceiptFile(null);
    setExtractedReceipt(null);
    setEditingId(null);
  };

  // ADD / UPDATE EXPENSE
  const handleAddExpense = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (editingId) {
        await API.put("/expenses/" + editingId, {
          description,
          amount: Number(amount),
          category,
        });
        setToast({ message: "Expense updated successfully!", type: "success" });
      } else {
        let splitBetween;

        if (splitMode === "custom") {
          const expenseAmount = Number(amount);
          const customValues = Object.values(customShares).map((v) => Number(v || 0));
          const hasNegativeShare = customValues.some((v) => v < 0);
          const customTotal = calculateCustomTotal();

          if (hasNegativeShare) {
            setError("Custom shares cannot be negative.");
            return;
          }

          if (!expenseAmount || Math.abs(customTotal - expenseAmount) > 0.001) {
            setError(
              `Custom shares must add up to ${formatMoney(expenseAmount)}. Current total: ${formatMoney(customTotal)}`
            );
            return;
          }

          splitBetween = group.members.map((member) => ({
            user: member._id,
            share: Number(customShares[member._id] || 0),
          }));
        } else {
          const equalShares = calculateEqualShares();
          splitBetween = group.members.map((member) => ({
            user: member._id,
            share: Number(equalShares[member._id] || 0),
          }));
        }

        await API.post("/expenses", {
          groupId,
          description,
          amount: Number(amount),
          category,
          splitMode,
          splitBetween,
        });
        setToast({ message: "Expense added successfully!", type: "success" });
      }

      resetForm();
      fetchAll();
    } catch (err) {
      setError(editingId ? "Could not update expense" : "Could not add expense");
    }
  };

  const startEditExpense = (exp) => {
    setEditingId(exp._id);
    setDescription(exp.description);
    setAmount(exp.amount);
    setCategory(exp.category);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm("Delete this expense? This cannot be undone.")) return;

    try {
      await API.delete("/expenses/" + id);
      setToast({ message: "Expense deleted", type: "success" });
      fetchAll();
    } catch (err) {
      setError("Could not delete expense");
    }
  };

  const handleDeleteGroup = async () => {
    if (!window.confirm("Delete this entire trip and all its expenses? This cannot be undone.")) return;

    try {
      await API.delete("/groups/" + groupId);
      navigate("/dashboard");
    } catch (err) {
      setError("Could not delete trip");
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setMemberError("");

    try {
      const findRes = await API.get("/auth/find?email=" + encodeURIComponent(memberEmail));
      const foundUser = findRes.data.user;

      await API.post("/groups/" + groupId + "/members", {
        userId: foundUser._id,
      });

      setMemberEmail("");
      setToast({ message: `Added ${toTitleCase(foundUser.name)} to trip!`, type: "success" });
      fetchAll();
    } catch (err) {
      setMemberError(err.response?.data?.message || "Could not add member");
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm("Remove this member from the trip?")) return;

    try {
      await API.delete("/groups/" + groupId + "/members/" + memberId);
      setToast({ message: "Member removed", type: "success" });
      fetchAll();
    } catch (err) {
      setMemberError(err.response?.data?.message || "Could not remove member");
    }
  };

  const handleAskAI = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userQuestion = question;
    setChatHistory((prev) => [...prev, { role: "user", text: userQuestion }]);
    setQuestion("");
    setAsking(true);

    try {
      const res = await API.post("/expenses/group/" + groupId + "/ask", {
        question: userQuestion,
      });
      setChatHistory((prev) => [...prev, { role: "ai", text: res.data.answer }]);
    } catch (err) {
      setChatHistory((prev) => [
        ...prev,
        { role: "ai", text: "Sorry, I could not answer that right now." },
      ]);
    } finally {
      setAsking(false);
    }
  };

  if (!group) {
    return (
      <Layout>
        <div
          className="card"
          style={{
            maxWidth: "600px",
            margin: "60px auto",
            textAlign: "center",
            padding: "40px",
          }}
        >
          {groupError ? (
            <>
              <div style={{ fontSize: "48px", marginBottom: "15px" }}>🔒</div>
              <h2 style={{ marginBottom: "10px" }}>Access Denied</h2>
              <p style={{ color: "#8b93a6", marginBottom: "25px", lineHeight: 1.6 }}>
                {groupError}
              </p>
              <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
            </>
          ) : (
            <p style={{ textAlign: "center", margin: 0, color: "#8b93a6" }}>
              Loading Safar-E-Life trip data...
            </p>
          )}
        </div>
      </Layout>
    );
  }

  const rawPercent =
    summary && summary.estimatedBudget > 0
      ? Math.round((summary.actualTotal / summary.estimatedBudget) * 100)
      : 0;

  const progressPercent = Math.min(rawPercent, 100);
  const isOverBudget = summary && summary.status === "over budget";
  const progressColor = isOverBudget ? "#ff6b5c" : "#29b6a6";

  const isCreator = currentUser && group.createdBy === currentUser.id;

  return (
    <Layout>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      {/* TOP NAVIGATION ACTIONS */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            backgroundColor: "transparent",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            color: "#8b93a6",
          }}
        >
          ← Back to Dashboard
        </button>

        {isCreator && (
          <button
            onClick={handleDeleteGroup}
            style={{
              backgroundColor: "rgba(255, 107, 92, 0.2)",
              border: "1px solid #ff6b5c",
              color: "#ff6b5c",
            }}
          >
            Delete Trip
          </button>
        )}
      </div>

      {/* GROUP HEADER */}
      <div className="card">
        <h2>{group.name}</h2>
        <p style={{ color: "#8b93a6", marginTop: "4px" }}>{group.description}</p>

        <div className="avatar-row" style={{ marginTop: "14px" }}>
          {group.members.map((m) => (
            <span key={m._id} className="avatar-label">
              <span
                className="avatar"
                style={{
                  backgroundColor: getAvatarColor(m.name),
                }}
              >
                {getInitials(m.name)}
              </span>
              {toTitleCase(m.name)}
              {isCreator && m._id !== group.createdBy && (
                <button
                  onClick={() => handleRemoveMember(m._id)}
                  style={{
                    padding: "2px 6px",
                    fontSize: "10px",
                    backgroundColor: "rgba(255,255,255,0.1)",
                    color: "#ff6b5c",
                    border: "none",
                    marginLeft: "4px",
                  }}
                >
                  ×
                </button>
              )}
            </span>
          ))}
        </div>

        {/* ADD MEMBER FORM */}
        <form
          onSubmit={handleAddMember}
          style={{
            display: "flex",
            gap: "8px",
            marginTop: "16px",
          }}
        >
          <input
            type="email"
            placeholder="Add member by email..."
            value={memberEmail}
            onChange={(e) => setMemberEmail(e.target.value)}
            style={{ flex: 1 }}
            required
          />
          <button type="submit">+ Add Member</button>
        </form>

        {memberError && <p className="error-text">{memberError}</p>}
      </div>

      {/* TRIP STATS */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Members</div>
          <div className="stat-value">{group.members.length}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Total Budget</div>
          <div className="stat-value">{formatMoney(group.estimatedBudget)}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Spent So Far</div>
          <div className="stat-value">{formatMoney(summary ? summary.actualTotal : 0)}</div>
        </div>
      </div>

      {/* SPENDING INSIGHTS */}
      {insights.length > 0 && (
        <div
          className="card"
          style={{
            borderLeft: "4px solid #f2a33c",
            background: "rgba(22, 29, 43, 0.85)",
          }}
        >
          <h3 style={{ marginTop: 0 }}>💡 Spending Insights</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
            {insights.map((insight, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  fontSize: "13px",
                  color: "#e2e8f0",
                }}
              >
                <span style={{ color: "#f2a33c" }}>•</span>
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ASK SAFAR-E-LIFE AI */}
      <div
        className="card"
        style={{
          border: "1px solid rgba(123, 110, 246, 0.35)",
          borderLeft: "4px solid #7b6ef6",
          background: "linear-gradient(145deg, rgba(25, 32, 50, 0.98), rgba(17, 23, 38, 0.98))",
          boxShadow: "0 18px 50px rgba(0, 0, 0, 0.18)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            marginBottom: "14px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #7b6ef6 0%, #5b8cff 100%)",
                fontSize: "20px",
              }}
            >
              🤖
            </div>

            <div>
              <h3 style={{ margin: 0, fontSize: "18px" }}>Ask Safar-E-Life AI</h3>
              <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#8b93a6" }}>
                Your trip's intelligent financial assistant
              </p>
            </div>
          </div>

          {chatHistory.length > 0 && (
            <button
              type="button"
              onClick={() => setChatHistory([])}
              style={{
                padding: "6px 10px",
                fontSize: "11px",
                backgroundColor: "#252d3d",
                color: "#b8c0d0",
              }}
            >
              Clear chat
            </button>
          )}
        </div>

        {/* SUGGESTED QUESTIONS */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "14px" }}>
          {[
            "Why are we over budget?",
            "Who owes whom?",
            "Where are we spending the most?",
            "How can we reduce spending?",
          ].map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setQuestion(suggestion)}
              disabled={asking}
              style={{
                padding: "6px 12px",
                borderRadius: "999px",
                border: "1px solid rgba(123, 110, 246, 0.35)",
                backgroundColor: "rgba(123, 110, 246, 0.08)",
                color: "#c9c5ff",
                fontSize: "11px",
                cursor: asking ? "not-allowed" : "pointer",
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>

        {/* CHAT HISTORY */}
        <div
          style={{
            minHeight: chatHistory.length > 0 ? "150px" : "80px",
            maxHeight: "330px",
            overflowY: "auto",
            padding: "14px",
            marginBottom: "14px",
            borderRadius: "14px",
            backgroundColor: "rgba(10, 15, 27, 0.55)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
          }}
        >
          {chatHistory.length === 0 && !asking && (
            <div style={{ height: "100%", minHeight: "50px", display: "flex", alignItems: "center", justifyContent: "center", color: "#727c91", fontSize: "13px" }}>
              Ask your first question and I'll analyze this trip for you.
            </div>
          )}

          {chatHistory.map((msg, index) => (
            <div key={index} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", maxWidth: "88%", flexDirection: msg.role === "user" ? "row-reverse" : "row" }}>
                <div style={{ flexShrink: 0, width: "28px", height: "28px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: msg.role === "user" ? "#29b6a6" : "#7b6ef6", color: "#fff", fontSize: "11px", fontWeight: 700 }}>
                  {msg.role === "user" ? "You" : "AI"}
                </div>
                <div style={{ padding: "10px 13px", borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px", backgroundColor: msg.role === "user" ? "#5f52d8" : "#202a3c", color: "#edf0f6", fontSize: "13px", lineHeight: 1.55, whiteSpace: "pre-wrap" }}>
                  {msg.role === "ai" ? renderAIText(msg.text) : msg.text}
                </div>
              </div>
            </div>
          ))}

          {asking && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#8b93a6", fontSize: "12px" }}>
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "#7b6ef6", display: "inline-block" }} />
              Safar-E-Life is analyzing your trip...
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* ASK FORM */}
        <form onSubmit={handleAskAI} style={{ display: "flex", gap: "9px" }}>
          <input
            type="text"
            placeholder="Ask a question about this trip..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={asking}
            style={{ flex: 1, backgroundColor: "#1c2638", border: "1px solid rgba(123, 110, 246, 0.28)" }}
          />
          <button type="submit" disabled={asking || !question.trim()} style={{ minWidth: "82px", background: "linear-gradient(135deg, #7b6ef6, #5b8cff)" }}>
            {asking ? "..." : "Ask"}
          </button>
        </form>
      </div>

      {/* ESTIMATE VS ACTUAL & VISUAL CATEGORY BREAKDOWN */}
      {summary && (
        <div
          className="card"
          style={{
            background: isOverBudget
              ? "linear-gradient(135deg, rgba(43, 20, 22, 0.9), rgba(22, 29, 43, 0.9))"
              : "rgba(22, 29, 43, 0.85)",
            border: isOverBudget
              ? "1px solid rgba(255, 107, 92, 0.4)"
              : "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h3 style={{ margin: 0 }}>Estimate vs Actual</h3>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                padding: "4px 10px",
                borderRadius: "20px",
                backgroundColor: isOverBudget ? "rgba(255, 107, 92, 0.2)" : "rgba(41, 182, 166, 0.2)",
                color: isOverBudget ? "#ff6b5c" : "#29b6a6",
              }}
            >
              {isOverBudget ? "⚠️ OVER BUDGET" : "✓ ON TRACK"}
            </span>
          </div>

          <div className="progress-track" style={{ marginBottom: "8px" }}>
            <div className="progress-fill" style={{ width: progressPercent + "%", backgroundColor: progressColor }} />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#8b93a6", marginBottom: "16px" }}>
            <span>{rawPercent}% of budget used</span>
            <strong style={{ color: progressColor }}>
              {isOverBudget
                ? `${formatMoney(Math.abs(summary.difference))} over budget`
                : `${formatMoney(summary.difference)} remaining`}
            </strong>
          </div>

          {/* VISUAL CATEGORY BREAKDOWN WITH PROGRESS BARS & BADGES */}
          <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
            <strong style={{ fontSize: "14px", display: "block", marginBottom: "12px" }}>
              Category Breakdown
            </strong>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {Object.keys(summary.categoryBreakdown || {}).map((cat) => {
                const amountSpent = summary.categoryBreakdown[cat];
                const catPercent = summary.actualTotal > 0 ? Math.round((amountSpent / summary.actualTotal) * 100) : 0;
                const icon = CATEGORY_ICONS[cat] || "📦";
                const catColor = CATEGORY_COLORS[cat] || "#7b6ef6";

                return (
                  <div key={cat}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
                      <span>
                        <span style={{ marginRight: "6px" }}>{icon}</span>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </span>
                      <span>
                        <strong>{formatMoney(amountSpent)}</strong>{" "}
                        <span style={{ fontSize: "11px", color: "#8b93a6" }}>({catPercent}%)</span>
                      </span>
                    </div>

                    <div style={{ height: "6px", backgroundColor: "rgba(255, 255, 255, 0.08)", borderRadius: "4px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${catPercent}%`, backgroundColor: catColor, borderRadius: "4px" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* RECEIPT SCANNER WITH EXTRACTED REVIEW CARD */}
      <div className="card">
        <h3 style={{ marginTop: 0, marginBottom: "12px" }}>📸 Scan Receipt with Gemini Vision</h3>

        <div
          style={{
            border: "2px dashed rgba(123, 110, 246, 0.4)",
            borderRadius: "14px",
            padding: "24px",
            textAlign: "center",
            background: "rgba(123, 110, 246, 0.04)",
            marginBottom: "16px",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onClick={() => document.getElementById("receiptFileInput").click()}
        >
          <input
            id="receiptFileInput"
            type="file"
            accept="image/*"
            onChange={(e) => setReceiptFile(e.target.files[0])}
            style={{ display: "none" }}
          />

          <div style={{ fontSize: "32px", marginBottom: "8px" }}>📸</div>
          <div style={{ fontWeight: 700, color: "#ffffff", marginBottom: "4px" }}>
            {receiptFile ? receiptFile.name : "Drag & drop receipt image or click to browse"}
          </div>
          <div style={{ fontSize: "12px", color: "#8b93a6" }}>
            Supports JPG, PNG, WEBP (Max 5MB)
          </div>
        </div>

        <button
          type="button"
          onClick={handleScanReceipt}
          disabled={scanning || !receiptFile}
          style={{
            width: "100%",
            background: scanning || !receiptFile ? "#3a3f4a" : "linear-gradient(135deg, #7b6ef6, #5b8cff)",
          }}
        >
          {scanning ? "Analyzing Receipt with Gemini Vision..." : "Scan & Extract Receipt Details"}
        </button>

        {scanError && <p className="error-text">{scanError}</p>}

        {/* EXTRACTED RECEIPT REVIEW CARD */}
        {extractedReceipt && (
          <div
            style={{
              marginTop: "16px",
              padding: "16px",
              borderRadius: "12px",
              background: "rgba(41, 182, 166, 0.1)",
              border: "1px solid rgba(41, 182, 166, 0.3)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <strong style={{ color: "#29b6a6", fontSize: "14px" }}>Receipt Detected ✓</strong>
              <span style={{ fontSize: "11px", color: "#8b93a6" }}>Gemini Vision AI</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "13px", marginBottom: "14px" }}>
              <div>
                <span style={{ color: "#8b93a6", fontSize: "11px", display: "block" }}>Description / Merchant</span>
                <strong style={{ color: "#ffffff" }}>{extractedReceipt.description || "N/A"}</strong>
              </div>
              <div>
                <span style={{ color: "#8b93a6", fontSize: "11px", display: "block" }}>Extracted Total</span>
                <strong style={{ color: "#29b6a6" }}>{formatMoney(extractedReceipt.amount)}</strong>
              </div>
              <div>
                <span style={{ color: "#8b93a6", fontSize: "11px", display: "block" }}>Suggested Category</span>
                <strong style={{ color: "#ffffff" }}>
                  {CATEGORY_ICONS[extractedReceipt.category] || "📦"} {extractedReceipt.category || "misc"}
                </strong>
              </div>
            </div>

            <button
              type="button"
              onClick={applyExtractedReceipt}
              style={{
                width: "100%",
                background: "linear-gradient(135deg, #29b6a6, #229688)",
                color: "#ffffff",
                fontWeight: 700,
              }}
            >
              ✓ Review & Apply to Expense Form
            </button>
          </div>
        )}
      </div>

      {/* ADD / EDIT EXPENSE FORM */}
      <div className="card">
        <h3 style={{ marginTop: 0 }}>
          {editingId ? "Edit expense" : "Add an expense"}
        </h3>

        <form onSubmit={handleAddExpense}>
          <div style={{ marginBottom: "12px" }}>
            <label style={{ fontSize: "12px", color: "#8b93a6" }}>Description</label>
            <input
              type="text"
              placeholder="e.g. Dinner at Hotel"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: "100%" }}
              required
            />
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label style={{ fontSize: "12px", color: "#8b93a6" }}>Amount (₹)</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Amount in ₹"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{ width: "100%" }}
              required
            />
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label style={{ fontSize: "12px", color: "#8b93a6" }}>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: "100%" }}>
              <option value="food">🍕 Food</option>
              <option value="travel">✈️ Travel</option>
              <option value="stay">🏨 Stay</option>
              <option value="activities">🎟️ Activities</option>
              <option value="misc">📦 Misc</option>
            </select>
          </div>

          {/* SPLIT EXPENSE CONTROLS */}
          {!editingId && group && group.members && (
            <div
              style={{
                marginBottom: "16px",
                padding: "14px",
                backgroundColor: "rgba(30, 41, 59, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "12px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <strong style={{ fontSize: "13px", color: "#ffffff" }}>SPLIT METHOD</strong>
                <span style={{ fontSize: "11px", color: "#8b93a6" }}>Deterministic Cents Allocation</span>
              </div>

              <div style={{ display: "flex", gap: "15px", marginBottom: "12px" }}>
                <label style={{ cursor: "pointer", fontSize: "13px" }}>
                  <input type="radio" name="splitMode" value="equal" checked={splitMode === "equal"} onChange={() => setSplitMode("equal")} />
                  {" "}EQUAL SPLIT
                </label>
                <label style={{ cursor: "pointer", fontSize: "13px" }}>
                  <input type="radio" name="splitMode" value="custom" checked={splitMode === "custom"} onChange={() => setSplitMode("custom")} />
                  {" "}CUSTOM SPLIT
                </label>
              </div>

              {splitMode === "equal" && (
                <div>
                  {group.members.map((member) => {
                    const equalShares = calculateEqualShares();
                    return (
                      <div key={member._id} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", padding: "4px 0", color: "#cbd5e1" }}>
                        <span>{toTitleCase(member.name)}</span>
                        <strong>{formatMoney(equalShares[member._id] || 0)}</strong>
                      </div>
                    );
                  })}
                </div>
              )}

              {splitMode === "custom" && (
                <div>
                  {group.members.map((member) => (
                    <div key={member._id} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                      <span style={{ flex: 1, fontSize: "13px" }}>{toTitleCase(member.name)}</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Share ₹"
                        value={customShares[member._id] ?? ""}
                        onChange={(e) => setCustomShares((prev) => ({ ...prev, [member._id]: e.target.value }))}
                        style={{ width: "120px" }}
                      />
                    </div>
                  ))}

                  <div style={{ marginTop: "10px", fontSize: "12px", fontWeight: 700, textAlign: "right", color: "#8b93a6" }}>
                    Total: {formatMoney(calculateCustomTotal())} / {formatMoney(amount || 0)}
                  </div>
                </div>
              )}
            </div>
          )}

          {error && <p className="error-text">{error}</p>}

          <div style={{ display: "flex", gap: "8px" }}>
            <button type="submit">{editingId ? "Save Changes" : "+ Add Expense"}</button>
            {editingId && (
              <button type="button" onClick={resetForm} style={{ backgroundColor: "transparent", border: "1px solid rgba(255, 255, 255, 0.15)", color: "#8b93a6" }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* EXPENSES LIST */}
      <h3>Expenses</h3>

      {expenses.length === 0 && (
        <div className="empty-state">No expenses recorded yet for this trip.</div>
      )}

      {expenses.map((exp) => {
        const splitList = getNormalizedSplits(exp);
        const splitTotal = splitList.reduce((sum, s) => sum + Number(s.share || 0), 0);
        const splitType = exp.splitMode === "custom" ? "CUSTOM" : "EQUAL";
        const diff = Math.abs(splitTotal - Number(exp.amount));
        const splitVerified = diff < 0.001;

        return (
          <div key={exp._id} className="list-item" style={{ display: "block", marginBottom: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
              <div>
                <strong style={{ fontSize: "15px" }}>{exp.description}</strong>
                <br />
                <small style={{ color: "#8b93a6" }}>
                  Paid by <strong>{toTitleCase(exp.paidBy?.name)}</strong> • {CATEGORY_ICONS[exp.category] || "📦"} {exp.category}
                </small>
              </div>

              <span className="amount">{formatMoney(exp.amount)}</span>
            </div>

            {/* SPLIT BREAKDOWN WITH TRANSPARENT MISMATCH DETAILS */}
            {splitList.length > 0 && (
              <div
                style={{
                  marginTop: "12px",
                  padding: "12px",
                  backgroundColor: "rgba(30, 41, 59, 0.8)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "10px",
                  color: "#e2e8f0",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <strong style={{ fontSize: "12px", color: "#8b93a6" }}>SPLIT BREAKDOWN ({splitType})</strong>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "12px",
                      backgroundColor: splitVerified ? "rgba(41, 182, 166, 0.2)" : "rgba(255, 107, 92, 0.2)",
                      color: splitVerified ? "#29b6a6" : "#ff6b5c",
                    }}
                  >
                    {splitVerified ? "✓ VERIFIED" : `⚠️ Mismatch (Diff: ${formatMoney(diff)})`}
                  </span>
                </div>

                {splitList.map((split, index) => (
                  <div key={split.user?._id || index} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", fontSize: "13px" }}>
                    <span>{toTitleCase(split.user?.name || "Member")}</span>
                    <strong>{formatMoney(split.share || 0)}</strong>
                  </div>
                ))}

                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", paddingTop: "6px", borderTop: "1px dashed rgba(255,255,255,0.1)", fontSize: "12px", color: "#8b93a6" }}>
                  <span>Split Total vs Expense</span>
                  <strong>{formatMoney(splitTotal)} / {formatMoney(exp.amount)}</strong>
                </div>
              </div>
            )}

            {currentUser && exp.paidBy?._id === currentUser.id && (
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "10px" }}>
                <button onClick={() => startEditExpense(exp)} style={{ padding: "4px 10px", fontSize: "12px" }}>Edit</button>
                <button onClick={() => handleDeleteExpense(exp._id)} style={{ padding: "4px 10px", fontSize: "12px", backgroundColor: "rgba(255, 107, 92, 0.2)", color: "#ff6b5c", border: "none" }}>Delete</button>
              </div>
            )}
          </div>
        );
      })}

      {/* DIRECTIONAL SETTLEMENT PLAN WITH "MARK AS PAID" BUTTON */}
      <h3>Settlement Plan</h3>

      {settlement.length === 0 && (
        <div className="empty-state">Everyone is settled up! 🎉</div>
      )}

      {settlement.map((t, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px",
            marginBottom: "12px",
            background: "rgba(22, 29, 43, 0.85)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700, color: "#ffffff" }}>{toTitleCase(t.fromName)}</span>
            <span style={{ color: "#7b6ef6", fontSize: "16px", fontWeight: 900 }}>➔</span>
            <span style={{ fontWeight: 700, color: "#ffffff" }}>{toTitleCase(t.toName)}</span>

            <span
              style={{
                fontSize: "11px",
                padding: "3px 10px",
                borderRadius: "12px",
                background: "rgba(123, 110, 246, 0.15)",
                color: "#c9c5ff",
                fontWeight: 600,
              }}
            >
              {toTitleCase(t.fromName)} owes {toTitleCase(t.toName)}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ fontWeight: 700, fontSize: "16px", color: "#29b6a6", fontFamily: "JetBrains Mono, monospace" }}>
              {formatMoney(t.amount)}
            </div>

            <button
              type="button"
              onClick={() => handleMarkAsPaid(t)}
              style={{
                padding: "6px 12px",
                fontSize: "12px",
                background: "linear-gradient(135deg, #29b6a6, #229688)",
                color: "#ffffff",
                fontWeight: 700,
                border: "none",
                borderRadius: "8px",
              }}
            >
              ✓ Mark as Paid
            </button>
          </div>
        </div>
      ))}

      {/* SETTLEMENT HISTORY LOG */}
      {settlementHistory.length > 0 && (
        <div style={{ marginTop: "24px" }}>
          <h4 style={{ color: "#8b93a6", marginBottom: "12px" }}>Settlement History</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {settlementHistory.map((s) => (
              <div
                key={s._id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "12px",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  color: "#cbd5e1",
                }}
              >
                <span>
                  ✓ <strong>{toTitleCase(s.fromUser?.name)}</strong> paid <strong>{toTitleCase(s.toUser?.name)}</strong>
                </span>
                <div>
                  <strong style={{ color: "#29b6a6", marginRight: "12px" }}>{formatMoney(s.amount)}</strong>
                  <span style={{ color: "#64748b", fontSize: "11px" }}>
                    {new Date(s.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}

export default GroupDetail;
