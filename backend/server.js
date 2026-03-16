const express = require("express");
const cors = require("cors");
const path = require("path");

const servicesRoutes = require("./routes/services");
const authRoutes = require("./routes/auth");
const appointmentsRoutes = require("./routes/appointments");

const app = express();

app.use(cors());
app.use(express.json());

/* SERVIR FRONTEND */

app.use(express.static(path.join(__dirname, "../frontend")));

/* API */

app.use("/services", servicesRoutes);
app.use("/auth", authRoutes);
app.use("/appointments", appointmentsRoutes);

/* PUERTO PARA RAILWAY */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Servidor corriendo en puerto", PORT);
});