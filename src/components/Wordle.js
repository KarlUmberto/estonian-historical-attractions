import { useState, useEffect } from 'react';
import words from './eesti-sonad.json'

const WordleGame = ({targetWord, relatedWords}) => {
  //const WORD_LENGTH = 5;
  const MAX_ATTEMPTS = 6;
  
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('');
  const [targetLength, setTargetLength] = useState("")

  useEffect(() => {
    if (targetWord){
        setTargetLength(targetWord.length)
    }
  }, [targetWord]);

  const handleGuess = () => {

    if (!words.includes(currentGuess.toLowerCase())){
        setMessage(`Guess peab olema paris sona`);
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

    if (currentGuess.toLowerCase() === targetWord.toLowerCase()) {
      setMessage('Õnnitlused! Sa arvasid õigesti!');
      setGameOver(true);
    } else if (newGuesses.length >= MAX_ATTEMPTS) {
      setMessage(`Game over! Õige sõna oli ${targetWord}`);
      setGameOver(true);
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
    </div>
  );
};

export default WordleGame;