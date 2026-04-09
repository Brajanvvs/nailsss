const mongoose = require("mongoose");

const connectMongo = () => {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("🍃 MongoDB conectado"))
    .catch(err => console.error("❌ Error Mongo:", err.message));
};

module.exports = connectMongo;