const mongoose = require("mongoose");

const connectMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🍃 MongoDB conectado");
  } catch (error) {
    console.error("❌ Error Mongo:", error.message);
  }
};

module.exports = connectMongo;