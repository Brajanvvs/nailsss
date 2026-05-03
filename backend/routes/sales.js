const router = require("express").Router();
const pool = require("../db");

/* =========================
CREAR VENTA
========================= */

router.post("/", async (req, res) => {
    const client = await pool.connect();
    
    try {
        await client.query("BEGIN");
        
        const { client_id, client_name, client_document, client_phone, items } = req.body;
        
        if (!items || items.length === 0) {
            throw new Error("No hay productos en la venta");
        }
        
        for (const item of items) {
            const product = await client.query(
                "SELECT stock, price FROM products WHERE id = $1",
                [item.product_id]
            );
            
            if (product.rows.length === 0) {
                throw new Error(`Producto ${item.product_name} no encontrado`);
            }
            
            if (product.rows[0].stock < item.quantity) {
                throw new Error(`Stock insuficiente para ${item.product_name}. Stock actual: ${product.rows[0].stock}`);
            }
            
            await client.query(
                "UPDATE products SET stock = stock - $1 WHERE id = $2",
                [item.quantity, item.product_id]
            );
        }
        
        const total = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
        
        const sale = await client.query(
            `INSERT INTO sales(client_id, client_name, client_document, client_phone, total)
             VALUES($1, $2, $3, $4, $5)
             RETURNING *`,
            [client_id || null, client_name, client_document, client_phone, total]
        );
        
        const saleId = sale.rows[0].id;
        
        for (const item of items) {
            await client.query(
                `INSERT INTO sales_items(sale_id, product_id, product_name, quantity, unit_price, subtotal)
                 VALUES($1, $2, $3, $4, $5, $6)`,
                [saleId, item.product_id, item.product_name, item.quantity, item.unit_price, item.quantity * item.unit_price]
            );
        }
        
        await client.query("COMMIT");
        
        const completeSale = await pool.query(
            `SELECT s.*, json_agg(json_build_object(
                'product_name', si.product_name,
                'quantity', si.quantity,
                'unit_price', si.unit_price,
                'subtotal', si.subtotal
            )) as items
            FROM sales s
            LEFT JOIN sales_items si ON si.sale_id = s.id
            WHERE s.id = $1
            GROUP BY s.id`,
            [saleId]
        );
        
        res.json({ message: "Venta realizada exitosamente", sale: completeSale.rows[0] });
        
    } catch (err) {
        await client.query("ROLLBACK");
        console.error(err);
        res.status(400).json({ error: err.message });
    } finally {
        client.release();
    }
});

/* =========================
LISTAR VENTAS
========================= */

router.get("/", async (req, res) => {
    try {
        const sales = await pool.query(
            `SELECT s.*, 
                    (SELECT json_agg(json_build_object(
                        'product_name', si.product_name,
                        'quantity', si.quantity,
                        'unit_price', si.unit_price,
                        'subtotal', si.subtotal
                    )) FROM sales_items si WHERE si.sale_id = s.id) as items
             FROM sales s 
             ORDER BY s.created_at DESC
             LIMIT 50`
        );
        res.json(sales.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error obteniendo ventas" });
    }
});

/* =========================
OBTENER VENTA POR ID
========================= */

router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const sale = await pool.query(
            `SELECT s.*, 
                    (SELECT json_agg(json_build_object(
                        'product_name', si.product_name,
                        'quantity', si.quantity,
                        'unit_price', si.unit_price,
                        'subtotal', si.subtotal
                    )) FROM sales_items si WHERE si.sale_id = s.id) as items
             FROM sales s 
             WHERE s.id = $1`,
            [id]
        );
        
        if (sale.rows.length === 0) {
            return res.status(404).json({ error: "Venta no encontrada" });
        }
        
        res.json(sale.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error obteniendo venta" });
    }
});

/* =========================
BUSCAR CLIENTE POR DOCUMENTO O EMAIL
========================= */

router.get("/client/:search", async (req, res) => {
    try {
        const { search } = req.params;
        
        // Buscar por documento o email
        const client = await pool.query(
            "SELECT id, name, document_number, phone, email, balance FROM clients WHERE document_number = $1 OR email = $1",
            [search]
        );
        
        if (client.rows.length === 0) {
            return res.json({ found: false });
        }
        
        res.json({ found: true, client: client.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error buscando cliente" });
    }
});

/* =========================
LOGIN CON EMAIL Y CONTRASEÑA
========================= */

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: "Email y contraseña requeridos" });
        }
        
        // Buscar en tabla de usuarios (que tiene las contraseñas)
        const user = await pool.query(
            "SELECT id, name, email, password FROM users WHERE email = $1",
            [email]
        );
        
        if (user.rows.length === 0) {
            return res.status(401).json({ error: "Usuario no encontrado" });
        }
        
        const bcrypt = require("bcrypt");
        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        
        if (!validPassword) {
            return res.status(401).json({ error: "Contraseña incorrecta" });
        }
        
        // Buscar o crear cliente linked
        const client = await pool.query(
            "SELECT id, name, document_number, phone, email, balance FROM clients WHERE email = $1",
            [email]
        );
        
        if (client.rows.length === 0) {
            return res.status(404).json({ error: "No tienes registro como cliente. Regístrate primero." });
        }
        
        res.json({ 
            success: true, 
            client: client.rows[0] 
        });
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error en login" });
    }
});

module.exports = router;