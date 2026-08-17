import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "./api";
import Layout from "./Layout";
import { formatMoney } from "./utils/formatMoney";

function KnowYourDestination() {
  const navigate = useNavigate();

  const [destinations, setDestinations] = useState([]);
  const [selected, setSelected] = useState("");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const categoryPills = [
    { label: "All 🇮🇳 (100)", value: "All" },
    { label: "Top 20 Flagship ⭐", value: "Flagship" },
    { label: "Heritage 🏛️", value: "Heritage" },
    { label: "Beach 🏖️", value: "Beach" },
    { label: "Spiritual 🛕", value: "Spiritual" },
    { label: "Mountains 🏔️", value: "Mountains" },
    { label: "Wildlife 🐅", value: "Wildlife" },
    { label: "Desert 🏜️", value: "Desert" },
    { label: "Nature 🌿", value: "Nature" },
  ];

  const flagshipNames = [
    "Agra", "Jaipur", "Goa", "Varanasi", "Manali", "Leh", "Srinagar", "Udaipur",
    "Amritsar", "Kochi", "Rishikesh", "Darjeeling", "Munnar", "Jaisalmer", "Hampi",
    "Andaman Islands", "Ooty", "Shillong", "Alappuzha", "Pahalgam"
  ];

  const fetchDestinations = async () => {
    try {
      setLoading(true);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, []);

  const filteredDestinations = useMemo(() => {
    let result = destinations;

    if (activeCategory === "Flagship") {
      result = result.filter((d) => flagshipNames.includes(d.name));
    } else if (activeCategory !== "All") {
      result = result.filter((d) => {
        const desc = (d.description || "").toLowerCase();
        const best = (d.bestFor || []).join(" ").toLowerCase();
        const cat = activeCategory.toLowerCase();
        return desc.includes(cat) || best.includes(cat);
      });
    }

    const query = search.trim().toLowerCase();
    if (!query) {
      return result;
    }

    return result.filter((destination) => {
      const name = destination.name?.toLowerCase() || "";
      const state = destination.state?.toLowerCase() || "";
      return name.includes(query) || state.includes(query);
    });
  }, [destinations, search, activeCategory]);

  const selectedDestination = destinations.find(
    (destination) => destination.name === selected
  );

  const handleSelectDestination = (name) => {
    setSelected(name);
  };

  const handlePlanTrip = () => {
    if (!selectedDestination) return;

    navigate(
      `/plan-trip?destination=${encodeURIComponent(
        selectedDestination.name
      )}`
    );
  };

  return (
    <Layout>
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        {/* HEADER */}
        <div style={{ marginBottom: "24px" }}>
          <div
            style={{
              fontSize: "13px",
              color: "#8b93a6",
              marginBottom: "8px",
            }}
          >
            🌍 Discover India
          </div>

          <h2 style={{ marginBottom: "8px" }}>
            Know Your Destination
          </h2>

          <p
            style={{
              color: "#8b93a6",
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            Before you travel, know the place. Explore its stories,
            geography, history, culture, food, climate and more.
          </p>
        </div>

        {/* DESTINATION SEARCH */}
        <div
          className="card"
          style={{
            marginBottom: "24px",
          }}
        >
          {/* CATEGORY PILLS */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              overflowX: "auto",
              paddingBottom: "12px",
              marginBottom: "16px",
              scrollbarWidth: "none",
            }}
          >
            {categoryPills.map((pill) => {
              const isActive = activeCategory === pill.value;
              return (
                <button
                  key={pill.value}
                  type="button"
                  onClick={() => setActiveCategory(pill.value)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "20px",
                    fontSize: "13px",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    background: isActive
                      ? "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)"
                      : "rgba(255, 255, 255, 0.05)",
                    color: isActive ? "#ffffff" : "#94a3b8",
                    border: isActive
                      ? "1px solid #818cf8"
                      : "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>

          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: 600,
            }}
          >
            🔍 Search a destination
          </label>

          <input
            type="text"
            placeholder="Search by destination or state..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={loading}
            style={{
              width: "100%",
              boxSizing: "border-box",
              marginBottom: "20px",
            }}
          />

          {/* DESTINATION RESULTS */}
          <label
            style={{
              display: "block",
              marginBottom: "10px",
              fontWeight: 600,
            }}
          >
            Choose your destination
          </label>

          {loading && (
            <div
              style={{
                padding: "20px",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.03)",
                color: "#8b93a6",
              }}
            >
              Loading destinations...
            </div>
          )}

          {!loading && filteredDestinations.length === 0 && (
            <div
              style={{
                padding: "20px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.02)",
                color: "#8b93a6",
                textAlign: "center",
              }}
            >
              No destinations found.
              <br />
              Try another destination or state.
            </div>
          )}

          {!loading && filteredDestinations.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "12px",
              }}
            >
              {filteredDestinations.map((destination) => {
                const isSelected =
                  selected === destination.name;

                return (
                  <button
                    key={destination._id}
                    type="button"
                    onClick={() =>
                      handleSelectDestination(destination.name)
                    }
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "18px",
                      borderRadius: "14px",
                      border: isSelected
                        ? "2px solid #f5a623"
                        : "1px solid rgba(255,255,255,0.08)",
                      background: isSelected
                        ? "rgba(245,166,35,0.10)"
                        : "rgba(255,255,255,0.025)",
                      color: "#ffffff",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      boxSizing: "border-box",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.border =
                          "1px solid rgba(245,166,35,0.7)";
                        e.currentTarget.style.transform =
                          "translateY(-2px)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.border =
                          "1px solid rgba(255,255,255,0.08)";
                        e.currentTarget.style.transform =
                          "translateY(0)";
                      }
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: "17px",
                            fontWeight: 700,
                            marginBottom: "5px",
                          }}
                        >
                          🌴 {destination.name}
                        </div>

                        <div
                          style={{
                            color: "#8b93a6",
                            fontSize: "13px",
                          }}
                        >
                          {destination.state}
                        </div>
                      </div>

                      {isSelected && (
                        <div
                          style={{
                            color: "#f5a623",
                            fontSize: "20px",
                            fontWeight: 700,
                          }}
                        >
                          ✓
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {!loading && filteredDestinations.length > 0 && search && (
            <div
              style={{
                marginTop: "10px",
                color: "#8b93a6",
                fontSize: "12px",
              }}
            >
              {filteredDestinations.length} destination
              {filteredDestinations.length !== 1 ? "s" : ""} found
            </div>
          )}
        </div>

        {error && (
          <p className="error-text">
            {error}
          </p>
        )}

        {/* SELECTED DESTINATION */}
        {selectedDestination && (
          <>
            {/* DESTINATION INTRO */}
            <div
              className="card"
              style={{
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "20px",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    minWidth: "280px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#8b93a6",
                      marginBottom: "6px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {selectedDestination.state}
                  </div>

                  <h2
                    style={{
                      margin: "0 0 10px 0",
                    }}
                  >
                    {selectedDestination.name}
                  </h2>

                  <p
                    style={{
                      margin: 0,
                      color: "#aeb5c5",
                      lineHeight: 1.7,
                    }}
                  >
                    {selectedDestination.description}
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    className="dash-stat-card"
                    style={{
                      padding: "12px",
                    }}
                  >
                    <div className="dash-stat-label">
                      BEST TIME TO VISIT
                    </div>

                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#29b6a6",
                      }}
                    >
                      {selectedDestination.bestSeason || "Oct – Mar"}
                    </div>
                  </div>

                  <div
                    className="dash-stat-card"
                    style={{
                      padding: "12px",
                    }}
                  >
                    <div className="dash-stat-label">
                      IDEAL DURATION
                    </div>

                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#7b6ef6",
                      }}
                    >
                      {selectedDestination.recommendedDuration || "2–3 days"}
                    </div>
                  </div>

                  <div
                    className="dash-stat-card"
                    style={{
                      padding: "12px",
                    }}
                  >
                    <div className="dash-stat-label">
                      ESTIMATED DAILY COST
                    </div>

                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#f2a33c",
                      }}
                    >
                      {selectedDestination.avgCostPerPersonPerDay
                        ? `${formatMoney(
                            (selectedDestination.avgCostPerPersonPerDay.stay || 0) +
                            (selectedDestination.avgCostPerPersonPerDay.food || 0) +
                            (selectedDestination.avgCostPerPersonPerDay.localTransport || 0)
                          )} / person`
                        : "₹2,500 – ₹4,000 / day"}
                    </div>
                  </div>
                </div>
              </div>

              {/* HIGHLIGHTS */}
              <div
                style={{
                  marginTop: "20px",
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: "12px",
                }}
              >
                <div
                  className="list-item"
                  style={{
                    display: "block",
                  }}
                >
                  <strong>Best for</strong>

                  <div
                    style={{
                      color: "#aeb5c5",
                      marginTop: "6px",
                      lineHeight: 1.6,
                    }}
                  >
                    {selectedDestination.bestFor?.join(", ") ||
                      "Travel"}
                  </div>
                </div>

                <div
                  className="list-item"
                  style={{
                    display: "block",
                  }}
                >
                  <strong>Top attractions</strong>

                  <div
                    style={{
                      color: "#aeb5c5",
                      marginTop: "6px",
                      lineHeight: 1.6,
                    }}
                  >
                    {selectedDestination.topAttractions?.join(
                      ", "
                    ) || "Coming soon"}
                  </div>
                </div>

                <div
                  className="list-item"
                  style={{
                    display: "block",
                  }}
                >
                  <strong>Top food</strong>

                  <div
                    style={{
                      color: "#aeb5c5",
                      marginTop: "6px",
                      lineHeight: 1.6,
                    }}
                  >
                    {selectedDestination.topFood?.join(", ") ||
                      "Coming soon"}
                  </div>
                </div>
              </div>
            </div>

            {/* DESTINATION STORIES */}
            {selectedDestination.destinationStory?.length > 0 && (
              <div
                className="card"
                style={{
                  marginBottom: "24px",
                }}
              >
                <div
                  style={{
                    marginBottom: "20px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#8b93a6",
                      marginBottom: "5px",
                    }}
                  >
                    VISUAL STORIES
                  </div>

                  <h3
                    style={{
                      margin: "0 0 7px 0",
                    }}
                  >
                    Explore {selectedDestination.name}
                  </h3>

                  <p
                    style={{
                      margin: 0,
                      color: "#8b93a6",
                    }}
                  >
                    See what makes this destination special.
                  </p>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: "18px",
                  }}
                >
                  {selectedDestination.destinationStory.map(
                    (story, index) => (
                      <div
                        key={index}
                        style={{
                          overflow: "hidden",
                          borderRadius: "14px",
                          border:
                            "1px solid rgba(255,255,255,0.08)",
                          background:
                            "rgba(255,255,255,0.02)",
                        }}
                      >
                        <img
                          src={story.imageUrl}
                          alt={story.title}
                          style={{
                            width: "100%",
                            height: "210px",
                            objectFit: "cover",
                            display: "block",
                          }}
                          onError={(e) => {
                            e.currentTarget.style.display =
                              "none";
                          }}
                        />

                        <div
                          style={{
                            padding: "16px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "11px",
                              color: "#8b93a6",
                              marginBottom: "6px",
                            }}
                          >
                            STORY {index + 1}
                          </div>

                          <h4
                            style={{
                              margin: "0 0 8px 0",
                            }}
                          >
                            {story.title}
                          </h4>

                          <p
                            style={{
                              margin: 0,
                              color: "#aeb5c5",
                              fontSize: "14px",
                              lineHeight: 1.6,
                            }}
                          >
                            {story.description}
                          </p>

                          {story.credit && (
                            <div
                              style={{
                                marginTop: "10px",
                                fontSize: "10px",
                                color: "#6f7788",
                              }}
                            >
                              📷 {story.credit}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* KNOW BEFORE YOU GO */}
            {(selectedDestination.geography ||
              selectedDestination.history ||
              selectedDestination.culture ||
              selectedDestination.climate ||
              selectedDestination.travelInfo) && (
              <div
                className="card"
                style={{
                  marginBottom: "24px",
                }}
              >
                <div
                  style={{
                    marginBottom: "18px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#8b93a6",
                      marginBottom: "5px",
                    }}
                  >
                    DESTINATION GUIDE
                  </div>

                  <h3 style={{ margin: 0 }}>
                    Know Before You Go
                  </h3>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "16px",
                  }}
                >
                  {selectedDestination.geography && (
                    <div
                      className="list-item"
                      style={{
                        display: "block",
                        padding: "18px",
                      }}
                    >
                      <h4 style={{ marginTop: 0 }}>
                        🌍 Geography
                      </h4>

                      <p
                        style={{
                          margin: 0,
                          color: "#aeb5c5",
                          lineHeight: 1.7,
                        }}
                      >
                        {selectedDestination.geography}
                      </p>
                    </div>
                  )}

                  {selectedDestination.history && (
                    <div
                      className="list-item"
                      style={{
                        display: "block",
                        padding: "18px",
                      }}
                    >
                      <h4 style={{ marginTop: 0 }}>
                        🏛️ History
                      </h4>

                      <p
                        style={{
                          margin: 0,
                          color: "#aeb5c5",
                          lineHeight: 1.7,
                        }}
                      >
                        {selectedDestination.history}
                      </p>
                    </div>
                  )}

                  {selectedDestination.culture && (
                    <div
                      className="list-item"
                      style={{
                        display: "block",
                        padding: "18px",
                      }}
                    >
                      <h4 style={{ marginTop: 0 }}>
                        🎭 Culture & Traditions
                      </h4>

                      <p
                        style={{
                          margin: 0,
                          color: "#aeb5c5",
                          lineHeight: 1.7,
                        }}
                      >
                        {selectedDestination.culture}
                      </p>
                    </div>
                  )}

                  {selectedDestination.climate && (
                    <div
                      className="list-item"
                      style={{
                        display: "block",
                        padding: "18px",
                      }}
                    >
                      <h4 style={{ marginTop: 0 }}>
                        🌤️ Climate
                      </h4>

                      <p
                        style={{
                          margin: 0,
                          color: "#aeb5c5",
                          lineHeight: 1.7,
                        }}
                      >
                        {selectedDestination.climate}
                      </p>
                    </div>
                  )}

                  {selectedDestination.travelInfo && (
                    <div
                      className="list-item"
                      style={{
                        display: "block",
                        padding: "18px",
                        gridColumn: "1 / -1",
                      }}
                    >
                      <h4 style={{ marginTop: 0 }}>
                        ✈️ Travel Information
                      </h4>

                      <p
                        style={{
                          margin: 0,
                          color: "#aeb5c5",
                          lineHeight: 1.7,
                        }}
                      >
                        {selectedDestination.travelInfo}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* NEXT STEP */}
            <div
              className="card"
              style={{
                marginBottom: "30px",
                textAlign: "center",
              }}
            >
              <h3 style={{ marginTop: 0 }}>
                Ready to plan {selectedDestination.name}?
              </h3>

              <p
                style={{
                  color: "#8b93a6",
                  marginBottom: "16px",
                }}
              >
                Get a rough idea of what your trip could cost.
              </p>

              <button onClick={handlePlanTrip}>
                Plan a Trip to {selectedDestination.name} →
              </button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

export default KnowYourDestination;