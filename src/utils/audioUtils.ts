
// Define types for Web Speech API to fix TypeScript errors
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  [index: number]: SpeechRecognitionResult;
  item(index: number): SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  [index: number]: SpeechRecognitionAlternative;
  item(index: number): SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

// Augment Window interface
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  start(): void;
  stop(): void;
}

export const generateVoiceResponse = async (text: string, voiceId?: string): Promise<string> => {
  console.log("Generating voice response for:", text);
  console.log("Using voice ID:", voiceId);
  
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
  return new Promise((resolve, reject) => {
    try {
      // Use SpeechRecognition API for real-time transcription
      const SpeechRecognition = (window as any).SpeechRecognition || 
                               (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        throw new Error("Speech recognition not supported in this browser");
      }
      
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      
      let transcriptResult = "";
      
      recognition.onresult = (event: any) => {
        transcriptResult = event.results[0][0].transcript;
        console.log("Recognized text:", transcriptResult);
      };
      
      recognition.onerror = (event: any) => {
        console.error("Recognition error:", event.error);
        reject(new Error(`Speech recognition error: ${event.error}`));
      };
      
      recognition.onend = () => {
        if (transcriptResult) {
          resolve(transcriptResult);
        } else {
          // If no transcript, use the audio blob with an alternative method
          processAudioBlobFallback(audioBlob)
            .then(resolve)
            .catch(reject);
        }
      };
      
      // Start recognition
      recognition.start();
    } catch (error) {
      console.error("Error during speech recognition:", error);
      // Try fallback method
      processAudioBlobFallback(audioBlob)
        .then(resolve)
        .catch(reject);
    }
  });
};

// Fallback method for processing audio when SpeechRecognition fails
const processAudioBlobFallback = async (audioBlob: Blob): Promise<string> => {
  try {
    // In a real implementation, you would send the audio to a transcription API like Whisper
    // For now, we'll create an audio element to let the user know we received their audio
    const audioURL = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioURL);
    
    // Log that we're trying to process the audio
    console.log("Using fallback audio processing method");
    
    // If we had an OpenAI Whisper API key, this is where we'd use it
    // const formData = new FormData();
    // formData.append('file', audioBlob, 'recording.webm');
    // formData.append('model', 'whisper-1');
    
    // const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${OPENAI_API_KEY}`
    //   },
    //   body: formData
    // });
    
    // const data = await response.json();
    // return data.text;
    
    // For now, return a placeholder message
    return "I heard your voice but couldn't transcribe it with the browser's capabilities. For better results, try speaking clearly or typing your question.";
  } catch (error) {
    console.error("Error in fallback audio processing:", error);
    throw new Error("Could not process audio recording");
  }
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
): void => {
  if (!mediaRecorder) return;
  
  const chunks: Blob[] = [];
  
  // Ensure we have the ondataavailable handler
  const originalDataHandler = mediaRecorder.ondataavailable;
  mediaRecorder.ondataavailable = function(e) {
    if (originalDataHandler) {
      originalDataHandler.call(this, e);
    }
    if (e.data.size > 0) {
      chunks.push(e.data);
    }
  };
  
  // Set up the onstop handler
  const originalStopHandler = mediaRecorder.onstop;
  mediaRecorder.onstop = function() {
    if (originalStopHandler) {
      originalStopHandler.call(this);
    }
    
    // Stop all audio tracks
    mediaRecorder.stream.getTracks().forEach(track => track.stop());
    
    const blob = new Blob(chunks, { type: "audio/webm" });
    onStop(blob);
  };
  
  mediaRecorder.stop();
};
