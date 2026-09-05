const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sessionModel = require("../models/session.model");
const { sendEmail } = require("../services/email.service");
const { generateOtp, getOtpHtml } = require("../utils/otp");
const otpModel = require("../models/otpModel");
//reg user
async function userRegister(req, res) {
  const { name, email, password } = req.body;
  try {
    //checking
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required(name,email,password)",
      });
    }
    const isExist = await userModel.findOne({
      email,
    });
    if (isExist) {
      return res.status(409).json({
        message: "user already exist",
      });
    }
    const user = await userModel.create({
      name,
      email,
      password,
    });
    //gen otp
    const otp = generateOtp();
    const html = getOtpHtml(otp);
    const otpHash = await bcrypt.hash(otp, 10);
    otpModel.create({
      email: user.email,
      user: user._id,
      otpHash: otpHash,
    });
    sendEmail(email, "OTP Verification", `Your OTP code is ${otp}`, html);
    return res.status(201).json({
      message: "user created successfully",
      user: {
        id: user._id,
        email: user.email,
        verified: user.verified,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: Object.values(error.errors).map((err) => err.message),
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}
//login api
async function userLogin(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "both fields are required",
      });
    }

    const user = await userModel.findOne({
      email,
    });
    if (!user) {
      return res.status(409).json({
        message: "user not found register please!",
      });
    }
    if (!user.verified) {
      return res.status(409).json({
        message: "email is not verified",
      });
    }
    //if user found
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(409).json({
        message: "password is incorrect!",
      });
    }
    // if password is valid now we create a session
    const session = await sessionModel.create({
      userId: user._id,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });
    //now creating refresh token
    const refreshToken = jwt.sign(
      {
        id: user._id,
        sessionId: session._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );
    session.refreshTokenHash = refreshToken;
    await session.save();
    //access token
    const accessToken = jwt.sign(
      {
        id: user._id,
        sessionId: session._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "10m",
      },
    );
    //set cookies
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,

      secure: false, // Localhost HTTP ke liye

      sameSite: "lax",

      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    //res send to user
    res.status(200).json({
      message: "login successfully",
      user: {
        id: user._id,
        email: user.email,
      },
      userRefreshToken: refreshToken,
      userAccessToken: accessToken,
    });
  } catch (error) {
    console.error("Register Error:", error);

    // Mongoose Validation Error handling
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: Object.values(error.errors).map((err) => err.message),
      });
    }

    // Fallback response for other errors
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}
//rotateRefreshToken and gen new accss token
async function rotateRefreshToken(req, res) {
  const incomingRefreshToken =
    req.body.refreshToken ||
    req.cookies.refreshToken ||
    req.headers.authorization?.split(" ")[1];
  if (!incomingRefreshToken) {
    return res.status(401).json({
      message: "refresh Token required",
    });
  }
  try {
    //veify token with jwt
    const decoded = jwt.verify(incomingRefreshToken, process.env.JWT_SECRET);
    //now from which session the req is comming from
    const session = await sessionModel.findOne({
      _id: decoded.sessionId,
      revoke: false,
    });
    //session not found invalid
    if (!session) {
      return res.status(401).json({
        message: "invalid refresh token",
      });
    }
    //verify incoming refresh token hash with store hash in db
    const isMatch = await session.verifyToken(incomingRefreshToken);
    if (!isMatch) {
      return res.status(401).json({
        message: "invalid refresh token hash",
      });
    }
    //new access token
    const accessToken = jwt.sign(
      {
        id: session.userId,
        sessionId: session._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "10m",
      },
    );
    //now making new refresh token for security
    const newRefreshToken = jwt.sign(
      { id: session.userId, sessionId: session._id },
      process.env.JWT_SECRET,

      {
        expiresIn: "7d",
      },
    );
    session.refreshTokenHash = newRefreshToken;
    await session.save();
    //saving it in cookies

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,

      secure: false, // Localhost HTTP ke liye

      sameSite: "lax",

      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    //returning new access token

    return res.status(200).json({
      message: "access token refresh successfully",

      accessToken: accessToken,
    });
  } catch (err) {
    console.log("error", err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
}
//verify email via otp
async function verifyEmail(req, res) {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        message: "both fields are required ",
      });
    }
    //find latest otp
    const latestOtp = await otpModel
      .findOne({
        email,
      })
      .sort({ createdAt: -1 });
    if (!latestOtp) {
      return res.status(400).json({
        message: "otp not found",
      });
    }
    // compare otp
    const isValid = await bcrypt.compare(otp, latestOtp.otpHash);
    if (!isValid) {
      return res.status(400).json({
        message: "invalid OTP",
      });
    }
    //if otp is valid
    await userModel.findByIdAndUpdate(latestOtp.user, {
      verified: true,
    });
    return res.status(200).json({
      message: "Email verified successfully",
    });
  } catch (err) {
    console.log("error", err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
}
//resend Otp
async function resendOtp(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        message: "email is required",
      });
    }
    //finding user
    const user = await userModel.findOne({
      email,
    });
    //user
    if (!user) {
      return res.status(400).json({
        message: "user not found",
      });
    }
    //user already verified
    if (user.verified) {
      return res.status(400).json({
        message: "user already verified",
      });
    }
    //now after passing all these creating otp
    const otp = generateOtp();
    const html = getOtpHtml(otp);
    const otpHash = await bcrypt.hash(otp, 10);
    otpModel.create({
      email: user.email,
      user: user._id,
      otpHash: otpHash,
    });
    await sendEmail(email, "OTP Verification", `Your OTP code is ${otp}`, html);
    return res.status(200).json({
      message: "Otp sent successfully ",
      user: {
        email: user.email,
        id: user._id,
      },
    });
  } catch (err) {
    console.log("error", err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
}

module.exports = {
  userRegister,
  userLogin,
  verifyEmail,
  resendOtp,
  rotateRefreshToken,
};
