document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("user"));
    
    // Verificamos que sea administrador
    if (!user || user.role !== "admin") {
        alert("No tienes permiso para estar aquí");
        window.location.href = "login.html";
        return;
    }

    loadServices(); // Trae servicios de Postgres
    loadPQRS();     // Trae mensajes de MongoDB
});

// --- FUNCIONES DE SERVICIOS (PostgreSQL) ---
function loadServices() {
    fetch("/services")
    .then(res => res.json())
    .then(data => {
        const container = document.getElementById("services");
        container.innerHTML = "";
        data.forEach(s => {
            container.innerHTML += `
                <div class="item-service">
                    <span>${s.title} - $${s.price}</span>
                    <button onclick="deleteService(${s.id})" style="color:red; background:none; border:none; cursor:pointer;">[Eliminar]</button>
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
        loadServices();
    });
}

function deleteService(id) {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!confirm("¿Borrar servicio?")) return;
    fetch(`/services/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: user.role })
    }).then(() => loadServices());
}

// --- 🔥 FUNCIÓN PARA VER LAS PQRS DE MONGO 🔥 ---
function loadPQRS() {
    const container = document.getElementById("pqrsList");

    fetch("/api/pqrs") // Esta ruta consulta a MongoDB
    .then(res => res.json())
    .then(data => {
        container.innerHTML = ""; // Quitamos el "Cargando..."

        if (data.length === 0) {
            container.innerHTML = "<p>No hay mensajes en el buzón.</p>";
            return;
        }

        data.forEach(item => {
            // Usamos los nombres de tu esquema: nombre, tipo, mensaje, fecha
            container.innerHTML += `
                <div class="pqrs-box">
                    <div class="pqrs-header">
                        <span class="badge">${item.tipo.toUpperCase()}</span>
                        <span>${new Date(item.fecha).toLocaleString()}</span>
                    </div>
                    <p style="margin: 10px 0;"><strong>${item.nombre}</strong> (${item.email}) dice:</p>
                    <p><em>"${item.mensaje}"</em></p>
                    <div style="font-size: 0.8em; color: #666; text-align: right;">
                        Estado: <strong>${item.estado}</strong>
                    </div>
                </div>`;
        });
    })
    .catch(err => {
        console.error("Error cargando Mongo:", err);
        container.innerHTML = "<p style='color:red;'>Error al conectar con MongoDB.</p>";
    });
}