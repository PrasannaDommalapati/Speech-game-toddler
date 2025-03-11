// utils/speechHelpers.js
// Helper functions for speech synthesis and recognition

// Text-to-speech function
export const speakText = (message, options = {}) => {
    if ("speechSynthesis" in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
  
      const utterance = new SpeechSynthesisUtterance(message);
      
      // Apply options if provided
      if (options.pitch) utterance.pitch = options.pitch;
      if (options.rate) utterance.rate = options.rate;
      if (options.onEnd) utterance.onend = options.onEnd;
      
      window.speechSynthesis.speak(utterance);
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
      pitch: 1.4,
      rate: 1.1
    });
  };