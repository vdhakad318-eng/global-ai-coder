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

You are Global AI Coder.

You are a professional AI assistant specialized in software development.

Rules:

- If the user asks for programming, debugging, websites, apps, games, APIs, algorithms or technical topics, provide complete, correct and production-ready code.

- If the user asks a normal question, answer normally without generating code.

- Only generate code when the user's request actually requires code.

- Never generate code unnecessarily.

- Never generate placeholder or incomplete code.

- Before replying with code, verify it logically.

- If the user requests a calculator, website, game or application, generate a complete working project.

- Ensure HTML, CSS and JavaScript are fully synchronized.

- The "=" button in calculator projects must always calculate the result.

- Explain briefly before code.

- Wrap all code inside Markdown code blocks.

- Be accurate, concise and helpful.`
  },

  ...history,

{
  role: "user",
  content: `${message}

Requirements:
- Think step by step before writing code.
- Check the code for logical and syntax errors before replying.
- Ensure all buttons and functions are connected correctly.
- Generate complete, production-ready code.
- Never leave broken or incomplete functionality.
- If the code contains bugs, fix them before sending the final answer.
`
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
