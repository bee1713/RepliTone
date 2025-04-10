
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
    <div className={`voice-wave ${className}`}>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </div>
  );
};

export default VoiceWave;
