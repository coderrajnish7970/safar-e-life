import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "./api";

function Dashboard() {
  const [groups, setGroups] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [estimatedBudget, setEstimatedBudget] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const fetchGroups = async () => {
    try {
      const res = await API.get("/groups");
      setGroups(res.data.groups);
    } catch {
      setError("Could not load groups");
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await API.post("/groups", {
        name: name,
        description: description,
        estimatedBudget: Number(estimatedBudget) || 0,
      });

      setName("");
      setDescription("");
      setEstimatedBudget("");
      fetchGroups();
    } catch {
      setError("Could not create group");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div style={{ maxWidth: "700px", margin: "40px auto", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Welcome, {user && user.name}</h2>
        <div>
          <button onClick={() => navigate("/plan-trip")} style={{ marginRight: "8px" }}>
            Plan a Trip
          </button>
          <button onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <h3>Create a new trip or group</h3>
      <form onSubmit={handleCreateGroup} style={{ marginBottom: "30px" }}>
        <div style={{ marginBottom: "10px" }}>
          <input
            type="text"
            placeholder="Group name example Goa Trip 2026"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: "100%" }}
            required
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <input
            type="number"
            placeholder="Estimated budget"
            value={estimatedBudget}
            onChange={(e) => setEstimatedBudget(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit">
          Create Group
        </button>
      </form>

      <h3>Your groups</h3>
      {groups.length === 0 && <p>No groups yet. Create one above.</p>}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {groups.map((group) => (
          <li
            key={group._id}
            className="group-card"
            onClick={() => navigate("/groups/" + group._id)}
            style={{
              border: "1px solid #333",
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "10px",
              cursor: "pointer",
            }}
          >
            <strong>{group.name}</strong>
            <p style={{ margin: "4px 0" }}>{group.description}</p>
            <small>{group.members.length} members</small>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;