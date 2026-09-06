const mongoose = require("mongoose");
const ledgerSchema = new mongoose.Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "account",
    required: [true, "Leger must be accociate with a account"],
    index: true,
    immutable: true,
  },
  amount: {
    type: Number,
    required: [true, "amount is required for leger"],
    immutable: true,
  },
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "transaction",
    required: [true, "Leger must be accociate with a transaction"],
    index: true,
    immutable: true,
  },
  type: {
    type: String,
    enum: {
      values: ["CREDIT", "DEBIT"],
      message: "Type can either be CREDIT OR DEBIT",
    },
    required: [true, "Leger type is required"],
    index: true,
  },
});
function preventLedgerModification() {
  throw new Error(
    "Ledger entries are immutable and cannot be modified or deleted",
  );
}

ledgerSchema.pre("findOneAndUpdate", preventLedgerModification);
ledgerSchema.pre("updateOne", preventLedgerModification);
ledgerSchema.pre("deleteOne", preventLedgerModification);
ledgerSchema.pre("remove", preventLedgerModification);
ledgerSchema.pre("deleteMany", preventLedgerModification);
ledgerSchema.pre("updateMany", preventLedgerModification);
ledgerSchema.pre("findOneAndDelete", preventLedgerModification);
ledgerSchema.pre("findOneAndReplace", preventLedgerModification);
const ledgerModel = mongoose.model("ledger", ledgerSchema);
module.exports = ledgerModel;
