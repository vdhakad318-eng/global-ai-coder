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
    const { message } = req.body;

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
          model: "llama-3.3-70b-versatile",
          temperature: 0.4,
          max_tokens: 4096,
          messages: [
            {
              role: "system",
              content: `You are Global AI Coder.

You are an expert software engineer.

Rules:
- Support HTML, CSS, JavaScript, Java, Python, C++, Android, React, Node.js.
- Reply normally to greetings and casual conversation.
- Generate code only when the user explicitly asks for coding, debugging, programming, or software development.
- Explain briefly before code.
- Wrap code in Markdown code blocks only when code is included.
- Never generate unnecessary code.`
            },
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
  console.error("Groq Error:", data);

  return res.status(response.status).json({
    success: false,
    error: data.error?.message || "Groq API Error",
    details: data
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
