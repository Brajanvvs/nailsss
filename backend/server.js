const express = require("express");

const app = express();

const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send("OK FUNCIONANDO 🚀");
});

app.listen(PORT, () => {
  console.log("🔥 TEST SERVER RUNNING ON PORT:", PORT);
});