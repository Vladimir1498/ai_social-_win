const mongoose = require("mongoose");

const responseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  style: { type: String, required: true },
  imageUrl: { type: String },
  responses: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Response", responseSchema);
