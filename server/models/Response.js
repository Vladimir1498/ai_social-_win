const mongoose = require("mongoose");

const responseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  style: { type: String, required: true },
  imageUrl: { type: String },
  responses: [{ type: String }],
  last_interaction: { type: Date, default: Date.now },
  is_copied: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Response", responseSchema);
