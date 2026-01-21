const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    telegramId: { type: String, required: true, unique: true },
    username: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    balance: { type: Number, default: 3 }, // бесплатные генерации
    history: [{ type: mongoose.Schema.Types.ObjectId, ref: "Response" }],
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
