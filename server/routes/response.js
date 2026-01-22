const express = require("express");
const Response = require("../models/Response");
const router = express.Router();

// Get latest analysis
router.get("/latest-analysis", async (req, res) => {
  try {
    const latestResponse = await Response.findOne({ userId: req.user.id, "analysis.interest_score": { $exists: true } }).sort({ createdAt: -1 });
    if (latestResponse && latestResponse.analysis) {
      res.json(latestResponse.analysis);
    } else {
      res.json(null);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark latest response as copied
router.post("/mark-copied", async (req, res) => {
  try {
    const latestResponse = await Response.findOne({ userId: req.user.id }).sort({ createdAt: -1 });
    if (latestResponse) {
      latestResponse.is_copied = true;
      await latestResponse.save();
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
