
import React from "react";
import { Github, Moon, Sun, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme";

const Header = () => {
  const { theme, setTheme } = useTheme();

  return (
    <header className="w-full border-b border-border/40 backdrop-blur-md bg-background/80 fixed top-0 z-10">
      <div className="container flex items-center justify-between h-16 px-4 max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-brand-purple to-brand-blue flex items-center justify-center">
            <Mic className="h-4 w-4 text-white" />
          </div>
          <h1 className="font-bold text-xl md:text-2xl gradient-text">RepliTone</h1>
        </Link>
        
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" className="hidden md:flex gap-2 items-center">
              <Github className="h-4 w-4" />
              <span>GitHub</span>
            </Button>
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
