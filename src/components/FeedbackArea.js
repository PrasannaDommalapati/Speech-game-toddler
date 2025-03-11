// components/FeedbackArea.js
import React from "react";

const FeedbackArea = ({ feedback, userAnswer, listening }) => {
  // Get feedback class based on message content
  const getFeedbackClass = () => {
    if (feedback.includes("Hurray") || feedback.includes("Great")) return "success";
    if (feedback.includes("listening")) return "listening";
    return "warning";
  };

  return (
    <div className="feedback-area">
      {feedback && <p className={getFeedbackClass()}>{feedback}</p>}
      
      {userAnswer && !listening && !feedback.includes(userAnswer) && (
        <p className="user-answer">I heard: "{userAnswer}"</p>
      )}
    </div>
  );
};

export default FeedbackArea;