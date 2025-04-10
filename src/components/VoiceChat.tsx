
import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, Send, StopCircle } from "lucide-react";
import Message from "./Message";
import VoiceWave from "./VoiceWave";
import { useToast } from "@/components/ui/use-toast";

interface VoiceChatProps {
  voiceId?: string;
}

interface MessageType {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
  audioUrl?: string;
}

const VoiceChat: React.FC<VoiceChatProps> = ({ voiceId }) => {
  const [messages, setMessages] = useState<MessageType[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Hello! I'm your AI assistant. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [audioElements, setAudioElements] = useState<Record<string, HTMLAudioElement>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      recorder.onstop = async () => {
        // Stop all audio tracks
        recorder.stream.getTracks().forEach(track => track.stop());
        
        const blob = new Blob(chunks, { type: "audio/webm" });
        await processVoiceInput(blob);
      };
      
      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        title: "Microphone Access Error",
        description: "Please allow microphone access to record audio.",
        variant: "destructive"
      });
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const generateVoiceResponse = async (text: string): Promise<string> => {
    // In a real app, this would make an API call to ElevenLabs or another TTS service
    // For this demo, we'll simulate this with predefined audio
    
    // Simulate voice generation delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Here, we would use the voiceId to select the appropriate cloned voice
    // For the demo, just simulate with a basic browser TTS
    const utterance = new SpeechSynthesisUtterance(text);
    
    // If we had a real voice service, we'd use the voiceId here
    // This is just a placeholder behavior
    if (voiceId) {
      // In a real app with ElevenLabs API:
      // const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + voiceId, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'xi-api-key': 'your-api-key'
      //   },
      //   body: JSON.stringify({
      //     text: text,
      //     model_id: "eleven_multilingual_v2",
      //     voice_settings: {
      //       stability: 0.5,
      //       similarity_boost: 0.75
      //     }
      //   })
      // });
      // const audioBlob = await response.blob();
      // const url = URL.createObjectURL(audioBlob);
      // return url;
      
      // For demo, use browser voice synthesis
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        // Try to use a female voice for variety
        const femaleVoice = voices.find(voice => voice.name.includes('female'));
        utterance.voice = femaleVoice || voices[0];
      }
    }
    
    // Create a promise to capture audio
    return new Promise((resolve) => {
      // For demo purposes, use the browser's SpeechSynthesis API
      const synth = window.speechSynthesis;
      
      // Create audio context and processor to capture audio
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
      utterance.onend = () => {
        mediaRecorder.stop();
        audioContext.close();
      };
      
      synth.speak(utterance);
    });
  };

  const processVoiceInput = async (audioBlob: Blob) => {
    setIsProcessing(true);
    
    // In a real implementation, you would:
    // 1. Send audio to speech-to-text API (like Whisper)
    // 2. Get the transcription
    // 3. Send the text to GPT or other LLM
    // 4. Convert the response to speech using the cloned voice
    
    // For demo purposes, we'll simulate this process
    
    // Simulate transcription (in reality, would use Whisper API)
    const mockUserQuestions = [
      "How are you today?",
      "What's the weather like?",
      "Can you tell me a joke?",
      "What's your favorite color?",
      "Tell me something interesting."
    ];
    
    const userText = mockUserQuestions[Math.floor(Math.random() * mockUserQuestions.length)];
    
    // Add user message
    const userMessage: MessageType = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Simulate AI processing time
    setTimeout(async () => {
      // Mock AI responses
      const mockResponses: Record<string, string> = {
        "How are you today?": "I'm doing well, thank you for asking! How about you?",
        "What's the weather like?": "I don't have access to real-time weather data, but I hope it's pleasant where you are!",
        "Can you tell me a joke?": "Why don't scientists trust atoms? Because they make up everything!",
        "What's your favorite color?": "As an AI, I don't have personal preferences, but I think purple is quite nice!",
        "Tell me something interesting.": "The human brain can process images in as little as 13 milliseconds. That's faster than the blink of an eye!"
      };
      
      // Generate AI response
      const aiResponse = mockResponses[userText] || "I'm not sure how to respond to that, but I'm learning!";
      
      // Generate audio for the response
      let audioUrl = "";
      try {
        audioUrl = await generateVoiceResponse(aiResponse);
      } catch (error) {
        console.error("Error generating voice response:", error);
        toast({
          title: "Voice Generation Error",
          description: "Could not generate voice response.",
          variant: "destructive"
        });
      }
      
      // Add AI message with audio
      const aiMessage: MessageType = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: aiResponse,
        timestamp: new Date(),
        audioUrl: audioUrl
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsProcessing(false);
      
      // Auto-play the response if it's the first one or if a previous one was playing
      if (audioUrl && (messages.length <= 2 || isPlaying)) {
        playMessage(aiMessage.id, audioUrl);
      }
    }, 2000);
  };

  const playMessage = (messageId: string, audioUrl?: string) => {
    if (!audioUrl) {
      const message = messages.find(m => m.id === messageId);
      if (!message?.audioUrl) return;
      audioUrl = message.audioUrl;
    }
    
    // Stop any currently playing audio
    if (isPlaying) {
      const currentAudio = audioElements[isPlaying];
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
    }
    
    // Play the new audio
    let audio = audioElements[messageId];
    if (!audio) {
      audio = new Audio(audioUrl);
      setAudioElements(prev => ({
        ...prev,
        [messageId]: audio
      }));
    }
    
    setIsPlaying(messageId);
    
    audio.onended = () => {
      setIsPlaying(null);
    };
    
    audio.play().catch(error => {
      console.error("Error playing audio:", error);
      setIsPlaying(null);
    });
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>
          {voiceId 
            ? "Chat with AI (Custom Voice)" 
            : "Chat with AI (Default Voice)"}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="flex-1 overflow-y-auto max-h-[calc(70vh-8rem)] pr-2 mb-4">
          {messages.map(message => (
            <Message 
              key={message.id}
              sender={message.sender}
              text={message.text}
              timestamp={message.timestamp}
              isPlaying={isPlaying === message.id}
              onPlay={() => message.sender === "ai" && message.audioUrl && playMessage(message.id)}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="border-t pt-3">
          <div className="flex items-center justify-between gap-2">
            {isRecording ? (
              <Button 
                variant="destructive" 
                size="icon" 
                className="rounded-full h-12 w-12"
                onClick={stopRecording}
              >
                <StopCircle className="h-6 w-6" />
              </Button>
            ) : (
              <Button 
                className="rounded-full h-12 w-12 bg-brand-purple hover:bg-brand-purple/90"
                size="icon" 
                onClick={startRecording}
                disabled={isProcessing}
              >
                <Mic className="h-6 w-6" />
              </Button>
            )}
            
            <div className="flex-1 mx-2">
              {isRecording ? (
                <div className="flex justify-center">
                  <VoiceWave active={true} />
                </div>
              ) : isProcessing ? (
                <p className="text-sm text-center text-muted-foreground animate-pulse">
                  Processing your message...
                </p>
              ) : (
                <p className="text-sm text-center text-muted-foreground">
                  {messages.length > 1 
                    ? "Press and hold to speak again" 
                    : "Press and hold to start speaking"}
                </p>
              )}
            </div>
            
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full h-12 w-12"
              disabled={true}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceChat;
