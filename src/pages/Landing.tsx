
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { Moon, Sun, ArrowRight, Mic, BookOpen, Brain, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  const { theme, setTheme } = useTheme();
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background transition-colors duration-300">
      {/* Header */}
      <header className="w-full border-b border-border/40 backdrop-blur-md bg-background/80 fixed top-0 z-10">
        <div className="container flex items-center justify-between h-16 px-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-brand-purple to-brand-blue flex items-center justify-center">
              <Mic className="w-4 h-4 text-white" />
            </div>
            <h1 className="font-bold text-xl md:text-2xl gradient-text">RepliTone</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            
            <Link to="/app">
              <Button className="btn-gradient">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="container max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 gradient-text leading-tight">
                Talk to AI in Any Voice You Choose
              </h1>
              <p className="text-xl text-foreground/80 mb-8 max-w-2xl mx-auto lg:mx-0">
                RepliTone lets you clone any voice with just 30 seconds of audio. Chat with AI assistants that respond in your voice, a celebrity's voice, or any voice you upload.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/app">
                  <Button 
                    size="lg" 
                    className="btn-gradient text-lg font-medium py-6"
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                  >
                    Try Voice Cloning
                    {isHovering ? (
                      <Zap className="ml-2 h-5 w-5 animate-pulse" />
                    ) : (
                      <ArrowRight className="ml-2 h-5 w-5" />
                    )}
                  </Button>
                </Link>
                <Link to="/app">
                  <Button size="lg" variant="outline" className="text-lg font-medium py-6">
                    See Examples
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="flex-1 relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-300">
                <img 
                  src="/lovable-uploads/39fcdab6-a5c7-4b54-882e-5b334db5b30a.png" 
                  alt="RepliTone AI Chat Interface" 
                  className="w-full h-auto"
                />
              </div>
              
              <div className="absolute -bottom-6 -left-6 bg-card rounded-lg p-4 shadow-lg border border-border hidden md:block">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-brand-purple/20 flex items-center justify-center">
                    <Mic className="w-5 h-5 text-brand-purple" />
                  </div>
                  <div>
                    <h3 className="font-medium">Voice Cloning</h3>
                    <p className="text-sm text-muted-foreground">30 seconds is all we need</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute -top-6 -right-6 bg-card rounded-lg p-4 shadow-lg border border-border hidden md:block">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-brand-blue/20 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-brand-blue" />
                  </div>
                  <div>
                    <h3 className="font-medium">Powered by GPT-4</h3>
                    <p className="text-sm text-muted-foreground">Smart AI responses</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 gradient-text">
            How RepliTone Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-xl border border-border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-brand-purple/10 flex items-center justify-center mb-4">
                <Mic className="w-6 h-6 text-brand-purple" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Upload Your Voice</h3>
              <p className="text-muted-foreground">
                Record a 30-second sample of any voice you want to clone — yours, a friend's, or a public figure's voice.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-xl border border-border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-brand-blue/10 flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-brand-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Processing</h3>
              <p className="text-muted-foreground">
                Our advanced AI analyzes the voice patterns, tone, and unique characteristics to create a digital voice clone.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-xl border border-border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-brand-pink/10 flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-brand-pink" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Chat with AI</h3>
              <p className="text-muted-foreground">
                Start chatting with our GPT-powered AI that responds in the cloned voice, creating a personalized experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 gradient-text">
            Ready to Hear AI Speak in Any Voice?
          </h2>
          <p className="text-xl text-foreground/80 mb-8">
            Create your first voice clone in minutes. No technical skills required.
          </p>
          <Link to="/app">
            <Button size="lg" className="btn-gradient text-lg font-medium py-6 px-8">
              Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 px-4 border-t border-border">
        <div className="container max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-brand-purple to-brand-blue flex items-center justify-center">
                <Mic className="w-3 h-3 text-white" />
              </div>
              <span className="font-semibold gradient-text">RepliTone</span>
            </div>
            
            <div className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} RepliTone. All rights reserved. 
              <span className="block md:inline md:ml-1">
                Voice cloning for educational purposes only.
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
