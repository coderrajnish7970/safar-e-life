import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "./api";

function GroupDetail() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [settlement, setSettlement] = useState([]);
  const [summary, setSummary] = useState(null);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("misc");
  const [error, setError] = useState("");

  const [receiptFile, setReceiptFile] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState("");

  const fetchAll = async () => {
    try {
      const groupRes = await API.get("/groups/" + groupId);
      setGroup(groupRes.data.group);

      const expensesRes = await API.get("/expenses/group/" + groupId);
      setExpenses(expensesRes.data.expenses);

      const settlementRes = await API.get("/expenses/group/" + groupId + "/settlement");
      setSettlement(settlementRes.data.transactions);

      const summaryRes = await API.get("/expenses/group/" + groupId + "/summary");
      setSummary(summaryRes.data);
    } catch (err) {
      setError("Could not load group data");
    }
  };

  useEffect(() => {
    fetchAll();
  }, [groupId]);

  const handleScanReceipt = async () => {
    if (!receiptFile) {
      setScanError("Please choose an image first");
      return;
    }

    setScanning(true);
    setScanError("");

    try {
      const formData = new FormData();
      formData.append("receipt", receiptFile);

      const res = await API.post("/receipts/scan", formData);

      const extracted = res.data.extracted;
      setDescription(extracted.description || "");
      setAmount(extracted.amount || "");
      setCategory(extracted.category || "misc");
    } catch (err) {
      setScanError("Could not scan receipt. Try entering details manually.");
    } finally {
      setScanning(false);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await API.post("/expenses", {
        groupId: groupId,
        description: description,
        amount: Number(amount),
        category: category,
      });

      setDescription("");
      setAmount("");
      setCategory("misc");
      setReceiptFile(null);
      fetchAll();
    } catch (err) {
      setError("Could not add expense");
    }
  };

  const findName = (userId) => {
    if (!group) return userId;
    const member = group.members.find((m) => m._id === userId);
    return member ? member.name : userId;
  };

  if (!group) {
    return <p style={{ textAlign: "center", marginTop: "40px" }}>Loading...</p>;
  }

  return (
    <div className="page-container">
      <button onClick={() => navigate("/dashboard")} style={{ marginBottom: "20px" }}>
        Back to Dashboard
      </button>

      <div className="card">
        <h2>{group.name}</h2>
        <p>{group.description}</p>
        <p>
          <strong>Estimated budget: </strong> Rs {group.estimatedBudget}
        </p>
        <p>
          <strong>Members:</strong> {group.members.map((m) => m.name).join(", ")}
        </p>
      </div>

      {summary && (
        <div className={summary.status === "over budget" ? "budget-card-over" : "budget-card-under"}>
          <h3 style={{ marginTop: 0 }}>Estimate vs Actual</h3>
          <p>Estimated: Rs {summary.estimatedBudget}</p>
          <p>Actual spent: Rs {summary.actualTotal}</p>
          <p style={{ fontWeight: "bold" }}>
            {summary.status === "over budget"
              ? "Rs " + Math.abs(summary.difference) + " over budget"
              : "Rs " + summary.difference + " under budget"}
          </p>
          <div>
            <strong>By category:</strong>
            <ul style={{ margin: "6px 0 0 0", paddingLeft: "20px" }}>
              {Object.keys(summary.categoryBreakdown).map((cat) => (
                <li key={cat}>
                  {cat}: Rs {summary.categoryBreakdown[cat]}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Scan a receipt</h3>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setReceiptFile(e.target.files[0])}
          style={{ marginBottom: "10px", display: "block" }}
        />
        <button type="button" onClick={handleScanReceipt} disabled={scanning}>
          {scanning ? "Scanning..." : "Scan Receipt"}
        </button>
        {scanError && <p className="error-text">{scanError}</p>}
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Add an expense</h3>
        <form onSubmit={handleAddExpense}>
          <div style={{ marginBottom: "10px" }}>
            <input
              type="text"
              placeholder="Description example Dinner"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: "100%" }}
              required
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{ width: "100%" }}
              required
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ width: "100%" }}
            >
              <option value="food">Food</option>
              <option value="travel">Travel</option>
              <option value="stay">Stay</option>
              <option value="activities">Activities</option>
              <option value="misc">Misc</option>
            </select>
          </div>
          {error && <p className="error-text">{error}</p>}
          <button type="submit">Add Expense</button>
        </form>
      </div>

      <h3>Expenses</h3>
      {expenses.length === 0 && <p>No expenses yet.</p>}
      {expenses.map((exp) => (
        <div key={exp._id} className="list-item">
          <strong>{exp.description}</strong> - Rs {exp.amount} ({exp.category})
          <br />
          <small>Paid by {exp.paidBy.name}</small>
        </div>
      ))}

      <h3>Settlement plan</h3>
{settlement.length === 0 && <p>Everyone is settled up.</p>}
{settlement.map((t, index) => (
  <div key={index} className="ticket">
    <div className="ticket-route">
      <span className="ticket-name">{findName(t.from)}</span>
      <span className="ticket-divider"></span>
      <span className="ticket-name">{findName(t.to)}</span>
    </div>
    <div className="ticket-amount">Rs {t.amount}</div>
  </div>
))}
    </div>
  );
}

export default GroupDetail;