const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// Definición del esquema (Asegúrate de que coincida con el frontend)
const pqrsSchema = new mongoose.Schema({
    nombre: String,
    email: String,
    tipo: String,
    mensaje: String,
    estado: { type: String, default: "pendiente" },
    fecha: { type: Date, default: Date.now }
});

const PQRS = mongoose.model("PQRS", pqrsSchema);

// GET: Listar PQRS
router.get("/", async (req, res) => {
    try {
        const data = await PQRS.find().sort({ fecha: -1 });
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: "Error al obtener datos", error: err.message });
    }
});

// POST: Crear PQRS (Desde el formulario del cliente)
router.post("/", async (req, res) => {
    try {
        const pqrs = new PQRS(req.body);
        await pqrs.save();
        res.status(201).json(pqrs);
    } catch (err) {
        res.status(400).json({ message: "Error al guardar", error: err.message });
    }
});

module.exports = router;