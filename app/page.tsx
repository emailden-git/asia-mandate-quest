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
    if (!confirm("Restart simulation?")) return;

    setMessages([]);
    setMessage("");
    setLocation("Singapore");
    setClientType("Sovereign Wealth Fund");
    setDifficulty("Standard");
    setEngagement(100);
    setMeetingEnded(false);
  }

  function engagementColor() {
    if (engagement > 60) return "bg-green-500";
    if (engagement > 30) return "bg-yellow-500";
    return "bg-red-600";
  }

  return (
    <div className="min-h-screen bg-black text-gray-200 px-6 py-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="border border-gray-700 bg-gray-900 p-6">
          <h1 className="text-2xl font-bold text-orange-500 tracking-wide">
            ASIA MANDATE QUEST
          </h1>
          <p className="text-gray-400 text-xs mt-2">
            Institutional Allocator Simulation · Sales Intelligence Terminal
          </p>

          <div className="mt-6">
            <div className="flex justify-between text-xs text-gray-400 uppercase tracking-wide">
              <span>Engagement Level</span>
              <span>{engagement}%</span>
            </div>
            <div className="w-full h-2 bg-gray-800 mt-2">
              <div
                className={`${engagementColor()} h-full transition-all duration-300`}
                style={{ width: `${engagement}%` }}
              />
            </div>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="grid md:grid-cols-3 gap-4 border border-gray-700 bg-gray-900 p-6 text-sm">
          <div>
            <label className="text-gray-400 text-xs uppercase">Location</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={meetingEnded}
              className="w-full mt-2 bg-black border border-gray-700 p-2 text-gray-200 focus:outline-none focus:border-orange-500"
            >
              <option>Singapore</option>
              <option>Hong Kong</option>
            </select>
          </div>

          <div>
            <label className="text-gray-400 text-xs uppercase">Client Type</label>
            <select
              value={clientType}
              onChange={(e) => setClientType(e.target.value)}
              disabled={meetingEnded}
              className="w-full mt-2 bg-black border border-gray-700 p-2 text-gray-200 focus:outline-none focus:border-orange-500"
            >
              <option>Sovereign Wealth Fund</option>
              <option>Pension Fund</option>
              <option>Family Office</option>
              <option>Insurance Company</option>
            </select>
          </div>

          <div>
            <label className="text-gray-400 text-xs uppercase">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              disabled={meetingEnded}
              className="w-full mt-2 bg-black border border-gray-700 p-2 text-gray-200 focus:outline-none focus:border-orange-500"
            >
              <option>Standard</option>
              <option>Skeptical</option>
              <option>Hostile IC</option>
            </select>
          </div>
        </div>

        {/* CHAT WINDOW */}
        <div className="border border-gray-700 bg-gray-900 p-6 h-96 overflow-y-auto space-y-4 text-sm">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-3 ${
                msg.role === "user"
                  ? "bg-gray-800 border-l-4 border-orange-500"
                  : "bg-black border-l-4 border-green-500"
              }`}
            >
              {msg.content}
            </div>
          ))}

          {loading && !meetingEnded && (
            <div className="text-gray-500 italic">
              Allocator reviewing your response...
            </div>
          )}
        </div>

        {/* INPUT */}
        <div className="border border-gray-700 bg-gray-900 p-6 space-y-4">
          <div className="flex gap-3">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={meetingEnded}
              placeholder={
                meetingEnded
                  ? "Session concluded. Reset to begin again."
                  : "Enter your response..."
              }
              className="flex-1 bg-black border border-gray-700 p-3 text-gray-200 focus:outline-none focus:border-orange-500"
            />
            <button
              onClick={sendMessage}
              disabled={meetingEnded}
              className="bg-orange-600 hover:bg-orange-500 text-black font-semibold px-6 py-3 transition disabled:opacity-50"
            >
              SEND
            </button>
            <button
              onClick={reviewPerformance}
              disabled={meetingEnded}
              className="bg-gray-700 hover:bg-gray-600 px-6 py-3 transition disabled:opacity-50"
            >
              REVIEW
            </button>
          </div>

          <button
            onClick={resetSimulation}
            className="text-red-500 text-xs hover:underline"
          >
            Reset Simulation
          </button>
        </div>

        {/* FOOTER */}
        <div className="text-center text-gray-600 text-xs pt-4 border-t border-gray-800">
          © {new Date().getFullYear()} Asia Mandate Quest · Institutional Training System
        </div>
      </div>
    </div>
  );
}