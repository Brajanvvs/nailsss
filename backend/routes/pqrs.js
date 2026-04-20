const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// Esquema de PQRS
const pqrsSchema = new mongoose.Schema({
    nombre: String,
    email: String,
    tipo: String,
    mensaje: String,
    estado: { type: String, default: "pendiente" },
    fecha: { type: Date, default: Date.now }
});

const PQRS = mongoose.model("PQRS", pqrsSchema);

// GET: Listar todas las PQRS
router.get("/", async (req, res) => {
    try {
        const data = await PQRS.find().sort({ fecha: -1 });
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: "Error al obtener datos", error: err.message });
    }
});

// POST: Crear una nueva PQRS
router.post("/", async (req, res) => {
    try {
        const pqrs = new PQRS(req.body);
        await pqrs.save();
        res.status(201).json(pqrs);
    } catch (err) {
        res.status(400).json({ message: "Error al guardar", error: err.message });
    }
});

// PATCH: Actualizar el estado (completada o cancelada)
router.patch("/:id", async (req, res) => {
    try {
        const { estado } = req.body;
        const pqrsActualizada = await PQRS.findByIdAndUpdate(
            req.params.id,
            { estado },
            { new: true }
        );
        res.json(pqrsActualizada);
    } catch (err) {
        res.status(400).json({ message: "Error al actualizar estado", error: err.message });
    }
});

module.exports = router;