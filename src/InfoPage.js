import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import WordleGame from './components/Wordle';

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