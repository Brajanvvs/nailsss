const router = require("express").Router();
const pool = require("../db");

/* =========================
SOLICITAR RECARGA DE SALDO
========================= */

router.post("/recharge", async (req, res) => {
    try {
        const { client_id, amount } = req.body;
        
        if (!client_id || !amount || amount <= 0) {
            return res.status(400).json({ error: "Cliente y monto requeridos" });
        }
        
        const request = await pool.query(
            `INSERT INTO balance_requests(client_id, amount, status)
             VALUES($1, $2, 'pending')
             RETURNING *`,
            [client_id, amount]
        );
        
        res.json({ message: "Solicitud de recarga enviada", request: request.rows[0] });
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error solicitando recarga" });
    }
});

/* =========================
LISTAR SOLICITUDES PENDIENTES
========================= */

router.get("/requests", async (req, res) => {
    try {
        const requests = await pool.query(
            `SELECT br.*, c.name as client_name, c.document_number, c.phone
             FROM balance_requests br
             JOIN clients c ON c.id = br.client_id
             WHERE br.status = 'pending'
             ORDER BY br.created_at DESC`
        );
        res.json(requests.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error obteniendo solicitudes" });
    }
});

/* =========================
APROBAR RECARGA (ADMIN)
========================= */

router.post("/approve/:id", async (req, res) => {
    const client = await pool.connect();
    
    try {
        await client.query("BEGIN");
        
        const { id } = req.params;
        
        const request = await client.query(
            "SELECT * FROM balance_requests WHERE id = $1 AND status = 'pending'",
            [id]
        );
        
        if (request.rows.length === 0) {
            return res.status(404).json({ error: "Solicitud no encontrada o ya procesada" });
        }
        
        const reqData = request.rows[0];
        
        await client.query(
            "UPDATE balance_requests SET status = 'approved', approved_at = NOW() WHERE id = $1",
            [id]
        );
        
        await client.query(
            "UPDATE clients SET balance = balance + $1 WHERE id = $2",
            [reqData.amount, reqData.client_id]
        );
        
        await client.query("COMMIT");
        
        res.json({ message: "Recarga aprobada" });
        
    } catch (err) {
        await client.query("ROLLBACK");
        console.error(err);
        res.status(500).json({ error: "Error aprobando recarga" });
    } finally {
        client.release();
    }
});

/* =========================
RECHAZAR RECARGA (ADMIN)
========================= */

router.post("/reject/:id", async (req, res) => {
    try {
        const { id } = req.params;
        
        await pool.query(
            "UPDATE balance_requests SET status = 'rejected' WHERE id = $1",
            [id]
        );
        
        res.json({ message: "Recarga rechazada" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error rechazando recarga" });
    }
});

/* =========================
OBTENER SALDO DEL CLIENTE
========================= */

router.get("/client/:id", async (req, res) => {
    try {
        const { id } = req.params;
        
        const client = await pool.query(
            "SELECT id, name, document_number, balance FROM clients WHERE id = $1",
            [id]
        );
        
        if (client.rows.length === 0) {
            return res.status(404).json({ error: "Cliente no encontrado" });
        }
        
        res.json(client.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error obteniendo saldo" });
    }
});

/* =========================
COMPRAR CON SALDO
========================= */

router.post("/purchase", async (req, res) => {
    const client = await pool.connect();
    
    try {
        await client.query("BEGIN");
        
        const { client_id, items } = req.body;
        
        if (!items || items.length === 0) {
            throw new Error("No hay productos");
        }
        
        const total = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
        
        const clientData = await client.query(
            "SELECT id, name, document_number, phone, balance FROM clients WHERE id = $1",
            [client_id]
        );
        
        if (clientData.rows.length === 0) {
            throw new Error("Cliente no encontrado");
        }
        
        if (clientData.rows[0].balance < total) {
            throw new Error("Saldo insuficiente");
        }
        
        // Descontar stock de productos
        for (const item of items) {
            const product = await client.query(
                "SELECT stock FROM products WHERE id = $1",
                [item.product_id]
            );
            
            if (product.rows.length === 0 || product.rows[0].stock < item.quantity) {
                throw new Error(`Stock insuficiente para ${item.product_name}`);
            }
            
            await client.query(
                "UPDATE products SET stock = stock - $1 WHERE id = $2",
                [item.quantity, item.product_id]
            );
        }
        
        // Descontar saldo del cliente
        await client.query(
            "UPDATE clients SET balance = balance - $1 WHERE id = $2",
            [total, client_id]
        );
        
        // Crear registro de venta
        const sale = await client.query(
            `INSERT INTO sales(client_id, client_name, client_document, client_phone, total)
             VALUES($1, $2, $3, $4, $5)
             RETURNING *`,
            [client_id, clientData.rows[0].name, clientData.rows[0].document_number, clientData.rows[0].phone, total]
        );
        
        const saleId = sale.rows[0].id;
        
        // Crear items de la venta
        for (const item of items) {
            await client.query(
                `INSERT INTO sales_items(sale_id, product_id, product_name, quantity, unit_price, subtotal)
                 VALUES($1, $2, $3, $4, $5, $6)`,
                [saleId, item.product_id, item.product_name, item.quantity, item.unit_price, item.quantity * item.unit_price]
            );
        }
        
        await client.query("COMMIT");
        
        res.json({ 
            message: "Compra exitosa", 
            total: total,
            remainingBalance: clientData.rows[0].balance - total,
            saleId: saleId
        });
        
    } catch (err) {
        await client.query("ROLLBACK");
        console.error(err);
        res.status(400).json({ error: err.message });
    } finally {
        client.release();
    }
});

module.exports = router;