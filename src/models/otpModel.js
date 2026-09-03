const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "User is required"],
    },
    otpHash: {
      type: String,
      required: [true, "OTP hash is required"],
    },
    // Yeh field 5 minutes (300 seconds) baad document auto-delete kar degi
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 300, // 300 seconds = 5 minutes
    },
  }
);

const otpModel = mongoose.model("otps", otpSchema);

module.exports = otpModel;