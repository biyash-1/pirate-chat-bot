// Updated client component
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { FiSend } from "react-icons/fi";

interface Message {
  user: "me" | "bot";
  text: string;
}

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    // 1️⃣ Add user's message
    const userMessage: Message = { user: "me", text: message };
    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      // 2️⃣ Prepare messages for API
      const apiMessages = [
        ...messages.map((m) => ({
          role: m.user === "me" ? "user" : "assistant",
          content: m.text,
        })),
        { role: "user", content: message },
      ];

      console.log("Sending messages to API:", apiMessages);

      // 3️⃣ Call API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let botText = "";

      // 4️⃣ Add initial empty bot message for streaming
      setMessages((prev) => [...prev, { user: "bot", text: "" }]);

      // 5️⃣ Stream response
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        botText += chunk;

        // Update last bot message safely
        setMessages((prev) => {
          const newMessages = [...prev];
          if (newMessages.length > 0 && newMessages[newMessages.length - 1].user === "bot") {
            newMessages[newMessages.length - 1] = { user: "bot", text: botText };
          }
          return newMessages;
        });
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        { user: "bot", text: "Oops! Something went wrong. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-200 to-blue-100 dark:from-slate-900 dark:to-slate-800 flex flex-col items-center">
      {/* Header */}
      <header className="w-full flex items-center justify-between p-6 bg-white dark:bg-slate-900 shadow-md rounded-b-2xl">
        <div className="flex items-center gap-4">
          <Image
            src="/logo.png"
            alt="Logo"
            width={50}
            height={50}
            className="rounded-full"
          />
          <h1 className="text-2xl font-bold text-purple-700 dark:text-purple-300">
            Chat AI Bot
          </h1>
        </div>
        <div className="text-gray-500 dark:text-gray-400">🚀 Have fun chatting!</div>
      </header>

      {/* Main */}
      <main className="flex-1 w-full flex flex-col justify-center items-center pt-8 px-4">
        {!isChatOpen && (
          <div className="text-gray-700 dark:text-gray-300 mb-4">
            Click the chat bot icon below to start chatting!
          </div>
        )}
      </main>

      {/* Floating Chat + Panel */}
      <div className="fixed bottom-6 right-6 flex flex-col items-end space-y-2">
        {isChatOpen && (
          <div className="w-80 bg-white dark:bg-slate-900 rounded-xl shadow-lg flex flex-col overflow-hidden animate-slide-up">
            {/* Chat Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-slate-700">
              <h2 className="text-lg font-bold text-purple-700 dark:text-purple-300">
                Chat with me
              </h2>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✖
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 h-64 overflow-y-auto p-4 bg-gray-50 dark:bg-slate-800 space-y-2">
              {messages.length === 0 && (
                <div className="text-gray-400 text-center">No messages yet. Start a conversation!</div>
              )}

              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.user === "me" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`px-4 py-2 rounded-lg max-w-[70%] break-words ${
                      msg.user === "me"
                        ? "bg-purple-600 text-white rounded-tr-none"
                        : "bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-gray-100 rounded-tl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="flex items-center border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 p-3 rounded-l-md bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isLoading) handleSend();
                }}
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !message.trim()}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 p-3 rounded-r-md text-white flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FiSend />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Chat button */}
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-full shadow-lg transition-transform active:scale-90"
        >
          {isChatOpen ? '✖' : '💬'}
        </button>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          0% {
            transform: translateY(20px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}