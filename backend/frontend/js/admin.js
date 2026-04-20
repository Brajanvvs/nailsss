document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("user"));
    
    // Seguridad: Solo admin entra
    if (!user || user.role !== "admin") {
        alert("Acceso no autorizado");
        window.location.href = "login.html";
        return;
    }

    loadServices(); // Carga Servicios de Postgres
    loadPQRS();     // Carga PQRS de Mongo
});

// --- FUNCIONES PARA SERVICIOS (PostgreSQL) ---

function loadServices() {
    fetch("/services")
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById("services");
            container.innerHTML = "";
            data.forEach(s => {
                container.innerHTML += `
                    <div style="display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid #eee;">
                        <span><strong>${s.title}</strong> - $${s.price}</span>
                        <button onclick="deleteService(${s.id})" style="color:red; cursor:pointer; background:none; border:none;">[Eliminar]</button>
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
        alert("Servicio Creado");
        loadServices();
    });
}

function deleteService(id) {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!confirm("¿Eliminar?")) return;
    fetch(`/services/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: user.role })
    }).then(() => loadServices());
}

// --- FUNCIÓN CRÍTICA: VER PQRS (MongoDB) ---

function loadPQRS() {
    const container = document.getElementById("pqrsList");

    fetch("/api/pqrs") // Ruta que definimos en server.js y routes/pqrs.js
        .then(res => res.json())
        .then(data => {
            container.innerHTML = ""; // Limpiar el "Cargando..."

            if (data.length === 0) {
                container.innerHTML = "<p>No hay mensajes en el buzón actualmente.</p>";
                return;
            }

            data.forEach(item => {
                const fecha = new Date(item.fecha).toLocaleString();
                container.innerHTML += `
                    <div class="pqrs-card">
                        <div class="pqrs-header">
                            <span class="pqrs-type">${item.tipo.toUpperCase()}</span>
                            <span class="pqrs-date">${fecha}</span>
                        </div>
                        <strong>De: ${item.nombre}</strong>
                        <div class="pqrs-msg">"${item.mensaje}"</div>
                        <div class="pqrs-footer">
                            Email de contacto: <strong>${item.email}</strong> | Estado: <strong>${item.estado}</strong>
                        </div>
                    </div>`;
            });
        })
        .catch(err => {
            console.error("Error cargando PQRS:", err);
            container.innerHTML = "<p style='color:red;'>Error al conectar con MongoDB.</p>";
        });
}