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
      });
      await user.save();
    }
    res.json({ balance: user.balance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
