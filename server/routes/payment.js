const express = require("express");
const axios = require("axios");
const User = require("../models/User");
const router = express.Router();

router.post("/create-invoice", async (req, res) => {
  try {
    const botToken = process.env.BOT_TOKEN;
    const { title, description, payload, currency, prices } = req.body;

    const response = await axios.post(`https://api.telegram.org/bot${botToken}/createInvoiceLink`, {
      title,
      description,
      payload,
      currency,
      prices,
    });

    res.json({ invoiceLink: response.data.result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Webhook for payment success
router.post("/webhook", async (req, res) => {
  if (req.headers["x-telegram-bot-api-secret-token"] !== process.env.TELEGRAM_SECRET) {
    return res.status(401).send("Unauthorized");
  }

  const { telegram_payment_charge_id, provider_payment_charge_id, total_amount, invoice_payload } = req.body;

  if (invoice_payload === "10_generations") {
    const userId = req.body.user.id; // assuming user data in webhook
    const user = await User.findOne({ telegramId: userId });
    if (user) {
      user.balance += 10;
      await user.save();
    }
  }

  res.sendStatus(200);
});

module.exports = router;
