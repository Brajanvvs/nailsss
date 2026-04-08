require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

// 🔥 NUEVO (Mongo + PQRS)
const connectMongo = require("./mongo");
const pqrsRoutes = require("./routes/pqrs");

// 🔹 Rutas existentes
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
   🔥 MONGO DB
========================= */
connectMongo();

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

// 🔥 NUEVA RUTA PQRS (Mongo)
app.use("/api/pqrs", pqrsRoutes);

/* =========================
   FRONTEND (IMPORTANTE)
========================= */
const frontendPath = path.join(__dirname, "frontend");

if (fs.existsSync(frontendPath)) {
  console.log("✅ Frontend encontrado");

  // servir archivos estáticos
  app.use(express.static(frontendPath));

  // ruta raíz
  app.get("/", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });

} else {
  console.log("⚠️ Frontend NO encontrado");

  app.get("/", (req, res) => {
    res.send("API funcionando 🚀");
  });
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
   PUERTO (RAILWAY OK)
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🔥 Servidor corriendo en puerto ${PORT}`);
});