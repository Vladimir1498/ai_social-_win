const express = require("express");
const Groq = require("groq-sdk");
const Session = require("../models/Session");
const User = require("../models/User");
const router = express.Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Create session
router.post("/create", async (req, res) => {
  try {
    const { screenshotText } = req.body;
    const session = new Session({
      userId: req.user.id,
      screenshotText,
    });
    await session.save();

    // Mark the latest response as copied
    const latestResponse = await Response.findOne({ userId: req.user.id }).sort({ createdAt: -1 });
    if (latestResponse) {
      latestResponse.is_copied = true;
      await latestResponse.save();
    }

    res.json({ sessionId: session._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user sessions
router.get("/", async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user.id, isActive: true }).sort({ createdAt: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send message in session
router.post("/:id/message", async (req, res) => {
  try {
    const { message } = req.body;
    const session = await Session.findById(req.params.id);

    if (!session || session.userId.toString() !== req.user.id) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Add user message
    session.messages.push({ role: "user", content: message });

    // Generate AI response
    const prompt = `Ты — человек из этой переписки: "${session.screenshotText}". Отвечай пользователю так, как ответил бы оригинал. Сохраняй его уровень токсичности или дружелюбия. Кратко, как в реальном чате.`;

    const result = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        { role: "system", content: prompt },
        ...session.messages.slice(-10).map((m) => ({ role: m.role, content: m.content })), // Last 10 messages
      ],
    });

    const aiResponse = result.choices[0].message.content;

    // Add AI message
    session.messages.push({ role: "assistant", content: aiResponse });
    await session.save();

    res.json({ response: aiResponse });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// End session
router.post("/:id/end", async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (session && session.userId.toString() === req.user.id) {
      session.isActive = false;
      await session.save();
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Session not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
