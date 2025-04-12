
export const generateVoiceResponse = async (text: string, voiceId?: string): Promise<string> => {
  console.log("Generating voice response for:", text);
  console.log("Using voice ID:", voiceId);
  
  // In a real implementation with ElevenLabs API
  try {
    if (!voiceId) {
      // Fallback to browser's speech synthesis if no voice ID
      return generateBrowserSpeech(text);
    }
    
    // This would be the ElevenLabs API call in production
    // For now, we'll simulate with browser's speech synthesis but track the voiceId
    return generateBrowserSpeech(text, voiceId);
  } catch (error) {
    console.error("Error generating voice response:", error);
    throw new Error("Could not generate voice response");
  }
};

const generateBrowserSpeech = (text: string, voiceId?: string): Promise<string> => {
  return new Promise((resolve) => {
    // Create audio context and processor to capture audio
    const AudioContext = window.AudioContext || 
      (window as any).webkitAudioContext as typeof AudioContext;
    
    const audioContext = new AudioContext();
    const destination = audioContext.createMediaStreamDestination();
    const mediaRecorder = new MediaRecorder(destination.stream);
    const audioChunks: Blob[] = [];
    
    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };
    
    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      resolve(audioUrl);
    };
    
    // Start recording
    mediaRecorder.start();
    
    // Use the utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Try to simulate the effect of using different voices based on voiceId
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      if (voiceId) {
        // Use voiceId as a seed to select a consistent voice
        const voiceIndex = voiceId.charCodeAt(0) % voices.length;
        utterance.voice = voices[voiceIndex];
      } else {
        utterance.voice = voices[0];
      }
    }
    
    utterance.onend = () => {
      mediaRecorder.stop();
      audioContext.close();
    };
    
    window.speechSynthesis.speak(utterance);
  });
};

export const recognizeSpeech = async (audioBlob: Blob): Promise<string> => {
  // In a real app, use OpenAI's Whisper API or another speech-to-text service
  // For demo, prompt the user (this would be replaced with actual API call)
  return new Promise((resolve) => {
    const userInput = prompt("What did you say? (Simulating speech recognition)", "");
    resolve(userInput || "");
  });
};

export const startAudioRecording = async (): Promise<MediaRecorder> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    return recorder;
  } catch (error) {
    console.error("Error accessing microphone:", error);
    throw new Error("Please allow microphone access to record audio");
  }
};

export const stopAudioRecording = (
  mediaRecorder: MediaRecorder, 
  onStop: (blob: Blob) => void
) => {
  if (!mediaRecorder) return;
  
  const chunks: Blob[] = [];
  
  // Ensure we have the ondataavailable handler
  const originalDataHandler = mediaRecorder.ondataavailable;
  mediaRecorder.ondataavailable = (e) => {
    if (originalDataHandler) originalDataHandler(e);
    if (e.data.size > 0) {
      chunks.push(e.data);
    }
  };
  
  // Set up the onstop handler
  const originalStopHandler = mediaRecorder.onstop;
  mediaRecorder.onstop = () => {
    if (originalStopHandler) originalStopHandler();
    
    // Stop all audio tracks
    mediaRecorder.stream.getTracks().forEach(track => track.stop());
    
    const blob = new Blob(chunks, { type: "audio/webm" });
    onStop(blob);
  };
  
  mediaRecorder.stop();
};
