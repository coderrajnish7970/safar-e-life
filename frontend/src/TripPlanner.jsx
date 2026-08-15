import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "./api";
import Layout from "./Layout";
import { formatMoney } from "./utils/formatMoney";

function TripPlanner() {
  const [destinations, setDestinations] = useState([]);
  const [selected, setSelected] = useState("");
  const [numPeople, setNumPeople] = useState(2);
  const [numDays, setNumDays] = useState(3);
  const [estimate, setEstimate] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [destinationsLoading, setDestinationsLoading] =
    useState(true);

  const navigate = useNavigate();

  const fetchDestinations = async () => {
    try {
      setDestinationsLoading(true);
      setError("");

      const res = await API.get("/destinations");

      const list = res.data.destinations || [];

      setDestinations(list);

      if (list.length > 0) {
        setSelected(list[0].name);
      }
    } catch (err) {
      console.error("Destination loading error:", err);
      setError("Could not load destinations");
    } finally {
      setDestinationsLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, []);

  const handleEstimate = async (e) => {
    e.preventDefault();

    setError("");
    setEstimate(null);

    const people = Number(numPeople);
    const days = Number(numDays);

    if (!selected) {
      setError("Please choose a destination.");
      return;
    }

    if (!people || people < 1) {
      setError("Number of travelers must be at least 1.");
      return;
    }

    if (!days || days < 1) {
      setError("Trip duration must be at least 1 day.");
      return;
    }

    setLoading(true);

    try {
      const res = await API.post(
        "/destinations/estimate",
        {
          destinationName: selected,
          numPeople: people,
          numDays: days,
        }
      );

      setEstimate(res.data);
    } catch (err) {
      console.error("Estimate error:", err);
      setError("Could not calculate estimate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectedDestination = destinations.find(
    (destination) => destination.name === selected
  );

  const totalEstimate =
    estimate?.totalEstimatedCost || 0;

  return (
    <Layout>
      <div
        style={{
          maxWidth: "980px",
          margin: "0 auto",
          paddingBottom: "40px",
        }}
      >
        {/* ============================================
            HEADER
        ============================================ */}

        <div
          style={{
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              color: "#8b93a6",
              marginBottom: "8px",
              textTransform: "uppercase",
              letterSpacing: "0.8px",
              fontWeight: 700,
            }}
          >
            🧭 Trip Planning
          </div>

          <h2
            style={{
              margin: 0,
              fontSize: "30px",
              lineHeight: 1.2,
            }}
          >
            Plan a Trip
          </h2>

          <p
            style={{
              color: "#8b93a6",
              margin: "9px 0 0",
              lineHeight: 1.6,
              maxWidth: "650px",
            }}
          >
            Choose a destination, set your group size and
            trip duration, then get a quick estimate before
            creating your trip.
          </p>
        </div>

        {/* ============================================
            MAIN PLANNER
        ============================================ */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(0, 1.35fr) minmax(280px, 0.65fr)",
            gap: "20px",
            alignItems: "start",
          }}
        >
          {/* LEFT — PLANNER */}

          <div className="card">
            <form onSubmit={handleEstimate}>
              {/* DESTINATION */}

              <div style={{ marginBottom: "22px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: 700,
                  }}
                >
                  Where are you going?
                </label>

                {destinationsLoading ? (
                  <div
                    style={{
                      padding: "14px",
                      borderRadius: "10px",
                      background: "rgba(123,110,246,0.06)",
                      color: "#8b93a6",
                      fontSize: "14px",
                    }}
                  >
                    Loading destinations...
                  </div>
                ) : (
                  <select
                    value={selected}
                    onChange={(e) => {
                      setSelected(e.target.value);
                      setEstimate(null);
                      setError("");
                    }}
                    style={{
                      width: "100%",
                    }}
                    required
                  >
                    <option value="" disabled>
                      Select a destination
                    </option>

                    {destinations.map((destination) => (
                      <option
                        key={destination._id}
                        value={destination.name}
                      >
                        {destination.name}
                        {destination.state
                          ? `, ${destination.state}`
                          : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* DESTINATION PREVIEW */}

              {selectedDestination && (
                <div
                  style={{
                    padding: "18px",
                    marginBottom: "22px",
                    borderRadius: "14px",
                    background:
                      "rgba(123,110,246,0.07)",
                    border:
                      "1px solid rgba(123,110,246,0.16)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "15px",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#8b93a6",
                          marginBottom: "4px",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Selected destination
                      </div>

                      <h3
                        style={{
                          margin: 0,
                          fontSize: "22px",
                        }}
                      >
                        {selectedDestination.name}
                      </h3>
                    </div>

                    <div
                      style={{
                        fontSize: "28px",
                      }}
                    >
                      🌴
                    </div>
                  </div>

                  <p
                    style={{
                      margin: "10px 0 14px",
                      color: "#aeb5c5",
                      lineHeight: 1.6,
                      fontSize: "14px",
                    }}
                  >
                    {selectedDestination.description}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        padding: "7px 10px",
                        borderRadius: "999px",
                        background:
                          "rgba(255,255,255,0.05)",
                        fontSize: "12px",
                      }}
                    >
                      🌤️{" "}
                      {selectedDestination.bestSeason ||
                        "Best season varies"}
                    </span>

                    <span
                      style={{
                        padding: "7px 10px",
                        borderRadius: "999px",
                        background:
                          "rgba(255,255,255,0.05)",
                        fontSize: "12px",
                      }}
                    >
                      🗓️{" "}
                      {selectedDestination.recommendedDuration ||
                        "Flexible duration"}
                    </span>
                  </div>
                </div>
              )}

              {/* PEOPLE + DAYS */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(2, minmax(0, 1fr))",
                  gap: "14px",
                  marginBottom: "22px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: 700,
                    }}
                  >
                    👥 Travelers
                  </label>

                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={numPeople}
                    onChange={(e) =>
                      setNumPeople(e.target.value)
                    }
                    style={{
                      width: "100%",
                    }}
                    required
                  />

                  <div
                    style={{
                      fontSize: "11px",
                      color: "#8b93a6",
                      marginTop: "6px",
                    }}
                  >
                    How many people are going?
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: 700,
                    }}
                  >
                    📅 Duration
                  </label>

                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={numDays}
                    onChange={(e) =>
                      setNumDays(e.target.value)
                    }
                    style={{
                      width: "100%",
                    }}
                    required
                  />

                  <div
                    style={{
                      fontSize: "11px",
                      color: "#8b93a6",
                      marginTop: "6px",
                    }}
                  >
                    Number of travel days
                  </div>
                </div>
              </div>

              {/* ERROR */}

              {error && (
                <div
                  style={{
                    marginBottom: "16px",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    background:
                      "rgba(255,107,92,0.08)",
                    border:
                      "1px solid rgba(255,107,92,0.18)",
                    color: "#ff8b7d",
                    fontSize: "13px",
                  }}
                >
                  {error}
                </div>
              )}

              {/* BUTTON */}

              <button
                type="submit"
                disabled={
                  loading ||
                  destinationsLoading ||
                  !selected
                }
                style={{
                  width: "100%",
                  minHeight: "46px",
                }}
              >
                {loading
                  ? "Calculating..."
                  : "Calculate Trip Estimate"}
              </button>
            </form>
          </div>

          {/* RIGHT — QUICK SUMMARY */}

          <div
            className="card"
            style={{
              position: "sticky",
              top: "20px",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                color: "#8b93a6",
                textTransform: "uppercase",
                letterSpacing: "0.7px",
                fontWeight: 700,
                marginBottom: "8px",
              }}
            >
              Your plan
            </div>

            <h3
              style={{
                margin: "0 0 16px",
              }}
            >
              {selectedDestination
                ? selectedDestination.name
                : "Choose a destination"}
            </h3>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "11px 0",
                borderBottom:
                  "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <span style={{ color: "#8b93a6" }}>
                👥 Travelers
              </span>
              <strong>{numPeople || 0}</strong>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "11px 0",
                borderBottom:
                  "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <span style={{ color: "#8b93a6" }}>
                📅 Days
              </span>
              <strong>{numDays || 0}</strong>
            </div>

            <div
              style={{
                marginTop: "18px",
                padding: "14px",
                borderRadius: "12px",
                background:
                  "rgba(41,182,166,0.08)",
                border:
                  "1px solid rgba(41,182,166,0.14)",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: "#8b93a6",
                  marginBottom: "5px",
                }}
              >
                Estimated budget
              </div>

              <div
                style={{
                  fontSize: "25px",
                  fontWeight: 800,
                }}
              >
                {estimate
                  ? formatMoney(totalEstimate)
                  : "—"}
              </div>

              {!estimate && (
                <div
                  style={{
                    fontSize: "11px",
                    color: "#8b93a6",
                    marginTop: "5px",
                  }}
                >
                  Calculate your estimate to see
                  the budget.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ============================================
            ESTIMATE RESULT
        ============================================ */}

        {estimate && (
          <div
            className="card"
            style={{
              marginTop: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "15px",
                marginBottom: "20px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#8b93a6",
                    textTransform: "uppercase",
                    letterSpacing: "0.6px",
                    fontWeight: 700,
                  }}
                >
                  Estimated trip budget
                </div>

                <h3
                  style={{
                    margin: "5px 0 5px",
                    fontSize: "24px",
                  }}
                >
                  {estimate.destination}
                </h3>

                <p
                  style={{
                    margin: 0,
                    color: "#8b93a6",
                    fontSize: "13px",
                  }}
                >
                  {estimate.numPeople} travelers ·{" "}
                  {estimate.numDays} days
                </p>
              </div>

              <div
                style={{
                  textAlign: "right",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    color: "#8b93a6",
                  }}
                >
                  Total estimate
                </div>

                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: 800,
                  }}
                >
                  {formatMoney(totalEstimate)}
                </div>
              </div>
            </div>

            {/* BREAKDOWN */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(3, minmax(0, 1fr))",
                gap: "12px",
              }}
            >
              <div
                className="list-item"
                style={{
                  display: "block",
                  padding: "16px",
                }}
              >
                <div
                  style={{
                    fontSize: "22px",
                    marginBottom: "8px",
                  }}
                >
                  🏨
                </div>

                <div
                  style={{
                    color: "#8b93a6",
                    fontSize: "12px",
                  }}
                >
                  Stay
                </div>

                <div
                  style={{
                    fontWeight: 800,
                    fontSize: "18px",
                    marginTop: "3px",
                  }}
                >
                  {formatMoney(estimate.breakdown.stay)}
                </div>
              </div>

              <div
                className="list-item"
                style={{
                  display: "block",
                  padding: "16px",
                }}
              >
                <div
                  style={{
                    fontSize: "22px",
                    marginBottom: "8px",
                  }}
                >
                  🍛
                </div>

                <div
                  style={{
                    color: "#8b93a6",
                    fontSize: "12px",
                  }}
                >
                  Food
                </div>

                <div
                  style={{
                    fontWeight: 800,
                    fontSize: "18px",
                    marginTop: "3px",
                  }}
                >
                  {formatMoney(estimate.breakdown.food)}
                </div>
              </div>

              <div
                className="list-item"
                style={{
                  display: "block",
                  padding: "16px",
                }}
              >
                <div
                  style={{
                    fontSize: "22px",
                    marginBottom: "8px",
                  }}
                >
                  🚕
                </div>

                <div
                  style={{
                    color: "#8b93a6",
                    fontSize: "12px",
                  }}
                >
                  Local transport
                </div>

                <div
                  style={{
                    fontWeight: 800,
                    fontSize: "18px",
                    marginTop: "3px",
                  }}
                >
                  {formatMoney(estimate.breakdown.localTransport)}
                </div>
              </div>
            </div>

            {/* NEXT ACTION */}

            <div
              style={{
                marginTop: "20px",
                padding: "18px",
                borderRadius: "14px",
                background:
                  "rgba(123,110,246,0.08)",
                border:
                  "1px solid rgba(123,110,246,0.18)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "18px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: 800,
                    marginBottom: "4px",
                  }}
                >
                  Ready to make it real? 🌴
                </div>

                <div
                  style={{
                    color: "#8b93a6",
                    fontSize: "13px",
                    lineHeight: 1.5,
                  }}
                >
                  Turn this estimate into an actual
                  trip and start managing it.
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate("/create-trip")
                }
              >
                Create This Trip →
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default TripPlanner;