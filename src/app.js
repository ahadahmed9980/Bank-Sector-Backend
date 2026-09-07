const express = require("express");
const authrouter = require("./routes/authroutues");
const accountroute = require("./routes/account.routes");
const cookieParser = require("cookie-parser");
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authrouter);
app.use("/api/account",accountroute);
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy"
  });
});
module.exports = app;
