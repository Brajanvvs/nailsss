document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("user"));
    
    if (!user || user.role !== "admin") {
        alert("Acceso denegado");
        window.location.href = "login.html";
        return;
    }

    loadUsers();
    loadServices();
    loadClients();
    loadProducts();
    loadSales();
    loadPQRS();
});

// --- LÓGICA DE VENTAS ---
function loadSales() {
    fetch("/sales")
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById("salesList");
            
            if (!data || data.length === 0) {
                container.innerHTML = "<p style='color: #666;'>No hay ventas registradas</p>";
                return;
            }
            
            const totalVentas = data.reduce((sum, s) => sum + parseFloat(s.total || 0), 0);
            
            container.innerHTML = `
                <div style="background: #d63384; color: white; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <strong>Total Ventas: $${totalVentas.toLocaleString()}</strong>
                    <br><small>${data.length} ventas registradas</small>
                </div>
                <table style="width:100%; border-collapse: collapse; margin-top: 15px;">
                    <thead>
                        <tr style="background:#ffb3c1; color:white;">
                            <th style="padding:10px; text-align:left;">#</th>
                            <th style="padding:10px; text-align:left;">Fecha</th>
                            <th style="padding:10px; text-align:left;">Cliente</th>
                            <th style="padding:10px; text-align:left;">Documento</th>
                            <th style="padding:10px; text-align:left;">Total</th>
                            <th style="padding:10px; text-align:left;">Items</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(s => `
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:10px;">${s.id}</td>
                                <td style="padding:10px;">${new Date(s.created_at).toLocaleDateString()}</td>
                                <td style="padding:10px;">${s.client_name || "Sin cliente"}</td>
                                <td style="padding:10px;">${s.client_document || "-"}</td>
                                <td style="padding:10px; font-weight:bold;">$${parseFloat(s.total).toLocaleString()}</td>
                                <td style="padding:10px;">
                                    <span style="background:#3498db; color:white; padding:3px 8px; border-radius:10px; font-size:12px;">
                                        ${s.items ? s.items.length : 0} productos
                                    </span>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        })
        .catch(err => {
            console.error(err);
            document.getElementById("salesList").innerHTML = "<p style='color:red'>Error cargando ventas</p>";
        });
}

async function generateSalesPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    try {
        const res = await fetch("/sales");
        const sales = await res.json();
        
        if (sales.length === 0) return alert("No hay ventas para exportar");
        
        const totalVentas = sales.reduce((sum, s) => sum + parseFloat(s.total || 0), 0);
        
        doc.setFontSize(18);
        doc.setTextColor(214, 51, 132);
        doc.text("Reporte de Ventas - Nail Salon", 14, 20);
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generado el: ${new Date().toLocaleString()}`, 14, 28);
        doc.text(`Total de ventas: $${totalVentas.toLocaleString()}`, 14, 34);
        doc.text(`Número de ventas: ${sales.length}`, 14, 40);
        
        const rows = sales.map(s => [
            s.id,
            new Date(s.created_at).toLocaleDateString(),
            s.client_name || "Sin cliente",
            s.client_document || "-",
            `$${parseFloat(s.total).toLocaleString()}`
        ]);
        
        doc.autoTable({
            startY: 50,
            head: [['#', 'Fecha', 'Cliente', 'Documento', 'Total']],
            body: rows,
            headStyles: { fillColor: [255, 105, 180] },
            styles: { fontSize: 9 }
        });
        
        doc.save("Reporte_Ventas_NailSalon.pdf");
        
    } catch (error) {
        alert("Error generando el PDF");
        console.error(error);
    }
}

// --- LÓGICA DE PRODUCTOS (INVENTARIO) ---
function loadProducts() {
    fetch("/products")
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById("productsList");
            
            if (!data || data.length === 0) {
                container.innerHTML = "<p style='color: #666;'>No hay productos en inventario</p>";
                return;
            }
            
            container.innerHTML = `
                <table style="width:100%; border-collapse: collapse; margin-top: 15px;">
                    <thead>
                        <tr style="background:#ffb3c1; color:white;">
                            <th style="padding:10px; text-align:left;">Producto</th>
                            <th style="padding:10px; text-align:left;">Categoría</th>
                            <th style="padding:10px; text-align:left;">Stock</th>
                            <th style="padding:10px; text-align:left;">Precio</th>
                            <th style="padding:10px; text-align:left;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(p => `
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:10px;">
                                    <strong>${p.name}</strong><br>
                                    <small style="color:#666;">${p.description || ""}</small>
                                </td>
                                <td style="padding:10px;">${p.category || "-"}</td>
                                <td style="padding:10px;">
                                    <span style="color: ${p.stock <= 5 ? '#e74c3c' : '#27ae60'}; font-weight:bold;">
                                        ${p.stock} ${p.unit}
                                    </span>
                                </td>
                                <td style="padding:10px;">$${parseFloat(p.price).toLocaleString()}</td>
                                <td style="padding:10px;">
                                    <button onclick="updateStock(${p.id}, ${p.stock}, 'add')" style="background:#27ae60; color:white; border:none; padding:5px 8px; border-radius:3px; cursor:pointer;">+</button>
                                    <button onclick="updateStock(${p.id}, ${p.stock}, 'subtract')" style="background:#e74c3c; color:white; border:none; padding:5px 8px; border-radius:3px; cursor:pointer;">-</button>
                                    <button onclick="editProduct(${p.id}, '${p.name}', '${p.category || ''}', ${p.stock}, ${p.price}, '${p.unit}', '${p.description || ''}')" style="background:#3498db; color:white; border:none; padding:5px 8px; border-radius:3px; cursor:pointer;">✏️</button>
                                    <button onclick="deleteProduct(${p.id})" style="background:#e74c3c; color:white; border:none; padding:5px 8px; border-radius:3px; cursor:pointer;">🗑️</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        })
        .catch(err => {
            console.error(err);
            document.getElementById("productsList").innerHTML = "<p style='color:red'>Error cargando inventario</p>";
        });
}

function createProduct() {
    const data = {
        name: document.getElementById("prodName").value,
        category: document.getElementById("prodCategory").value,
        unit: document.getElementById("prodUnit").value,
        price: document.getElementById("prodPrice").value,
        stock: document.getElementById("prodStock").value,
        description: document.getElementById("prodDesc").value
    };

    if (!data.name || !data.price || data.stock === "") {
        alert("Nombre, precio y stock son obligatorios");
        return;
    }

    fetch("/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(result => {
        alert("Producto agregado");
        document.getElementById("prodName").value = "";
        document.getElementById("prodCategory").value = "";
        document.getElementById("prodUnit").value = "";
        document.getElementById("prodPrice").value = "";
        document.getElementById("prodStock").value = "";
        document.getElementById("prodDesc").value = "";
        loadProducts();
    })
    .catch(err => alert("Error creando producto"));
}

function updateStock(id, currentStock, operation) {
    fetch(`/products/${id}/stock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: currentStock, operation })
    })
    .then(() => loadProducts())
    .catch(err => alert("Error actualizando stock"));
}

function editProduct(id, name, category, stock, price, unit, description) {
    const newName = prompt("Nombre:", name);
    if (newName === null) return;
    
    const newCategory = prompt("Categoría:", category);
    const newStock = prompt("Stock:", stock);
    const newPrice = prompt("Precio:", price);
    const newUnit = prompt("Unidad:", unit);
    const newDesc = prompt("Descripción:", description);

    fetch(`/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: newName,
            category: newCategory,
            stock: parseInt(newStock),
            price: parseFloat(newPrice),
            unit: newUnit,
            description: newDesc
        })
    })
    .then(() => loadProducts())
    .catch(err => alert("Error actualizando producto"));
}

function deleteProduct(id) {
    if (!confirm("¿Eliminar este producto?")) return;
    
    fetch(`/products/${id}`, { method: "DELETE" })
        .then(() => loadProducts())
        .catch(err => alert("Error eliminando producto"));
}

// --- LÓGICA DE CLIENTES ---
function loadClients() {
    fetch("/clients")
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById("clientsList");
            
            if (!data || data.length === 0) {
                container.innerHTML = "<p style='color: #666;'>No hay clientes registrados</p>";
                return;
            }
            
            container.innerHTML = `
                <table style="width:100%; border-collapse: collapse; margin-top: 15px;">
                    <thead>
                        <tr style="background:#ffb3c1; color:white;">
                            <th style="padding:10px; text-align:left;">Nombre</th>
                            <th style="padding:10px; text-align:left;">Documento</th>
                            <th style="padding:10px; text-align:left;">Contacto</th>
                            <th style="padding:10px; text-align:left;">RUT</th>
                            <th style="padding:10px; text-align:left;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(c => `
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:10px;">${c.name}</td>
                                <td style="padding:10px;">${c.document_type} ${c.document_number}</td>
                                <td style="padding:10px;">${c.email || "-"}<br>${c.phone || "-"}</td>
                                <td style="padding:10px;">
                                    ${c.rut_pdf ? '<span style="color: #27ae60;">✓ Adjunto</span>' : '<span style="color: #999;">Sin archivo</span>'}
                                </td>
                                <td style="padding:10px;">
                                    ${c.rut_pdf ? `<a href="/clients/${c.id}/rut" target="_blank" style="background:#3498db; color:white; padding:5px 10px; border-radius:5px; text-decoration:none; margin-right:5px;">Ver RUT</a>` : ''}
                                    <button onclick="deleteClient(${c.id})" style="background:#e74c3c; color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer;">Eliminar</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        })
        .catch(err => {
            console.error(err);
            document.getElementById("clientsList").innerHTML = "<p style='color:red'>Error cargando clientes</p>";
        });
}

function deleteClient(id) {
    if (!confirm("¿Eliminar este cliente?")) return;
    
    fetch(`/clients/${id}`, { method: "DELETE" })
        .then(() => loadClients())
        .catch(err => alert("Error eliminando cliente"));
}

// --- LÓGICA DE USUARIOS ---
function loadUsers() {
    const user = JSON.parse(localStorage.getItem("user"));
    
    fetch(`/auth/users?adminEmail=${encodeURIComponent(user.email)}`)
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById("usersList");
            if (data.error) {
                container.innerHTML = `<p style="color:red">${data.error}</p>`;
                return;
            }
            container.innerHTML = `
                <table style="width:100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background:#ffb3c1; color:white;">
                            <th style="padding:10px; text-align:left;">Nombre</th>
                            <th style="padding:10px; text-align:left;">Email</th>
                            <th style="padding:10px; text-align:left;">Rol</th>
                            <th style="padding:10px; text-align:left;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(u => `
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:10px;">${u.name}</td>
                                <td style="padding:10px;">${u.email}</td>
                                <td style="padding:10px;">
                                    <span style="background:${u.role === 'admin' ? '#d63384' : '#6c757d'}; color:white; padding:3px 8px; border-radius:10px; font-size:12px;">
                                        ${u.role}
                                    </span>
                                </td>
                                <td style="padding:10px;">
                                    ${u.email !== user.email ? `
                                        <button onclick="deleteUser(${u.id})" style="background:#e74c3c; color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer;">Eliminar</button>
                                    ` : '<span style="color:#999;">(tú)</span>'}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        })
        .catch(err => {
            console.error(err);
            document.getElementById("usersList").innerHTML = "<p style='color:red'>Error cargando usuarios</p>";
        });
}

function createUser() {
    const user = JSON.parse(localStorage.getItem("user"));
    const name = document.getElementById("newUserName").value;
    const email = document.getElementById("newUserEmail").value;
    const password = document.getElementById("newUserPassword").value;
    const role = document.getElementById("newUserRole").value;

    if (!name || !email || !password) {
        alert("Todos los campos son obligatorios");
        return;
    }

    fetch("/auth/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, adminEmail: user.email })
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            alert("Usuario creado exitosamente");
            document.getElementById("newUserName").value = "";
            document.getElementById("newUserEmail").value = "";
            document.getElementById("newUserPassword").value = "";
            loadUsers();
        }
    })
    .catch(err => alert("Error creando usuario"));
}

function deleteUser(id) {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!confirm("¿Estás seguro de eliminar este usuario?")) return;

    fetch(`/auth/users/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminEmail: user.email })
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            loadUsers();
        }
    })
    .catch(err => alert("Error eliminando usuario"));
}

// --- LÓGICA DE SERVICIOS (PostgreSQL) ---
function loadServices() {
    fetch("/services")
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById("services");
            container.innerHTML = "";
            data.forEach(s => {
                container.innerHTML += `
                    <div class="item-service">
                        <span><strong>${s.title}</strong> - $${s.price}</span>
                        <button onclick="deleteService(${s.id})" style="color:red; background:none; border:none; cursor:pointer; font-weight:bold;">Eliminar</button>
                    </div>`;
            });
        });
}

function createService() {
    const user = JSON.parse(localStorage.getItem("user"));
    const title = document.getElementById("title").value;
    const price = document.getElementById("price").value;
    const image = document.getElementById("image").value;

    fetch("/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, price, image, role: user.role })
    }).then(() => {
        alert("Servicio creado");
        location.reload();
    });
}

function deleteService(id) {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!confirm("¿Eliminar este servicio?")) return;
    fetch(`/services/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: user.role })
    }).then(() => loadServices());
}

// --- LÓGICA DE PQRS (MongoDB) ---
function loadPQRS() {
    const container = document.getElementById("pqrsList");

    fetch("/api/pqrs")
        .then(res => res.json())
        .then(data => {
            container.innerHTML = "";
            if (data.length === 0) {
                container.innerHTML = "<p>No hay mensajes en el buzón.</p>";
                return;
            }

            data.forEach(item => {
                // Definir color según el estado
                let colorBadge = "#f39c12"; // Naranja (Pendiente)
                if (item.estado === "completada") colorBadge = "#27ae60"; // Verde
                if (item.estado === "cancelada") colorBadge = "#e74c3c"; // Rojo

                container.innerHTML += `
                    <div class="pqrs-box">
                        <div class="pqrs-header">
                            <span class="badge" style="background: ${colorBadge}">${item.estado.toUpperCase()}</span>
                            <span>${new Date(item.fecha).toLocaleString()}</span>
                        </div>
                        <p style="margin: 5px 0;"><strong>${item.nombre}</strong> (${item.email})</p>
                        <p style="font-style: italic; color: #444;">"${item.mensaje}"</p>
                        
                        <div style="margin-top: 10px; display: flex; gap: 10px;">
                            <button onclick="updateStatus('${item._id}', 'completada')" 
                                style="background:#27ae60; color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer; font-size:12px;">
                                ✅ Completar
                            </button>
                            <button onclick="updateStatus('${item._id}', 'cancelada')" 
                                style="background:#e74c3c; color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer; font-size:12px;">
                                ❌ Cancelar
                            </button>
                        </div>
                    </div>`;
            });
        })
        .catch(err => {
            console.error("Error cargando PQRS:", err);
            container.innerHTML = "<p style='color:red;'>Error al conectar con MongoDB.</p>";
        });
}

// Función para actualizar el estado en MongoDB
function updateStatus(id, nuevoEstado) {
    fetch(`/api/pqrs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado })
    })
    .then(res => {
        if (!res.ok) throw new Error("Error al actualizar");
        loadPQRS(); // Recargar la lista para ver los cambios
    })
    .catch(err => alert("Error: " + err.message));
}

// --- GENERAR REPORTE PDF ---
async function generarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    try {
        const response = await fetch("/api/pqrs");
        const data = await response.json();

        if (data.length === 0) return alert("No hay datos para exportar.");

        doc.setFontSize(18);
        doc.setTextColor(214, 51, 132); 
        doc.text("Reporte de PQRS Recibidas", 14, 20);
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generado el: ${new Date().toLocaleString()}`, 14, 28);

        const rows = data.map(item => [
            new Date(item.fecha).toLocaleDateString(),
            item.tipo.toUpperCase(),
            item.nombre,
            item.mensaje,
            item.estado.toUpperCase()
        ]);

        doc.autoTable({
            startY: 35,
            head: [['Fecha', 'Tipo', 'Cliente', 'Mensaje', 'Estado']],
            body: rows,
            headStyles: { fillColor: [255, 105, 180] }, 
            styles: { fontSize: 8, overflow: 'linebreak' },
            columnStyles: { 3: { cellWidth: 80 } } 
        });

        doc.save("Reporte_NailsBar_PQRS.pdf");

    } catch (error) {
        alert("Error generando el PDF");
        console.error(error);
    }
}