const router = require("express").Router();
const pool = require("../db");

/* =========================
OBTENER SERVICIOS
========================= */
router.get("/", async (req, res) => {
  try {
    const services = await pool.query("SELECT * FROM services");
    res.json(services.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error obteniendo servicios" });
  }
});

/* =========================
CREAR SERVICIO (SOLO ADMIN)
========================= */
router.post("/", async (req, res) => {

  const { title, price, image, role } = req.body;

  // 🔒 validar admin
  if (role !== "admin") {
    return res.status(403).json({ error: "No autorizado" });
  }

  try {

    const newService = await pool.query(
      "INSERT INTO services (title, price, image) VALUES ($1,$2,$3) RETURNING *",
      [title, price, image]
    );

    res.json(newService.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creando servicio" });
  }

});

/* =========================
ELIMINAR SERVICIO (SOLO ADMIN)
========================= */
router.delete("/:id", async (req, res) => {

  const { role } = req.body; // 👈 viene del frontend

  if (role !== "admin") {
    return res.status(403).json({ error: "No autorizado" });
  }

  try {

    await pool.query("DELETE FROM services WHERE id = $1", [req.params.id]);

    res.json({ message: "Servicio eliminado" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error eliminando servicio" });
  }

});

module.exports = router;