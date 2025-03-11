// components/ViewToggle.js

const ViewToggle = ({ 
  viewMode, 
  toggleViewMode, 
  selectedLevel, 
  autoListenEnabled, 
  setAutoListenEnabled 
}) => {
  return (
    <div className="controls">
      <button onClick={toggleViewMode} className="view-toggle">
        {viewMode === "standard" ? "Switch to Mile View" : "Switch to Standard View"}
      </button>

      {selectedLevel && (
        <div className="auto-listen">
          <span>Auto Listen:</span>
          <button
            onClick={() => setAutoListenEnabled(!autoListenEnabled)}
            className={autoListenEnabled ? "enabled" : "disabled"}
          >
            {autoListenEnabled ? "On" : "Off"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ViewToggle;