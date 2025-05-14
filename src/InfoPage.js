import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const WordleGame = ({targetWord, relatedWords}) => {
  const WORD_LENGTH = 5;
  const MAX_ATTEMPTS = 6;
  
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (targetWord && targetWord.length !== WORD_LENGTH) {
      setMessage(`Error: Sihtsõna peab olema ${WORD_LENGTH} tähte`);
      setGameOver(true);
    }
  }, [targetWord]);

  const handleGuess = () => {
    if (currentGuess.length !== WORD_LENGTH) {
      setMessage(`Sihtsõna peab olema ${WORD_LENGTH} tähte`);
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
            {Array.from({ length: WORD_LENGTH }).map((_, colIndex) => {
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
            maxLength={WORD_LENGTH}
            value={currentGuess}
            onChange={(e) => setCurrentGuess(e.target.value.slice(0, WORD_LENGTH))}
            onKeyPress={(e) => e.key === 'Enter' && handleGuess()}
          />
          <button onClick={handleGuess}>Guess</button>
        </div>
      )}

      {message && <div className="wordle-message">{message}</div>}
    </div>
  );
};

const InfoPage = () => {
  const {name, info} = useParams();
  const [wordData, setWordData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWordle, setShowWordle] = useState(false);
  const toggleWordle = () => {
    setShowWordle(!showWordle);
  };

  useEffect(() => {
    fetch('/data/wordData.json')
      .then((response) => response.json())
      .then((data) => {
        const decodedName = decodeURIComponent(name);
        const attractionWords = data.find(item => 
          item.attraction.toLowerCase() === decodedName.toLowerCase()
        );
        setWordData(attractionWords || null);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error loading word data:', error);
        setLoading(false);
      });
  }, [name]);

  if (loading) {
    return <div>Loading game...</div>;
  }

  if (!wordData) {
    return (
      <div className="info-page">
        <h1>{decodeURIComponent(name)}</h1>
        <p>{decodeURIComponent(info)}</p>
        <p>Selle koha kohta pole sõnamängu veel.</p>
      </div>
    );
  }

  return (
    <div className="info-page">
      <div className="text-container">
        <h1>{decodeURIComponent(name)}</h1>
        <p className="text">{decodeURIComponent(info)}</p>
        <button onClick={toggleWordle}>
          {showWordle ? 'Peida Wordle' : 'Mängi Wordle'}
        </button>
      </div>
      
      <div className={showWordle ? 'visible' : 'hidden'}>
        <WordleGame 
          targetWord={wordData.word} 
          relatedWords={wordData.relatedWords} 
        />
      </div>
    </div>
  );
};

export default InfoPage;