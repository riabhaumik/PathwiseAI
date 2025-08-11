'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, MessageCircle, Lightbulb, HelpCircle, TrendingUp, BookOpen } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  suggestions?: string[];
  followUpQuestions?: string[];
  functionCalls?: any[];
  context?: any;
}

interface AIAssistantProps {
  className?: string;
  initialContext?: {
    career_path?: string;
    user_skills?: string[];
    experience_level?: string;
    learning_goals?: string;
    preferred_learning_style?: string;
  };
  careerData?: any[];
  resourceData?: any[];
}

const AIAssistant: React.FC<AIAssistantProps> = ({ className = '', initialContext = {}, careerData = [], resourceData = [] }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm Pathwise AI, your career guidance assistant. I can help you explore STEM careers, create learning paths, analyze your skills, and prepare for interviews. What would you like to know?",
      role: 'assistant',
      timestamp: new Date(),
      suggestions: [
        "Explore STEM careers",
        "Get career recommendations",
        "Analyze my skills",
        "Create a learning path"
      ],
      followUpQuestions: [
        "What interests you most about STEM?",
        "What are your current strengths?",
        "Where do you see yourself in 5 years?"
      ]
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Enhanced context with career and resource data
  const [conversationContext, setConversationContext] = useState({
    ...initialContext,
    available_careers: careerData.length,
    available_resources: resourceData.length
  });
  const [userPreferences, setUserPreferences] = useState<any>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      role: 'user',
      timestamp: new Date(),
      context: conversationContext
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      // Prepare enhanced context for the API call with career data
      const enhancedContext = {
        ...conversationContext,
        message_type: 'user_query',
        timestamp: new Date().toISOString(),
        conversation_history: messages.slice(-4).map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp
        })),
        available_careers: careerData.length,
        available_resources: resourceData.length,
        career_categories: careerData.reduce((acc: any, career: any) => {
          if (career.category && !acc.includes(career.category)) {
            acc.push(career.category);
          }
          return acc;
        }, []),
        resource_categories: resourceData.reduce((acc: any, resource: any) => {
          if (resource.category && !acc.includes(resource.category)) {
            acc.push(resource.category);
          }
          return acc;
        }, [])
      };

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          context: enhancedContext
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.data.response,
          role: 'assistant',
          timestamp: new Date(),
          suggestions: data.data.suggestions,
          followUpQuestions: data.data.follow_up_questions,
          functionCalls: data.data.function_calls,
          context: data.data.context
        };

        setMessages(prev => [...prev, aiMessage]);
        
        // Update conversation context and user preferences
        if (data.data.context) {
          setConversationContext(prev => ({ ...prev, ...data.data.context }));
        }
        if (data.data.user_preferences) {
          setUserPreferences(data.data.user_preferences);
        }
      } else {
        throw new Error(data.message || 'Failed to get AI response');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
      
      // Add error message to chat
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm experiencing some technical difficulties. Please try again in a moment.",
        role: 'assistant',
        timestamp: new Date(),
        suggestions: ["Try rephrasing your question", "Ask about career guidance", "Get learning recommendations"]
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    inputRef.current?.focus();
  };

  const handleFollowUpClick = (question: string) => {
    setInputValue(question);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessage = (content: string) => {
    // Enhanced markdown-like formatting
    return content
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('• ')) {
          return <li key={index} className="ml-4 mb-1">{line.substring(2)}</li>;
        }
        if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || 
            line.startsWith('4. ') || line.startsWith('5. ')) {
          return <li key={index} className="ml-4 mb-1">{line}</li>;
        }
        if (line.startsWith('**') && line.endsWith('**')) {
          return <strong key={index} className="font-semibold text-blue-700 dark:text-blue-300">{line.substring(2, line.length - 2)}</strong>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={index} className="text-lg font-semibold mt-4 mb-2 text-gray-800 dark:text-gray-200">{line.substring(4)}</h3>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={index} className="text-xl font-bold mt-6 mb-3 text-gray-900 dark:text-gray-100">{line.substring(3)}</h2>;
        }
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-2xl font-bold mt-6 mb-4 text-gray-900 dark:text-gray-100">{line.substring(2)}</h1>;
        }
        if (line.trim() === '') {
          return <div key={index} className="h-2"></div>;
        }
        return <p key={index} className="mb-2 leading-relaxed">{line}</p>;
      });
  };

  const getContextualIcon = (message: Message) => {
    if (message.functionCalls && message.functionCalls.length > 0) {
      return <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
    }
    if (message.suggestions && message.suggestions.length > 0) {
      return <Lightbulb className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />;
    }
    return <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
  };

  // Enhanced suggestions with career data integration
  const getEnhancedSuggestions = (baseSuggestions: string[]) => {
    if (careerData.length > 0) {
      const popularCareers = careerData
        .filter((career: any) => career.popularity || career.demand)
        .slice(0, 3)
        .map((career: any) => `Learn about ${career.title}`);
      
      return [...baseSuggestions, ...popularCareers].slice(0, 6);
    }
    return baseSuggestions;
  };

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
          <Bot className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Pathwise AI Assistant</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Your STEM career guidance companion
            {careerData.length > 0 && (
              <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                {careerData.length}+ careers available
              </span>
            )}
          </p>
        </div>
        <div className="ml-auto">
          <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Active
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                {getContextualIcon(message)}
              </div>
            )}
            
            <div
              className={`max-w-[80%] rounded-lg px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
              }`}
            >
              <div className="prose prose-sm max-w-none">
                {formatMessage(message.content)}
              </div>
              
              {/* Function calls info */}
              {message.functionCalls && message.functionCalls.length > 0 && (
                <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-700 dark:text-blue-300">
                  <div className="flex items-center gap-1 mb-1">
                    <Sparkles className="w-3 h-3" />
                    <span className="font-medium">AI Analysis</span>
                  </div>
                  <p>I analyzed your request using specialized tools to provide the best guidance.</p>
                </div>
              )}
            </div>

            {message.role === 'user' && (
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span className="text-gray-600 dark:text-gray-400">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0 w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg px-4 py-3 border border-red-200 dark:border-red-800">
              <p className="text-red-700 dark:text-red-300 text-sm">
                <strong>Error:</strong> {error}
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Suggestions with career data */}
      {messages.length > 0 && messages[messages.length - 1].role === 'assistant' && 
       messages[messages.length - 1].suggestions && (
        <div className="px-4 pb-3">
          <div className="mb-2 text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
            <Lightbulb className="w-3 h-3" />
            Suggested next steps:
          </div>
          <div className="flex flex-wrap gap-2">
            {getEnhancedSuggestions(messages[messages.length - 1].suggestions || []).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-800 transition-colors duration-200 flex items-center gap-2"
              >
                <TrendingUp className="w-3 h-3" />
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Follow-up Questions */}
      {messages.length > 0 && messages[messages.length - 1].role === 'assistant' && 
       messages[messages.length - 1].followUpQuestions && (
        <div className="px-4 pb-3">
          <div className="mb-2 text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
            <HelpCircle className="w-3 h-3" />
            Follow-up questions:
          </div>
          <div className="flex flex-wrap gap-2">
            {messages[messages.length - 1].followUpQuestions?.map((question, index) => (
              <button
                key={index}
                onClick={() => handleFollowUpClick(question)}
                className="px-3 py-2 text-sm bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full border border-green-200 dark:border-green-800 transition-colors duration-200 flex items-center gap-2"
              >
                <BookOpen className="w-3 h-3" />
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about careers, skills, learning paths..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
              disabled={isLoading}
            />
            {inputValue && (
              <button
                onClick={() => setInputValue('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ×
              </button>
            )}
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Send
          </button>
        </div>
        
        {/* Quick actions and context info */}
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              <span>Press Enter to send</span>
            </div>
            <div className="flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>AI-powered responses</span>
            </div>
          </div>
          
          {/* Enhanced context indicator */}
          <div className="flex items-center gap-2">
            {Object.keys(conversationContext).length > 0 && (
              <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Context active</span>
              </div>
            )}
            {careerData.length > 0 && (
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{careerData.length} careers</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant; 