// components/GameView.js
import React, { useState, useEffect, useCallback, useRef } from "react";
import QuestionDisplay from "./QuestionDisplay";
import FeedbackArea from "./FeedbackArea";
import { speakText, startSpeechRecognition, playCelebrationSound } from "../utils/speechHelpers";

const GameView = ({
  level,
  questions,
  currentQuestion,
  autoListenEnabled,
  handleBackToLevels,
  moveToNextQuestion
}) => {
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [listening, setListening] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const recognitionRef = useRef(null);

  // Function to speak the current question
  const speakQuestion = useCallback(() => {
    const currentQ = questions[currentQuestion].question;
    
    const utterance = speakText(currentQ, {
      rate: 0.9,
      pitch: 1.2,
      onEnd: () => {
        // Start listening after question is spoken if auto-listen is enabled
        if (autoListenEnabled) {
          setTimeout(() => startListening(), 500);
        }
      }
    });
    
    return () => {
      if (utterance && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [questions, currentQuestion, autoListenEnabled]);

  // Process the user's voice input
  const processVoiceInput = useCallback((userInput) => {
    const correctAnswer = questions[currentQuestion].answer.toLowerCase();
    
    if (userInput.toLowerCase().includes(correctAnswer)) {
      // Play celebration sound/speech
      playCelebrationSound();
      
      const successMessage = `Hurray! "${userInput}" is correct!`;
      setFeedback(successMessage);
      
      speakText(successMessage, { 
        pitch: 1.4, 
        rate: 1.1 
      });
      
      setTimeout(() => {
        moveToNextQuestion();
        setAttempts(0);
        setFeedback("");
        setUserAnswer("");
      }, 3000);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= 5) {
        const failMessage = `I heard "${userInput}". Let's try the next question. The correct answer was "${correctAnswer}".`;
        setFeedback(failMessage);
        
        speakText(failMessage, { 
          pitch: 0.9, 
          rate: 0.9 
        });
        
        setTimeout(() => {
          moveToNextQuestion();
          setAttempts(0);
          setFeedback("");
          setUserAnswer("");
        }, 4000);
      } else {
        const tryAgainMessage = `I heard "${userInput}". Try again! You have ${5 - newAttempts} attempts left.`;
        setFeedback(tryAgainMessage);
        
        speakText(tryAgainMessage, { 
          pitch: 0.9, 
          rate: 0.9 
        });
        
        setTimeout(() => {
          setFeedback("");  // Clear feedback to trigger next listening cycle
          setUserAnswer("");
        }, 3000);
      }
    }
  }, [questions, currentQuestion, attempts, moveToNextQuestion]);

  // Start the speech recognition process
  const startListening = useCallback(() => {
    setListening(true);
    setFeedback("I'm listening... Please say your answer!");
    
    recognitionRef.current = startSpeechRecognition({
      lang: 'en-US',
      continuous: false,
      interimResults: false,
      onResult: (event) => {
        const transcript = event.results[0][0].transcript;
        setUserAnswer(transcript);
        processVoiceInput(transcript);
        setListening(false);
      },
      onError: (event) => {
        setListening(false);
        setFeedback("Sorry, I couldn't hear you. Try again.");
        
        speakText("Sorry, I couldn't hear you. Try again.", {
          pitch: 0.9,
          rate: 0.9
        });
        
        setTimeout(() => {
          setFeedback("");
        }, 2000);
      },
      onEnd: () => {
        setListening(false);
      }
    });
  }, [processVoiceInput]);

  // Handle repeat question button click
  const handleRepeatQuestion = useCallback(() => {
    speakQuestion();
  }, [speakQuestion]);

  // Speak the question when it first loads or changes
  useEffect(() => {
    const cleanup = speakQuestion();
    return cleanup;
  }, [currentQuestion, speakQuestion]);

  // Start automatic listening when feedback is cleared
  useEffect(() => {
    if (autoListenEnabled && !listening && feedback === "") {
      // Don't start listening here - we start after question is spoken
    }
  }, [autoListenEnabled, feedback, listening]);

  // Cleanup effect for speech synthesis
  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      
      // Cancel any ongoing speech recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          console.log("Error aborting speech recognition:", e);
        }
      }
    };
  }, []);

  return (
    <div className="game-view">
      <h2>{level} Level</h2>

      <div className="question-container">
        <div className="question-counter">
          Question {currentQuestion + 1} of {questions.length}
        </div>

        <QuestionDisplay 
          question={questions[currentQuestion]} 
          onRepeat={handleRepeatQuestion} 
        />

        <FeedbackArea 
          feedback={feedback} 
          userAnswer={userAnswer}
          listening={listening} 
        />

        <div className={`microphone ${listening ? "active" : ""}`}>
          <div className="mic-inner"></div>
        </div>

        <div className="attempts-counter">Attempts: {attempts} / 5</div>
        
        {!listening && autoListenEnabled === false && (
          <button 
            onClick={startListening} 
            className="listen-button"
          >
            Start Listening
          </button>
        )}
      </div>

      <div className="navigation">
        <button onClick={handleBackToLevels} className="back-button">
          Back to Levels
        </button>
      </div>
    </div>
  );
};

export default GameView;