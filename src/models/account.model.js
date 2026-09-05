const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "Account Must be associated with User"],
      index: true,
    },
    status: {
      enum: {
        values: ["ACTIVE", "FROZEN", "CLOSED"],
        MESSAGE: "Status can be either ACTIVE, FROZEN OR CLOSED",
        default: "ACTIVE",
      },
    },
    currency: {
      type: String,
      required: [true, "currency is required for creating account"],
      defualt: "PKR",
    },
  },
  {
    timestamps: true,
  },
);
const accountModel = mongoose.model("account", accountSchema);
module.exports = accountModel;
