export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
          Asia Mandate Quest
        </h1>

        <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
          Institutional Sales Intelligence Simulator.
          Supercharge your ability to uncover hidden allocator needs
          through disciplined funnel questioning.
        </p>

        <div className="mt-10">
          <a
            href="/chat"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-blue-700 transition"
          >
            Enter Simulation
          </a>
        </div>
      </section>

    </main>
  );
}