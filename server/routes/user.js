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
        balance: ["572741546", "932090137"].includes(req.user.id) ? 100 : 3, // Admins get 100 credits
      });
      await user.save();
    } else if (["572741546", "932090137"].includes(req.user.id)) {
      user.balance = 100; // Ensure admins have 100 credits
      await user.save();
    }
    res.json({ balance: user.balance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
