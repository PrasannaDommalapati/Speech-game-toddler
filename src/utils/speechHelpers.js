// utils/speechHelpers.js
// Helper functions for speech synthesis and recognition

// Text-to-speech function with Veena voice selection
export const speakText = (message, options = {}) => {
  if ("speechSynthesis" in window) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(message);
    
    // Get all available voices
    let voices = window.speechSynthesis.getVoices();
    
    // If voices array is empty, wait for voices to load (happens in some browsers)
    if (voices.length === 0) {
      // Create a promise that resolves when voices are loaded
      const voicesLoaded = new Promise((resolve) => {
        window.speechSynthesis.onvoiceschanged = () => {
          voices = window.speechSynthesis.getVoices();
          resolve(voices);
        };
      });
      
      // Wait for voices to load before continuing
      voicesLoaded.then((updatedVoices) => {
        voices = updatedVoices;
        setVoiceAndSpeak();
      });
    } else {
      setVoiceAndSpeak();
    }
    
    function setVoiceAndSpeak() {
      // First try to find specifically the Veena voice
      let selectedVoice = voices.find(voice => 
        voice.name.includes('Veena')
      );
      
      // If Veena is not found, fall back to other female voices
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => 
          voice.name.includes('female') || 
          voice.name.includes('Female') || 
          voice.name.includes('woman') ||
          voice.name.includes('girl') ||
          (voice.name.includes('Google') && voice.name.includes('US English') && !voice.name.includes('Male'))
        );
      }
      
      // If still no voice found, try common female voice names
      if (!selectedVoice) {
        const commonFemaleVoices = ['Samantha', 'Victoria', 'Alice', 'Karen', 'Tessa', 'Moira'];
        selectedVoice = voices.find(voice => 
          commonFemaleVoices.some(name => voice.name.includes(name))
        );
      }
      
      // Set the selected voice if found
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log("Using voice:", selectedVoice.name);
      } else {
        console.log("No preferred voice found, using default");
      }
      
      // Apply options if provided
      if (options.pitch) utterance.pitch = options.pitch;
      if (options.rate) utterance.rate = options.rate;
      if (options.onEnd) utterance.onend = options.onEnd;
      
      window.speechSynthesis.speak(utterance);
    }
    
    return utterance;
  }
  return null;
};

// Speech recognition function
export const startSpeechRecognition = (options = {}) => {
  if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
    console.error('Speech recognition not supported in this browser');
    if (options.onError) {
      options.onError({ error: 'not-supported' });
    }
    return null;
  }

  // Use the appropriate speech recognition constructor
  const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognitionAPI();
  
  // Configure recognition
  recognition.lang = options.lang || 'en-US';
  recognition.continuous = options.continuous || false;
  recognition.interimResults = options.interimResults || false;
  
  // Set up event handlers
  if (options.onResult) recognition.onresult = options.onResult;
  if (options.onError) recognition.onerror = options.onError;
  if (options.onEnd) recognition.onend = options.onEnd;
  
  // Start recognition
  recognition.start();
  
  return recognition;
};

// Play celebration sound
export const playCelebrationSound = () => {
  const audio = new Audio();
  // You would typically provide a real audio file path here
  audio.src = "/path/to/celebration.mp3"; 
  audio.play().catch(e => console.log("Audio play error:", e));
  
  // If audio file is not available, use speech synthesis as fallback
  speakText("Hurray! You got it right!", { 
    pitch: 1.2,  // Slightly higher pitch for female voice
    rate: 1.0
  });
};

// Skip question functionality
export const skipQuestion = (callback, options = {}) => {
  // Cancel any ongoing speech
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
  
  // Speak skip confirmation message if enabled
  if (options.speakConfirmation !== false) {
    const skipMessage = options.skipMessage || "Question skipped. Moving to the next one.";
    speakText(skipMessage, {
      pitch: options.pitch || 1.2,
      rate: options.rate || 1.0,
      onEnd: () => {
        // Execute callback after confirmation is spoken
        if (typeof callback === 'function') {
          callback();
        }
      }
    });
  } else {
    // Execute callback immediately if speech confirmation is disabled
    if (typeof callback === 'function') {
      callback();
    }
  }
  
  return true;
};

// Add keyboard listener for skipping (can be called once during app initialization)
export const initSkipQuestionKeyboardShortcut = (skipCallback, options = {}) => {
  const keyCode = options.keyCode || 83; // Default to 'S' key
  
  const handleKeyPress = (event) => {
    // Check if S key or custom key is pressed
    if (event.keyCode === keyCode || event.key === 's' || event.key === 'S') {
      // Check if modifier keys are required and pressed
      const modifiersRequired = options.requireModifiers || false;
      
      if (modifiersRequired) {
        // Only skip if Ctrl/Cmd is pressed along with the key
        if (event.ctrlKey || event.metaKey) {
          skipQuestion(skipCallback, options);
        }
      } else {
        // Skip with just the key press
        skipQuestion(skipCallback, options);
      }
    }
  };
  
  // Add the event listener
  document.addEventListener('keydown', handleKeyPress);
  
  // Return a function to remove the listener when needed
  return () => {
    document.removeEventListener('keydown', handleKeyPress);
  };
};

// Helper to list all available voices (useful for debugging or creating a voice selector)
export const listAllAvailableVoices = () => {
  if ("speechSynthesis" in window) {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      console.log("No voices available yet, please try again after onvoiceschanged event");
      window.speechSynthesis.onvoiceschanged = () => {
        const updatedVoices = window.speechSynthesis.getVoices();
        console.log("Available voices:", updatedVoices);
        return updatedVoices;
      };
    } else {
      console.log("Available voices:", voices);
      return voices;
    }
  } else {
    console.error("Speech synthesis not supported in this browser");
    return [];
  }
};