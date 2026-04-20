document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("user"));
    
    if (!user || user.role !== "admin") {
        alert("Acceso denegado");
        window.location.href = "login.html";
        return;
    }

    loadServices();
    loadPQRS();
});

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