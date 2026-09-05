const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
    },
    email: {
      type: String,
      required: [true, "email is required"],
      trim: true,
      lowercase: true,
      match: [
        /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
        "kindly enter a valid email address",
      ],
      unique: [true, "email already register"],
      index: true,
    },

    password: {
      type: String,
      required: [true, "password is required"],
      trim: true,
      match: [
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
        "Password must be at least 6 characters and contain letters, numbers, and a special character",
      ],
      //  select: false,//user ki query lagai select false kia to password bydefual nahi aaye ga
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;
  return;
});
//compare password function
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};
const userModel = mongoose.model("user", userSchema);
module.exports = userModel;
