import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import WordleGame from '../components/Wordle';
import Modal from "../components/Modal";
import EditAttractionGameData from '../components/EditAttractionGameData';
import UserContext from '../components/UserContext';

const InfoPage = () => {
  const { user } = useContext(UserContext);

  const { name, info } = useParams();
  const [wordData, setWordData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWordle, setShowWordle] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false)

  const toggleWordle = () => {
    setShowWordle(!showWordle);
  };

  useEffect(() => {
    const fetchGameData = async () => {
      setLoading(true);
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
        setWordData(null);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    fetchGameData();
  }, [name]);

  if (loading) {
    return <div>Loading game...</div>;
  }

  return (
    <div className="info-page">

      <div className="text-container">
        <h1>{decodeURIComponent(name)}</h1>
        <p className="text">{info === "undefined" || !info ? "Info puudub." : decodeURIComponent(info)}</p>        
        {user.role === "õpetaja" && (
        <div>
          <p>Lisa või muuda atraktsiooni mänge:</p>
          <button onClick={() => setShowEditModal(true)}>
            Tee seda mis kirjeldati üleval
          </button>
        </div>
        )}
        
        

      </div>
      {wordData !== null && wordData?.wordle?.word !== "" && 
        <>
          <button onClick={toggleWordle}>
            {showWordle ? 'Peida Wordle' : 'Mängi Wordle'}
          </button>

          <div className={showWordle ? 'visible' : 'hidden'}>
            <WordleGame
              targetWord={wordData.wordle.word}
              relatedWords={wordData.wordle.relatedWords}
              gameName={decodeURIComponent(name)}
              key={wordData.wordle.word}
            />
          </div>
        </>
      }
      
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)}>
        <EditAttractionGameData
          attractionName={decodeURIComponent(name)}
          existingGameData={wordData ? wordData : {}}
          onSave={(updatedData) => {
            setWordData(updatedData);
            setShowEditModal(false);
          }
          }
        />
      </Modal>
    </div>
  );
};

export default InfoPage;
