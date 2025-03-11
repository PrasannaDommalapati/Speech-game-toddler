// App.js - Main component file
import React, { useState } from "react";
import LevelSelection from "./components/LevelSelection";
import GameView from "./components/GameView";
import ViewToggle from "./components/ViewToggle";
import MileView from "./components/MileView";
import elephant from "./assets/beginner/elephant.jpg";
import cat from "./assets/beginner/cat.avif";
import cow from "./assets/beginner/cow.avif";
import lion from "./assets/beginner/lion.avif";
import zebra from "./assets/intermediate/zebra.avif";
import tiger from "./assets/beginner/Tiger.jpg";
import giraffe from "./assets/beginner/giraffe.avif";
import rhino from "./assets/beginner/rhino.avif";
import "./App.scss";

const App = () => {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [viewMode, setViewMode] = useState("standard");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [autoListenEnabled, setAutoListenEnabled] = useState(true);

  // Sample questions for each level
  const questions = {
    Beginner: [
      { question: "What animal say MOO MOO?", answer: "COW", image: cow },
      { question: "Who say Meow Meow?", answer: "CAT", image: cat },
      { question: "Who say ROAR ROAR?", answer: "LION", image: lion },
      { question: "What animal is this?", answer: "ELEPHANT", image: elephant },
      { question: "WHat Animal is this?", answer: "GIRAFFE", image: giraffe },
      { question: "Who say GIRR GIRR?", answer: "TIGER", image: tiger },
      { question: "What animal is this?", answer: "RHINO", image: rhino },
      { question: "What animal say MOO MOO?", answer: "cow", image: cow },
      { question: "Who say Meow Meow?", answer: "cat", image: cat }
    ],
    Intermediate: [
      { question: "What animal has white and black stripes?", answer: "ZEBRA", image: zebra },
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
    Expert: [
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

  const shuffleArray = array=> array.sort(() => Math.random() - 0.5);

  const shuffledQuestions = {
    Beginner: shuffleArray([...questions.Beginner]),
    Intermediate: shuffleArray([...questions.Intermediate]),
    Expert: shuffleArray([...questions.Expert]),
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
    if (currentQuestion < shuffledQuestions[selectedLevel]?.length - 1) {
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
          questions={shuffledQuestions[selectedLevel]}
          currentQuestion={currentQuestion}
        />
      )}

      {/* Level Selection */}
      {!selectedLevel && <LevelSelection setSelectedLevel={setSelectedLevel} />}

      {/* Game View */}
      {selectedLevel && (
        <GameView
          level={selectedLevel}
          questions={shuffledQuestions[selectedLevel]}
          currentQuestion={currentQuestion}
          autoListenEnabled={autoListenEnabled}
          handleBackToLevels={handleBackToLevels}
          moveToNextQuestion={moveToNextQuestion}
        />
      )}
    </div>
  );
};

export default App;