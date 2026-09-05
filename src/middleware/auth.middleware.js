const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const sessionModel = require("../models/session.model");
async function authMiddleware(req, res, next) {
  const token =
    req.headers.authorization?.split(" ")[1] ||
    req.cookies?.accessToken ||
    req.cookies?.token ||
    req.body?.token;
  if (!token) {
    return res.status(401).json({
      message: "unAuthorized Access, token is missing",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }
    const session = await sessionModel.findOne({
      _id: decoded.sessionId,
      userId: decoded.id,
      revoke: false,
    });
    if (!session) {
      return res.status(401).json({
        message: "Session is invalid or revoke",
      });
    }
    req.user = user;
    req.session = session;
    return next();
  } catch (err) {
    console.log("error from auth middleware", err);
    return res.status(401).json({
      message: "error from auth middleware",
      error: err.message,
    });
  }
}
module.exports = { authMiddleware };
