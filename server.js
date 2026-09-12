// server.js
// Simple backend that keeps your Gemini API key secret and forwards
// chat messages from your website to Google's Gemini API.

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors()); // allows your website to call this server
app.use(express.json());

// Put your Gemini API key in an environment variable, never in the code.
// Get a free key at: https://aistudio.google.com/app/apikey
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-3.6-flash'; // fast + free-tier friendly

app.post('/chat', async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage) {
      return res.status(400).json({ error: 'Missing "message" in request body' });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: userMessage }]
          }
        ],
        systemInstruction: {
          parts: [{
            text: "You are a friendly assistant on a business's website. Answer visitor questions helpfully and concisely."
          }]
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API error:', data);
      return res.status(500).json({ error: 'AI service error' });
    }

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text
      || "Sorry, I couldn't generate a response.";

    res.json({ reply });

  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Chatbot backend running on http://localhost:${PORT}`);
});