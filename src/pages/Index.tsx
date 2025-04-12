
import React, { useState } from "react";
import Header from "@/components/Header";
import VoiceCloner from "@/components/VoiceCloner";
import VoiceChat from "@/components/VoiceChat";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [clonedVoiceId, setClonedVoiceId] = useState<string | undefined>();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-gray-50 dark:to-gray-950 transition-colors duration-300">
      <Header />
      
      <main className="container px-4 max-w-7xl mx-auto pt-24 pb-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
            RepliTone Voice Assistant
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Chat with an AI that responds in any voice you upload — your friend, celebrity, or even your own voice!
          </p>
        </div>
        
        <Tabs defaultValue="chat" className="w-full max-w-5xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="chat">AI Voice Chat</TabsTrigger>
            <TabsTrigger value="clone">Voice Cloning</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat" className="min-h-[70vh]">
            <VoiceChat voiceId={clonedVoiceId} />
          </TabsContent>
          
          <TabsContent value="clone">
            <VoiceCloner onVoiceCloned={setClonedVoiceId} />
          </TabsContent>
        </Tabs>
        
        {clonedVoiceId && (
          <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg max-w-5xl mx-auto">
            <p className="text-green-800 dark:text-green-400 text-center">
              <span className="font-medium">Voice cloned successfully!</span> Switch to the "AI Voice Chat" tab to start talking with the AI using your cloned voice.
            </p>
          </div>
        )}
        
        <div className="mt-16 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            For a production app, connect to OpenAI's Whisper API for speech-to-text, 
            GPT for intelligence, and ElevenLabs for voice cloning and text-to-speech.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Index;
