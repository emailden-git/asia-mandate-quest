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
  const [reviewData, setReviewData] = useState<any>(null);
  const [reviewLoading, setReviewLoading] = useState(false);

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

 const reviewPerformance = async () => {
  if (reviewLoading) return; // ✅ prevent double clicks

  setReviewLoading(true);    // ✅ START loading

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages,
        reviewMode: true,
      }),
    });

    const data = await response.json();

    try {
      const parsed =
        typeof data.reply === "string"
          ? JSON.parse(data.reply)
          : data.reply;

      setReviewData(parsed);
    } catch (err) {
      console.error("Failed to parse review JSON", err);
    }

  } catch (error) {
    console.error(error);
  } finally {
    setReviewLoading(false); // ✅ STOP loading
  }
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
            Client Patience Level: {engagement}%
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
<div className="bg-black border border-white/20 p-4 sm:p-6 h-[60vh] sm:h-96 overflow-y-auto mb-6">
  {messages.map((msg, index) => (
    <div key={index} className="mb-4">
      <span className="font-semibold">
        {msg.role === "user" ? "You:" : "AI:"}
      </span>
      <div className="whitespace-pre-wrap break-words mt-1 text-sm sm:text-base text-white">
        {msg.content}
      </div>
    </div>
  ))}
</div>
{/* ✅ REVIEW LOADING INDICATOR */}
{reviewLoading && (
  <div className="mt-8 border border-white/20 bg-black p-6 text-blue-400 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" />
      <p className="text-sm sm:text-base tracking-wide">
        Analyzing conversation and generating performance review...
      </p>
    </div>
  </div>
)}
{/* ✅ PERFORMANCE REVIEW OUTPUT */}
{reviewData && (
  <div className="mt-8 border border-white bg-black text-white p-6 space-y-8">

    {/* Overall Score */}
    <div>
      <h2 className="text-2xl font-bold mb-2">Overall Performance Score</h2>
      <div className="text-4xl font-bold text-green-400">
        {reviewData.overallScore}/100
      </div>
    </div>

    {/* Funnel Analysis */}
    
    <div>
      <h3 className="text-xl font-semibold mb-3">Funnel Question Analysis</h3>
      <ul className="space-y-1 ml-4 list-disc">
        <li>Broad: {reviewData.funnelAnalysis.broadUsed ? "Used" : "Not Used"}</li>
        <li>Reflective / Paraphrasing: {reviewData.funnelAnalysis.reflectiveUsed ? "Used" : "Not Used"}</li>
        <li>Probing: {reviewData.funnelAnalysis.probingUsed ? "Used" : "Not Used"}</li>
        <li>Summarising / Clarifying: {reviewData.funnelAnalysis.summarisingUsed ? "Used" : "Not Used"}</li>
        <li>Testing: {reviewData.funnelAnalysis.testingUsed ? "Used" : "Not Used"}</li>
        <li>Follow-Up Questions: {reviewData.funnelAnalysis.followUpUsed ? "Used" : "Not Used"}</li>
      </ul>

      {reviewData.funnelAnalysis.missedTypes?.length > 0 && (
        <div className="mt-3 text-red-400">
         Missed Funnel Types: {
  Array.isArray(reviewData.funnelAnalysis.missedTypes)
    ? reviewData.funnelAnalysis.missedTypes.join(", ")
    : reviewData.funnelAnalysis.missedTypes
}
        </div>
      )}
    </div>

    {/* Follow-Up Assessment */}
    <div>
      <h3 className="text-xl font-semibold mb-2">Follow-Up Assessment</h3>
      <p><strong>Quality:</strong> {reviewData.followUpAssessment.quality}</p>
      <p><strong>Depth:</strong> {reviewData.followUpAssessment.depth}</p>
      <p><strong>Missed Opportunities:</strong> {reviewData.followUpAssessment.missedOpportunities}</p>
    </div>

    {/* Constraint Discovery */}
    <div>
      <h3 className="text-xl font-semibold mb-2">Constraint Discovery</h3>
      <p><strong>Quality:</strong> {reviewData.constraintDiscovery.quality}</p>
      <p><strong>Gaps:</strong> {reviewData.constraintDiscovery.gaps}</p>
    </div>

    {/* Needs Discovery */}
    <div>
      <h3 className="text-xl font-semibold mb-2">Needs Discovery</h3>
      <p><strong>Quality:</strong> {reviewData.needsDiscovery.quality}</p>
      <p><strong>Gaps:</strong> {reviewData.needsDiscovery.gaps}</p>
    </div>

    {/* Engagement */}
    <div>
      <h3 className="text-xl font-semibold mb-2">Engagement Assessment</h3>
      <p>{reviewData.engagementAssessment}</p>
    </div>

    {/* Questioning Quality */}
    <div>
      <h3 className="text-xl font-semibold mb-2">Overall Questioning Quality</h3>
      <p>{reviewData.questioningQuality}</p>
    </div>

    {/* Suggested Questions */}
    <div>
      <h3 className="text-xl font-semibold mb-2">
        Questions That Could Have Deepened the Conversation
      </h3>
      <ul className="list-disc ml-4 space-y-1 text-yellow-400">
        {reviewData.suggestedQuestions.map((q: string, i: number) => (
          <li key={i}>{q}</li>
        ))}
      </ul>
    </div>

  </div>
)}

{loading && (
  <div className="italic text-gray-600">
    {getThinkingMessage()}
  </div>
)}

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
  disabled={reviewLoading}
  className={`px-4 sm:px-6 py-3 font-semibold tracking-wide transition ${
    reviewLoading
      ? "bg-gray-600 cursor-not-allowed"
      : "bg-purple-600 hover:bg-purple-500"
  }`}
>
  {reviewLoading ? "Reviewing..." : "Review Performance"}
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