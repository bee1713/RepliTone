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
    
    // For demo purposes, simulate an OpenAI call
    // In production, this would be an actual API call to OpenAI
    // with proper authentication
    let aiResponse = "";
    let finalHistory = updatedHistory;
    
    try {
      // Uncomment this in production with proper API key handling
      // const response = await fetch('https://api.openai.com/v1/chat/completions', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${API_KEY}`
      //   },
      //   body: JSON.stringify({
      //     model: 'gpt-4o-mini',
      //     messages: updatedHistory,
      //     temperature: 0.7,
      //     max_tokens: 150
      //   })
      // });
      // 
      // const result = await response.json();
      // aiResponse = result.choices[0].message.content;
      
      // For demo, use simulated responses based on input
      aiResponse = generateSimulatedResponse(userText);
      
      // Add AI response to history
      finalHistory = [
        ...updatedHistory,
        { role: "assistant", content: aiResponse }
      ];
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
      aiResponse = "I'm having trouble connecting to my brain right now. Please try again in a moment.";
      
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

const generateSimulatedResponse = (userText: string): string => {
  const lowerText = userText.toLowerCase();
  
  if (lowerText.includes("hello") || lowerText.includes("hi")) {
    return "Hello there! How can I assist you today?";
  } else if (lowerText.includes("how are you")) {
    return "I'm doing well, thanks for asking! How about you?";
  } else if (lowerText.includes("weather")) {
    return "I don't have real-time weather data, but I'd be happy to chat about other topics!";
  } else if (lowerText.includes("name")) {
    return "I'm your RepliTone voice assistant. You can call me whatever you'd like!";
  } else if (lowerText.includes("joke")) {
    return "Why don't scientists trust atoms? Because they make up everything!";
  } else if (lowerText.includes("thank")) {
    return "You're very welcome! Is there anything else I can help with?";
  } else if (lowerText.includes("bye") || lowerText.includes("goodbye")) {
    return "Goodbye! Have a wonderful day. Feel free to chat again anytime.";
  } else {
    // Generate a variety of responses for generic questions
    const genericResponses = [
      "That's an interesting question. Let me think about that...",
      "I understand what you're asking. Here's what I think...",
      "Great question! From my perspective...",
      "I'm glad you asked about that. Here's my take...",
      "Let me share some thoughts on that topic..."
    ];
    
    const response = genericResponses[Math.floor(Math.random() * genericResponses.length)];
    return response + " Based on what you're asking, I'd say this is something worth exploring further. What specific aspect interests you most?";
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
