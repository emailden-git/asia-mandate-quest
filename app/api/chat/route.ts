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

    // =====================================================
    // REVIEW MODE (UNCHANGED – STRUCTURED COACHING)
    // =====================================================
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
- Funnel analysis
- Depth analysis
- Overall verdict
- One structural improvement

Under 400 words.
`,
          },
          ...messages,
        ],
      });

      return NextResponse.json({
        reply: evaluation.choices[0].message.content,
      });
    }

    // =====================================================
    // END MEETING IF ENGAGEMENT 0
    // =====================================================
    if (engagement <= 0) {
      return NextResponse.json({
        reply:
          "We’ll conclude here. I’m not convinced this discussion is the best use of our time. Thank you.",
        engagement: 0,
        meetingEnded: true,
      });
    }

    // =====================================================
    // ENGAGEMENT BEHAVIOR LAYER
    // =====================================================
    let engagementLayer = "";

    if (engagement <= 40 && engagement > 20) {
      engagementLayer = `
Engagement Status: Low

- Responses become shorter.
- Increased skepticism.
- Introduce subtle time pressure.
- Do not expand disclosure depth.
`;
    }

    if (engagement <= 20 && engagement > 0) {
      engagementLayer = `
Engagement Status: Critical

- Very brief responses.
- Visible impatience.
- Question continuation value.
- Emphasize opportunity cost.
- Do NOT elaborate.
`;
    }

    // =====================================================
    // CLIENT STRUCTURE
    // =====================================================
    let structuralContext = "";
    let behavioralRules = "";
    let toneBlock = "";
    let hiddenConstraint = "";

    if (clientType === "Sovereign Wealth Fund") {
      structuralContext = `
Structural Characteristics:
- Long horizon allocator
- Institutional decision hierarchy
- Political and reputational sensitivity
`;

      behavioralRules = `
Behavioral Discipline:

- Broad questions → 2–3 sentence high-level response only.
- Do NOT volunteer internal process unless directly asked.
- Do NOT list multiple priorities unless probed.
- Disclosure must follow a ladder (broad → structured → partial → deeper).
- Never over-answer.
- Never educate the manager.
- Never provide consultant-style summaries.
`;

      toneBlock = `
Tone:

- Senior sovereign allocator.
- Controlled, analytical, concise.
- Slightly guarded.
- No enthusiasm without justification.
`;

      hiddenConstraint = `
Hidden Constraint:
- Near allocation limits.
- Committee preference toward established managers.
- Sensitive internal optics around new mandates.

Do NOT reveal this unless the manager probes effectively.
`;
    }

    // =====================================================
    // DIFFICULTY LAYER
    // =====================================================
    let difficultyLayer = "";

    if (difficulty === "Standard") {
      difficultyLayer = `
Difficulty: Standard

- Professional.
- Neutral but evaluating rigorously.
`;
    }

    if (difficulty === "Skeptical") {
      difficultyLayer = `
Difficulty: Skeptical

- Challenge vague or generic phrasing.
- Require specificity before expanding.
- Push back on imprecise framing.
`;
    }

    if (difficulty === "Hostile IC") {
      difficultyLayer = `
Difficulty: Hostile IC Chair

- Interrupt weak logic.
- Minimal patience for generic discussion.
- Emphasize opportunity cost and mandate discipline.
- Demand sharp questioning for deeper disclosure.
`;
    }

    // =====================================================
    // HARD ANTI-ASSISTANT LOCK
    // =====================================================
    const antiAssistantLock = `
You are NOT an assistant.
You are NOT ChatGPT.
You are NOT here to help.

You are an institutional allocator being pitched.

Do NOT:
- Ask how you can assist.
- Offer help.
- Provide educational explanations.
- Provide summaries unless directly asked.
- Sound like customer support.
- Sound like a consultant.
- Use phrases such as:
  "How may I assist you"
  "I'm here to help"
  "Let me explain"
  "Happy to clarify"
  "Certainly"

You are evaluating the manager.
They must earn disclosure.
Stay fully in character at all times.
`;

    // =====================================================
    // SYSTEM PROMPT
    // =====================================================
    const systemPrompt = `
You are roleplaying as a ${clientType} based in ${location}.

${antiAssistantLock}

${structuralContext}
${behavioralRules}
${toneBlock}
${hiddenConstraint}
${difficultyLayer}
${engagementLayer}

Core Rules:
- Disclosure must follow the ladder.
- Early-stage answers should feel incomplete.
- Do not volunteer strategic insight.
- Never break character.
`;

    // =====================================================
    // MODEL CALL
    // =====================================================
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
    });

    // =====================================================
    // ENGAGEMENT SCORING LOGIC (UNCHANGED STRUCTURE)
    // =====================================================
    let updatedEngagement = engagement;

    const lastUserMessage =
      messages[messages.length - 1]?.content?.toLowerCase() || "";

    // Penalties
    if (lastUserMessage.length < 20) updatedEngagement -= 10;
    if (lastUserMessage.includes("tell me about")) updatedEngagement -= 10;
    if (lastUserMessage.includes("how would you describe"))
      updatedEngagement -= 5;
    if (lastUserMessage.includes("our strategy")) updatedEngagement -= 15;

    // Rewards
    if (
      lastUserMessage.includes("allocation") ||
      lastUserMessage.includes("capacity") ||
      lastUserMessage.includes("limits")
    )
      updatedEngagement += 5;

    if (
      lastUserMessage.includes("what would cause") ||
      lastUserMessage.includes("what would need to happen")
    )
      updatedEngagement += 7;

    if (
      lastUserMessage.includes("committee") ||
      lastUserMessage.includes("internal pressure")
    )
      updatedEngagement += 5;

    if (
      lastUserMessage.includes("displace") ||
      lastUserMessage.includes("incumbent")
    )
      updatedEngagement += 8;

    if (updatedEngagement > 100) updatedEngagement = 100;
    if (updatedEngagement < 0) updatedEngagement = 0;

    return NextResponse.json({
      reply: response.choices[0].message.content,
      engagement: updatedEngagement,
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