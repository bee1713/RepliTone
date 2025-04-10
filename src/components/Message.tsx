
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import VoiceWave from "./VoiceWave";

interface MessageProps {
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
  isPlaying?: boolean;
  onPlay?: () => void;
}

const Message: React.FC<MessageProps> = ({ 
  sender, 
  text, 
  timestamp, 
  isPlaying = false,
  onPlay
}) => {
  const isUser = sender === "user";
  
  return (
    <div className={cn(
      "flex w-full mb-4 gap-3", 
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      <Avatar className={cn(
        "h-9 w-9 border",
        isUser ? "bg-brand-blue/10 border-brand-blue/20" : "bg-brand-purple/10 border-brand-purple/20"
      )}>
        <AvatarFallback className={cn(
          isUser ? "text-brand-blue" : "text-brand-purple"
        )}>
          {isUser ? "You" : "AI"}
        </AvatarFallback>
      </Avatar>
      
      <div className={cn(
        "flex flex-col max-w-[80%] md:max-w-[60%]",
        isUser ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "relative px-4 py-2 rounded-2xl",
          isUser 
            ? "bg-brand-blue text-white rounded-tr-none" 
            : "bg-gray-100 text-gray-800 rounded-tl-none"
        )}>
          {text}
          
          {!isUser && (
            <button 
              onClick={onPlay}
              className="absolute -bottom-5 right-0 text-xs font-medium text-gray-500 flex items-center gap-1 hover:text-primary transition-colors"
            >
              {isPlaying ? "Playing" : "Play"}
              <VoiceWave active={isPlaying} />
            </button>
          )}
        </div>
        
        <span className={cn(
          "text-xs text-gray-500 mt-1",
        )}>
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};

export default Message;
