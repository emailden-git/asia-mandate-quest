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
        headers: { "Content-Type": "application/json" },
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
    if (reviewLoading) return;
    setReviewLoading(true);

    try {
      const response = await fetch("/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    messages,
    reviewMode: true,
    clientType,
    location,
  }),
});

      const data = await response.json();

      try {
        const parsed =
          typeof data.reply === "string"
            ? JSON.parse(data.reply)
            : data.reply;
           const transformed = {
  ...parsed,
  funnelQuestionAnalysis: parsed.funnelAnalysis
    ? {
        "Broad": parsed.funnelAnalysis.broadUsed ? "✅ Used" : "❌ Not Used",
        "Reflective / Expanding": parsed.funnelAnalysis.reflectiveUsed ? "✅ Used" : "❌ Not Used",
        "Probing": parsed.funnelAnalysis.probingUsed ? "✅ Used" : "❌ Not Used",
        "Summarising / Clarifying": parsed.funnelAnalysis.summarisingUsed ? "✅ Used" : "❌ Not Used",
        "Testing": parsed.funnelAnalysis.testingUsed ? "✅ Used" : "❌ Not Used",
      }
    : null,
  missedFunnelTypes: parsed.funnelAnalysis?.missedTypes?.length
    ? parsed.funnelAnalysis.missedTypes.join(", ")
    : "None",
hiddenNeedAnalysis: parsed.hiddenNeedAnalysis
  ? {
      need: parsed.hiddenNeedAnalysis.need,
      discovered: parsed.hiddenNeedAnalysis.discovered,
      expandedUpon: parsed.hiddenNeedAnalysis.expandedUpon,
      summarised: parsed.hiddenNeedAnalysis.summarised,
      commentary: parsed.hiddenNeedAnalysis.commentary,
    }
  : null,
hiddenConstraintAnalysis: parsed.hiddenConstraintAnalysis
  ? {
      constraint: parsed.hiddenConstraintAnalysis.constraint,
      discovered: parsed.hiddenConstraintAnalysis.discovered,
      expandedUpon: parsed.hiddenConstraintAnalysis.expandedUpon,
      summarised: parsed.hiddenConstraintAnalysis.summarised,
      commentary: parsed.hiddenConstraintAnalysis.commentary,
    }
  : null,
  overallQuestioningQuality: parsed.questioningQuality,
  questionsThatCouldHaveDeepenedConversation: parsed.suggestedQuestions,
};

        console.log("Review data received:", parsed);
        setReviewData(transformed);
      } catch (err) {
        console.error("Failed to parse review JSON", err);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setReviewLoading(false);
    }
  };

  const resetSimulation = () => {
    setMessages([]);
    setEngagement(100);
    setMeetingEnded(false);
    setReviewData(null);
  };

  return (
    <main className="min-h-screen bg-black px-4 py-6 sm:p-8 text-white">
      <div className="max-w-5xl mx-auto">

       <h1 className="text-xl sm:text-3xl font-bold mb-6 leading-tight tracking-wide">
  The Asia Mandate Quest
  <br />
  <span className="text-lg sm:text-xl font-normal">
    Use Funnel Questioning to discover hidden client needs and constraints
  </span>
  <br />
  <span className="text-base sm:text-lg font-normal italic text-red-400">
    Beware, they lose patience if you pitch too soon.
  </span>
</h1>

        {/* ENGAGEMENT BAR */}
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

        {/* CONTROLS */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:gap-6 mb-6">
          <div>
            <label className="block text-sm mb-1">Client Location</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="px-3 py-2 border border-white bg-black text-white"
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
              className="px-3 py-2 border border-white bg-black text-white"
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
              className="px-3 py-2 border border-white bg-black text-white"
            >
              <option>Standard</option>
              <option>Skeptical</option>
              <option>Hostile IC</option>
            </select>
          </div>
        </div>

        {/* CHAT WINDOW */}
        <div className="bg-black border border-white/20 p-4 sm:p-6 h-96 overflow-y-auto mb-6">
          {messages.map((msg, index) => (
            <div key={index} className="mb-4">
              <span className="font-semibold">
                {msg.role === "user" ? "You:" : "The Client:"}
              </span>
              <div className="whitespace-pre-wrap mt-1 text-sm sm:text-base">
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="mb-4 text-white/50 italic">
              Client is thinking...
            </div>
          )}
        </div>

        {/* REVIEW LOADING */}
        {reviewLoading && (
          <div className="mt-8 border border-white/20 bg-black p-6 text-blue-400 animate-pulse">
            Analyzing conversation...
          </div>
        )}

        {/* ✅ FULL REVIEW RESULTS */}
        {reviewData && (
          <div className="mt-8 border border-white bg-black text-white p-6 space-y-6">

            {/* OVERALL SCORE */}
            <div>
              <h2 className="text-2xl font-bold mb-2">Overall Performance Score</h2>
              <div className="text-4xl font-bold text-green-400">
                {reviewData.overallScore}/100
              </div>
            </div>

            {/* FUNNEL QUESTION ANALYSIS */}
            {reviewData.funnelQuestionAnalysis && (
              <div>
                <h3 className="text-xl font-bold mb-2">Funnel Question Analysis</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {Object.entries(reviewData.funnelQuestionAnalysis).map(
                    ([key, value]) => (
                      <li key={key}>
                        {key}: {String(value)}
                      </li>
                    )
                  )}
                </ul>
                {reviewData.missedFunnelTypes && (
                  <p className="text-red-400 text-sm mt-2">
                    Missed Funnel Types: {reviewData.missedFunnelTypes}
                  </p>
                )}
              </div>
            )}

            {/* FOLLOW-UP ASSESSMENT */}
            {reviewData.followUpAssessment && (
              <div>
                <h3 className="text-xl font-bold mb-2">Follow-Up Assessment</h3>
                <p className="text-sm">
                  <strong>Quality:</strong> {reviewData.followUpAssessment.quality}
                </p>
                <p className="text-sm">
                  <strong>Depth:</strong> {reviewData.followUpAssessment.depth}
                </p>
                <p className="text-sm">
                  <strong>Missed Opportunities:</strong>{" "}
                  {reviewData.followUpAssessment.missedOpportunities}
                </p>
              </div>
            )}

            {/* CONSTRAINT DISCOVERY */}
            {reviewData.constraintDiscovery && (
              <div>
                <h3 className="text-xl font-bold mb-2">Constraint Discovery</h3>
                <p className="text-sm">
                  <strong>Quality:</strong> {reviewData.constraintDiscovery.quality}
                </p>
                <p className="text-sm">
                  <strong>Gaps:</strong> {reviewData.constraintDiscovery.gaps}
                </p>
              </div>
            )}

            {/* NEEDS DISCOVERY */}
            {reviewData.needsDiscovery && (
              <div>
                <h3 className="text-xl font-bold mb-2">Needs Discovery</h3>
                <p className="text-sm">
                  <strong>Quality:</strong> {reviewData.needsDiscovery.quality}
                </p>
                <p className="text-sm">
                  <strong>Gaps:</strong> {reviewData.needsDiscovery.gaps}
                </p>
              </div>
            )}

{/* HIDDEN NEED ANALYSIS */}
            {reviewData.hiddenNeedAnalysis && (
              <div className="border border-yellow-500 p-4">
                <h3 className="text-xl font-bold mb-2 text-yellow-400">Hidden Need</h3>
                <p className="text-sm mb-2">
                  <strong>Need:</strong> {reviewData.hiddenNeedAnalysis.need}
                </p>
                <div className="flex gap-4 text-sm mb-2">
                  <span>
                    Discovered: {reviewData.hiddenNeedAnalysis.discovered ? "✅" : "❌"}
                  </span>
                  <span>
                    Expanded Upon: {reviewData.hiddenNeedAnalysis.expandedUpon ? "✅" : "❌"}
                  </span>
                  <span>
                    Summarised: {reviewData.hiddenNeedAnalysis.summarised ? "✅" : "❌"}
                  </span>
                </div>
                <p className="text-sm text-gray-400">
                  {reviewData.hiddenNeedAnalysis.commentary}
                </p>
              </div>
            )}

            {/* HIDDEN CONSTRAINT ANALYSIS */}
            {reviewData.hiddenConstraintAnalysis && (
              <div className="border border-red-500 p-4">
                <h3 className="text-xl font-bold mb-2 text-red-400">Hidden Constraint</h3>
                <p className="text-sm mb-2">
                  <strong>Constraint:</strong> {reviewData.hiddenConstraintAnalysis.constraint}
                </p>
                <div className="flex gap-4 text-sm mb-2">
                  <span>
                    Discovered: {reviewData.hiddenConstraintAnalysis.discovered ? "✅" : "❌"}
                  </span>
                  <span>
                    Expanded Upon: {reviewData.hiddenConstraintAnalysis.expandedUpon ? "✅" : "❌"}
                  </span>
                  <span>
                    Summarised: {reviewData.hiddenConstraintAnalysis.summarised ? "✅" : "❌"}
                  </span>
                </div>
                <p className="text-sm text-gray-400">
                  {reviewData.hiddenConstraintAnalysis.commentary}
                </p>
              </div>
            )}

            {/* ENGAGEMENT ASSESSMENT */}
            {reviewData.engagementAssessment && (
              <div>
                <h3 className="text-xl font-bold mb-2">Engagement Assessment</h3>
                <p className="text-sm">{reviewData.engagementAssessment}</p>
              </div>
            )}

            {/* OVERALL QUESTIONING QUALITY */}
            {reviewData.overallQuestioningQuality && (
              <div>
                <h3 className="text-xl font-bold mb-2">Overall Questioning Quality</h3>
                <p className="text-sm">{reviewData.overallQuestioningQuality}</p>
              </div>
            )}

            {/* QUESTIONS THAT COULD HAVE DEEPENED */}
            {reviewData.questionsThatCouldHaveDeepenedConversation && (
              <div>
                <h3 className="text-xl font-bold mb-2">
                  Questions That Could Have Deepened the Conversation
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-green-400">
                  {reviewData.questionsThatCouldHaveDeepenedConversation.map(
                    (q: string, i: number) => (
                      <li key={i}>{q}</li>
                    )
                  )}
                </ul>
              </div>
            )}

          </div>
        )}

        {/* INPUT */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            className="flex-1 px-4 py-3 border border-white bg-black text-white"
            placeholder="Type your question..."
          />
          <button
            onClick={sendMessage}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 font-semibold"
          >
            Send
          </button>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <button
            onClick={reviewPerformance}
            disabled={messages.length < 2 || reviewLoading}
            className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold"
          >
            Review Performance
          </button>
          <button
            onClick={resetSimulation}
            className="px-6 py-3 bg-red-600 hover:bg-red-500 font-semibold"
          >
            Reset Simulation
          </button>
        </div>
{/* FUNNEL QUESTION TYPES REFERENCE */}
<div className="mt-6 p-4 rounded-lg bg-gray-800 border border-gray-700">
  <h3 className="text-lg font-bold mb-3 text-white">🔽 Funnel Question Types</h3>
  <div className="space-y-3 text-sm text-gray-300">
    <div>
      <span className="font-semibold text-green-400">1. Broad Questions</span>
      <p>Creates a space for open dialogue, thinking and top priorities.</p>
      <p className="italic text-gray-400">"What are your top investment priorities right now?"</p>
    </div>
    <div>
      <span className="font-semibold text-blue-400">2. Reflective / Expanding Questions</span>
      <p>Uses the client's words to zoom in on subjects and guide conversation direction.</p>
      <p className="italic text-gray-400">"You mentioned X is a priority — what's driving that focus now?"</p>
    </div>
    <div>
      <span className="font-semibold text-yellow-400">3. Probing Questions</span>
      <p>Pinpoints facts, metrics, constraints, and decision criteria.</p>
      <p className="italic text-gray-400">"What level of drawdown would trigger a formal review?"</p>
    </div>
    <div>
      <span className="font-semibold text-purple-400">4. Summarising Questions</span>
      <p>Confirms shared understanding and shows the client you listened.</p>
      <p className="italic text-gray-400">"So if I'm hearing you right, downside protection and board transparency are the two main factors?"</p>
    </div>
    <div>
      <span className="font-semibold text-red-400">5. Testing Questions</span>
      <p>Secures permission before transitioning to solutions.</p>
      <p className="italic text-gray-400">"Would it be helpful if I walked you through how we approach tail-risk in our Asia strategy?"</p>
    </div>
  </div>
</div>
      </div>
    </main>
  );
}