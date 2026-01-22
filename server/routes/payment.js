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

// Payment routes (webhook moved to index.js)

module.exports = router;
