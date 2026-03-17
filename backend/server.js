require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const servicesRoutes = require("./routes/services");
const authRoutes = require("./routes/auth");
const appointmentsRoutes = require("./routes/appointments");

const app = express();

/* =========================
   CONFIG
========================= */
app.set("trust proxy", 1);

/* =========================
   LOG INICIAL
========================= */
console.log("🚀 Iniciando servidor...");
console.log("🌍 NODE_ENV:", process.env.NODE_ENV);
console.log("🔌 PORT ENV:", process.env.PORT);

/* =========================
   MIDDLEWARE
========================= */
app.use(cors());
app.use(express.json());

/* =========================
   RUTA BASE
========================= */
app.get("/", (req, res) => {
  res.status(200).send("Servidor activo 🚀");
});

/* =========================
   HEALTH CHECK
========================= */
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

/* =========================
   API ROUTES
========================= */
app.use("/services", servicesRoutes);
app.use("/auth", authRoutes);
app.use("/appointments", appointmentsRoutes);

/* =========================
   FRONTEND (OPCIONAL)
========================= */
const frontendPath = path.join(__dirname, "frontend");

if (fs.existsSync(frontendPath)) {
  console.log("✅ Frontend encontrado");
  app.use(express.static(frontendPath));
}

/* =========================
   404
========================= */
app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

/* =========================
   ERRORES
========================= */
app.use((err, req, res, next) => {
  console.error("❌ Error global:", err);
  res.status(500).json({
    message: "Error interno",
    error: err.message
  });
});

/* =========================
   PUERTO (FORZADO PARA RAILWAY)
========================= */
const PORT = 3000; // 🔥 puerto fijo

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🔥 Servidor corriendo en puerto ${PORT}`);
});