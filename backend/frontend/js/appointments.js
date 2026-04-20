const container = document.getElementById("appointments");

function cargarCitas() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !container) return; // Si no hay usuario o contenedor, no hace nada

    let url = (user.role === "admin") ? "/appointments" : `/appointments/user/${user.id}`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            container.innerHTML = ""; // Limpiar lista de citas

            // 1. Limpiar visualmente el calendario
            document.querySelectorAll('#calendar td[data-day]').forEach(td => {
                td.innerHTML = "";
                td.style.backgroundColor = "";
                td.style.pointerEvents = "auto";
            });

            if (data.length === 0) {
                container.innerHTML = "<p>No tienes citas agendadas</p>";
                return;
            }

            data.forEach(app => {
                if (app.status === "active") {
                    // Normalización para marcar el calendario
                    const diaDB = app.day.trim().toLowerCase();
                    const horaDB = app.time.trim().toLowerCase();

                    const celdas = document.querySelectorAll('#calendar td[data-day]');
                    celdas.forEach(celda => {
                        const diaHTML = celda.getAttribute('data-day').trim().toLowerCase();
                        const horaHTML = celda.getAttribute('data-time').trim().toLowerCase();

                        if (diaHTML === diaDB && horaHTML === horaDB) {
                            celda.innerHTML = "❌";
                            celda.style.backgroundColor = "#ffb3c1";
                            celda.style.pointerEvents = "none";
                        }
                    });

                    // 2. Mostrar la lista debajo
                    container.innerHTML += `
                        <div class="appointment" style="border:1px solid #ccc; margin:10px; padding:10px;">
                            <h3>${app.title || "Servicio"}</h3>
                            <p>${app.day} - ${app.time}</p>
                            <p>Usuario: ${app.name || "N/A"}</p>
                            <button onclick="cancel(${app.id})">Cancelar</button>
                        </div>
                    `;
                }
            });
        })
        .catch(err => console.error("Error cargando citas:", err));
}

document.addEventListener('DOMContentLoaded', () => {
    cargarCitas();

    const celdas = document.querySelectorAll('#calendar td[data-day]');
    celdas.forEach(celda => {
        celda.addEventListener('click', () => {
            const day = celda.getAttribute('data-day');
            const time = celda.getAttribute('data-time');
            const selectedService = document.getElementById("selectedServiceText").innerText;
            const user = JSON.parse(localStorage.getItem("user"));

            if (!selectedService || selectedService.trim() === "") {
                alert("Selecciona un servicio primero");
                return;
            }

            fetch("/appointments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: selectedService,
                    day: day,
                    time: time,
                    userId: user.id,
                    name: user.name,
                    status: "active"
                })
            })
            .then(res => {
                if (res.ok) {
                    alert("¡Cita agendada!");
                    location.reload();
                } else {
                    alert("Error: Este horario ya está ocupado");
                }
            });
        });
    });
});

window.cancel = function(id) {
    if (!confirm("¿Deseas cancelar?")) return;
    fetch(`/appointments/${id}`, { method: "DELETE" })
        .then(() => location.reload());
};