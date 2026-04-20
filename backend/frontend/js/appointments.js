document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById("appointments");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        console.warn("No hay usuario en localStorage");
        return;
    }

    // --- FUNCIÓN PARA CARGAR Y MARCAR ---
    function cargarCitas() {
        const url = (user.role === "admin") ? "/appointments" : `/appointments/user/${user.id}`;
        
        fetch(url)
            .then(res => res.json())
            .then(data => {
                console.log("Citas recibidas de DB:", data);
                if (container) container.innerHTML = "";

                // Limpiar celdas antes de marcar
                const todasLasCeldas = document.querySelectorAll('#calendar td[data-day]');
                todasLasCeldas.forEach(td => {
                    td.innerHTML = "";
                    td.style.backgroundColor = "";
                    td.style.pointerEvents = "auto";
                });

                data.forEach(app => {
                    if (app.status === "active") {
                        // NORMALIZACIÓN TOTAL
                        const diaDB = app.day.trim().toLowerCase();
                        const horaDB = app.time.trim().toLowerCase().replace(/^0/, '');

                        todasLasCeldas.forEach(celda => {
                            const diaHTML = celda.getAttribute('data-day').trim().toLowerCase();
                            const horaHTML = celda.getAttribute('data-time').trim().toLowerCase().replace(/^0/, '');

                            if (diaHTML === diaDB && horaHTML === horaDB) {
                                celda.innerHTML = "❌";
                                celda.style.backgroundColor = "#ffb3c1";
                                celda.style.pointerEvents = "none";
                                console.log(`✅ Marcada: ${diaDB} ${horaDB}`);
                            }
                        });
                    }

                    // Lista de texto abajo
                    if (container) {
                        container.innerHTML += `
                            <div class="appointment" style="border:1px solid #ddd; padding:10px; margin:5px;">
                                <strong>${app.title}</strong> - ${app.day} a las ${app.time}
                                <button onclick="cancelarCita(${app.id})">Cancelar</button>
                            </div>`;
                    }
                });
            })
            .catch(err => console.error("Error cargando citas:", err));
    }

    // --- EVENTO PARA CREAR CITA ---
    const celdas = document.querySelectorAll('#calendar td[data-day]');
    celdas.forEach(celda => {
        celda.addEventListener('click', () => {
            const day = celda.getAttribute('data-day');
            const time = celda.getAttribute('data-time');
            const service = document.getElementById("selectedServiceText").innerText;

            if (!service || service.includes("selecciona") || service === "") {
                alert("Primero selecciona un servicio arriba");
                return;
            }

            fetch("/appointments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: service.replace("Servicio seleccionado: ", ""),
                    day: day,
                    time: time,
                    userId: user.id,
                    name: user.name,
                    status: "active"
                })
            })
            .then(res => {
                if (res.ok) {
                    alert("¡Agendado!");
                    cargarCitas(); // Recarga sin refrescar página completa
                } else {
                    alert("Error 400: El servidor dice que ya está ocupado.");
                }
            });
        });
    });

    // Carga inicial
    cargarCitas();
});

// Función cancelar (Fuera para que el onclick del HTML la vea)
window.cancelarCita = function(id) {
    if (!confirm("¿Seguro que desea eliminar esta cita?")) return;

    fetch(`/appointments/${id}`, {
        method: "DELETE"
    })
    .then(res => {
        if (res.ok) {
            alert("✅ Cita eliminada");
            location.reload(); // Forzamos la recarga para limpiar la lista
        } else {
            alert("❌ No se pudo borrar. Es posible que la cita ya no exista.");
            location.reload();
        }
    })
    .catch(err => {
        console.error("Error:", err);
        alert("Error de conexión al borrar");
    });
};