"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useChat } from "@ai-sdk/react";

const Chat = () => {
  const chatContainer = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");

  const { messages, sendMessage } = useChat({
    api: "/api/chat",
  });

  // Scroll to bottom on new messages
  useEffect(() => {
    if (!chatContainer.current) return;
    chatContainer.current.scrollTo(0, chatContainer.current.scrollHeight);
  }, [messages]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    await sendMessage([{ role: "user", content: input }]);
    setInput(""); // clear input after sending
  };

  return (
    <div className="w-full max-w-md mx-auto mt-6 flex flex-col h-[500px] bg-white dark:bg-slate-800 rounded-2xl shadow-lg">
      <div ref={chatContainer} className="flex-1 overflow-y-auto border-b p-2 scroll-smooth">
        <div className="flex flex-col gap-3 p-6 mt-2">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-2 items-start ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role !== "user" && (
                <Image src="/bot.png" alt="AI" width={30} height={30} className="rounded-full" />
              )}
              <div
                className={`max-w-xs p-2 rounded-lg ${
                  m.role === "user"
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-gray-200 text-gray-800 rounded-bl-none"
                }`}
              >
                <p>{m.content}</p>
              </div>
              {m.role === "user" && (
                <Image src="/user.png" alt="User" width={30} height={30} className="rounded-full" />
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={onSubmit} className="flex gap-2 p-4 bg-gray-50 dark:bg-slate-700 rounded-b-2xl">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-2 rounded-lg border border-gray-300 dark:border-slate-600"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 rounded-lg hover:bg-blue-600">
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
