export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-gray-900 flex items-center justify-center">
      <div className="text-center px-6">
        <h1 className="text-4xl font-semibold">Asia Mandate Quest</h1>
        <p className="mt-4 text-gray-600">
          Institutional Sales Intelligence Simulator
        </p>
        <a
          href="/chat"
          className="inline-block mt-8 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition"
        >
          Enter Simulation
        </a>
      </div>
    </main>
  );
}