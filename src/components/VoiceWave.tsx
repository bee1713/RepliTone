
import React from "react";

interface VoiceWaveProps {
  active?: boolean;
  className?: string;
}

const VoiceWave: React.FC<VoiceWaveProps> = ({ active = false, className = "" }) => {
  if (!active) {
    return null;
  }

  return (
    <div className={`voice-wave flex items-center space-x-0.5 ml-1 ${className}`}>
      <span className="inline-block w-1 h-2 bg-current rounded-full animate-sound-wave-1"></span>
      <span className="inline-block w-1 h-3 bg-current rounded-full animate-sound-wave-2"></span>
      <span className="inline-block w-1 h-4 bg-current rounded-full animate-sound-wave-3"></span>
      <span className="inline-block w-1 h-3 bg-current rounded-full animate-sound-wave-4"></span>
      <span className="inline-block w-1 h-2 bg-current rounded-full animate-sound-wave-5"></span>
    </div>
  );
};

export default VoiceWave;
