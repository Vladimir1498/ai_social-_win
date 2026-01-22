require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const validateInitData = require("./middleware/validateInitData");

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.use("/api/user", validateInitData, require("./routes/user"));
app.use("/api/ai", validateInitData, require("./routes/ai"));
app.use("/api/payment", validateInitData, require("./routes/payment"));

// Bot webhook for commands and payments
app.post("/bot/webhook", async (req, res) => {
  const update = req.body;

  // Handle /start command
  if (update.message && update.message.text === "/start") {
    const chatId = update.message.chat.id;
    const welcomeMessage = `
🤖 Привет! Я AI Social Wingman — твой помощник в дейтинге! 💕

📸 Загружай скриншоты переписок, выбирай стиль ответа (Смешной, Романтичный, Дерзкий), и я сгенерирую идеальные варианты с помощью ИИ!

⭐ Бесплатно: 3 генерации
💳 Купи 10 за 50 Stars

Нажми кнопку ниже, чтобы начать! 🚀
    `;
    // Send message via Telegram API
    const botToken = process.env.BOT_TOKEN;
    await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      chat_id: chatId,
      text: welcomeMessage,
      reply_markup: {
        inline_keyboard: [[{ text: "Открыть AI Wingman", web_app: { url: "https://vladimir1498.github.io/ai_social-_win/" } }]],
      },
    });
  }

  // Handle successful payment
  if (update.successful_payment) {
    const { invoice_payload } = update.successful_payment;
    if (invoice_payload === "10_generations") {
      const userId = update.successful_payment.chat.id; // For private chats
      const User = require("./models/User");
      const user = await User.findOne({ telegramId: userId });
      if (user) {
        user.balance += 10;
        await user.save();
      }
    }
  }

  res.sendStatus(200);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
