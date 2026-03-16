const express = require("express");
const cors = require("cors");
const path = require("path");

const servicesRoutes = require("./routes/services");
const authRoutes = require("./routes/auth");
const appointmentsRoutes = require("./routes/appointments");

const app = express();

app.use(cors());
app.use(express.json());

/* FRONTEND */

app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

/* API */

app.use("/services", servicesRoutes);
app.use("/auth", authRoutes);
app.use("/appointments", appointmentsRoutes);

/* PORT */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Servidor corriendo en puerto", PORT);
});