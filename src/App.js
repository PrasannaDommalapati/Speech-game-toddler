import React, { useState, useEffect, useRef } from 'react';
import elephantImage from './assets/beginner/elephant.jpg';

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
      <div className="bg-blue-100 p-4 rounded-xl mb-4">
        <h3 className="text-lg font-bold mb-2">Mile View Progress</h3>
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {questions[selectedLevel].map((q, index) => (
            <div 
              key={index} 
              className={`flex-shrink-0 w-20 h-20 flex items-center justify-center rounded-lg 
                ${index < currentQuestion ? 'bg-green-500 text-white' : 
                  index === currentQuestion ? 'bg-yellow-500 text-white' : 
                  'bg-gray-300'}`}
            >
              Q{index + 1}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow-lg font-sans">
      <header className="bg-green-500 p-4 rounded-lg text-white mb-6">
        <h1 className="text-2xl font-bold">Fun Speech Learning for Kids</h1>
      </header>
      
      {/* View Mode Toggle */}
      <div className="mb-4 flex justify-between items-center">
        <button 
          onClick={toggleViewMode} 
          className="bg-purple-500 text-white px-3 py-1 rounded-md text-sm"
        >
          {viewMode === 'standard' ? 'Switch to Mile View' : 'Switch to Standard View'}
        </button>
        
        {selectedLevel && (
          <div className="flex items-center">
            <span className="mr-2 text-sm">Auto Listen:</span>
            <button 
              onClick={() => setAutoListenEnabled(!autoListenEnabled)}
              className={`px-3 py-1 rounded-md text-sm text-white ${autoListenEnabled ? 'bg-green-500' : 'bg-gray-500'}`}
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
        <div className="text-center py-6">
          <h2 className="text-xl font-bold mb-6">Choose Your Level</h2>
          <div className="flex flex-col space-y-4">
            <button 
              onClick={() => setSelectedLevel('beginner')}
              className="bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-xl font-bold text-lg transition-transform hover:scale-105"
            >
              Beginner
            </button>
            <button 
              onClick={() => setSelectedLevel('intermediate')}
              className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-xl font-bold text-lg transition-transform hover:scale-105"
            >
              Intermediate
            </button>
            <button 
              onClick={() => setSelectedLevel('expert')}
              className="bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-xl font-bold text-lg transition-transform hover:scale-105"
            >
              Expert
            </button>
          </div>
        </div>
      )}
      
      {/* Game View */}
      {selectedLevel && (
        <div className="game-view">
          <h2 className="text-xl font-bold mb-4 text-center capitalize">{selectedLevel} Level</h2>
          
          <div className="bg-gray-100 p-4 rounded-xl mb-4">
            <div className="text-sm text-gray-600 mb-2">
              Question {currentQuestion + 1} of {questions[selectedLevel].length}
            </div>
            
            <div className="mb-4 flex justify-center">
              <img 
                src={questions[selectedLevel][currentQuestion].image}
                alt="Question"
                className="rounded-lg max-h-48 shadow-md"
              />
            </div>
            
            <div className="text-center mb-4 relative">
              <p className="text-xl font-medium">
                {questions[selectedLevel][currentQuestion].question}
              </p>
              <button 
                onClick={handleRepeatQuestion} 
                className="absolute right-0 top-0 text-blue-500"
                aria-label="Repeat question"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                  <path d="M3 3v5h5"></path>
                </svg>
              </button>
            </div>
            
            <div className="min-h-12 text-center my-4">
              {feedback && (
                <p className={`text-lg font-bold ${
                  feedback.includes("Great") ? "text-green-600" : 
                  feedback.includes("listening") ? "text-blue-600" : 
                  "text-orange-600"
                }`}>
                  {feedback}
                </p>
              )}
            </div>
            
            <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${
              listening ? 'bg-red-100 border-4 border-red-500 animate-pulse' : 'bg-gray-100'
            }`}>
              <div className={`w-16 h-16 rounded-full ${
                listening ? 'bg-red-500' : 'bg-gray-300'
              }`}></div>
            </div>
            
            <div className="text-center text-gray-600 mt-4">
              Attempts: {attempts} / 5
            </div>
          </div>
          
          <div className="text-center">
            <button
              onClick={handleBackToLevels}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
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
      <div className="mt-8 border-t pt-4 text-sm text-gray-600">
        <p className="font-bold">Preview Mode:</p>
        <p>This is a functional preview of the speech learning app with audio features.</p>
        <p>The app now reads questions aloud and provides audio feedback.</p>
        <p>Click the repeat button next to the question to hear it again.</p>
      </div>
    </div>
  );
};

export default SpeechLearningApp;