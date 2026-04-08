require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

// 🔥 Mongo + PQRS
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
   🔥 HEALTH CHECK (CRÍTICO PARA RAILWAY)
========================= */
// 👉 ESTA RUTA DEBE IR ARRIBA
app.get("/", (req, res) => {
  res.status(200).send("OK");
});

/* =========================
   🔥 MONGO DB
========================= */
connectMongo();

/* =========================
   HEALTH CHECK EXTRA
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

// 🔥 PQRS (Mongo)
app.use("/api/pqrs", pqrsRoutes);

/* =========================
   FRONTEND
========================= */
const frontendPath = path.join(__dirname, "frontend");

console.log("📂 Frontend path:", frontendPath);

// servir archivos estáticos
app.use(express.static(frontendPath));

// 👉 opcional: acceder a tu index
app.get("/home", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

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
   PUERTO (RAILWAY)
========================= */
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`🔥 Servidor corriendo en puerto ${PORT}`);
});