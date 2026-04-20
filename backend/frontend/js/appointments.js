const container = document.getElementById("appointments");

// Función principal para cargar citas y marcar el calendario
function cargarCitas() {
    const user = JSON.parse(localStorage.getItem("user"));

    // 🔐 validar sesión
    if (!user) {
        alert("Debe iniciar sesión");
        window.location.href = "login.html";
        return;
    }

    let url = (user.role === "admin") ? "/appointments" : `/appointments/user/${user.id}`;

    // 📥 cargar citas
    fetch(url)
        .then(res => res.json())
        .then(data => {
            container.innerHTML = "";

            if (!data || data.length === 0) {
                container.innerHTML = "<p>No tienes citas</p>";
                return;
            }

            // 1. Limpiar el calendario antes de marcar (opcional pero recomendado)
            document.querySelectorAll('#calendar td[data-day]').forEach(td => {
                td.innerHTML = "";
                td.style.backgroundColor = "";
                td.style.pointerEvents = "auto";
            });

            data.forEach(app => {
                // --- ❌ LÓGICA PARA MARCAR EL CALENDARIO ---
                if (app.status === "active") {
                    // Normalización extrema: quitamos espacios, minúsculas y el "0" inicial de la hora
                    const diaDB = app.day.trim().toLowerCase();
                    const horaDB = app.time.trim().toLowerCase().replace(/^0/, '');

                    const todasLasCeldas = document.querySelectorAll('#calendar td[data-day]');
                    
                    todasLasCeldas.forEach(celda => {
                        const diaHTML = (celda.getAttribute('data-day') || "").trim().toLowerCase();
                        const horaHTML = (celda.getAttribute('data-time') || "").trim().toLowerCase().replace(/^0/, '');

                        if (diaHTML === diaDB && horaHTML === horaDB) {
                            celda.innerHTML = "❌";
                            celda.style.backgroundColor = "#ffb3c1";
                            celda.style.pointerEvents = "none"; // Bloquea el clic para evitar error 400
                            console.log(`Marcada celda ocupada: ${diaDB} ${horaDB}`);
                        }
                    });
                }

                // --- 📋 MOSTRAR LISTA DE CITAS ABAJO ---
                container.innerHTML += `
                    <div class="appointment">
                        <h3>${app.title || "Servicio"}</h3>
                        <p>${app.day} - ${app.time}</p>
                        <p>Usuario: ${app.name || "N/A"}</p>
                        ${app.status === "active"
                            ? `<button onclick="cancel(${app.id})">Cancelar</button>`
                            : `<p style="color:red;">Cancelada</p>`
                        }
                    </div>
                `;
            });
        })
        .catch(err => {
            console.error("Error cargando citas:", err);
            container.innerHTML = "<p>Error cargando citas</p>";
        });
}

// --- 🖱️ EVENTO PARA AGENDAR HACIENDO CLICK EN EL CALENDARIO ---
document.addEventListener('DOMContentLoaded', () => {
    // Ejecutar la carga inicial de citas
    cargarCitas();

    const celdas = document.querySelectorAll('#calendar td[data-day]');
    const user = JSON.parse(localStorage.getItem("user"));

    celdas.forEach(celda => {
        celda.addEventListener('click', () => {
            const day = celda.getAttribute('data-day');
            const time = celda.getAttribute('data-time');
            const selectedService = document.getElementById("selectedServiceText").innerText;

            if (!selectedService || selectedService.trim() === "") {
                alert("Por favor, selecciona primero un servicio.");
                return;
            }

            // ENVIAR POST
            fetch("/appointments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: selectedService,
                    day: day,
                    time: time,
                    userId: user.id,
                    name: user.name || "Cliente",
                    status: "active"
                })
            })
            .then(res => {
                if (res.ok) {
                    alert("✅ ¡Cita agendada!");
                    location.reload();
                } else {
                    // Si el servidor responde 400, informamos al usuario
                    alert("❌ Error: Este horario ya está ocupado o los datos son inválidos.");
                }
            })
            .catch(err => {
                console.error("Error al agendar:", err);
                alert("Ocurrió un error al conectar con el servidor.");
            });
        });
    });
});

/* =========================
   CANCELAR CITA
   ========================= */
function cancel(id) {
    if (!confirm("¿Seguro que desea cancelar la cita?")) return;

    fetch(`/appointments/${id}`, {
        method: "DELETE"
    })
    .then(res => {
        if (res.ok) {
            alert("✅ Cita cancelada");
            location.reload(); // Recarga simple para actualizar todo
        } else {
            alert("No se pudo cancelar la cita");
        }
    })
    .catch(err => {
        console.error("Error cancelando cita:", err);
        alert("Error al procesar la cancelación");
    });
}