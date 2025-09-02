import React, { useState } from "react";

const EditAttractionGameData = ({ attractionName, existingGameData, onSave }) => {
  const [word, setWord] = useState(existingGameData?.wordle?.word || "");
  const [relatedWords, setRelatedWords] = useState(existingGameData?.wordle?.relatedWords || []);
  const [choiceQuestions, setChoiceQuestions] = useState(existingGameData?.choice || []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  /** WORDLE HANDLERS */
  const updateRelatedWord = (index, value) => {
    const newWords = [...relatedWords];
    newWords[index] = value;
    setRelatedWords(newWords);
  };
  const addRelatedWord = () => setRelatedWords([...relatedWords, ""]);
  const removeRelatedWord = (index) =>
    setRelatedWords(relatedWords.filter((_, i) => i !== index));

  /** SENTENCE CHOICE HANDLERS */
  const updateChoiceQuestion = (index, field, value) => {
    const newQuestions = [...choiceQuestions];
    newQuestions[index][field] = value;
    setChoiceQuestions(newQuestions);
  };

  const updateChoiceOption = (qIndex, cIndex, value) => {
    const newQuestions = [...choiceQuestions];
    newQuestions[qIndex].choices[cIndex] = value;
    setChoiceQuestions(newQuestions);
  };

  const addChoiceOption = (qIndex) => {
    const newQuestions = [...choiceQuestions];
    newQuestions[qIndex].choices.push("");
    setChoiceQuestions(newQuestions);
  };

  const removeChoiceOption = (qIndex, cIndex) => {
    const newQuestions = [...choiceQuestions];
    newQuestions[qIndex].choices = newQuestions[qIndex].choices.filter(
      (_, i) => i !== cIndex
    );
    setChoiceQuestions(newQuestions);
  };

  const addChoiceQuestion = () => {
    setChoiceQuestions([
      ...choiceQuestions,
      { sentence: "", choices: ["", ""], answer: "" },
    ]);
  };

  const removeChoiceQuestion = (index) => {
    setChoiceQuestions(choiceQuestions.filter((_, i) => i !== index));
    if (expandedQuestion === index) setExpandedQuestion(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      wordle: {
        word,
        relatedWords: relatedWords.filter((w) => w.trim() !== ""),
      },
      choice: choiceQuestions.map((q) => ({
        sentence: q.sentence,
        choices: q.choices.filter((c) => c.trim() !== ""),
        answer: q.answer,
      })),
    };

    try {
      const response = await fetch(
        `http://localhost:5000/api/gamedata/${encodeURIComponent(attractionName)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
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
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", maxWidth: 800 }}>
      <h3>Muuda "{attractionName}" andmeid</h3>

      {/* Wordle Section */}
      <div style={{ marginBottom: 20 }}>
        <h4>Wordle</h4>
        <label>
          Vastus:
          <input type="text" value={word} onChange={(e) => setWord(e.target.value)} />
        </label>

        <div>
          <label>Vihjed:</label>
          {relatedWords.map((relatedWord, idx) => (
            <div key={idx} style={{ display: "flex", marginBottom: 4 }}>
              <input
                type="text"
                value={relatedWord}
                onChange={(e) => updateRelatedWord(idx, e.target.value)}
                style={{ flex: 1 }}
              />
              <button type="button" onClick={() => removeRelatedWord(idx)}>
                &times;
              </button>
            </div>
          ))}
          <button type="button" onClick={addRelatedWord}>
            + Lisa vihje
          </button>
        </div>
      </div>

      {/* Sentence Choice Section */}
      <div style={{ marginBottom: 20 }}>
        <h4>Küsimused</h4>
        <div style={{ maxHeight: 400, overflowY: "auto", border: "1px solid #ddd", padding: 10 }}>
          {choiceQuestions.map((q, qIndex) => (
            <div key={qIndex} style={{ border: "1px solid #ccc", marginBottom: 10 }}>
              <div
                style={{ padding: 10, background: "#f5f5f5", cursor: "pointer" }}
                onClick={() =>
                  setExpandedQuestion(expandedQuestion === qIndex ? null : qIndex)
                }
              >
                Küsimus {qIndex + 1}: {q.sentence || "No sentence yet"}
              </div>

              {expandedQuestion === qIndex && (
                <div style={{ padding: 10 }}>
                  <label>
                    Küsimus:
                    <input
                      type="text"
                      value={q.sentence}
                      onChange={(e) =>
                        updateChoiceQuestion(qIndex, "sentence", e.target.value)
                      }
                      style={{ width: "100%" }}
                    />
                  </label>

                  <label>
                    Õige vastus:
                    <input
                      type="text"
                      value={q.answer}
                      onChange={(e) =>
                        updateChoiceQuestion(qIndex, "answer", e.target.value)
                      }
                      style={{ width: "100%" }}
                    />
                  </label>

                  <div style={{ marginTop: 10 }}>
                    <label>Valikud:</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {q.choices.map((choice, cIndex) => (
                        <div key={cIndex} style={{ display: "flex", alignItems: "center" }}>
                          <input
                            type="text"
                            value={choice}
                            onChange={(e) =>
                              updateChoiceOption(qIndex, cIndex, e.target.value)
                            }
                          />
                          <button
                            type="button"
                            onClick={() => removeChoiceOption(qIndex, cIndex)}
                            style={{ marginLeft: 4 }}
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                    <button type="button" onClick={() => addChoiceOption(qIndex)} style={{ marginTop: 5 }}>
                      + Lisa valik
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeChoiceQuestion(qIndex)}
                    style={{ marginTop: 10 }}
                  >
                    Eemalda
                  </button>
                </div>
              )}
            </div>
          ))}
          <button type="button" onClick={addChoiceQuestion}>
            + Lisa uus küsimus
          </button>
        </div>
      </div>

      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {/* Sticky Save Button */}
      <div style={{ position: "sticky", bottom: 0, background: "#fff", padding: 10, borderTop: "1px solid #ccc" }}>
        <button type="submit" disabled={saving}>
          {saving ? "Salvestab..." : "Salvesta"}
        </button>
      </div>
    </form>
  );
};

export default EditAttractionGameData;
