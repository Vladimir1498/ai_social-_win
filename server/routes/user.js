const express = require("express");
const User = require("../models/User");
const router = express.Router();

// Get user balance
router.get("/balance", async (req, res) => {
  try {
    console.log("User ID:", req.user.id);
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
      console.log("Setting admin balance to 100");
      user.balance = 100; // Ensure admins have 100 credits
      await user.save();
      console.log("Saved admin balance:", user.balance);
    }
    console.log("Final Balance:", user.balance);
    res.json({ balance: user.balance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
