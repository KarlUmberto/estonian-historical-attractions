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
          // Optionally, refresh scores after adding new score
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
    <div className="wordle-game">
      <h2>Wordle: Arva ära selle atraktsiooniga seotud sõna</h2>
      <p>Seotud sõna vihjed: {relatedWords.join(', ')}</p>
      
      <div className="wordle-board">
        {Array.from({ length: MAX_ATTEMPTS }).map((_, rowIndex) => (
          <div key={rowIndex} className="wordle-row">
            {Array.from({ length: targetLength }).map((_, colIndex) => {
              if (rowIndex < guesses.length) {
                return renderLetter(
                  guesses[rowIndex][colIndex] || '',
                  colIndex,
                  guesses[rowIndex],
                  targetWord
                );
              } else if (rowIndex === guesses.length && colIndex < currentGuess.length) {
                return <span key={colIndex} className="letter current">{currentGuess[colIndex]}</span>;
              } else {
                return <span key={colIndex} className="letter empty"></span>;
              }
            })}
          </div>
        ))}
      </div>

      {!gameOver && (
        <div className="wordle-input">
          <input
            type="text"
            maxLength={targetLength}
            value={currentGuess}
            onChange={(e) => setCurrentGuess(e.target.value.slice(0, targetLength))}
            onKeyPress={(e) => e.key === 'Enter' && handleGuess()}
          />
          <button onClick={handleGuess}>Guess</button>
        </div>
      )}

      {message && <div className="wordle-message">{message}</div>}

      <div className="score-section">
        <h3>Skoorid</h3>
        {scores.length === 0 ? (
          <p>Hetkel skoorid puuduvad.</p>
        ) : (
          <ul>
            {scores.slice(0,10).map((entry, index) => {
              const date = new Date(entry.datestamp);
              const formatted = date.toLocaleString('en-GB', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              });
              return (
                <li key={index}><strong>{entry.user}</strong>: {entry.score} - <i>{formatted}</i> </li>
              );
            }
            )}
          </ul>
        )}
      </div>

    </div>
  );
};

export default WordleGame;
