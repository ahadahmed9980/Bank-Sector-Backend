const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
async function userRegister(req, res) {
  const { name, email, password } = req.body;
  const isExist = await userModel.findOne({
    email: email,
  });
  if (isExist) {
    return res.status(422).json({
      message: "user already exist",
      status: "failed",
    });
  }
  const user = await userModel.create({
    email,
    password,
    name,
  });
  const token = jwt.sign(
    {
      userId: user._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "2d",
    },
  );
  res.cookie("token", token);
  res.status(201).json({
    message: "user created successfully",
    user: {
      userId: user._id,
      email: user.email,
    },
    token,
  });
}

module.exports = { userRegister };
