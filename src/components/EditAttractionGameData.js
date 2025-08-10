import React, { useState } from "react";

const EditAttractionGameData = ({ attractionName, existingGameData, onSave }) => {
  const [word, setWord] = useState(existingGameData?.wordle?.word || "");
  const [relatedWords, setRelatedWords] = useState(existingGameData?.wordle?.relatedWords || []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Handlers for related words list
  const updateRelatedWord = (index, value) => {
    const newWords = [...relatedWords];
    newWords[index] = value;
    setRelatedWords(newWords);
  };

  const addRelatedWord = () => {
    setRelatedWords([...relatedWords, ""]);
  };

  const removeRelatedWord = (index) => {
    setRelatedWords(relatedWords.filter((_, i) => i !== index));
  };

  // Submit handler to save updated data
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      wordle: {
        word,
        relatedWords: relatedWords.filter((w) => w.trim() !== ""),
      },
    };

    try {
      const response = await fetch(
        `http://localhost:5000/api/gamedata/${encodeURIComponent(attractionName)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to save: ${response.statusText}`);
      }

      onSave(payload);
    } catch (err) {
      setError(err.message || "Failed to save game data");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Edit game data for "{attractionName}"</h3>

      <div>
        <label>
          Word:
          <input
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
          />
        </label>
      </div>

      <div>
        <label>Related Words:</label>
        {relatedWords.map((relatedWord, idx) => (
          <div key={idx} style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
            <input
              type="text"
              value={relatedWord}
              onChange={(e) => updateRelatedWord(idx, e.target.value)}
              style={{ flex: 1 }}
            />
            <button
              type="button"
              onClick={() => removeRelatedWord(idx)}
              style={{ marginLeft: 8 }}
              aria-label="Remove related word"
            >
              &times;
            </button>
          </div>
        ))}
        <button type="button" onClick={addRelatedWord}>
          + Add related word
        </button>
      </div>

      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      <button type="submit" disabled={saving}>
        {saving ? "Saving..." : "Save"}
      </button>
    </form>
  );
};

export default EditAttractionGameData;
