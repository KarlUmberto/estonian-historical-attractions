import { useState, useEffect } from 'react';
import words from './eesti-sonad.json'
import UserContext from './UserContext';
import { useContext } from 'react';

const WordleGame = ({ targetWord, relatedWords, attractionName }) => {
  const MAX_ATTEMPTS = 6;
  
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('');
  const [targetLength, setTargetLength] = useState("");
  const [scores, setScores] = useState([]);

  const { user } = useContext(UserContext);

  useEffect(() => {
    if (targetWord) {
      setTargetLength(targetWord.length);
    }
  }, [targetWord]);

  useEffect(() => {
    const fetchScores = async () => {
      if (!attractionName) return;

      try {
        const response = await fetch(`http://localhost:5000/api/scores/wordle/${attractionName.toLowerCase()}`);
        const data = await response.json();

        if (response.ok && Array.isArray(data)) {
          setScores(data.sort((a, b) => new Date(b.datestamp) - new Date(a.datestamp)));
        } else {
          console.error('Skooride laadimine ebaõnnestus:', data.message || data);
        }
      } catch (err) {
        console.error('Viga skooride toomisel:', err);
      }
    };

    fetchScores();
  }, [attractionName]);

  const handleGuess = async () => {
    if (!words.includes(currentGuess.toLowerCase())) {
      setMessage(`Guess peab olema päris sõna`);
      return;
    }

    if (currentGuess.length !== targetLength) {
      setMessage(`Sihtsõna peab olema ${targetLength} tähte`);
      return;
    }

    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);
    setCurrentGuess('');
    setMessage('');

    let playerScore = null;

    if (currentGuess.toLowerCase() === targetWord.toLowerCase()) {
      setMessage('Õnnitlused! Sa arvasid õigesti!');
      setGameOver(true);
      playerScore = newGuesses.length;
    } else if (newGuesses.length >= MAX_ATTEMPTS) {
      setMessage(`Game over! Õige sõna oli ${targetWord}`);
      setGameOver(true);
      playerScore = "Kaotas";
    }

    if (playerScore != null) {
      try {
        const response = await fetch(`http://localhost:5000/api/scores/wordle/${attractionName.toLowerCase()}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            user: user?.name || 'anonüümne',
            score: playerScore
          })
        });

        const data = await response.json();
        if (!response.ok) {
          console.error('Skoori salvestamine ebaõnnestus:', data.message);
        } else {
          setScores(prev => [...prev, data.score].sort((a, b) => new Date(b.datestamp) - new Date(a.datestamp)));
        }
      } catch (err) {
        console.error('Viga skoori saatmisel:', err);
      }
    }
  };

  const renderLetter = (letter, index, guess, target) => {
    let className = 'letter';
    
    if (letter.toLowerCase() === target[index].toLowerCase()) {
      className += ' correct';
    } else if (target.toLowerCase().includes(letter.toLowerCase())) {
      className += ' present';
    } else {
      className += ' absent';
    }

    return (
      <span key={index} className={className}>
        {letter}
      </span>
    );
  };

return (
  <div
    className="wordle-game"
    style={{
      textAlign: "center",
      marginTop: "20px",
    }}
  >
    <h2
      style={{
        fontSize: "22px",
        fontWeight: "600",
        marginBottom: "10px",
        color: "#2c3e50",
      }}
    >
      Wordle: Arva ära selle atraktsiooniga seotud sõna
    </h2>

    <p
      style={{
        marginBottom: "20px",
        color: "#34495e",
      }}
    >
      Seotud sõna vihjed: {relatedWords.join(", ")}
    </p>

    <div
      className="wordle-board"
      style={{
        display: "inline-block",
        marginBottom: "15px",
      }}
    >
      {Array.from({ length: MAX_ATTEMPTS }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="wordle-row"
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "5px",
          }}
        >
          {Array.from({ length: targetLength }).map((_, colIndex) => {
            if (rowIndex < guesses.length) {
              return renderLetter(
                guesses[rowIndex][colIndex] || "",
                colIndex,
                guesses[rowIndex],
                targetWord
              );
            } else if (
              rowIndex === guesses.length &&
              colIndex < currentGuess.length
            ) {
              return (
                <span
                  key={colIndex}
                  className="letter current"
                  style={{
                    display: "inline-block",
                    width: "40px",
                    height: "40px",
                    lineHeight: "40px",
                    margin: "2px",
                    textAlign: "center",
                    border: "2px solid #3498db",
                    borderRadius: "6px",
                    fontWeight: "600",
                  }}
                >
                  {currentGuess[colIndex]}
                </span>
              );
            } else {
              return (
                <span
                  key={colIndex}
                  className="letter empty"
                  style={{
                    display: "inline-block",
                    width: "40px",
                    height: "40px",
                    margin: "2px",
                    border: "2px solid #ccc",
                    borderRadius: "6px",
                  }}
                ></span>
              );
            }
          })}
        </div>
      ))}
    </div>

    {!gameOver && (
      <div
        className="wordle-input"
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "10px",
          marginTop: "10px",
        }}
      >
        <input
          type="text"
          maxLength={targetLength}
          value={currentGuess}
          onChange={(e) =>
            setCurrentGuess(e.target.value.slice(0, targetLength))
          }
          onKeyPress={(e) => e.key === "Enter" && handleGuess()}
          style={{
            width: `${targetLength * 44}px`,
            height: "40px",
            fontSize: "18px",
            textAlign: "center",
            border: "2px solid #3498db",
            borderRadius: "6px",
          }}
        />
        <button
          onClick={handleGuess}
          style={{
            padding: "10px 18px",
            backgroundColor: "#3498db",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "500",
            transition: "background-color 0.3s ease",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#2980b9")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#3498db")}
        >
          Arva!
        </button>
      </div>
    )}

    {message && (
      <div
        className="wordle-message"
        style={{
          marginTop: "15px",
          fontWeight: "500",
          color: "#e74c3c",
        }}
      >
        {message}
      </div>
    )}

    <div
      className="score-section"
      style={{
        marginTop: "30px",
        textAlign: "left",
        padding: "15px",
        backgroundColor: "#ecf0f1",
        borderRadius: "8px",
      }}
    >
      <h3
        style={{
          marginBottom: "10px",
          color: "#2c3e50",
        }}
      >
        Skoorid
      </h3>
      {scores.length === 0 ? (
        <p>Hetkel skoorid puuduvad.</p>
      ) : (
        <ul
          style={{
            paddingLeft: "20px",
          }}
        >
          {scores.slice(0, 10).map((entry, index) => {
            const date = new Date(entry.datestamp);
            const formatted = date.toLocaleString("en-GB", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            });
            return (
              <li key={index}>
                <strong>{entry.user}</strong>: {entry.score} -{" "}
                <i>{formatted}</i>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  </div>
);

};

export default WordleGame;
