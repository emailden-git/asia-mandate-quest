"use client";

import React, { useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Home() {
  const [location, setLocation] = useState("Singapore");
  const [clientType, setClientType] = useState("Sovereign Wealth Fund");
  const [difficulty, setDifficulty] = useState("Standard");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [engagement, setEngagement] = useState(100);
  const [meetingEnded, setMeetingEnded] = useState(false);

  async function sendMessage() {
    if (!message.trim() || meetingEnded) return;

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: message },
    ];

    setMessages(newMessages);
    setMessage("");
    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: newMessages,
        location,
        clientType,
        difficulty,
        engagement,
      }),
    });

    const data = await res.json();

    setMessages([
      ...newMessages,
      { role: "assistant", content: data.reply },
    ]);

    if (typeof data.engagement === "number") {
      setEngagement(data.engagement);
    }

    if (data.meetingEnded) {
      setMeetingEnded(true);
    }

    setLoading(false);
  }

  async function reviewPerformance() {
    if (messages.length === 0 || meetingEnded) return;

    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages,
        location,
        clientType,
        difficulty,
        engagement,
        reviewMode: true,
      }),
    });

    const data = await res.json();

    setMessages([
      ...messages,
      { role: "assistant", content: data.reply },
    ]);

    setLoading(false);
  }

  function resetSimulation() {
    const confirmReset = window.confirm(
      "Do you really wish to restart?"
    );
    if (!confirmReset) return;

    setMessages([]);
    setMessage("");
    setLocation("Singapore");
    setClientType("Sovereign Wealth Fund");
    setDifficulty("Standard");
    setEngagement(100);
    setMeetingEnded(false);
  }

  function engagementColor() {
    if (engagement > 60) return "bg-emerald-500";
    if (engagement > 30) return "bg-amber-500";
    return "bg-red-500";
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8">
          <h1 className="text-3xl font-semibold text-gray-900">
            Asia Mandate Quest
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Institutional allocator simulation for advanced sales training.
          </p>

          <div className="mt-8">
            <div className="flex justify-between text-sm font-medium text-gray-600">
              <span>Allocator Engagement Level</span>
              <span>{engagement}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full mt-3 overflow-hidden">
              <div
                className={`h-full ${engagementColor()} transition-all duration-300`}
                style={{ width: `${engagement}%` }}
              />
            </div>
            {engagement <= 30 && !meetingEnded && (
              <p className="text-red-600 text-sm mt-3">
                Engagement critically low.
              </p>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="text-sm text-gray-600 font-medium">
              Location
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={meetingEnded}
              className="w-full mt-2 border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option>Singapore</option>
              <option>Hong Kong</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600 font-medium">
              Client Type
            </label>
            <select
              value={clientType}
              onChange={(e) => setClientType(e.target.value)}
              disabled={meetingEnded}
              className="w-full mt-2 border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option>Sovereign Wealth Fund</option>
              <option>Pension Fund</option>
              <option>Family Office</option>
              <option>Insurance Company</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600 font-medium">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              disabled={meetingEnded}
              className="w-full mt-2 border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option>Standard</option>
              <option>Skeptical</option>
              <option>Hostile IC</option>
            </select>
          </div>
        </div>

        {/* Chat */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 h-96 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`max-w-xl px-4 py-3 rounded-xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-emerald-100 ml-auto text-gray-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {msg.content}
            </div>
          ))}

          {loading && !meetingEnded && (
            <div className="text-gray-500 text-sm italic">
              The client is considering your question...
            </div>
          )}
        </div>

        {/* Input */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 space-y-5">
          <div className="flex gap-3">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={meetingEnded}
              placeholder={
                meetingEnded
                  ? "Meeting has concluded. Reset to begin again."
                  : "Type your question..."
              }
              className="flex-1 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              onClick={sendMessage}
              disabled={meetingEnded}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 transition"
            >
              Send
            </button>
            <button
              onClick={reviewPerformance}
              disabled={meetingEnded}
              className="bg-gray-900 hover:bg-black text-white px-6 py-2 rounded-lg disabled:opacity-50 transition"
            >
              Review Session
            </button>
          </div>

          <button
            onClick={resetSimulation}
            className="text-red-600 text-sm hover:underline"
          >
            Reset Simulation
          </button>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 pt-6">
          © {new Date().getFullYear()} Asia Mandate Quest · Training Simulation Tool
        </div>

      </div>
    </div>
  );
}