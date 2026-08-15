import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "./api";
import Layout from "./Layout";
import { formatMoney } from "./utils/formatMoney";

const AVATAR_COLORS = [
  "#7b6ef6",
  "#29b6a6",
  "#f2a33c",
  "#ff6b5c",
  "#4f8ef7",
];

const BANNER_GRADIENTS = [
  "linear-gradient(135deg, #1e3a5f, #4f8ef7)",
  "linear-gradient(135deg, #2d1b4e, #7b6ef6)",
  "linear-gradient(135deg, #1a3a2e, #29b6a6)",
  "linear-gradient(135deg, #4a2333, #ff6b5c)",
  "linear-gradient(135deg, #3a2a1a, #f2a33c)",
];

function toTitleCase(str) {
  if (!str) return "";
  return String(str).replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
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

function getBanner(name) {
  if (!name) return BANNER_GRADIENTS[0];

  let sum = 0;

  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }

  return BANNER_GRADIENTS[sum % BANNER_GRADIENTS.length];
}

function Dashboard() {
  const [groups, setGroups] = useState([]);
  const [groupSummaries, setGroupSummaries] = useState({});
  const [error, setError] = useState("");
  const [pendingReceivable, setPendingReceivable] = useState(0);
  const [insights, setInsights] = useState([]);

  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  let user = null;
  if (storedUser) {
    try {
      user = JSON.parse(storedUser);
    } catch {
      user = null;
    }
  }

  const fetchGroups = async () => {
    try {
      setError("");

      const res = await API.get("/groups/dashboard-summary");
      const fetchedGroups = res.data.groups || [];
      const summaries = res.data.groupSummaries || {};
      const netReceivable = res.data.pendingReceivable || 0;

      setGroups(fetchedGroups);
      setGroupSummaries(summaries);
      setPendingReceivable(netReceivable);

      const allInsights = [];

      const totalSpent = Object.values(summaries).reduce(
        (sum, x) => sum + (x.actualTotal || 0),
        0
      );

      const totalBudget = Object.values(summaries).reduce(
        (sum, x) => sum + (x.estimatedBudget || 0),
        0
      );

      if (totalBudget > 0) {
        const percent = Math.round((totalSpent / totalBudget) * 100);

        allInsights.push({
          icon: "💰",
          title: percent + "% of total budget used across all trips",
          sub:
            percent > 100
              ? `You are ${formatMoney(totalSpent - totalBudget)} over budget overall`
              : `You are on track overall (${formatMoney(totalBudget - totalSpent)} remaining)`,
        });
      }

      const overBudgetGroups = fetchedGroups.filter(
        (g) => summaries[g._id] && summaries[g._id].status === "over budget"
      );

      if (overBudgetGroups.length > 0) {
        allInsights.push({
          icon: "⚠️",
          title: overBudgetGroups.length + " trip(s) are over budget",
          sub: overBudgetGroups.map((g) => g.name).join(", "),
        });
      }

      setInsights(allInsights);
    } catch {
      setError("Could not load trips");
    }
  };

  useEffect(() => {
    fetchGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalBudget = groups.reduce((sum, g) => sum + (g.estimatedBudget || 0), 0);

  const totalSpent = Object.values(groupSummaries).reduce(
    (sum, s) => sum + (s.actualTotal || 0),
    0
  );

  const budgetPercent =
    totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  return (
    <Layout>
      <div>
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "24px",
          }}
        >
          <div>
            <h2 style={{ marginBottom: "4px" }}>
              Welcome back, {user && toTitleCase(user.name)} 👋
            </h2>

            <p style={{ color: "#8b93a6", marginTop: 0 }}>
              Here's what's happening across your trips
            </p>
          </div>

          <button onClick={() => navigate("/create-trip")}>
            + Create a Trip
          </button>
        </div>

        {/* STATS */}
        <div className="dash-stats-grid">
          <div className="dash-stat-card">
            <div
              className="dash-stat-icon"
              style={{ backgroundColor: "rgba(123,110,246,0.15)" }}
            >
              🧳
            </div>

            <div className="dash-stat-label">Total Trips</div>
            <div className="dash-stat-value">{groups.length}</div>
            <div className="dash-stat-sub">Active trips</div>
          </div>

          <div className="dash-stat-card">
            <div
              className="dash-stat-icon"
              style={{ backgroundColor: "rgba(41,182,166,0.15)" }}
            >
              💰
            </div>

            <div className="dash-stat-label">Total Budget</div>
            <div className="dash-stat-value">{formatMoney(totalBudget)}</div>
            <div className="dash-stat-sub">Across all trips</div>
          </div>

          <div className="dash-stat-card">
            <div
              className="dash-stat-icon"
              style={{ backgroundColor: "rgba(255,107,92,0.15)" }}
            >
              💸
            </div>

            <div className="dash-stat-label">Total Spent</div>
            <div className="dash-stat-value">{formatMoney(totalSpent)}</div>
            <div className="dash-stat-sub">{budgetPercent}% of budget</div>
          </div>

          {/* HUMANIZED SETTLEMENT CARD */}
          <div className="dash-stat-card">
            <div
              className="dash-stat-icon"
              style={{
                backgroundColor:
                  pendingReceivable >= 0
                    ? "rgba(41,182,166,0.15)"
                    : "rgba(255,107,92,0.15)",
              }}
            >
              💳
            </div>

            <div className="dash-stat-label">
              {pendingReceivable >= 0 ? "YOU'RE OWED" : "YOU OWE"}
            </div>

            <div
              className="dash-stat-value"
              style={{
                color: pendingReceivable >= 0 ? "#29b6a6" : "#ff6b5c",
              }}
            >
              {formatMoney(Math.abs(pendingReceivable))}
            </div>

            <div className="dash-stat-sub">
              {pendingReceivable >= 0 ? "Net balance across trips" : "Net debt across trips"}
            </div>
          </div>
        </div>

        {error && <p className="error-text">{error}</p>}

        {/* MAIN CONTENT */}
        <div className="dash-content-grid">
          {/* YOUR GROUPS */}
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3>Your Trips</h3>

              <button
                onClick={() => navigate("/create-trip")}
                style={{ fontSize: "13px" }}
              >
                + Create Trip
              </button>
            </div>

            {groups.length === 0 && (
              <div className="empty-state">
                <div style={{ fontSize: "32px", marginBottom: "10px" }}>🧳</div>
                <div style={{ fontWeight: 700, marginBottom: "6px" }}>
                  No trips yet
                </div>
                <div style={{ color: "#8b93a6", marginBottom: "14px" }}>
                  Create your first group trip and start managing expenses together.
                </div>

                <button onClick={() => navigate("/create-trip")}>
                  + Create a Trip
                </button>
              </div>
            )}

            {groups.map((group) => {
              const s = groupSummaries[group._id];
              const actualSpent = s ? s.actualTotal : 0;
              const budgetAmount = group.estimatedBudget || 0;
              const rawPercent = budgetAmount > 0 ? Math.round((actualSpent / budgetAmount) * 100) : 0;
              const percent = Math.min(rawPercent, 100);
              const isOver = s && s.status === "over budget";
              const ringColor = isOver ? "#ff6b5c" : "#29b6a6";

              return (
                <div
                  key={group._id}
                  className="group-card-v2"
                  onClick={() => navigate("/groups/" + group._id)}
                >
                  <div
                    className="group-banner"
                    style={{ background: getBanner(group.name) }}
                  >
                    <span
                      className="group-banner-badge"
                      style={{
                        backgroundColor: isOver ? "rgba(255, 107, 92, 0.9)" : "rgba(41, 182, 166, 0.9)",
                      }}
                    >
                      {isOver ? "Over Budget" : "Active"}
                    </span>
                  </div>

                  <div className="group-card-body">
                    <div>
                      <strong style={{ fontSize: "16px" }}>{group.name}</strong>

                      <p style={{ margin: "3px 0 8px 0", color: "#8b93a6", fontSize: "13px" }}>
                        {group.description}
                      </p>

                      <div className="avatar-row" style={{ marginTop: 0 }}>
                        {group.members.slice(0, 4).map((m) => (
                          <span
                            key={m._id}
                            className="avatar"
                            style={{
                              backgroundColor: getAvatarColor(m.name),
                              width: "24px",
                              height: "24px",
                              fontSize: "10px",
                            }}
                            title={toTitleCase(m.name)}
                          >
                            {getInitials(m.name)}
                          </span>
                        ))}
                        <span style={{ fontSize: "12px", color: "#8b93a6", marginLeft: "6px" }}>
                          {group.members.length} members
                        </span>
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "12px", color: "#8b93a6" }}>
                        Spent
                      </div>

                      <div className="amount" style={{ color: ringColor, fontSize: "15px" }}>
                        {formatMoney(actualSpent)}
                      </div>

                      <div style={{ fontSize: "11px", color: "#8b93a6", marginTop: "2px" }}>
                        Budget {formatMoney(budgetAmount)}
                      </div>

                      {isOver && (
                        <div style={{ fontSize: "10px", color: "#ff6b5c", marginTop: "2px", fontWeight: 700 }}>
                          {formatMoney(actualSpent - budgetAmount)} over
                        </div>
                      )}
                    </div>

                    <div
                      className="ring"
                      style={{
                        background: `conic-gradient(${ringColor} ${percent}%, rgba(255,255,255,0.08) 0)`,
                      }}
                    >
                      <span>{rawPercent}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* AI INSIGHT */}
          <div>
            <div className="card">
              <h3 style={{ marginTop: 0 }}>AI Spending Insight</h3>

              {insights.length === 0 && (
                <p style={{ color: "#8b93a6", fontSize: "13px" }}>
                  Add expenses to your trips to see insights here.
                </p>
              )}

              {insights.map((ins, i) => (
                <div className="insight-row" key={i}>
                  <span className="insight-icon">{ins.icon}</span>

                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 600 }}>
                      {ins.title}
                    </div>

                    <div style={{ fontSize: "12px", color: "#8b93a6" }}>
                      {ins.sub}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;
