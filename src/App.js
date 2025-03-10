import React, { useState, useEffect, useRef } from 'react';
import elephantImage from './assets/beginner/elephant.jpg';
import './App.scss'; // Import SCSS file

const SpeechLearningApp = () => {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [viewMode, setViewMode] = useState('standard');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [listening, setListening] = useState(false);
  const [autoListenEnabled, setAutoListenEnabled] = useState(true);
  
  // Audio references
  const questionAudioRef = useRef(null);
  const successAudioRef = useRef(null);
  const failureAudioRef = useRef(null);
  const completionAudioRef = useRef(null);
  
  // Timer ref for automatic listening
  const listeningTimerRef = useRef(null);
  
  // Sample questions for each level
  const questions = {
    beginner: [
      { question: "What animal is this?", answer: "cat", image: elephantImage },
      { question: "What color is this?", answer: "red", image: "/api/placeholder/300/200" },
      { question: "What shape is this?", answer: "circle", image: "/api/placeholder/300/200" }
    ],
    intermediate: [
      { question: "What are these animals called?", answer: "elephants", image: "/api/placeholder/300/200" },
      { question: "What season is shown?", answer: "winter", image: "/api/placeholder/300/200" },
      { question: "How many birds are in this picture?", answer: "three", image: "/api/placeholder/300/200" }
    ],
    expert: [
      { question: "What is this animal's habitat?", answer: "ocean", image: "/api/placeholder/300/200" },
      { question: "What is the capital city shown?", answer: "paris", image: "/api/placeholder/300/200" },
      { question: "What planet is this?", answer: "saturn", image: "/api/placeholder/300/200" }
    ]
  };

  // Toggle between view modes
  const toggleViewMode = () => {
    setViewMode(viewMode === 'standard' ? 'mile' : 'standard');
  };
  
  // Play question audio using Text-to-Speech
  const speakQuestion = () => {
    if (selectedLevel) {
      const currentQ = questions[selectedLevel][currentQuestion].question;
      
      // Using Web Speech API for text-to-speech
      if ('speechSynthesis' in window) {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(currentQ);
        utterance.rate = 0.9; // Slightly slower for kids
        utterance.pitch = 1.2; // Slightly higher pitch for kids
        utterance.onend = () => {
          // Start listening after question is spoken
          if (autoListenEnabled) {
            setTimeout(() => startListening(), 500);
          }
        };
        window.speechSynthesis.speak(utterance);
      }
    }
  };
  
  // Speak feedback message
  const speakFeedback = (message, isSuccess) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(message);
      
      if (isSuccess) {
        utterance.pitch = 1.4; // Higher pitch for success
        utterance.rate = 1.1;
      } else {
        utterance.pitch = 0.9; // Lower pitch for try again
        utterance.rate = 0.9;
      }
      
      window.speechSynthesis.speak(utterance);
    }
  };
  
  // Handle new question loading
  useEffect(() => {
    if (selectedLevel) {
      // Speak the question when it first loads or changes
      speakQuestion();
    }
  }, [selectedLevel, currentQuestion]);
  
  // Start automatic listening when question changes or when returning from feedback
  useEffect(() => {
    if (selectedLevel && autoListenEnabled && !listening && feedback === "") {
      // Don't start listening here - we'll start after the question is spoken
    }
  }, [selectedLevel, currentQuestion, feedback, autoListenEnabled, listening]);
  
  // Cleanup effect
  useEffect(() => {
    return () => {
      if (listeningTimerRef.current) {
        clearTimeout(listeningTimerRef.current);
      }
      // Cancel any ongoing speech when component unmounts
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);
  
  // Start listening automatically
  const startListening = () => {
    setListening(true);
    setFeedback("I'm listening... Please say your answer!");
    
    // Simulate speech recognition process
    listeningTimerRef.current = setTimeout(() => {
      processVoiceInput();
    }, 5000); // Give 5 seconds to speak
  };
  
  // Process the voice input (simulated)
  const processVoiceInput = () => {
    // For preview purposes, we'll simulate random answers
    const success = Math.random() > 0.6; // 40% chance of correct answer
    setListening(false);
    
    if (success) {
      const successMessage = "Great job! That's correct!";
      setFeedback(successMessage);
      speakFeedback(successMessage, true);
      
      setTimeout(() => {
        moveToNextQuestion();
      }, 2500);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= 5) {
        const failMessage = `Let's try the next question. The correct answer was "${questions[selectedLevel][currentQuestion].answer}".`;
        setFeedback(failMessage);
        speakFeedback(failMessage, false);
        
        setTimeout(() => {
          moveToNextQuestion();
        }, 4000);
      } else {
        const tryAgainMessage = `Try again! You have ${5 - newAttempts} attempts left.`;
        setFeedback(tryAgainMessage);
        speakFeedback(tryAgainMessage, false);
        
        setTimeout(() => {
          setFeedback("");  // Clear feedback to trigger next listening cycle
        }, 2500);
      }
    }
  };
  
  // Move to next question
  const moveToNextQuestion = () => {
    if (currentQuestion < questions[selectedLevel].length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setAttempts(0);
      setFeedback("");  // Clear feedback to trigger auto-listening
    } else {
      // End of questions
      const completionMessage = "You've completed all questions! Great job!";
      setFeedback(completionMessage);
      speakFeedback(completionMessage, true);
    }
  };
  
  // Reset to level selection
  const handleBackToLevels = () => {
    setSelectedLevel(null);
    setCurrentQuestion(0);
    setAttempts(0);
    setFeedback("");
    if (listeningTimerRef.current) {
      clearTimeout(listeningTimerRef.current);
    }
    // Cancel any ongoing speech
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };
  
  // Repeat current question
  const handleRepeatQuestion = () => {
    speakQuestion();
  };
  
  // Render the Mile View
  const renderMileView = () => {
    if (!selectedLevel) return null;
    
    return (
      <div className="mile-view">
        <h3>Mile View Progress</h3>
        <div className="question-indicators">
          {questions[selectedLevel].map((q, index) => (
            <div 
              key={index} 
              className={`question-indicator ${
                index < currentQuestion ? 'completed' : 
                index === currentQuestion ? 'current' : 
                'pending'
              }`}
            >
              Q{index + 1}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Get feedback class based on message content
  const getFeedbackClass = () => {
    if (feedback.includes("Great")) return "success";
    if (feedback.includes("listening")) return "listening";
    return "warning";
  };

  return (
    <div className="speech-learning-app">
      <header>
        <h1>Fun Speech Learning for Kids</h1>
      </header>
      
      {/* View Mode Toggle */}
      <div className="controls">
        <button 
          onClick={toggleViewMode} 
          className="view-toggle"
        >
          {viewMode === 'standard' ? 'Switch to Mile View' : 'Switch to Standard View'}
        </button>
        
        {selectedLevel && (
          <div className="auto-listen">
            <span>Auto Listen:</span>
            <button 
              onClick={() => setAutoListenEnabled(!autoListenEnabled)}
              className={autoListenEnabled ? 'enabled' : 'disabled'}
            >
              {autoListenEnabled ? 'On' : 'Off'}
            </button>
          </div>
        )}
      </div>
      
      {/* Mile View (if selected) */}
      {viewMode === 'mile' && renderMileView()}
      
      {/* Level Selection */}
      {!selectedLevel && (
        <div className="level-selection">
          <h2>Choose Your Level</h2>
          <div className="level-buttons">
            <button 
              onClick={() => setSelectedLevel('beginner')}
              className="level-button beginner"
            >
              Beginner
            </button>
            <button 
              onClick={() => setSelectedLevel('intermediate')}
              className="level-button intermediate"
            >
              Intermediate
            </button>
            <button 
              onClick={() => setSelectedLevel('expert')}
              className="level-button expert"
            >
              Expert
            </button>
          </div>
        </div>
      )}
      
      {/* Game View */}
      {selectedLevel && (
        <div className="game-view">
          <h2>{selectedLevel} Level</h2>
          
          <div className="question-container">
            <div className="question-counter">
              Question {currentQuestion + 1} of {questions[selectedLevel].length}
            </div>
            
            <div className="question-image">
              <img 
                src={questions[selectedLevel][currentQuestion].image}
                alt="Question"
              />
            </div>
            
            <div className="question-text">
              <p>{questions[selectedLevel][currentQuestion].question}</p>
              <button 
                onClick={handleRepeatQuestion} 
                className="repeat-button"
                aria-label="Repeat question"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                  <path d="M3 3v5h5"></path>
                </svg>
              </button>
            </div>
            
            <div className="feedback-area">
              {feedback && (
                <p className={getFeedbackClass()}>
                  {feedback}
                </p>
              )}
            </div>
            
            <div className={`microphone ${listening ? 'active' : ''}`}>
              <div className="mic-inner"></div>
            </div>
            
            <div className="attempts-counter">
              Attempts: {attempts} / 5
            </div>
          </div>
          
          <div className="navigation">
            <button
              onClick={handleBackToLevels}
              className="back-button"
            >
              Back to Levels
            </button>
          </div>
        </div>
      )}
      
      {/* Audio elements for sound effects (hidden) */}
      <audio ref={questionAudioRef} className="hidden">
        <source src="#" type="audio/mpeg" />
      </audio>
      <audio ref={successAudioRef} className="hidden">
        <source src="#" type="audio/mpeg" />
      </audio>
      <audio ref={failureAudioRef} className="hidden">
        <source src="#" type="audio/mpeg" />
      </audio>
      <audio ref={completionAudioRef} className="hidden">
        <source src="#" type="audio/mpeg" />
      </audio>
      
      {/* Preview Info */}
      <div className="preview-info">
        <p className="preview-heading">Preview Mode:</p>
        <p>This is a functional preview of the speech learning app with audio features.</p>
        <p>The app now reads questions aloud and provides audio feedback.</p>
        <p>Click the repeat button next to the question to hear it again.</p>
      </div>
    </div>
  );
};

export default SpeechLearningApp;