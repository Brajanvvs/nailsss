const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const pqrsSchema = new mongoose.Schema({
  nombre: String,
  email: String,
  tipo: String,
  mensaje: String,
  estado: { type: String, default: "pendiente" },
  fecha: { type: Date, default: Date.now }
});

const PQRS = mongoose.model("PQRS", pqrsSchema);

// GET
router.get("/", async (req, res) => {
  const data = await PQRS.find().sort({ fecha: -1 });
  res.json(data);
});

// POST
router.post("/", async (req, res) => {
  const pqrs = new PQRS(req.body);
  await pqrs.save();
  res.status(201).json(pqrs);
});

module.exports = router;