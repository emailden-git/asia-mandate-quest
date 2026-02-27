"use client";

import React, { useState } from "react";

type Role = "user" | "assistant";

type Message = {
  role: Role;
  content: string;
};

type Persona = {
  name: string;
  title: string;
  clientType?: string;
} | null;

export default function ChatPage() {
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [persona, setPersona] = useState<Persona>(null);
  const [engagement, setEngagement] = useState(100);
  const [loading, setLoading] = useState(false);

  const [location, setLocation] = useState("Singapore");
  const [clientType, setClientType] = useState("Sovereign Wealth Fund");
  const [difficulty, setDifficulty] = useState("Standard");

  const resetSimulation = () => {
    setMessages([]);
    setPersona(null);
    setEngagement(100);
    setStarted(false);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    const newMessages: Message[] = [...messages, userMessage];

    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: newMessages,
          location,
          clientType,
          difficulty,
          engagement,
          persona,
        }),
      });

      const data = await res.json();

      const assistantMessage: Message = {
        role: "assistant",
        content: data.reply ?? "No response.",
      };

      setMessages([...newMessages, assistantMessage]);
      setEngagement(data.engagement ?? engagement);
      setPersona(data.persona ?? persona);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  // ===============================
  // LANDING SCREEN
  // ===============================

  if (!started) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center">
        <section className="bg-white shadow-md rounded-lg p-10 max-w-lg w-full text-center space-y-6">
          <h1 className="text-2xl font-bold">
            Asia Institutional Mandate Simulator
          </h1>

          <div className="space-y-3 text-left">
            <div>
              <label className="block text-sm font-medium mb-1">
                Location
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option>Singapore</option>
                <option>Hong Kong</option>
                <option>Tokyo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Client Type
              </label>
              <select
                value={clientType}
                onChange={(e) => setClientType(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option>Sovereign Wealth Fund</option>
                <option>Pension Fund</option>
                <option>Insurance Company</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option>Standard</option>
                <option>Challenging</option>
                <option>Hostile</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => setStarted(true)}
            className="w-full bg-black text-white py-3 rounded-md hover:opacity-90 transition"
          >
            Enter Simulation
          </button>
        </section>
      </main>
    );
  }

  // ===============================
  // SIMULATION SCREEN
  // ===============================

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-semibold">
              {persona
                ? `Meeting with ${persona.name} — ${persona.title}`
                : "Institutional Meeting Simulation"}
            </h1>
            <p className="text-xs text-gray-500">
              Engagement Score: {engagement}
            </p>
          </div>

          <button
            onClick={resetSimulation}
            className="text-sm text-red-600 hover:underline"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === "user"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-md px-4 py-3 rounded-lg text-sm ${
                  msg.role === "user"
                    ? "bg-black text-white"
                    : "bg-white border text-gray-800"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="text-sm text-gray-400">
              Thinking...
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border-t">
        <div className="max-w-4xl mx-auto px-4 py-4 flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) =>
              setInput(e.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder="Type your question..."
            className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
          <button
            onClick={sendMessage}
            className="bg-black text-white px-4 py-2 rounded-md text-sm hover:opacity-90 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}