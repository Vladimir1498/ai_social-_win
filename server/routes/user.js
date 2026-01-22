const express = require("express");
const User = require("../models/User");
const router = express.Router();

// Get user balance
router.get("/balance", async (req, res) => {
  try {
    let user = await User.findOne({ telegramId: req.user.id });
    if (!user) {
      user = new User({
        telegramId: req.user.id,
        username: req.user.username,
        firstName: req.user.first_name,
        lastName: req.user.last_name,
        balance: req.user.id === "572741546" ? 100 : 3, // Admin gets 100 credits
      });
      await user.save();
    } else if (req.user.id === "572741546") {
      user.balance = 100; // Ensure admin has 100 credits
      await user.save();
    }
    res.json({ balance: user.balance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
