const mongoose = require("mongoose");
const crypto = require("crypto");
const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "UserId is required"],
    },
    refreshTokenHash: {
      type: String,
    },
    ip: {
      type: String,
      required: [true, "Ip is required"],
    },
    userAgent: {
      type: String,
      required: [true, "User agent is required"],
    },
    revoke: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);
//making hash in pre
sessionSchema.pre("save", async function () {
  if (!this.isModified("refreshTokenHash") || !this.refreshTokenHash) {
    return;
  }
  const hash = crypto
    .createHash("sha256")
    .update(this.refreshTokenHash)
    .digest("hex");
  this.refreshTokenHash = hash;
  return;
});
// comparing incoming refresh token
sessionSchema.methods.verifyToken = async function (incomingRefreshToken) {
  if (!incomingRefreshToken || !this.refreshTokenHash) {
    return false;
  }
  const incomingHash = crypto
    .createHash("sha256")
    .update(incomingRefreshToken)
    .digest("hex");
  return incomingHash === this.refreshTokenHash;
};

//creating model
const sessionModel = mongoose.model("session", sessionSchema);
module.exports = sessionModel;
