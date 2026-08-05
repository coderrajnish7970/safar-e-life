import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "./api";

function TripPlanner() {
  const navigate = useNavigate();

  const [destinations, setDestinations] = useState([]);
  const [selected, setSelected] = useState("");
  const [numPeople, setNumPeople] = useState(2);
  const [numDays, setNumDays] = useState(3);
  const [estimate, setEstimate] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchDestinations = async () => {
    try {
      const res = await API.get("/destinations");
      setDestinations(res.data.destinations);
      if (res.data.destinations.length > 0) {
        setSelected(res.data.destinations[0].name);
      }
    } catch (err) {
      setError("Could not load destinations");
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, []);

  const handleEstimate = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setEstimate(null);

    try {
      const res = await API.post("/destinations/estimate", {
        destinationName: selected,
        numPeople: Number(numPeople),
        numDays: Number(numDays),
      });
      setEstimate(res.data);
    } catch (err) {
      setError("Could not calculate estimate");
    } finally {
      setLoading(false);
    }
  };

  const selectedDestination = destinations.find((d) => d.name === selected);

  return (
    <div className="page-container">
      <button onClick={() => navigate("/dashboard")} style={{ marginBottom: "20px" }}>
        Back to Dashboard
      </button>

      <h2>Plan a Trip</h2>
      <p>Pick a destination and get a rough cost estimate before you commit.</p>

      <div className="card">
        <form onSubmit={handleEstimate}>
          <div style={{ marginBottom: "10px" }}>
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              style={{ width: "100%" }}
            >
              {destinations.map((d) => (
                <option key={d._id} value={d.name}>
                  {d.name}, {d.state}
                </option>
              ))}
            </select>
          </div>

          {selectedDestination && (
            <div className="list-item">
              <p style={{ margin: "0 0 6px 0" }}>{selectedDestination.description}</p>
              <p style={{ margin: "0 0 6px 0" }}>
                <strong>Best for:</strong> {selectedDestination.bestFor.join(", ")}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Top food:</strong> {selectedDestination.topFood.join(", ")}
              </p>
            </div>
          )}

          <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            <div style={{ flex: 1 }}>
              <label>Number of people</label>
              <input
                type="number"
                min="1"
                value={numPeople}
                onChange={(e) => setNumPeople(e.target.value)}
                style={{ width: "100%" }}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <label>Number of days</label>
              <input
                type="number"
                min="1"
                value={numDays}
                onChange={(e) => setNumDays(e.target.value)}
                style={{ width: "100%" }}
                required
              />
            </div>
          </div>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Calculating..." : "Get Estimate"}
          </button>
        </form>
      </div>

      {estimate && (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>
            Estimate for {estimate.destination} - {estimate.numPeople} people, {estimate.numDays} days
          </h3>
          <p>Stay: Rs {estimate.breakdown.stay}</p>
          <p>Food: Rs {estimate.breakdown.food}</p>
          <p>Local transport: Rs {estimate.breakdown.localTransport}</p>
          <h3>Total estimated cost: Rs {estimate.totalEstimatedCost}</h3>
        </div>
      )}
    </div>
  );
}

export default TripPlanner;