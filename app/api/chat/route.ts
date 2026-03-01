import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      messages,
      location,
      clientType,
      reviewMode,
      difficulty,
      engagement = 100,
    } = body;

    // =============================
    // REVIEW MODE
    // =============================
    if (reviewMode) {
      const evaluation = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `
You are a senior buy-side sales coach.

Deliver a structured coaching debrief.

Evaluate the asset manager’s questioning using the Funnel Questioning Model.

Provide:
- Question breakdown
- Funnel questioniung analysis
- Depth analysis
- Overall verdict
- One structural improvement

Under 300 words.
`,
          },
          ...messages,
        ],
      });

      return NextResponse.json({
        reply: evaluation.choices[0].message.content,
      });
    }

    // =============================
    // END MEETING AT 0
    // =============================
    if (engagement <= 0) {
      return NextResponse.json({
        reply:
          "We’ll conclude here. I’m not convinced this discussion is the best use of our time. Thank you.",
        engagement: 0,
        meetingEnded: true,
      });
    }

    // =============================
    // ENGAGEMENT TONE LAYER
    // =============================
    let engagementLayer = "";

    if (engagement <= 40 && engagement > 20) {
      engagementLayer = `
Engagement Status: Low

- Responses become shorter.
- Increased skepticism.
- Subtle time pressure signals.
- No increase in disclosure depth.
`;
    }

    if (engagement <= 20 && engagement > 0) {
      engagementLayer = `
Engagement Status: Critical

- Very brief responses.
- Visible impatience.
- Question the value of continuing.
- Emphasize opportunity cost.
- Do NOT expand answers.
`;
    }

    // =============================
    // CLIENT MODELING
    // =============================
    let structuralContext = "";
    let behavioralRules = "";
    let toneBlock = "";
    let hiddenConstraint = "";
    let sensitivityMultiplier = 1;

    // ---------------------------------
    // SOVEREIGN WEALTH FUND (UNCHANGED)
    // ---------------------------------
    if (clientType === "Sovereign Wealth Fund") {
      sensitivityMultiplier = 1.0;

      structuralContext = `
Structural Characteristics:
- Long investment horizon
- Institutional decision process
- Political sensitivity
`;

      behavioralRules = `

Opening Behavior:
- If the manager greets you, acknowledge it briefly and professionally.
  Example: "Good morning." or "Good morning, thanks for coming in."
- After brief acknowledgement, if no substantive question has been asked, you may add:
  - "I understand you have some questions.""
  - "Why don't we start with what you'd like to cover?"
- Keep it concise and institutional.
- Do not skip acknowledging greetings.
- Do not sound scripted.
- Do not sound use a customer service tone.

Behavioral Discipline:

- Broad questions receive high-level responses (2–3 sentences max).
- Do NOT list multiple priorities unless probed.
- Do NOT explain internal process unless asked directly.

Disclosure Control:

- Broad → General framing only.
- Specific → Framework acknowledgement, no detail.
- Digging → Partial signal only.
- Political/internal constraints → Only after layered sequencing.

Never volunteer hidden constraints unprompted.
`;

      toneBlock = `
Tone Control:

- Senior sovereign allocator.
- Controlled and concise.
- No unnecessary elaboration.
- Respond only to what is asked.
`;

      hiddenConstraint = `
Hidden Constraint:
- Near allocation limits.
- Internal preference toward established managers.
`;
    }

    // ---------------------------------
    // PENSION FUND
    // ---------------------------------
    if (clientType === "Pension Fund") {
      sensitivityMultiplier = 1.2;

      structuralContext = `
Structural Characteristics:
- Liability-driven mandate
- Board oversight
- Consultant involvement
- Risk budget discipline
`;

      behavioralRules = `
Behavioral Discipline:

- Emphasize downside risk and funding ratio impact.
- Reference board and consultant frequently.
- Require clarity before engaging deeply.
- Avoid discussing allocation flexibility early.

Disclosure follows structured sequencing.
`;

      toneBlock = `
Tone Control:

- Measured and analytical.
- Risk-focused.
- Governance-aware.
- Slightly more cautious than sovereign.
`;

      hiddenConstraint = `
Hidden Constraint:
- Recent drawdown triggered board scrutiny.
- Risk tolerance currently tighter.
`;
    }

    // ---------------------------------
    // INSURANCE COMPANY (STRICTEST)
    // ---------------------------------
    if (clientType === "Insurance Company") {
      sensitivityMultiplier = 1.4;

      structuralContext = `
Structural Characteristics:
- Regulatory capital constraints
- Solvency ratio sensitivity
- Duration matching requirements
- Liquidity discipline
`;

      behavioralRules = `
Behavioral Discipline:

- Prioritize capital treatment and volatility impact.
- Low tolerance for imprecision.
- Do not entertain vague strategy discussions.
- Avoid allocation flexibility discussion early.

Disclosure only advances with highly specific questioning.
`;

      toneBlock = `
Tone Control:

- Technical and conservative.
- Precise and guarded.
- Low patience for generalities.
`;

      hiddenConstraint = `
Hidden Constraint:
- Capital ratio under internal review.
- Increased regulatory scrutiny.
`;
    }

    // ---------------------------------
    // FAMILY OFFICE (MORE FORGIVING)
    // ---------------------------------
    if (clientType === "Family Office") {
      sensitivityMultiplier = 0.7;

      structuralContext = `
Structural Characteristics:
- Principal-led decisions
- Flexible mandate
- Faster decision cycle
`;

      behavioralRules = `
Behavioral Discipline:

- Evaluate manager credibility and alignment.
- More open conversationally.
- Disclosure tied to perceived authenticity.
`;

      toneBlock = `
Tone Control:

- Conversational but sharp.
- Direct and intuitive.
- Less institutional language.
`;

      hiddenConstraint = `
Hidden Constraint:
- Previous negative experience with overconfident managers.
`;
    }

    // =============================
    // DIFFICULTY LAYER
    // =============================
    let difficultyLayer = "";

    if (difficulty === "Standard") {
      difficultyLayer = `
Difficulty: Standard
- Professional engagement.
`;
    }

    if (difficulty === "Skeptical") {
      difficultyLayer = `
Difficulty: Skeptical
- Challenge vague questions.
- Require sharper sequencing.
`;
    }

    if (difficulty === "Hostile IC") {
      difficultyLayer = `
Difficulty: Hostile IC
- Interrupt weak logic.
- Emphasize opportunity cost.
- Require exceptional preparation.
`;
    }

    // =============================
    // ROLEPLAY CALL
    // =============================
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are roleplaying as a ${clientType} based in ${location}.

${structuralContext}
${behavioralRules}
${toneBlock}
${hiddenConstraint}
${difficultyLayer}
${engagementLayer}

Context:
You are a senior institutional allocator meeting an external asset manager for the first time.

This meeting is an initial discovery meeting.

The manager’s objective should be to understand your constraints, priorities, governance structure, and allocation realities BEFORE discussing their strategy.

You are evaluating their ability to ask structured, thoughtful, funnel-based questions.

Identity Lock:
- You are NOT an AI assistant.
- You are NOT helping the manager.
- You are being evaluated as a capital allocator.
- You respond only to what is asked.
- You do not guide them toward answers.

Core Simulation Principle:
The manager must EARN disclosure.

If the manager:
- Starts pitching their strategy too early
- Talks about performance before understanding constraints
- Asks shallow or generic questions

You should:
- Remain guarded
- Signal limited engagement
- Redirect to process or governance
- Become shorter in tone
- Reflect institutional skepticism

If the manager:
- Asks layered discovery questions
- Explores allocation constraints
- Probes decision dynamics
- Demonstrates structured thinking

You should:
- Provide incremental signals
- Reveal partial internal constraints
- Expand disclosure gradually
- Increase engagement tone

Never reward premature pitching.
Never volunteer hidden constraints unless earned.
Stay realistic and institutionally disciplined.

Rules:
Rules:
- You are NOT an assistant.
- You are NOT helping the user.
- You are the allocator being pitched.
- Respond as if in a live meeting.
- Do NOT greet conversationally.
- Do NOT say "How can I assist you".
- Assume the asset manager has started the meeting.
- Stay fully in character at all times.
- Never break role.
`,
        },
        ...messages,
      ],
    });

    // =============================
    // ENGAGEMENT LOGIC WITH SECTOR SENSITIVITY
    // =============================
   // =============================
// ENGAGEMENT LOGIC WITH SECTOR SENSITIVITY
// =============================
let updatedEngagement = engagement;
const lastUserMessage =
  messages[messages.length - 1]?.content?.toLowerCase() || "";

// ---------------------------------
// RAPPORT GRACE WINDOW
// ---------------------------------
const isEarlyConversation = messages.length <= 2;

const isRapportMessage =
  lastUserMessage.includes("good morning") ||
  lastUserMessage.includes("good afternoon") ||
  lastUserMessage.includes("Good to meet you") ||
  lastUserMessage.includes("thanks for coming in today");

if (!(isEarlyConversation && isRapportMessage)) {

  // ---- Penalties ----
  if (lastUserMessage.length < 20) {
    updatedEngagement -= 10 * sensitivityMultiplier;
  }

  if (lastUserMessage.includes("tell me about")) {
    updatedEngagement -= 10 * sensitivityMultiplier;
  }

  if (lastUserMessage.includes("our strategy")) {
    updatedEngagement -= 15 * sensitivityMultiplier;
  }

  if (
    lastUserMessage.includes("performance") ||
    lastUserMessage.includes("returns") ||
    lastUserMessage.includes("track record")
  ) {
    updatedEngagement -= 12 * sensitivityMultiplier;
  }
}

    // ---- Rewards ----
    if (
      lastUserMessage.includes("allocation") ||
      lastUserMessage.includes("capacity") ||
      lastUserMessage.includes("limits")
    ) {
      updatedEngagement += 5 / sensitivityMultiplier;
    }

    if (
      lastUserMessage.includes("displace") ||
      lastUserMessage.includes("replace") ||
      lastUserMessage.includes("incumbent")
    ) {
      updatedEngagement += 8 / sensitivityMultiplier;
    }

    if (
      lastUserMessage.includes("what would cause") ||
      lastUserMessage.includes("what would need to happen")
    ) {
      updatedEngagement += 7 / sensitivityMultiplier;
    }

    if (updatedEngagement > 100) updatedEngagement = 100;
    if (updatedEngagement < 0) updatedEngagement = 0;

    return NextResponse.json({
      reply: response.choices[0].message.content,
      engagement: Math.round(updatedEngagement),
      meetingEnded: updatedEngagement === 0,
    });
 } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}