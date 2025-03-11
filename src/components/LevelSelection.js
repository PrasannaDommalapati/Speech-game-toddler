const LevelSelection = ({ setSelectedLevel }) => {
  return (
    <div className="level-selection">
      <h2>Choose Your Level</h2>
      <div className="level-buttons">
        <button
          onClick={() => setSelectedLevel("Beginner")}
          className="level-button beginner"
        >
          Beginner
        </button>
        <button
          onClick={() => setSelectedLevel("Intermediate")}
          className="level-button intermediate"
        >
          Intermediate
        </button>
        <button
          onClick={() => setSelectedLevel("Expert")}
          className="level-button expert"
        >
          Expert
        </button>
      </div>
    </div>
  );
};

export default LevelSelection;