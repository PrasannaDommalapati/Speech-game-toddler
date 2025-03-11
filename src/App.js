// App.js - Main component file
import React, { useState } from "react";
import LevelSelection from "./components/LevelSelection";
import GameView from "./components/GameView";
import ViewToggle from "./components/ViewToggle";
import MileView from "./components/MileView";
import "./App.scss";

const App = () => {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [viewMode, setViewMode] = useState("standard");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [autoListenEnabled, setAutoListenEnabled] = useState(true);

  // Sample questions for each level
  const questions = {
    beginner: [
      { question: "What animal is this?", answer: "cat", image: "./assets/beginner/elephant.jpg" },
      {
        question: "What color is this?",
        answer: "red",
        image: "/api/placeholder/300/200",
      },
      {
        question: "What shape is this?",
        answer: "circle",
        image: "/api/placeholder/300/200",
      },
    ],
    intermediate: [
      {
        question: "What are these animals called?",
        answer: "elephants",
        image: "/api/placeholder/300/200",
      },
      {
        question: "What season is shown?",
        answer: "winter",
        image: "/api/placeholder/300/200",
      },
      {
        question: "How many birds are in this picture?",
        answer: "three",
        image: "/api/placeholder/300/200",
      },
    ],
    expert: [
      {
        question: "What is this animal's habitat?",
        answer: "ocean",
        image: "/api/placeholder/300/200",
      },
      {
        question: "What is the capital city shown?",
        answer: "paris",
        image: "/api/placeholder/300/200",
      },
      {
        question: "What planet is this?",
        answer: "saturn",
        image: "/api/placeholder/300/200",
      },
    ],
  };

  // Reset to level selection
  const handleBackToLevels = () => {
    setSelectedLevel(null);
    setCurrentQuestion(0);
  };

  // Toggle between view modes
  const toggleViewMode = () => {
    setViewMode(viewMode === "standard" ? "mile" : "standard");
  };

  // Move to next question
  const moveToNextQuestion = () => {
    if (currentQuestion < questions[selectedLevel]?.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  return (
    <div className="speech-learning-app">
      <header>
        <h1>Fun Speech Learning for Kids</h1>
      </header>

      {/* View Mode Toggle and Auto Listen Controls */}
      <ViewToggle 
        viewMode={viewMode} 
        toggleViewMode={toggleViewMode} 
        selectedLevel={selectedLevel}
        autoListenEnabled={autoListenEnabled}
        setAutoListenEnabled={setAutoListenEnabled}
      />

      {/* Mile View (if selected) */}
      {viewMode === "mile" && selectedLevel && (
        <MileView 
          questions={questions[selectedLevel]} 
          currentQuestion={currentQuestion} 
        />
      )}

      {/* Level Selection */}
      {!selectedLevel && (
        <LevelSelection setSelectedLevel={setSelectedLevel} />
      )}

      {/* Game View */}
      {selectedLevel && (
        <GameView
          level={selectedLevel}
          questions={questions[selectedLevel]}
          currentQuestion={currentQuestion}
          autoListenEnabled={autoListenEnabled}
          handleBackToLevels={handleBackToLevels}
          moveToNextQuestion={moveToNextQuestion}
        />
      )}

      {/* Preview Info */}
      <div className="preview-info">
        <p className="preview-heading">Preview Mode:</p>
        <p>
          This is a functional preview of the speech learning app with audio
          features.
        </p>
        <p>The app now reads questions aloud and provides audio feedback.</p>
        <p>Click the repeat button next to the question to hear it again.</p>
      </div>
    </div>
  );
};

export default App;