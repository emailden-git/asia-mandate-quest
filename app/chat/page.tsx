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
                ? "bg-blue-600 text-white"
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
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your question..."
        className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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