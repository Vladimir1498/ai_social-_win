const express = require("express");
const multer = require("multer");
const Groq = require("groq-sdk");
const User = require("../models/User");
const Response = require("../models/Response");
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

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

    const imageBase64 = req.file.buffer.toString("base64");
    const prompt = `Ты эксперт в дейтинге. Посмотри на скриншот переписки и предложи ровно 3 коротких варианта ответа в стиле ${style} на русском языке. Каждый вариант на отдельной строке, без нумерации и лишнего текста.`;

    let result;
    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        result = await groq.chat.completions.create({
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${req.file.mimetype};base64,${imageBase64}`,
                  },
                },
              ],
            },
          ],
        });
        break; // Success, exit loop
      } catch (error) {
        if (error.status === 429 && attempt < maxRetries) {
          console.log(`Attempt ${attempt} failed with 429, retrying in ${attempt * 2} seconds...`);
          await new Promise((resolve) => setTimeout(resolve, attempt * 2000)); // Exponential backoff
        } else {
          if (error.status === 429) {
            return res.status(429).json({ error: "AI перегружен, попробуй через минуту" });
          }
          throw error;
        }
      }
    }
    const text = result.choices[0].message.content;

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

    if (req.user.id !== "572741546") {
      // Admin doesn't consume credits
      user.balance -= 1;
    }
    user.history.push(newResponse._id);
    await user.save();

    res.json({ responses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
