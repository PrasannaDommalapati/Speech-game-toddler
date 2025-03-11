import React, { useState, useEffect, useCallback, useRef } from "react";
import QuestionDisplay from "./QuestionDisplay";
import FeedbackArea from "./FeedbackArea";
import {
  speakText,
  startSpeechRecognition,
  playCelebrationSound,
} from "../utils/speechHelpers";

const GameView = ({
  level,
  questions,
  currentQuestion,
  autoListenEnabled,
  handleBackToLevels,
  moveToNextQuestion,
}) => {
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [listening, setListening] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [processingError, setProcessingError] = useState(false); // Flag to prevent multiple errors
  const recognitionRef = useRef(null);
  const attemptsRef = useRef(0); // Use a ref to track attempts in real-time
  const MAX_ATTEMPTS = 3;

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
      },
    });

    return () => {
      if (utterance && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [questions, currentQuestion, autoListenEnabled]);

  // Reset attempts when moving to a new question
  useEffect(() => {
    setAttempts(0);
    attemptsRef.current = 0;
  }, [currentQuestion]);

  // Start the speech recognition process
  const startListening = useCallback(() => {
    // Don't start listening if we're already processing an error
    if (processingError) return;
    
    setListening(true);
    setFeedback("I'm listening... Please say your answer!");

    recognitionRef.current = startSpeechRecognition({
      lang: "en-GB",
      continuous: false,
      interimResults: false,
      onResult: (event) => {
        const transcript = event.results[0][0].transcript;
        setUserAnswer(transcript);
        processVoiceInput(transcript);
        setListening(false);
      },
      onError: (event) => {
        // Prevent multiple errors from being processed at once
        if (processingError) return;
        setProcessingError(true);
        
        // Increment attempts when speech recognition fails
        attemptsRef.current += 1;
        setAttempts(attemptsRef.current);
        setListening(false);
        
        if (attemptsRef.current >= MAX_ATTEMPTS) {
          const correctAnswer = questions[currentQuestion].answer;
          const failMessage = `The correct answer was "${correctAnswer}".`;
          setFeedback(failMessage);

          speakText(failMessage, {
            pitch: 0.9,
            rate: 0.9,
          });

          setTimeout(() => {
            moveToNextQuestion();
            attemptsRef.current = 0;
            setAttempts(0);
            setFeedback("");
            setUserAnswer("");
            setProcessingError(false);
          }, 4000);
        } else {
          const tryAgainMessage = `Sorry, I couldn't hear you. Try again! You have ${
            MAX_ATTEMPTS - attemptsRef.current
          } attempts left.`;
          setFeedback(tryAgainMessage);

          speakText(tryAgainMessage, {
            pitch: 0.9,
            rate: 0.9,
          });

          setTimeout(() => {
            setFeedback("");
            setProcessingError(false);
            
            // If auto-listen is enabled, start listening again after feedback
            if (autoListenEnabled) {
              setTimeout(() => startListening(), 500);
            }
          }, 5000);
        }
      },
      onEnd: () => {
        setListening(false);
      },
    });
  }, [questions, currentQuestion, moveToNextQuestion, autoListenEnabled, processingError]);

  // Process the user's voice input
  const processVoiceInput = useCallback(
    (userInput) => {
      // Prevent processing if we're already handling an error
      if (processingError) return;
      
      const correctAnswer = questions[currentQuestion].answer.toLowerCase();

      if (userInput.toLowerCase().includes(correctAnswer)) {
        // Play celebration sound/speech
        playCelebrationSound();

        const successMessage = `Hurray! "${userInput}" is correct!`;
        setFeedback(successMessage);

        speakText(successMessage, {
          pitch: 1.4,
          rate: 1.1,
        });

        setTimeout(() => {
          moveToNextQuestion();
          attemptsRef.current = 0;
          setAttempts(0);
          setFeedback("");
          setUserAnswer("");
        }, 3000);
      } else {
        // Increment attempts for wrong answer
        attemptsRef.current += 1;
        setAttempts(attemptsRef.current);
        setProcessingError(true);

        if (attemptsRef.current >= MAX_ATTEMPTS) {
          const failMessage = `I heard "${userInput}". Let's try the next question. The correct answer was "${correctAnswer}".`;
          setFeedback(failMessage);

          speakText(failMessage, {
            pitch: 0.9,
            rate: 0.9,
          });

          setTimeout(() => {
            moveToNextQuestion();
            attemptsRef.current = 0;
            setAttempts(0);
            setFeedback("");
            setUserAnswer("");
            setProcessingError(false);
          }, 4000);
        } else {
          const tryAgainMessage = `I heard "${userInput}". Try again! You have ${
            MAX_ATTEMPTS - attemptsRef.current
          } attempts left.`;
          setFeedback(tryAgainMessage);

          speakText(tryAgainMessage, {
            pitch: 0.9,
            rate: 0.9,
          });

          setTimeout(() => {
            setFeedback("");
            setUserAnswer("");
            setProcessingError(false);
            
            // If auto-listen is enabled, start listening again after feedback
            if (autoListenEnabled) {
              setTimeout(() => startListening(), 500);
            }
          }, 3000);
        }
      }
    },
    [questions, currentQuestion, moveToNextQuestion, autoListenEnabled, processingError]
  );

  // Handle repeat question button click
  const handleRepeatQuestion = useCallback(() => {
    speakQuestion();
  }, [speakQuestion]);

  // Speak the question when it first loads or changes
  useEffect(() => {
    const cleanup = speakQuestion();
    return cleanup;
  }, [currentQuestion, speakQuestion]);

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
          {/* Replace the circular button with a microphone icon */}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="mic-icon"
          >
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            <line x1="12" y1="19" x2="12" y2="23"></line>
            <line x1="8" y1="23" x2="16" y2="23"></line>
          </svg>
        </div>

        <div className="attempts-counter">Attempts: {attempts} / {MAX_ATTEMPTS}</div>

        {!listening && !processingError && autoListenEnabled === false && (
          <button onClick={startListening} className="listen-button">
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