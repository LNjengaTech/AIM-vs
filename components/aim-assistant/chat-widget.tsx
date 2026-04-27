// app-src/components/aim-assistant/chat-widget.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles } from "lucide-react";
import { CarContext, MarketplaceContext, ChatMessage } from "./types";

interface ChatWidgetProps {
  page: string;
  carContext?: CarContext;
  marketplaceContext?: MarketplaceContext;
  userRole?: string;
}

function getGreeting(page: string, carContext?: CarContext, userRole?: string): string {
  if (page === "car-detail" && carContext) {
    return `Hi! I can help you decide if this ${carContext.year} ${carContext.make} ${carContext.model} is the right pick. What would you like to know?`;
  }
  if (userRole === "DEALER") {
    return "Hi! I can help with your listings, completeness score, or anything on the platform. What's on your mind?";
  }
  if (page === "bolo") {
    return "Need help setting a BOLO alert? Tell me what you're looking for and I'll help you fill in the details.";
  }
  if (page === "marketplace") {
    return "Hi! Tell me what kind of car you're after and I'll help you narrow it down.";
  }
  return "Hi! I'm the AIM Assistant. Ask me anything about cars, prices in Mombasa, or how the platform works.";
}

/**
 * Generates a UUID with a fallback for insecure contexts (HTTP) 
 * where crypto.randomUUID might be unavailable.
 */
function generateUUID(): string {
  if (typeof window !== "undefined" && window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  // Fallback implementation
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function ChatWidget({ page, carContext, marketplaceContext, userRole }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    { role: "model", content: getGreeting(page, carContext, userRole) },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showCallout, setShowCallout] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  
  // Use a ref for sessionId to persist across re-renders
  const sessionIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = generateUUID();
    }
  }, []);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const suggestedPrompts: Record<string, string[]> = {
    "car-detail": ["Is this a fair price?", "What should I inspect before buying?", "How does the mileage compare?"],
    marketplace: ["Help me find a car under KES 800K", "What's popular in Mombasa?", "Explain the ranking system"],
    bolo: ["What is a BOLO request?", "Help me set up an alert", "How will I be notified?"],
    dashboard: ["How do I improve my ranking?", "What is the completeness score?", "Tips for better listings"],
    home: ["How does AIM-Mombasa work?", "Are dealers verified?", "How do BOLO alerts work?"],
  };

  const prompts = suggestedPrompts[page] ?? suggestedPrompts.home;

  const sendMessage = async (userInput: string) => {
    if (!userInput.trim() || isStreaming) return;

    const userMessage: ChatMessage = { role: "user", content: userInput.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsStreaming(true);

    // Add a placeholder for the streaming assistant response
    const placeholderIndex = updatedMessages.length;
    setMessages(prev => [...prev, { role: "model", content: "" }]);

    try {
      // Keep only the last 10 messages for context
      const contextMessages = updatedMessages.slice(-10);
      
      const response = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: contextMessages,
          context: { page, carContext, marketplaceContext, userRole },
          sessionId: sessionIdRef.current,
        }),
      });

      if (!response.ok) {
        const err: unknown = await response.json();
        const errMsg =
          typeof err === "object" && err !== null && "error" in err
            ? String((err as Record<string, unknown>).error)
            : "Something went wrong.";
        throw new Error(errMsg);
      }

      if (!response.body) throw new Error("No response body");

      // Read the plain-text stream chunk by chunk
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        // Update the placeholder message in real time
        setMessages(prev =>
          prev.map((msg, idx) =>
            idx === placeholderIndex ? { ...msg, content: accumulated } : msg
          )
        );
      }

      // Final flush
      accumulated += decoder.decode();
      setMessages(prev =>
        prev.map((msg, idx) =>
          idx === placeholderIndex ? { ...msg, content: accumulated } : msg
        )
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "I couldn't respond right now. Please try again.";
      setMessages(prev =>
        prev.map((msg, idx) =>
          idx === placeholderIndex ? { ...msg, content: message } : msg
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // Determine bottom spacing to avoid PWA prompt overlap (if applicable)
  const [bottomOffset, setBottomOffset] = useState("bottom-6");
  useEffect(() => {
    if (typeof window !== "undefined") {
      const pwaDismissed = localStorage.getItem("pwa_dismissed");
      if (!pwaDismissed) {
        setBottomOffset("bottom-24");
      }
      
      // Show callout after 5 seconds if not dismissed and not interacted
      const calloutDismissed = localStorage.getItem("assistant_callout_dismissed");
      if (!calloutDismissed && !isOpen) {
        const timer = setTimeout(() => {
          setShowCallout(true);
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
    return undefined;
  }, [isOpen]);

  const dismissCallout = () => {
    setShowCallout(false);
    localStorage.setItem("assistant_callout_dismissed", "true");
  };

  const toggleChat = () => {
    if (!isOpen) {
      setShowCallout(false);
      setHasInteracted(true);
      localStorage.setItem("assistant_callout_dismissed", "true");
    }
    setIsOpen(prev => !prev);
  };

  const calloutMessage = page === "car-detail" 
    ? "Want to know if this is a good deal? Ask me!"
    : "Hi! I'm your AI car expert. Ask me anything!";

  return (
    <>
      {/* Callout Bubble */}
      {showCallout && !isOpen && (
        <div className={`fixed ${bottomOffset === "bottom-24" ? "bottom-44" : "bottom-24"} right-6 z-50 animate-float-slow`}>
          <div className="relative bg-primary text-primary-foreground px-4 py-3 rounded-2xl shadow-xl max-w-[220px] text-sm font-medium animate-in fade-in zoom-in duration-300">
            {calloutMessage}
            <button 
              onClick={dismissCallout}
              className="absolute -top-2 -right-2 bg-muted text-muted-foreground rounded-full p-0.5 shadow-md hover:bg-accent transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
            {/* Arrow */}
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-primary rotate-45" />
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={toggleChat}
        className={`fixed ${bottomOffset} right-6 z-50 p-4 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-110 transition-all duration-300 ${!isOpen && "animate-bounce"}`}
        aria-label="Toggle AIM Assistant"
      >
        {isOpen ? <X className="h-6 w-6" /> : (
          <div className="relative">
            <Sparkles className="h-6 w-6" />
            {!hasInteracted && !showCallout && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
              </span>
            )}
          </div>
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className={`fixed ${bottomOffset === "bottom-24" ? "bottom-36" : "bottom-20"} right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 h-[480px] flex flex-col rounded-3xl border bg-card shadow-2xl animate-in slide-in-from-bottom-4 duration-200`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-card-foreground">AIM Assistant</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-muted text-muted-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2 whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-muted text-foreground rounded-tl-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isStreaming && messages[messages.length - 1]?.content === "" && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl px-4 py-3 rounded-tl-sm">
                  <div className="flex gap-1 items-center h-4">
                    <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                    <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                    <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            {/* Suggested Prompts */}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {prompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(prompt)}
                    className="text-xs px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary transition-colors text-left"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t">
            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                className="w-full resize-none rounded-xl border bg-background px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                rows={1}
                disabled={isStreaming}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isStreaming}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
