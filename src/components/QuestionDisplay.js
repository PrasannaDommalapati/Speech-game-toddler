// components/QuestionDisplay.js
import React from "react";

const QuestionDisplay = ({ question, onRepeat }) => {
  return (
    <>
      <div className="question-image">
        <img src={question.image} alt="Question" />
      </div>

      <div className="question-text">
        <p>{question.question}</p>
        <button
          onClick={onRepeat}
          className="repeat-button"
          aria-label="Repeat question"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
            <path d="M3 3v5h5"></path>
          </svg>
        </button>
      </div>
    </>
  );
};

export default QuestionDisplay;