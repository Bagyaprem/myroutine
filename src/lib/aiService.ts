
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export const generateJournalPrompt = async (): Promise<string> => {
  try {
    const response = await sendChatMessage([
      {
        role: 'system',
        content: 'You are a thoughtful journaling assistant. Generate a single, creative journaling prompt that helps with self-reflection and personal growth. Keep it concise (under 100 characters) and thought-provoking.'
      }
    ]);
    
    return response || "What's something you're grateful for today?";
  } catch (error) {
    console.error('Error generating journal prompt:', error);
    return "What's something you're grateful for today?";
  }
};

export const reflectOnEntry = async (entryText: string): Promise<string> => {
  try {
    const response = await sendChatMessage([
      {
        role: 'system',
        content: 'You are an empathetic and insightful journaling assistant. Provide a brief, thoughtful reflection (2-3 sentences) on the user\'s journal entry. Focus on highlighting themes, offering gentle perspective, or asking a follow-up question. Be supportive and avoid being judgmental.'
      },
      {
        role: 'user',
        content: `Here's my journal entry: ${entryText}`
      }
    ]);
    
    return response || "Thank you for sharing your thoughts. Reflection is a powerful practice for personal growth.";
  } catch (error) {
    console.error('Error reflecting on entry:', error);
    return "Thank you for sharing your thoughts. Reflection is a powerful practice for personal growth.";
  }
};

export const summarizeEntry = async (entryText: string): Promise<string> => {
  try {
    const response = await sendChatMessage([
      {
        role: 'system',
        content: 'You are a concise summarization assistant. Summarize the following journal entry in 1-2 sentences, capturing the key themes and emotions.'
      },
      {
        role: 'user',
        content: entryText
      }
    ]);
    
    return response || "Journal entry summary not available.";
  } catch (error) {
    console.error('Error summarizing entry:', error);
    return "Journal entry summary not available.";
  }
};

export const getAIChatResponse = async (messages: ChatMessage[]): Promise<string> => {
  try {
    return await sendChatMessage(messages);
  } catch (error) {
    console.error('Error getting AI chat response:', error);
    return "I'm having trouble responding right now. Please try again later.";
  }
};

// Helper function to make the actual API call
const sendChatMessage = async (messages: ChatMessage[]): Promise<string> => {
  try {
    // For development, we'll use a mock response
    // In production, this would be replaced with an actual API call
    console.log('Would send messages to API:', messages);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock responses based on message type
    if (messages[0].role === 'system') {
      if (messages[0].content.includes('journaling prompt')) {
        return "What would your 10-year-old self think about your life today?";
      } else if (messages[0].content.includes('reflection')) {
        return "I notice themes of growth and challenge in your entry. How might this experience shape your approach to similar situations in the future?";
      } else if (messages[0].content.includes('summarize')) {
        return "The entry expresses mixed feelings about a challenging work situation, highlighting both frustration and determination to overcome obstacles.";
      }
    }
    
    return "Thank you for sharing. Your journey of self-reflection is valuable.";
    
    // This is the actual API implementation that would be used in production
    /*
    const apiKey = 'AIzaSyBiFiw3oDdj3ipBGqQe54f28SAS5Rt-scs'; // This is a mock API key
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 150
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json() as ChatResponse;
    return data.choices[0].message.content;
    */
  } catch (error) {
    console.error('Error in sendChatMessage:', error);
    throw error;
  }
};
