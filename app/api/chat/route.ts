import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// =========================================
// SIMPLE RANDOM NAME GENERATOR
// =========================================

function generatePersona(clientType: string, location: string) {
  const asianFirstNames = [
    "Mei Lin",
    "Wei Zhang",
    "Arjun",
    "Siti",
    "Kenji",
    "Min Ho",
    "Ananya",
    "Daniel",
    "Li Wei",
    "Farah",
  ];

  const westernFirstNames = [
    "James",
    "Sarah",
    "David",
    "Emma",
    "Michael",
    "Laura",
    "Andrew",
    "Olivia",
  ];

  const lastNames = [
    "Tan",
    "Ng",
    "Lim",
    "Wong",
    "Chen",
    "Patel",
    "Kim",
    "Lee",
    "Smith",
    "Brown",
  ];

  const firstPool =
    location === "Singapore" || location === "Hong Kong"
      ? asianFirstNames
      : westernFirstNames;

  const firstName =
    firstPool[Math.floor(Math.random() * firstPool.length)];
  const lastName =
    lastNames[Math.floor(Math.random() * lastNames.length)];

  let title = "";

  if (clientType === "Sovereign Wealth Fund")
    title = "Deputy Chief Investment Officer";
  if (clientType === "Pension Fund")
    title = "Chief Investment Officer";
  if (clientType === "Insurance Company")
    title = "Head of Asset Allocation";
  if (clientType === "Family Office")
    title = "Principal";

  return {
    name: `${firstName} ${lastName}`,
    title,
  };
}

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
      persona,
    } = body;

    // =============================================
    // GENERATE OR USE EXISTING PERSONA
    // =============================================
    const activePersona =
      persona || generatePersona(clientType, location);

    // =============================================
    // REVIEW MODE
    // =============================================
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

    // =============================================
    // TERMINATE IF ENGAGEMENT 0
    // =============================================
    if (engagement <= 0) {
      return NextResponse.json({
        reply:
          "We’ll conclude here. This discussion isn’t progressing in a productive direction.",
        engagement: 0,
        meetingEnded: true,
        persona: activePersona,
      });
    }

    // =============================================
    // ENGAGEMENT LAYER
    // =============================================
    let engagementLayer = "";

    if (engagement <= 40 && engagement > 20) {
      engagementLayer = `
Engagement is low.

Responses shorten.
Skepticism increases.
Subtle time pressure appears.
Do not increase disclosure depth.
`;
    }

    if (engagement <= 20 && engagement > 0) {
      engagementLayer = `
Engagement is critical.

Very brief responses.
Visible impatience.
Question continuation value.
Emphasize opportunity cost.
Do NOT elaborate.
`;
    }

    // =============================================
    // CLIENT STRUCTURE
    // =============================================
    let structuralContext = `
You are ${activePersona.name}, ${activePersona.title},
based in ${location}, working at a ${clientType}.
`;

    let behavioralRules = `
This is a questioning simulation.

You are not being pitched.
You do not structure the meeting.
You do not guide the manager.

Respond only to what is asked.
Do not volunteer structure.
Do not expand beyond the scope of the question.

Disclosure Ladder:

Broad question → high-level response (2–3 sentences max).
Specific probing → partial structured acknowledgement.
Layered, intelligent questioning → controlled incremental disclosure.
Hidden constraints → only if earned.
`;

    let hiddenConstraint = `
Hidden constraints (do not reveal unless earned):

- Capacity sensitivity.
- Internal committee bias toward incumbents.
- Political or capital sensitivity.
`;

    // =============================================
    // DIFFICULTY
    // =============================================
    let difficultyLayer = "";

    if (difficulty === "Skeptical") {
      difficultyLayer = `
Challenge vague phrasing.
Require precision before expanding.
`;
    }

    if (difficulty === "Hostile IC") {
      difficultyLayer = `
Minimal patience.
Interrupt weak logic.
Emphasize opportunity cost.
`;
    }

    // =============================================
    // HARD ANTI-ASSISTANT LOCK
    // =============================================
    const antiAssistantLock = `
You are NOT an assistant.
You are NOT ChatGPT.
You are a senior institutional investor.

Do NOT:
- Ask how you can assist.
- Invite a pitch.
- Offer to explain.
- Provide educational commentary.
- Sound like customer support.

Opening rule:
If greeted casually, respond briefly and neutrally.
Example:
Manager: "Good morning."
You: "Good morning."
`;

    // =============================================
    // SYSTEM PROMPT
    // =============================================
    const systemPrompt = `
${structuralContext}

${antiAssistantLock}

${behavioralRules}

${hiddenConstraint}

${difficultyLayer}

${engagementLayer}

You speak in first person.
Stay fully in character as ${activePersona.name}.
`;

    // =============================================
    // MODEL CALL
    // =============================================
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.6,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
    });

    // =============================================
    // ENGAGEMENT SCORING
    // =============================================
    let updatedEngagement = engagement;
    const lastUser =
      messages[messages.length - 1]?.content?.toLowerCase() || "";

    if (lastUser.length < 20) updatedEngagement -= 10;
    if (lastUser.includes("tell me about")) updatedEngagement -= 10;

    if (
      lastUser.includes("allocation") ||
      lastUser.includes("capacity") ||
      lastUser.includes("limits")
    )
      updatedEngagement += 5;

    if (
      lastUser.includes("committee") ||
      lastUser.includes("internal dynamics")
    )
      updatedEngagement += 5;

    if (updatedEngagement > 100) updatedEngagement = 100;
    if (updatedEngagement < 0) updatedEngagement = 0;

    return NextResponse.json({
      reply: response.choices[0].message.content,
      engagement: updatedEngagement,
      meetingEnded: updatedEngagement === 0,
      persona: activePersona,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}