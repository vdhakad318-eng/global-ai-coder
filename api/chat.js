export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Only POST requests are allowed."
    });
  }

  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({
        error: "Message is required."
      });
    }

    const API_KEY = process.env.GROQ_API_KEY;

    if (!API_KEY) {
      return res.status(500).json({
        error: "GROQ_API_KEY not found."
      });
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        temperature: 0.3,
        max_tokens: 2048,
messages: [
  {
    role: "system",
    content: `You are Global AI Coder.

You are Global AI Coder, a professional software engineer.

Rules:
- Generate only correct, tested and working code.
- Never generate placeholder or incomplete code.
- Before replying, verify that the code logically works.
- If the user asks for a calculator, game, website or app, generate a complete working project.
- The "=" button must perform calculation, not clear the display.
- Never invent functions that are not connected to the HTML.
- Ensure HTML, CSS and JavaScript are fully synchronized.`
  },

  ...history,

  {
    role: "user",
    content: message
  }
]
        })
      }
    );

    const data = await response.json();

if (!response.ok) {

  if (response.status === 429) {
    return res.status(429).json({
      success: false,
      error: "⚠️ AI server is busy or the free API limit has been reached. Please wait a minute and try again."
    });
  }

  return res.status(response.status).json({
    success: false,
    error: data.error?.message || "Groq API Error"
  });

}

    return res.status(200).json({
      success: true,
      reply: data.choices[0].message.content
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
}
