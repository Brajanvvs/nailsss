const router = require("express").Router();
const pool = require("../db");

/* =========================
OBTENER TODAS LAS CITAS
========================= */
router.get("/", async (req, res) => {
  try {
    const appointments = await pool.query("SELECT * FROM appointments");
    res.json(appointments.rows);
  } catch (err) {
    console.error("ERROR GET APPOINTMENTS:", err);
    res.status(500).json({ error: "Error obteniendo citas" });
  }
});

/* =========================
OBTENER CITAS POR USUARIO
========================= */
router.get("/user/:id", async (req, res) => {
  try {
    const appointments = await pool.query(
      "SELECT * FROM appointments WHERE user_id = $1",
      [req.params.id]
    );
    res.json(appointments.rows);
  } catch (err) {
    console.error("ERROR GET USER APPOINTMENTS:", err);
    res.status(500).json({ error: "Error obteniendo citas del usuario" });
  }
});

/* =========================
CREAR CITA
========================= */
router.post("/", async (req, res) => {

  const { service_id, day, time, user_id } = req.body;

  // 🔥 FIX AQUÍ
  if (
    service_id == null ||
    day == null ||
    time == null ||
    user_id == null
  ) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  try {

    const newAppointment = await pool.query(
      "INSERT INTO appointments (service_id, day, time, user_id, status) VALUES ($1,$2,$3,$4,'active') RETURNING *",
      [service_id, day, time, user_id]
    );

    res.json(newAppointment.rows[0]);

  } catch (err) {
    console.error("ERROR CREANDO CITA:", err);
    res.status(500).json({ error: "Error creando cita" });
  }

});

/* =========================
CANCELAR CITA
========================= */
router.delete("/:id", async (req, res) => {
  try {

    await pool.query(
      "UPDATE appointments SET status = 'cancelled' WHERE id = $1",
      [req.params.id]
    );

    res.json({ message: "Cita cancelada" });

  } catch (err) {
    console.error("ERROR CANCELANDO CITA:", err);
    res.status(500).json({ error: "Error cancelando cita" });
  }
});

module.exports = router;