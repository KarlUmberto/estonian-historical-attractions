import React, { useEffect, useState } from 'react';

const Leaderboard = () => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) return <p>Loading leaderboard...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h2>Leaderboard</h2>
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Game Type</th>
            <th>Attraction</th>
            <th>Score</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {scores.map((s, idx) => (
            <tr key={idx}>
              <td>{s.user}</td>
              <td>{s.game_type}</td>
              <td>{s.attraction_name}</td>
              <td>{s.score}</td>
              <td>{new Date(s.datestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;
