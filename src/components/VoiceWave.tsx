
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
    <div className={`voice-wave flex items-center space-x-0.5 ${className}`}>
      <span className="inline-block w-1 h-5 bg-brand-purple rounded-full animate-sound-wave-1"></span>
      <span className="inline-block w-1 h-8 bg-brand-purple rounded-full animate-sound-wave-2"></span>
      <span className="inline-block w-1 h-10 bg-brand-purple rounded-full animate-sound-wave-3"></span>
      <span className="inline-block w-1 h-8 bg-brand-purple rounded-full animate-sound-wave-4"></span>
      <span className="inline-block w-1 h-5 bg-brand-purple rounded-full animate-sound-wave-5"></span>
    </div>
  );
};

export default VoiceWave;
