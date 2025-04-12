
import { useState, useRef, useEffect } from 'react';
import { Message, processUserMessage, getInitialConversationHistory } from '@/utils/aiUtils';
import { recognizeSpeech, startAudioRecording, stopAudioRecording } from '@/utils/audioUtils';
import { useToast } from '@/hooks/use-toast';

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
  audioUrl?: string;
}

export const useVoiceChat = (initialVoiceId?: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
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
  const [voiceId, setVoiceId] = useState<string | undefined>(initialVoiceId);
  const [conversationHistory, setConversationHistory] = useState<Message[]>(
    getInitialConversationHistory()
  );
  
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Effect to scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Effect to update voiceId when initialVoiceId changes
  useEffect(() => {
    setVoiceId(initialVoiceId);
  }, [initialVoiceId]);

  // Pre-load voices for speech synthesis
  useEffect(() => {
    // Force voices to load
    speechSynthesis.getVoices();
    
    // Set up a listener for when voices are loaded
    speechSynthesis.onvoiceschanged = () => {
      console.log("Voices loaded:", speechSynthesis.getVoices().length);
    };
    
    return () => {
      // Clean up
      speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const startRecording = async () => {
    try {
      const recorder = await startAudioRecording();
      
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
      stopAudioRecording(mediaRecorder, processVoiceInput);
      setIsRecording(false);
    }
  };

  const processVoiceInput = async (audioBlob: Blob) => {
    setIsProcessing(true);
    
    try {
      const userText = await recognizeSpeech(audioBlob);
      
      if (!userText) {
        throw new Error("No speech detected");
      }
      
      // Add user message
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        sender: "user",
        text: userText,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Process the message and get AI response
      await handleProcessUserMessage(userText);
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

  const handleSendText = async () => {
    if (!textInput.trim()) return;
    
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textInput,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setTextInput("");
    setIsProcessing(true);
    
    // Process the message and get AI response
    await handleProcessUserMessage(userMessage.text);
  };

  const handleProcessUserMessage = async (userText: string) => {
    try {
      const { text: aiResponse, audioUrl, updatedHistory } = 
        await processUserMessage(userText, conversationHistory, voiceId);
      
      // Update conversation history
      setConversationHistory(updatedHistory);
      
      // Add AI message with audio
      const aiMessage: ChatMessage = {
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
          playMessage(aiMessage.id);
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

  const playMessage = (messageId: string) => {
    try {
      const message = messages.find(m => m.id === messageId);
      if (!message?.audioUrl) {
        console.error("No audio URL found for message:", messageId);
        return;
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
        audio = new Audio(message.audioUrl);
        
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
      
      // Play the audio and handle any errors
      audio.play().catch(error => {
        console.error("Error playing audio:", error);
        toast({
          title: "Audio Playback Error",
          description: "Could not play the audio response. Please try again.",
          variant: "destructive"
        });
        setIsPlaying(null);
      });
    } catch (error) {
      console.error("Error in playMessage:", error);
      setIsPlaying(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  return {
    messages,
    isRecording,
    isProcessing,
    isPlaying,
    textInput,
    messagesEndRef,
    startRecording,
    stopRecording,
    handleSendText,
    playMessage,
    setTextInput,
    handleKeyPress
  };
};
