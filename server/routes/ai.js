const express = require("express");
const multer = require("multer");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const User = require("../models/User");
const Response = require("../models/Response");
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/analyze", upload.single("image"), async (req, res) => {
  try {
    const { style } = req.body;
    const user = await User.findOne({ telegramId: req.user.id });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.balance <= 0) {
      return res.status(403).json({ error: "Insufficient balance" });
    }

    const imagePart = {
      inlineData: {
        data: req.file.buffer.toString("base64"),
        mimeType: req.file.mimetype,
      },
    };

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Ты эксперт в дейтинге. Проанализируй скриншот переписки и предложи 3 варианта ответа в стиле ${style} на русском языке.`;

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    const responses = text
      .split("\n")
      .filter((line) => line.trim())
      .slice(0, 3);

    const newResponse = new Response({
      userId: user._id,
      style,
      imageUrl: "", // можно сохранить в cloud storage
      responses,
    });
    await newResponse.save();

    user.balance -= 1;
    user.history.push(newResponse._id);
    await user.save();

    res.json({ responses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
