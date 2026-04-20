// --- CARGA INICIAL ---
document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("user"));
    
    if (!user || user.role !== "admin") {
        alert("Acceso denegado. Se requiere perfil de administrador.");
        window.location.href = "login.html";
        return;
    }

    loadServices(); // Carga datos de Postgres
    loadPQRS();     // Carga datos de Mongo
});

/* ==========================================
   GESTIÓN DE SERVICIOS (POSTGRESQL)
   ========================================== */

function loadServices() {
    fetch("/services")
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById("services");
            container.innerHTML = "";

            data.forEach(service => {
                container.innerHTML += `
                <div style="border: 1px solid #ccc; padding: 10px; margin-bottom: 5px; display: flex; justify-content: space-between;">
                    <div>
                        <strong>${service.title}</strong> - $${service.price}
                    </div>
                    <button onclick="deleteService(${service.id})" style="background: red; color: white;">Eliminar</button>
                </div>`;
            });
        });
}

function createService() {
    const user = JSON.parse(localStorage.getItem("user"));
    const title = document.getElementById("title").value;
    const price = document.getElementById("price").value;
    const image = document.getElementById("image").value;

    if (!title || !price) return alert("Completa los campos básicos");

    fetch("/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, price, image, role: user.role })
    })
    .then(res => res.json())
    .then(() => {
        alert("Servicio creado con éxito");
        loadServices();
        // Limpiar campos
        document.getElementById("title").value = "";
        document.getElementById("price").value = "";
    });
}

function deleteService(id) {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!confirm("¿Eliminar este servicio?")) return;

    fetch(`/services/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: user.role })
    })
    .then(() => {
        alert("Servicio eliminado");
        loadServices();
    });
}

/* ==========================================
   GESTIÓN DE PQRS (MONGODB)
   ========================================== */

function loadPQRS() {
    const container = document.getElementById("pqrsList");

    fetch("/api/pqrs")
        .then(res => res.json())
        .then(data => {
            container.innerHTML = "";

            if (data.length === 0) {
                container.innerHTML = "<p>No hay mensajes registrados.</p>";
                return;
            }

            data.forEach(item => {
                container.innerHTML += `
                <div style="border-left: 5px solid #ffb3c1; background: #fff5f7; padding: 15px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <div style="display: flex; justify-content: space-between;">
                        <strong>${item.tipo.toUpperCase()}</strong>
                        <small>${new Date(item.fecha).toLocaleString()}</small>
                    </div>
                    <p style="margin: 10px 0;">"${item.mensaje}"</p>
                    <div style="font-size: 0.9em; color: #555;">
                        Enviado por: <strong>${item.nombre}</strong> (${item.email})
                    </div>
                    <div style="margin-top: 10px;">
                        <span style="color: ${item.estado === 'pendiente' ? 'orange' : 'green'}; font-weight: bold;">
                            Estado: ${item.estado}
                        </span>
                    </div>
                </div>`;
            });
        })
        .catch(err => {
            console.error("Error en Mongo:", err);
            container.innerHTML = "<p>Error al cargar el buzón de MongoDB.</p>";
        });
}