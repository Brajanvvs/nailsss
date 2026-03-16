const express = require("express");
const cors = require("cors");
const path = require("path");

const servicesRoutes = require("./routes/services");
const authRoutes = require("./routes/auth");
const appointmentsRoutes = require("./routes/appointments");

const app = express();

app.use(cors());
app.use(express.json());

const frontendPath = path.join(__dirname, "frontend");

app.use(express.static(frontendPath));

app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.use("/services", servicesRoutes);
app.use("/auth", authRoutes);
app.use("/appointments", appointmentsRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Servidor corriendo en puerto", PORT);
});