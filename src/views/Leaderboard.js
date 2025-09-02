import React, { useEffect, useState } from 'react';

const Leaderboard = () => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const gameAliasMap = {
    choice: "küsitlus",
    wordle: "wordle"
  }

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/scores');
        if (!response.ok) {
          throw new Error('Failed to fetch scores');
        }
        const data = await response.json();
        setScores(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, []);

  if (loading) return <p>Laadin skoore...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "80px auto 40px auto",
        padding: "20px",
        backgroundColor: "#f9f9f9",
        borderRadius: "12px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
      }}
    >
      <h2
        style={{
          fontSize: "26px",
          fontWeight: "700",
          color: "#2c3e50",
          marginBottom: "20px",
          textAlign: "center",
        }}
      >
        Edetabel
      </h2>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "15px",
        }}
      >
        <thead>
          <tr
            style={{
              backgroundColor: "#2c3e50",
              color: "white",
              textAlign: "left",
            }}
          >
            <th style={{ padding: "12px 15px" }}>Kasutaja</th>
            <th style={{ padding: "12px 15px" }}>Mäng</th>
            <th style={{ padding: "12px 15px" }}>Atraktsioon</th>
            <th style={{ padding: "12px 15px" }}>Skoor</th>
            <th style={{ padding: "12px 15px" }}>Kuupäev</th>
          </tr>
        </thead>
        <tbody>
          {scores.map((s, idx) => (
            <tr
              key={idx}
              style={{
                backgroundColor: idx % 2 === 0 ? "#ffffff" : "#ecf0f1",
                transition: "background-color 0.2s ease",
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#d6eaf8")}
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor =
                  idx % 2 === 0 ? "#ffffff" : "#ecf0f1")
              }
            >
              <td style={{ padding: "10px 15px", borderBottom: "1px solid #ddd" }}>
                <strong>{s.user}</strong>
              </td>
              <td style={{ padding: "10px 15px", borderBottom: "1px solid #ddd" }}>
                {gameAliasMap[s.game_type]}
              </td>
              <td style={{ padding: "10px 15px", borderBottom: "1px solid #ddd" }}>
                {s.attraction_name}
              </td>
              <td
                style={{
                  padding: "10px 15px",
                  borderBottom: "1px solid #ddd",
                  fontWeight: "600",
                  color: "#27ae60",
                }}
              >
                {s.score}
              </td>
              <td style={{ padding: "10px 15px", borderBottom: "1px solid #ddd" }}>
                {new Date(s.datestamp).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

};

export default Leaderboard;
