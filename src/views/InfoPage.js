import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import WordleGame from '../components/Wordle';
import SentenceChoice from '../components/SentenceChoice'
import Modal from "../components/Modal";
import EditAttractionGameData from '../components/EditAttractionGameData';
import UserContext from '../components/UserContext';

const InfoPage = () => {
  const { user } = useContext(UserContext);

  const { name, info } = useParams();
  const [wordData, setWordData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState("")
  const [showEditModal, setShowEditModal] = useState(false)

  const toggleWordle = () => {
    setSelectedGame(selectedGame !== "wordle" ? "wordle" : "")
  };

  const toggleChoice = () => {
    setSelectedGame(selectedGame !== "choice" ? "choice" : "")
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
          console.log(data.choice)
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
    <div
      className="info-page"
      style={{
        maxWidth: "800px",
        margin: "80px auto 40px auto", // spacing under navbar
        padding: "20px",
        backgroundColor: "#f9f9f9",
        borderRadius: "12px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
      }}
    >
      <div
        className="text-container"
        style={{
          marginBottom: "20px",
        }}
      >
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "700",
            color: "#2c3e50",
            marginBottom: "12px",
          }}
        >
          {decodeURIComponent(name)}
        </h1>

        <p
          className="text"
          style={{
            fontSize: "16px",
            lineHeight: "1.6",
            color: "#34495e",
            marginBottom: "20px",
          }}
        >
          {info === "undefined" || !info
            ? "Info puudub."
            : decodeURIComponent(info)}
        </p>

        {user.role === "õpetaja" && (
          <div
            style={{
              marginTop: "15px",
              padding: "15px",
              backgroundColor: "#ecf0f1",
              borderRadius: "8px",
            }}
          >
            <button
              onClick={() => setShowEditModal(true)}
              style={{
                padding: "10px 18px",
                backgroundColor: "#3498db",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                transition: "background-color 0.3s ease",
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#2980b9")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "#3498db")}
            >
              Lisa/muuda attraktsiooni mänge
            </button>
          </div>
        )}
      </div>

      {wordData !== null && wordData?.choice && (
        <button
          onClick={toggleChoice}
          style={{
            padding: "10px 18px",
            margin: "10px 10px 10px 0",
            backgroundColor: "#27ae60",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
            transition: "background-color 0.3s ease",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#1e8449")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#27ae60")}
        >
          {selectedGame === "choice" ? "Peida küsitlus" : "Mängi küsitlust"}
        </button>
      )}

      {wordData !== null && wordData?.wordle?.word !== "" && (
        <button
          onClick={toggleWordle}
          style={{
            padding: "10px 18px",
            margin: "10px 10px 10px 0",
            backgroundColor: "#8e44ad",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
            transition: "background-color 0.3s ease",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#6c3483")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#8e44ad")}
        >
          {selectedGame === "wordle" ? "Peida Wordle" : "Mängi Wordle"}
        </button>
      )}

      {wordData !== null && wordData?.wordle?.word !== "" && (
        <div className={selectedGame === "wordle" ? "visible" : "hidden"}>
          <WordleGame
            targetWord={wordData.wordle.word}
            relatedWords={wordData.wordle.relatedWords}
            attractionName={decodeURIComponent(name)}
            key={wordData.wordle.word}
          />
        </div>
      )}

      {wordData !== null && wordData?.choice && (
        <div className={selectedGame === "choice" ? "visible" : "hidden"}>
          <SentenceChoice
            attractionName={decodeURIComponent(name)}
            choiceGameInfo={wordData.choice}
            key={name + "-choice"}
          />
        </div>
      )}

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)}>
        <EditAttractionGameData
          attractionName={decodeURIComponent(name)}
          existingGameData={wordData ? wordData : {}}
          onSave={(updatedData) => {
            setWordData(updatedData);
            setShowEditModal(false);
          }}
        />
      </Modal>
    </div>
  );

};

export default InfoPage;
