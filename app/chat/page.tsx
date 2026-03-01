"use client";

import React, { useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const [engagement, setEngagement] = useState(100);
  const [location, setLocation] = useState("Singapore");
  const [clientType, setClientType] = useState("Sovereign Wealth Fund");
  const [difficulty, setDifficulty] = useState("Standard");
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [meetingEnded, setMeetingEnded] = useState(false);

  // ✅ SAFE PLACEHOLDER FUNCTIONS (so app runs)
 const sendMessage = async () => {
  if (!message.trim() || meetingEnded) return;

  const newUserMessage: Message = {
    role: "user",
    content: message,
  };

  const updatedMessages = [...messages, newUserMessage];

  setMessages(updatedMessages);
  setMessage("");
  setLoading(true);

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: updatedMessages,
        location,
        clientType,
        difficulty,
        engagement,
      }),
    });

    const data = await res.json();

    if (data.reply) {
      setMessages([
        ...updatedMessages,
        { role: "assistant", content: data.reply },
      ]);
    }

    if (typeof data.engagement === "number") {
      setEngagement(data.engagement);
    }

    if (data.meetingEnded) {
      setMeetingEnded(true);
    }

  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};

  const reviewPerformance = () => {
    alert("Performance review placeholder");
  };

  const resetSimulation = () => {
    setMessages([]);
    setEngagement(100);
    setMeetingEnded(false);
  };

  const getThinkingMessage = () => {
    return "Client is thinking...";
  };

  return (
<main className="min-h-screen bg-black px-4 py-6 sm:p-8 text-white">
       <div className="max-w-5xl mx-auto">

        <h1 className="text-xl sm:text-3xl font-bold mb-6 leading-tight tracking-wide">
          Asia Mandate Quest: Discover their Hidden Needs and Constraints
        </h1>

        {/* ✅ ENGAGEMENT */}
       <div className="mb-8 border border-white/20 p-4">
          <div className="font-semibold mb-2">
            Allocator Patience Level: {engagement}%
          </div>

          <div className="w-full h-2 bg-white/20 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                engagement > 60
                 ? "bg-green-400"
                  : engagement > 30
                  ? "bg-yellow-400"
                  : "bg-red-500"
              }`}
              style={{ width: `${engagement}%` }}
            />
          </div>
        </div>

        {/* ✅ CONTROLS */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:gap-6 mb-6">
        
          <div>
            <label className="block text-sm mb-1">Client Location</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="px-3 py-2 border border-white bg-black text-white appearance-none rounded-none focus:outline-none"
            >
              <option>Singapore</option>
              <option>Hong Kong</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Client Type</label>
            <select
              value={clientType}
              onChange={(e) => setClientType(e.target.value)}
              className="px-3 py-2 border border-white bg-black text-white appearance-none rounded-none focus:outline-none"
            >
              <option>Sovereign Wealth Fund</option>
              <option>Pension Fund</option>
              <option>Family Office</option>
              <option>Insurance Company</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="px-3 py-2 border border-white bg-black text-white appearance-none rounded-none focus:outline-none"
            >
              <option>Standard</option>
              <option>Skeptical</option>
              <option>Hostile IC</option>
            </select>
          </div>
        </div>

        {/* ✅ CHAT BOX */}
<div className="bg-black border border-white/20 p-4 sm:p-6 h-[60vh] sm:h-96 overflow-y-auto mb-6">        {messages.map((msg, index) => (
            <div key={index} className="mb-4">
              <span className="font-semibold">
                {msg.role === "user" ? "You:" : "AI:"}
              </span>
              <div className="whitespace-pre-wrap break-words mt-1 text-sm sm:text-base text-white">
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="italic text-gray-600">
              {getThinkingMessage()}
            </div>
          )}
        </div>

        {/* ✅ INPUT */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-6">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your question..."
            className="flex-1 px-4 py-3 border border-white bg-black text-white focus:outline-none"
          />

          <button
            onClick={sendMessage}
            className="px-4 sm:px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold tracking-wide transition"
          >
            Send
          </button>

          <button
            onClick={reviewPerformance}
            className="px-4 sm:px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold tracking-wide transition"
          >
            Review Performance
          </button>
        </div>

        {/* ✅ RESET */}
        <div>
          <button
            onClick={resetSimulation}
            className="px-4 sm:px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold tracking-wide transition"
          >
            Reset Simulation
          </button>
        </div>

      </div>
    </main>
  );
}