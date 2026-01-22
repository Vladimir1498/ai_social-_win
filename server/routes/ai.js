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
    const { style, gender } = req.body;
    const user = await User.findOne({ telegramId: req.user.id });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.balance <= 0 && !["572741546", "932090137"].includes(String(req.user.id))) {
      return res.status(403).json({ error: "Insufficient balance" });
    }

    const imageBase64 = req.file.buffer.toString("base64");
    const genderText = gender === "М" ? "мужчине" : "женщине";
    const prompt = `
Твоя роль: Элитный коуч по харизме и мастер переписок в дейтинг-приложениях.
Задача: Проанализируй скриншот и предложи 3 варианта ответа в стиле "${style}" для общения с ${genderText}.

ИНСТРУКЦИИ ПО КОНТЕКСТУ:
1. Сначала определи стадию общения (знакомство, флирт, затухание, пик интереса).
2. Игнорируй интерфейс приложения, фокуссируйся только на тексте сообщений.
3. Ответы должны учитывать последние реплики собеседника.

ТРЕБОВАНИЯ К ОТВЕТАМ:
- Никаких клише и "привет, как дела". Используй живой, современный сленг (но без перебора).
- Длина: от 3 до 12 слов. Краткость = уверенность.
- Эмодзи: используй максимум один на ответ, подходящий по смыслу.
- Ответ №1: Легкий, вовлекающий в ответ.
- Ответ №2: С акцентом на выбранный стиль "${style}" (максимально выразительно).
- Ответ №3: "Крючок" — интрига или мягкий переход к смене темы/встрече.

ФОРМАТ ВЫДАЧИ:
СТРОГО ТОЛЬКО 3 строки с ответами. Без цифр, кавычек, комментариев, анализа или любого другого текста. Только ответы, каждый на новой строке.
`;

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

    if (!["572741546", "932090137"].includes(String(req.user.id))) {
      // Admins don't consume credits
      user.balance -= 1;
    }
    user.history.push(newResponse._id);
    await user.save();

    res.json({ responses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/analyze-full", upload.single("image"), async (req, res) => {
  try {
    const { style, gender } = req.body;
    const user = await User.findOne({ telegramId: req.user.id });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.balance <= 0 && !["572741546", "932090137"].includes(String(req.user.id))) {
      return res.status(403).json({ error: "Insufficient balance" });
    }

    if (!["572741546", "932090137"].includes(String(req.user.id))) {
      // Admins don't consume credits for analysis
      user.balance -= 1;
    }

    const imageBase64 = req.file.buffer.toString("base64");
    const prompt = `Проанализируй скриншот переписки и верни JSON с анализом: {"interest_score": число от 1 до 10, "green_flags": массив плюсов, "red_flags": массив рисков, "analysis": текст разбора, "screenshot_text": полный текст переписки из скриншота}.`;

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
        break;
      } catch (error) {
        if (error.status === 429 && attempt < maxRetries) {
          console.log(`Attempt ${attempt} failed with 429, retrying in ${attempt * 2} seconds...`);
          await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
        } else {
          if (error.status === 429) {
            return res.status(429).json({ error: "AI перегружен, попробуй через минуту" });
          }
          throw error;
        }
      }
    }
    const text = result.choices[0].message.content;
    // Parse JSON from response
    let analysisData = null;
    try {
      // Try to parse the entire response as JSON first
      analysisData = JSON.parse(text.trim());
    } catch (e) {
      // If not, find JSON object
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          analysisData = JSON.parse(jsonMatch[0]);
        } catch (e2) {
          console.error("JSON parse error:", e2.message);
        }
      }
    }
    let responseData;
    if (analysisData && typeof analysisData === "object" && analysisData.interest_score !== undefined) {
      // Ensure screenshot_text is a string
      if (Array.isArray(analysisData.screenshot_text)) {
        analysisData.screenshot_text = analysisData.screenshot_text.join("\n");
      }
      responseData = analysisData;
    } else {
      responseData = { interest_score: 5, green_flags: [], red_flags: [], analysis: "Не удалось проанализировать", screenshot_text: "" };
    }
    // Save to latest Response
    const latestResponse = await Response.findOne({ userId: user._id }).sort({ createdAt: -1 });
    if (latestResponse) {
      latestResponse.analysis = responseData;
      await latestResponse.save();
    }
    res.json(responseData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
