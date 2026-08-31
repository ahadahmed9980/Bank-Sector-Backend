const mongoose = require("mongoose");
async function connectDB(req, res) {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB connected");
  } catch (err) {
    console.log("error from database", err);
    process.exit(1); //shutting down server if error come
  }
}
module.exports = connectDB();
