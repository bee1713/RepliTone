
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import VoiceRecorder from "./VoiceRecorder";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VoiceClonerProps {
  onVoiceCloned: (voiceId: string) => void;
}

const VoiceCloner: React.FC<VoiceClonerProps> = ({ onVoiceCloned }) => {
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isCloning, setIsCloning] = useState(false);
  const [isCloned, setIsCloned] = useState(false);
  const { toast } = useToast();

  const handleRecordingComplete = (blob: Blob) => {
    setRecordedBlob(blob);
    setIsCloned(false);
  };

  const handleCloneVoice = async () => {
    if (!recordedBlob) {
      toast({
        title: "Missing Voice Sample",
        description: "Please record or upload a voice sample first.",
        variant: "destructive"
      });
      return;
    }

    setIsCloning(true);

    // In a real implementation, you would upload the audio to ElevenLabs API
    // For simulation, we'll generate a mock voice ID
    
    // Simulating API call with timeout
    setTimeout(() => {
      // Mock voice ID - in real app, this would come from the API
      const mockVoiceId = "voice_" + Math.random().toString(36).substring(2, 10);
      
      setIsCloning(false);
      setIsCloned(true);
      
      toast({
        title: "Voice Cloned Successfully!",
        description: "Your voice clone is ready to use.",
      });
      
      onVoiceCloned(mockVoiceId);
    }, 3000);
  };

  return (
    <Card className="dark:border-gray-800">
      <CardHeader>
        <CardTitle>Voice Cloning</CardTitle>
        <CardDescription>
          Record or upload a sample of the voice you want to clone
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6">
        <VoiceRecorder onRecordingComplete={handleRecordingComplete} />
        
        {recordedBlob && (
          <div className="w-full">
            <audio 
              src={URL.createObjectURL(recordedBlob)} 
              controls 
              className="w-full mb-4" 
            />
            
            <Button 
              className="w-full btn-gradient"
              disabled={isCloning || isCloned}
              onClick={handleCloneVoice}
            >
              {isCloning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isCloned && <Check className="mr-2 h-4 w-4" />}
              {isCloning ? "Cloning Voice..." : isCloned ? "Voice Cloned" : "Clone Voice"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VoiceCloner;
