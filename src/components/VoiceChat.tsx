
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
  const [conversationHistory, setConversationHistory] = useState<{role: string, content: string}[]>([
    { role: "system", content: "You are a helpful AI assistant with a friendly, conversational style. Respond directly to questions and provide thoughtful answers. Never repeat the same response twice." }
  ]);

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
    // In a real implementation, this would make an API call to ElevenLabs or similar TTS service
    console.log("Generating voice response for:", text);
    console.log("Using voice ID:", voiceId);
    
    try {
      // Simulate API call to ElevenLabs or similar service
      // In a real implementation, this would be:
      /*
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + voiceId, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': 'your-api-key'
        },
        body: JSON.stringify({
          text: text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error generating voice: ${response.statusText}`);
      }
      
      const audioBlob = await response.blob();
      return URL.createObjectURL(audioBlob);
      */
      
      // For demo purposes, use the browser's SpeechSynthesis API
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Try to use a variety of voices for a better demo experience
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        // Try to simulate the effect of using different voices based on voiceId
        if (voiceId) {
          // Use voiceId to select a consistent voice (for demo only)
          const voiceIndex = voiceId.charCodeAt(0) % voices.length;
          utterance.voice = voices[voiceIndex];
        } else {
          // Use a default voice
          utterance.voice = voices[0];
        }
      }
      
      // Create a promise to capture the audio
      return new Promise((resolve) => {
        // Create audio context and processor to capture audio
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
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
        
        window.speechSynthesis.speak(utterance);
      });
    } catch (error) {
      console.error("Error generating voice response:", error);
      toast({
        title: "Voice Generation Error",
        description: "Could not generate voice response. Using text only.",
        variant: "destructive"
      });
      return "";
    }
  };

  const processVoiceInput = async (audioBlob: Blob) => {
    setIsProcessing(true);
    
    try {
      // In a real implementation, this would call Whisper API or similar for STT
      // For now, we'll use Web Speech API if available, otherwise simulate
      const userText = await recognizeSpeech(audioBlob);
      
      if (!userText) {
        throw new Error("No speech detected");
      }
      
      // Add user message
      const userMessage: MessageType = {
        id: `user-${Date.now()}`,
        sender: "user",
        text: userText,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Update conversation history
      setConversationHistory(prev => [
        ...prev,
        { role: "user", content: userText }
      ]);
      
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
    // For demo and to ensure we handle real input, use a prompt
    return new Promise((resolve) => {
      // Simulating speech recognition
      console.log("Processing speech recognition...");
      
      // In a real app with Whisper API:
      /*
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-1');
      
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: formData
      });
      
      const result = await response.json();
      return result.text;
      */
      
      // For demo purposes, prompt the user
      const userInput = prompt("What did you say? (Simulating speech recognition)", "");
      resolve(userInput || "");
    });
  };

  const processUserMessage = async (userText: string) => {
    // In a real app, this would call an AI service API
    try {
      console.log("Processing user message:", userText);
      console.log("Conversation history:", conversationHistory);
      
      // For realistic AI responses, you would use:
      /*
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: conversationHistory,
          temperature: 0.7,
          max_tokens: 150
        })
      });
      
      const result = await response.json();
      const aiResponse = result.choices[0].message.content;
      */
      
      // Simulate AI processing with more varied responses based on input
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let aiResponse = "";
      const lowerText = userText.toLowerCase();
      
      if (lowerText.includes("hello") || lowerText.includes("hi")) {
        aiResponse = "Hello there! How can I assist you today?";
      } else if (lowerText.includes("how are you")) {
        aiResponse = "I'm doing well, thanks for asking! How about you?";
      } else if (lowerText.includes("weather")) {
        aiResponse = "I don't have real-time weather data, but I'd be happy to chat about other topics!";
      } else if (lowerText.includes("name")) {
        aiResponse = "I'm your AI voice assistant. You can call me whatever you'd like!";
      } else if (lowerText.includes("joke")) {
        aiResponse = "Why don't scientists trust atoms? Because they make up everything!";
      } else if (lowerText.includes("thank")) {
        aiResponse = "You're very welcome! Is there anything else I can help with?";
      } else if (lowerText.includes("bye") || lowerText.includes("goodbye")) {
        aiResponse = "Goodbye! Have a wonderful day. Feel free to chat again anytime.";
      } else {
        // Generate a variety of responses for generic questions
        const genericResponses = [
          "That's an interesting question. Let me think about that...",
          "I understand what you're asking. Here's what I think...",
          "Great question! From my perspective...",
          "I'm glad you asked about that. Here's my take...",
          "Let me share some thoughts on that topic..."
        ];
        
        aiResponse = genericResponses[Math.floor(Math.random() * genericResponses.length)];
        aiResponse += " Based on what you're asking, I'd say this is something worth exploring further. What specific aspect interests you most?";
      }
      
      // Update conversation history
      setConversationHistory(prev => [
        ...prev,
        { role: "assistant", content: aiResponse }
      ]);
      
      // Generate audio for the response
      let audioUrl = "";
      try {
        audioUrl = await generateVoiceResponse(aiResponse);
      } catch (error) {
        console.error("Error generating voice:", error);
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
      
      // Auto-play the response if there's audio
      if (audioUrl) {
        setTimeout(() => {
          playMessage(aiMessage.id, audioUrl);
        }, 300);
      }
    } catch (error) {
      console.error("Error processing message:", error);
      toast({
        title: "Processing Error",
        description: "Could not process your message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
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
    
    // Update conversation history
    setConversationHistory(prev => [
      ...prev,
      { role: "user", content: textInput }
    ]);
    
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
    console.log("Playing audio for message:", messageId);
    console.log("Audio URL:", audioUrl);
    
    if (!audioUrl) {
      const message = messages.find(m => m.id === messageId);
      if (!message?.audioUrl) {
        console.error("No audio URL found for message:", messageId);
        return;
      }
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
      
      // Add error handler for audio
      audio.onerror = (error) => {
        console.error("Error playing audio:", error);
        toast({
          title: "Audio Playback Error",
          description: "Could not play audio response.",
          variant: "destructive"
        });
        setIsPlaying(null);
      };
      
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
