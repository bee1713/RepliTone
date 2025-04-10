
import React from "react";
import { GitHub } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="w-full border-b border-border/40 backdrop-blur-md bg-background/80 fixed top-0 z-10">
      <div className="container flex items-center justify-between h-16 px-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-brand-purple to-brand-blue flex items-center justify-center">
            <span className="text-white font-bold text-sm">VC</span>
          </div>
          <h1 className="font-bold text-xl md:text-2xl gradient-text">VoiceClone AI</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden md:flex gap-2 items-center">
            <GitHub className="h-4 w-4" />
            <span>GitHub</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
