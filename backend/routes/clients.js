const router = require("express").Router();
const pool = require("../db");
const bcrypt = require("bcrypt");

/* =========================
REGISTRAR CLIENTE CON LOGIN
========================= */

router.post("/", async (req, res) => {
    const client = await pool.connect();
    
    try {
        await client.query("BEGIN");
        
        const { name, document_type, document_number, email, phone, address, rut_pdf, password } = req.body;

        if (!name || !document_number) {
            return res.status(400).json({ error: "Nombre y número de documento son obligatorios" });
        }

        let newClient;
        
        // Si hay contraseña, crear usuario y cliente
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            
            // Crear usuario
            const newUser = await client.query(
                `INSERT INTO users(name, email, password, role)
                 VALUES($1, $2, $3, 'user')
                 RETURNING id`,
                [name, email, hashedPassword]
            );
            
            // Crear cliente vinculado al usuario
            newClient = await client.query(
                `INSERT INTO clients(name, document_type, document_number, email, phone, address, rut_pdf, user_id)
                 VALUES($1, $2, $3, $4, $5, $6, $7, $8)
                 RETURNING *`,
                [name, document_type || "CC", document_number, email, phone, address, rut_pdf || null, newUser.rows[0].id]
            );
            
            await client.query("COMMIT");
            
            res.json({ 
                message: "Cliente registrado con acceso a tienda", 
                client: newClient.rows[0],
                loginEnabled: true 
            });
        } else {
            // Solo crear cliente sin login
            newClient = await client.query(
                `INSERT INTO clients(name, document_type, document_number, email, phone, address, rut_pdf)
                 VALUES($1, $2, $3, $4, $5, $6, $7)
                 RETURNING *`,
                [name, document_type || "CC", document_number, email, phone, address, rut_pdf || null]
            );
            
            await client.query("COMMIT");
            
            res.json({ message: "Cliente registrado exitosamente", client: newClient.rows[0] });
        }

    } catch (err) {
        if (err.code === "23505") {
            return res.status(400).json({ error: "Ya existe un cliente con ese número de documento" });
        }
        console.error(err);
        res.status(500).json({ error: "Error registrando cliente" });
    }
});

/* =========================
LISTAR CLIENTES
========================= */

router.get("/", async (req, res) => {
    try {
        const clients = await pool.query(
            "SELECT id, name, document_type, document_number, email, phone, address, rut_pdf, created_at FROM clients ORDER BY created_at DESC"
        );
        res.json(clients.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error obteniendo clientes" });
    }
});

/* =========================
OBTENER CLIENTE POR ID
========================= */

router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const client = await pool.query(
            "SELECT * FROM clients WHERE id=$1",
            [id]
        );

        if (client.rows.length === 0) {
            return res.status(404).json({ error: "Cliente no encontrado" });
        }

        res.json(client.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error obteniendo cliente" });
    }
});

/* =========================
ACTUALIZAR CLIENTE
========================= */

router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, document_type, document_number, email, phone, address } = req.body;

        const updated = await pool.query(
            `UPDATE clients 
             SET name=$1, document_type=$2, document_number=$3, email=$4, phone=$5, address=$6
             WHERE id=$7
             RETURNING *`,
            [name, document_type, document_number, email, phone, address, id]
        );

        if (updated.rows.length === 0) {
            return res.status(404).json({ error: "Cliente no encontrado" });
        }

        res.json({ message: "Cliente actualizado", client: updated.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error actualizando cliente" });
    }
});

/* =========================
ELIMINAR CLIENTE
========================= */

router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM clients WHERE id=$1", [id]);
        res.json({ message: "Cliente eliminado" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error eliminando cliente" });
    }
});

/* =========================
VER PDF DEL RUT
========================= */

router.get("/:id/rut", async (req, res) => {
    try {
        const { id } = req.params;
        const client = await pool.query(
            "SELECT rut_pdf, name FROM clients WHERE id=$1",
            [id]
        );

        if (client.rows.length === 0 || !client.rows[0].rut_pdf) {
            return res.status(404).json({ error: "RUT no encontrado" });
        }

        const pdfBuffer = Buffer.from(client.rows[0].rut_pdf, "base64");
        res.set("Content-Type", "application/pdf");
        res.set("Content-Disposition", `inline; filename=RUT-${client.rows[0].name}.pdf`);
        res.send(pdfBuffer);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error obteniendo RUT" });
    }
});

module.exports = router;