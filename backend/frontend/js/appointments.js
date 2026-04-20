const container = document.getElementById("appointments");

function cargarCitas() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !container) return;

    const url = (user.role === "admin") ? "/appointments" : `/appointments/user/${user.id}`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            container.innerHTML = "";
            
            // 1. Limpiar el calendario (quitar X viejas)
            document.querySelectorAll('#calendar td[data-day]').forEach(td => {
                td.innerHTML = "";
                td.style.backgroundColor = "";
                td.style.pointerEvents = "auto";
            });

            data.forEach(app => {
                if (app.status === "active") {
                    // NORMALIZACIÓN: Pasamos a minúsculas, quitamos espacios y quitamos el "0" inicial de la hora
                    const diaDB = app.day.trim().toLowerCase();
                    const horaDB = app.time.trim().toLowerCase().replace(/^0/, '');

                    const celdas = document.querySelectorAll('#calendar td[data-day]');
                    celdas.forEach(celda => {
                        const diaHTML = celda.getAttribute('data-day').trim().toLowerCase();
                        const horaHTML = celda.getAttribute('data-time').trim().toLowerCase().replace(/^0/, '');

                        // Si coinciden tras la limpieza, marcamos con X
                        if (diaHTML === diaDB && horaHTML === horaDB) {
                            celda.innerHTML = "❌";
                            celda.style.backgroundColor = "#ffb3c1";
                            celda.style.pointerEvents = "none"; // BLOQUEA el clic para evitar el Error 400
                        }
                    });
                }

                // Lista de citas debajo
                container.innerHTML += `
                    <div class="appointment" style="border:1px solid #eee; padding:10px; margin-bottom:10px;">
                        <h3>${app.title}</h3>
                        <p>${app.day} - ${app.time}</p>
                        <button onclick="cancel(${app.id})">Cancelar</button>
                    </div>`;
            });
        })
        .catch(err => console.error("Error:", err));
}

document.addEventListener('DOMContentLoaded', () => {
    cargarCitas();

    const celdas = document.querySelectorAll('#calendar td[data-day]');
    celdas.forEach(celda => {
        celda.addEventListener('click', () => {
            const day = celda.getAttribute('data-day');
            const time = celda.getAttribute('data-time');
            const service = document.getElementById("selectedServiceText").innerText;
            const user = JSON.parse(localStorage.getItem("user"));

            if (!service) return alert("Selecciona un servicio");

            fetch("/appointments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: service,
                    day: day,
                    time: time,
                    userId: user.id,
                    name: user.name,
                    status: "active"
                })
            })
            .then(res => {
                if (res.ok) {
                    alert("Cita agendada");
                    location.reload();
                } else {
                    alert("El servidor dice que este horario ya está ocupado.");
                }
            });
        });
    });
});

window.cancel = function(id) {
    if (confirm("¿Cancelar?")) {
        fetch(`/appointments/${id}`, { method: "DELETE" }).then(() => location.reload());
    }
};