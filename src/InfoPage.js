import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import WordleGame from './components/Wordle';

const InfoPage = () => {
  const { name, info } = useParams();
  const [wordData, setWordData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWordle, setShowWordle] = useState(false);

  const toggleWordle = () => {
    setShowWordle(!showWordle);
  };

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const decodedName = decodeURIComponent(name);
        const response = await fetch(
          `http://localhost:5000/api/gamedata/${encodeURIComponent(decodedName)}`
        );

        if (!response.ok) {
          if (response.status === 404) {
            setWordData(null);
          } else {
            throw new Error('Server error');
          }
        } else {
          const data = await response.json();
          setWordData(data);
        }
      } catch (error) {
        console.error('Error loading game data:', error);
        setWordData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchGameData();
  }, [name]);

  if (loading) {
    return <div>Loading game...</div>;
  }

  if (!wordData) {
    return (
      <div className="info-page">
        <h1>{decodeURIComponent(name)}</h1>
        <p>{decodeURIComponent(info)}</p>
        <p>Sellele kohale pole veel mänge lisatud.</p>
        {/* Kui admin on sisse logitud, siis nupp et lisada uus mäng. (muuta andmeid)*/}
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
          targetWord={wordData.wordle.word}
          relatedWords={wordData.wordle.relatedWords}
          gameName={decodeURIComponent(name)}
        />
      </div>
    </div>
  );
};

export default InfoPage;
