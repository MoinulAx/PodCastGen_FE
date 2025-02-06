import React, { useState } from "react";
import axios from "axios";
import "./PodcastGenerator.css";

const PodcastGenerator = () => {
  const [transcript, setTranscript] = useState("");
  const [title, setTitle] = useState("Sample Podcast Title");
  const [numCommentators, setNumCommentators] = useState(1);
  const [commentators, setCommentators] = useState([""]);
  const [length, setLength] = useState(30);
  const [podcastScript, setPodcastScript] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const REACT_APP_AI_API_URL = import.meta.env.VITE_BASE_AI_API_URL;

  const parsePodcastScript = (script) => {
    const sections = {
      intro: [],
      mainDiscussion: [],
      conclusion: [],
    };

    script.forEach((line) => {
      if (line.includes("Intro Music")) {
        sections.intro.push(line);
      } else if (line.includes("(Transition music)")) {
        sections.transition.push(line);
      } else if (line.includes("Outro Music") || line.includes("Thank you for listening")) {
        sections.conclusion.push(line);
      } else {
        sections.mainDiscussion.push(line);
      }
    });

    return sections;
  };

  const formatText = (text) => {
    let formattedText = text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
    formattedText = formattedText.replace(/\*(.*?)\*/g, "<i>$1</i>");
    return formattedText;
  };

  const handleCommentatorChange = (index, value) => {
    const updatedCommentators = [...commentators];
    updatedCommentators[index] = value;
    setCommentators(updatedCommentators);
  };

  const generatePodcast = async () => {
    if (!transcript.trim()) {
      setError("Please provide a transcript to generate the podcast.");
      return;
    }

    setLoading(true);
    setError("");
    setPodcastScript(null);

    try {
      const response = await axios.post(`${REACT_APP_AI_API_URL}`, {
        title,
        commentators: commentators.join(", "),
        length,
        description: transcript,
      });

      const parsedScript = parsePodcastScript(response.data);
      setPodcastScript(parsedScript);
    } catch (err) {
      setError("Failed to generate podcast script. Please try again!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="podcast-container">
      <h1 className="title">🎙️ Podcast Generator</h1>

      <div className="input-fields">
        <div>
          <label>Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter podcast title"
          />
        </div>

        <div>
          <label>Number of Commentators:</label>
          <select
            value={numCommentators}
            onChange={(e) => {
              const num = parseInt(e.target.value, 10);
              setNumCommentators(num);
              setCommentators((prev) => {
                const updated = [...prev];
                while (updated.length < num) updated.push("");
                return updated.slice(0, num);
              });
            }}
          >
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        {Array.from({ length: numCommentators }).map((_, index) => (
          <div key={index}>
            <label>Commentator {index + 1}:</label>
            <input
              type="text"
              value={commentators[index] || ""}
              onChange={(e) => handleCommentatorChange(index, e.target.value)}
              placeholder={`Enter name of commentator ${index + 1}`}
            />
          </div>
        ))}

        <textarea
          className="transcript-box"
          placeholder="Paste your transcript here..."
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
        ></textarea>

        <div>
          <label>Length (minutes):</label>
          <input
            type="number"
            value={length}
            onChange={(e) => setLength(parseInt(e.target.value, 10))}
            placeholder="Enter podcast length"
          />
        </div>
      </div>

      <button className="generate-btn" onClick={generatePodcast} disabled={loading}>
        {loading ? "Generating..." : "Generate Podcast ✨"}
      </button>

      {loading && <div className="loading-spinner"></div>}

      {error && <p className="error-message">{error}</p>}

      {podcastScript && (
        <div className="script-output">
          <h2>Generated Podcast Script</h2>
          <div>
            <h3>Introduction</h3>
            <pre dangerouslySetInnerHTML={{ __html: podcastScript.intro.map(formatText).join("<br/>") }} />

            <h3>Main Discussion</h3>
            <pre dangerouslySetInnerHTML={{ __html: podcastScript.mainDiscussion.map(formatText).join("<br/>") }} />

            <h3>Conclusion</h3>
            <pre dangerouslySetInnerHTML={{ __html: podcastScript.conclusion.map(formatText).join("<br/>") }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default PodcastGenerator;
