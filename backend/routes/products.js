const router = require("express").Router();
const pool = require("../db");

/* =========================
CREAR PRODUCTO
========================= */

router.post("/", async (req, res) => {
    try {
        const { name, description, category, stock, price, unit, adminEmail } = req.body;

        if (!name || price === undefined || stock === undefined) {
            return res.status(400).json({ error: "Nombre, precio y stock son obligatorios" });
        }

        const newProduct = await pool.query(
            `INSERT INTO products(name, description, category, stock, price, unit)
             VALUES($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [name, description, category, stock, price, unit || "unidades"]
        );

        res.json({ message: "Producto agregado", product: newProduct.rows[0] });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error creando producto" });
    }
});

/* =========================
LISTAR PRODUCTOS
========================= */

router.get("/", async (req, res) => {
    try {
        const products = await pool.query(
            "SELECT * FROM products ORDER BY name ASC"
        );
        res.json(products.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error obteniendo productos" });
    }
});

/* =========================
ACTUALIZAR STOCK/PRECIO
========================= */

router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, category, stock, price, unit } = req.body;

        const updated = await pool.query(
            `UPDATE products 
             SET name=$1, description=$2, category=$3, stock=$4, price=$5, unit=$6
             WHERE id=$7
             RETURNING *`,
            [name, description, category, stock, price, unit, id]
        );

        if (updated.rows.length === 0) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        res.json({ message: "Producto actualizado", product: updated.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error actualizando producto" });
    }
});

/* =========================
ELIMINAR PRODUCTO
========================= */

router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM products WHERE id=$1", [id]);
        res.json({ message: "Producto eliminado" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error eliminando producto" });
    }
});

/* =========================
AJUSTAR STOCK
========================= */

router.patch("/:id/stock", async (req, res) => {
    try {
        const { id } = req.params;
        const { stock, operation } = req.body;

        let newStock = stock;
        
        if (operation === "add") {
            newStock = stock + 1;
        } else if (operation === "subtract") {
            newStock = stock - 1;
            if (newStock < 0) newStock = 0;
        }

        await pool.query("UPDATE products SET stock=$1 WHERE id=$2", [newStock, id]);
        res.json({ message: "Stock actualizado", newStock });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error actualizando stock" });
    }
});

module.exports = router;