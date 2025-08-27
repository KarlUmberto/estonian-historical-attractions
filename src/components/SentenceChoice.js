import { useState, useEffect, useContext } from 'react';
import UserContext from './UserContext';

const SentenceChoice = ({ choiceGameInfo, attractionName }) => {
  const { user } = useContext(UserContext);
  const [scores, setScores] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);

  // Fetch scores for leaderboard
  useEffect(() => {
    const fetchScores = async () => {
      if (!attractionName) return;
      try {
        const response = await fetch(
          `http://localhost:5000/api/scores/choice/${attractionName.toLowerCase()}`
        );
        const data = await response.json();

        if (response.ok && Array.isArray(data)) {
          setScores(
            data.sort((a, b) => new Date(b.datestamp) - new Date(a.datestamp))
          );
        } else {
          console.error('Failed to load scores:', data.message || data);
        }
      } catch (err) {
        console.error('Error fetching scores:', err);
      }
    };
    fetchScores();
  }, [attractionName]);

  const handleChange = (questionIndex, choice) => {
    setAnswers({ ...answers, [questionIndex]: choice });
  };

  const handleSubmit = async () => {
    let correct = 0;
    choiceGameInfo.forEach((q, i) => {
      if (answers[i] === q.answer) correct++;
    });

    const result = `${correct}/${choiceGameInfo.length}`;
    setScore(result);
    setSubmitted(true);

    // Send score to backend
    try {
      const response = await fetch(
        `http://localhost:5000/api/scores/choice/${attractionName.toLowerCase()}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user: user?.name || 'anonüümne',
            score: result,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        console.error('Failed to save score:', data.message);
      } else {
        // Update local leaderboard
        setScores((prev) =>
          [data.score, ...prev].sort(
            (a, b) => new Date(b.datestamp) - new Date(a.datestamp)
          )
        );
      }
    } catch (err) {
      console.error('Error sending score:', err);
    }
  };

  if (!choiceGameInfo || choiceGameInfo.length === 0) {
    return <p>No questions available.</p>;
  }

  return (
    <div>
      <h2>{attractionName} - Sentence Choice</h2>

      {choiceGameInfo.map((q, index) => (
        <div key={index} style={{ marginBottom: '1rem' }}>
          <p>
            {index + 1}. {q.sentence}
          </p>
          {q.choices.map((choice) => (
            <label key={choice} style={{ display: 'block', marginLeft: '1rem' }}>
              <input
                type="radio"
                name={`question-${index}`}
                value={choice}
                checked={answers[index] === choice}
                onChange={() => handleChange(index, choice)}
                disabled={submitted}
              />
              {choice}
            </label>
          ))}
        </div>
      ))}

      {!submitted && (
        <button onClick={handleSubmit} style={{ marginTop: '1rem' }}>
          Submit
        </button>
      )}

      {submitted && <p>Sinu skoor: {score}</p>}

      {scores.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Skoorid</h3>
          <ul>
            {scores.slice(0, 5).map((s, i) => (
              <li key={i}>
                {s.user}: {s.score} ({new Date(s.datestamp).toLocaleString()})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SentenceChoice;
