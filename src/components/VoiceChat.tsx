
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, Send, StopCircle } from "lucide-react";
import Message from "./Message";
import VoiceWave from "./VoiceWave";
import { Input } from "@/components/ui/input";
import { useVoiceChat } from "@/hooks/useVoiceChat";

interface VoiceChatProps {
  voiceId?: string;
}

const VoiceChat: React.FC<VoiceChatProps> = ({ voiceId }) => {
  const {
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
  } = useVoiceChat(voiceId);

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
