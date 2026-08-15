import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "./api";
import Layout from "./Layout";

function CreateTrip() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] =
    useState("");
  const [estimatedBudget, setEstimatedBudget] =
    useState("");
  const [startDate, setStartDate] =
    useState("");
  const [endDate, setEndDate] =
    useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] =
    useState(false);

  const handleCreateTrip = async (e) => {
    e.preventDefault();

    setError("");

    if (!startDate || !endDate) {
      setError(
        "Trip start date and end date are required"
      );
      return;
    }

    if (
      new Date(endDate) <
      new Date(startDate)
    ) {
      setError(
        "End date cannot be before the start date"
      );
      return;
    }

    setLoading(true);

    try {
      await API.post("/groups", {
        name,
        description,
        estimatedBudget:
          Number(estimatedBudget) || 0,
        startDate,
        endDate,
      });

      /*
       * The group has now been created
       * using the same existing backend
       * endpoint used by the old Dashboard.
       */

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not create trip"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div
        style={{
          maxWidth: "760px",
        }}
      >

        {/* HEADER */}
        <div
          style={{
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              color: "#8b93a6",
              marginBottom: "8px",
            }}
          >
            ➕ Create your actual trip
          </div>

          <h2
            style={{
              marginBottom: "8px",
            }}
          >
            Create a Trip
          </h2>

          <p
            style={{
              color: "#8b93a6",
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            Turn your travel idea into
            a real group trip and start
            managing expenses together.
          </p>
        </div>

        {/* FORM */}
        <div className="card">
          <form onSubmit={handleCreateTrip}>

            {/* TRIP NAME */}
            <div
              style={{
                marginBottom: "16px",
              }}
            >
              <label>
                Trip name
              </label>

              <input
                type="text"
                placeholder="Example: Manali Trip 2026"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                style={{
                  width: "100%",
                }}
                required
              />
            </div>

            {/* DESCRIPTION */}
            <div
              style={{
                marginBottom: "16px",
              }}
            >
              <label>
                Description
              </label>

              <input
                type="text"
                placeholder="Example: Friends trip to Manali"
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
                style={{
                  width: "100%",
                }}
              />
            </div>

            {/* BUDGET */}
            <div
              style={{
                marginBottom: "16px",
              }}
            >
              <label>
                Estimated budget (₹)
              </label>

              <input
                type="number"
                min="0"
                placeholder="Example: 30000"
                value={estimatedBudget}
                onChange={(e) =>
                  setEstimatedBudget(
                    e.target.value
                  )
                }
                style={{
                  width: "100%",
                }}
              />
            </div>

            {/* DATES */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  flex: 1,
                }}
              >
                <label>
                  Start date
                </label>

                <input
                  type="date"
                  value={startDate}
                  onChange={(e) =>
                    setStartDate(
                      e.target.value
                    )
                  }
                  style={{
                    width: "100%",
                  }}
                  required
                />
              </div>

              <div
                style={{
                  flex: 1,
                }}
              >
                <label>
                  End date
                </label>

                <input
                  type="date"
                  value={endDate}
                  onChange={(e) =>
                    setEndDate(
                      e.target.value
                    )
                  }
                  style={{
                    width: "100%",
                  }}
                  required
                />
              </div>
            </div>

            {error && (
              <p className="error-text">
                {error}
              </p>
            )}

            {/* ACTIONS */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "20px",
              }}
            >
              <button
                type="button"
                onClick={() =>
                  navigate("/dashboard")
                }
                style={{
                  backgroundColor: "transparent",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: "#8b93a6",
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Creating..."
                  : "Create Trip"}
              </button>
            </div>

          </form>
        </div>

        {/* FLOW HINT */}
        <div
          style={{
            marginTop: "18px",
            padding: "16px",
            borderRadius: "12px",
            background:
              "rgba(41,182,166,0.07)",
            border:
              "1px solid rgba(41,182,166,0.15)",
          }}
        >
          <div
            style={{
              fontWeight: 700,
              marginBottom: "6px",
            }}
          >
            Your Safar-E-Life journey
          </div>

          <div
            style={{
              color: "#8b93a6",
              fontSize: "13px",
            }}
          >
            🌍 Discover → 🧭 Plan →
            ➕ Create → 💰 Manage Expenses
          </div>
        </div>

      </div>
    </Layout>
  );
}

export default CreateTrip;