import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, Send, StopCircle } from "lucide-react";
import Message from "./Message";
import VoiceWave from "./VoiceWave";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";

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
  const [textInput, setTextInput] = useState("");
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
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
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
    // 1. Convert the audio to text using Whisper API
    try {
      // This would be an actual API call to a speech-to-text service
      // For now, we'll simulate speech recognition with the Web Speech API if available
      const userText = await recognizeSpeech(audioBlob);
      
      // Add user message
      const userMessage: MessageType = {
        id: `user-${Date.now()}`,
        sender: "user",
        text: userText,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Process the message and get AI response
      await processUserMessage(userText);
    } catch (error) {
      console.error("Error processing voice:", error);
      toast({
        title: "Voice Processing Error",
        description: "Could not process your voice. Please try again or use text input.",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };

  const recognizeSpeech = async (audioBlob: Blob): Promise<string> => {
    // In a real app, you would use Whisper API or similar here
    // For demo, we'll use a simulated response with Web Speech API if available
    
    // Since we can't directly use the Web Speech API with a blob in this way easily,
    // let's simulate this with a prompt
    const userText = prompt("Speech recognition simulation - What did you say?", "Hello AI, how are you today?");
    
    // Return user input or fallback to default message
    return userText || "Hello AI, can you hear me?";
  };

  const processUserMessage = async (userText: string) => {
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, this would call your AI service (e.g., OpenAI's API)
    // For demo, use simple responses for common queries
    const commonResponses: Record<string, string> = {
      "hello": "Hello! How can I help you today?",
      "hi": "Hi there! What can I do for you?",
      "how are you": "I'm doing great, thanks for asking! How about you?",
      "what's your name": "I'm your AI voice assistant. You can call me whatever you'd like!",
      "goodbye": "Goodbye! Have a great day!",
      "bye": "Bye for now! Feel free to chat again anytime."
    };
    
    // Check if the user's message matches any common phrases
    const lowerText = userText.toLowerCase();
    let aiResponse = "";
    
    for (const [key, value] of Object.entries(commonResponses)) {
      if (lowerText.includes(key)) {
        aiResponse = value;
        break;
      }
    }
    
    // Fallback response if no matches
    if (!aiResponse) {
      aiResponse = "That's interesting! Is there anything specific you'd like to know or talk about?";
    }
    
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
    
    // Auto-play the response
    if (audioUrl) {
      playMessage(aiMessage.id, audioUrl);
    }
  };

  const handleSendText = async () => {
    if (!textInput.trim()) return;
    
    const userMessage: MessageType = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textInput,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setTextInput("");
    setIsProcessing(true);
    
    // Process the message and get AI response
    await processUserMessage(userMessage.text);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
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
            
            <div className="flex-1 relative">
              <Input
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type a message..."
                disabled={isRecording || isProcessing}
                className="w-full pr-10"
              />
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-0 top-0 h-full"
                onClick={handleSendText}
                disabled={!textInput.trim() || isRecording || isProcessing}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex-col items-center hidden">
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
          </div>
          
          {isRecording && (
            <div className="flex justify-center mt-2">
              <VoiceWave active={true} />
              <span className="text-sm text-brand-purple ml-2 animate-pulse">Recording...</span>
            </div>
          )}
          
          {isProcessing && (
            <p className="text-sm text-center text-muted-foreground animate-pulse mt-2">
              Processing your message...
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceChat;
