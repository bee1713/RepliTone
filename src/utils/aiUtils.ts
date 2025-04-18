
import { generateVoiceResponse } from './audioUtils';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// This function would normally be in a secure backend
// For demo purposes, we're implementing it in the frontend
// In production, NEVER expose your API key in frontend code
export const processUserMessage = async (
  userText: string, 
  conversationHistory: Message[], 
  voiceId?: string
): Promise<{ text: string; audioUrl: string; updatedHistory: Message[] }> => {
  try {
    console.log("Processing user message:", userText);
    
    // Add user message to history
    const updatedHistory: Message[] = [
      ...conversationHistory,
      { role: "user", content: userText }
    ];
    
    let aiResponse = "";
    let finalHistory = updatedHistory;
    
    try {
      // This API key would normally be stored in a backend environment
      // IMPORTANT: For production, move this to a secure backend service
      const API_KEY = "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";
      
      // Call OpenAI API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: updatedHistory,
          temperature: 0.7,
          max_tokens: 500
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("OpenAI API error:", errorData);
        throw new Error(`API call failed with status: ${response.status}`);
      }
      
      const result = await response.json();
      aiResponse = result.choices[0].message.content;
      
      // Add AI response to history
      finalHistory = [
        ...updatedHistory,
        { role: "assistant", content: aiResponse }
      ];
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
      
      // If API key is missing or invalid, use a specific message
      if (typeof error === 'object' && error && 'message' in error && 
          (error.message as string).includes('API key')) {
        aiResponse = "There was an issue with the OpenAI API key. Please check the console for error details.";
      } else {
        aiResponse = "I'm having trouble connecting to my brain right now. Please check the console for error details.";
      }
      
      // Still add this error response to the conversation history
      finalHistory = [
        ...updatedHistory,
        { role: "assistant", content: aiResponse }
      ];
    }
    
    // Generate audio for the response
    const audioUrl = await generateVoiceResponse(aiResponse, voiceId);
    
    return { 
      text: aiResponse, 
      audioUrl, 
      updatedHistory: finalHistory
    };
  } catch (error) {
    console.error("Error processing message:", error);
    throw new Error("Could not process your message. Please try again.");
  }
};

export const getInitialConversationHistory = (): Message[] => {
  return [
    { 
      role: "system", 
      content: "You are a smart, natural-sounding AI assistant who answers questions in a helpful and conversational way. You respond only to the user's actual question or statement, and always stay on topic. Do not repeat preset or irrelevant messages. Always answer with real and specific information based on the user's input."
    }
  ];
};
