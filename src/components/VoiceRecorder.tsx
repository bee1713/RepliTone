
import React, { useState } from "react";
import { Mic, StopCircle, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import VoiceWave from "./VoiceWave";
import { useToast } from "@/components/ui/use-toast";

interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const { toast } = useToast();

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
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setRecordedChunks([blob]);
        onRecordingComplete(blob);
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
      
      // Stop all audio tracks
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const blob = new Blob([reader.result as ArrayBuffer], { type: file.type });
        setRecordedChunks([blob]);
        onRecordingComplete(blob);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2">
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
          >
            <Mic className="h-6 w-6" />
          </Button>
        )}
        
        <div className="relative">
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full h-12 w-12"
          >
            <Upload className="h-5 w-5" />
            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              accept="audio/*"
              onChange={handleFileUpload}
            />
          </Button>
        </div>
      </div>
      
      <VoiceWave active={isRecording} />
      
      <p className="text-sm text-muted-foreground">
        {isRecording 
          ? "Recording... Click stop when finished" 
          : "Record or upload a voice sample for cloning"}
      </p>
    </div>
  );
};

export default VoiceRecorder;
