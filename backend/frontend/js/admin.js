document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("user"));
    
    if (!user || user.role !== "admin") {
        alert("No autorizado");
        window.location.href = "login.html";
        return;
    }

    loadServices(); // Carga de Postgres
    loadPQRS();     // Carga de MongoDB
});

// --- SERVICIOS (PostgreSQL) ---
function loadServices() {
    fetch("/services")
    .then(res => res.json())
    .then(data => {
        const container = document.getElementById("services");
        container.innerHTML = "";
        data.forEach(s => {
            container.innerHTML += `
                <div style="border-bottom:1px solid #eee; padding:10px; display:flex; justify-content:space-between;">
                    <span>${s.title} - $${s.price}</span>
                    <button onclick="deleteService(${s.id})" style="color:red; cursor:pointer;">Eliminar</button>
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
    fetch(`/services/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: user.role })
    }).then(() => loadServices());
}

// --- 🔥 FUNCIÓN PARA VER LAS PQRS (MongoDB) 🔥 ---
function loadPQRS() {
    const container = document.getElementById("pqrsList");

    fetch("/api/pqrs")
    .then(res => res.json())
    .then(data => {
        container.innerHTML = ""; // Limpiar el "Cargando..."

        if (data.length === 0) {
            container.innerHTML = "<p>No hay PQRS registradas.</p>";
            return;
        }

        data.forEach(item => {
            container.innerHTML += `
                <div class="pqrs-item">
                    <div class="pqrs-meta">
                        <span class="pqrs-type">${item.tipo.toUpperCase()}</span>
                        <span>${new Date(item.fecha).toLocaleString()}</span>
                    </div>
                    <p style="margin: 10px 0;"><strong>${item.nombre}:</strong> "${item.mensaje}"</p>
                    <div style="font-size: 0.9em; color: #666;">
                        Email: ${item.email} | Estado: <strong>${item.estado}</strong>
                    </div>
                </div>`;
        });
    })
    .catch(err => {
        console.error("Error cargando PQRS:", err);
        container.innerHTML = "<p style='color:red;'>Error al conectar con MongoDB.</p>";
    });
}