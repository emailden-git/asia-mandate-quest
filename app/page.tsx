"use client";

import React, { useState } from "react";

export default function SimulatorPage() {
  const [messages, setMessages] = useState<
  { role: "user" | "assistant"; content: string }[]
>([]);
  const [input, setInput] = useState("");
  const [persona, setPersona] = useState(null);
  const [engagement, setEngagement] = useState(100);
  const [loading, setLoading] = useState(false);

  const location = "Singapore";
  const clientType = "Sovereign Wealth Fund";
  const difficulty = "Standard";

  const sendMessage = async () => {
    if (!input.trim()) return;

const newMessages: { role: "user" | "assistant"; content: string }[] = [
  ...messages,
  { role: "user", content: input },
];    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

      setMessages([
        ...newMessages,
        { role: "assistant", content: data.reply },
      ]);

      setEngagement(data.engagement);
      setPersona(data.persona);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      
      {/* HEADER */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
            {persona
              ? `Meeting with ${persona.name} — ${persona.title}`
              : "Institutional Meeting Simulation"}
          </h1>

          <div className="text-sm text-gray-500 mt-1">
            {persona ? clientType : ""}
          </div>

          <div className="mt-3 bg-gray-100 border rounded-md p-3">
            <p className="text-sm text-gray-700">
              <span className="font-medium text-gray-900">
                Objective:
              </span>{" "}
              Uncover hidden needs through disciplined funnel questioning.
              Disclosure must be earned.
            </p>
          </div>
        </div>
      </div>

      {/* CHAT WINDOW */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-md px-4 py-3 rounded-lg text-sm ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-white border text-gray-800"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="text-sm text-gray-400">Thinking...</div>
          )}
        </div>
      </div>

      {/* INPUT */}
      <div className="bg-white border-t">
        <div className="max-w-4xl mx-auto px-4 py-4 flex gap-3">
          <input
            type="text"
            className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition"
          >
            Send
          </button>
        </div>
      </div>

    </div>
  );
}