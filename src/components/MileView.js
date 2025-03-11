// components/MileView.js
import React from "react";

const MileView = ({ questions, currentQuestion }) => {
  return (
    <div className="mile-view">
      <h3>Mile View Progress</h3>
      <div className="question-indicators-container">
        <div className="question-indicators">
          {questions.map((q, index) => (
            <div
              key={index}
              className={`question-indicator ${
                index < currentQuestion
                  ? "completed"
                  : index === currentQuestion
                  ? "current"
                  : "pending"
              }`}
            >
              Q{index + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MileView;