const container = document.getElementById("appointments");

if (container) {

  const user = JSON.parse(localStorage.getItem("user"));

  // 🔐 validar sesión
  if (!user) {
    alert("Debe iniciar sesión");
    window.location.href = "login.html";
  }

  let url = "";

  // 👑 admin ve todo
  if (user.role === "admin") {
    url = "/appointments";
  } else {
    url = `/appointments/user/${user.id}`;
  }



/* ==========================================
   GESTIÓN DE CITAS (CARGAR Y CREAR)
   ========================================== */

function initAppointments() {
    const url = "https://nailsss-production.up.railway.app/appointments";
    const container = document.getElementById("services"); // Donde se listan las citas abajo

    // 1. CARGAR CITAS Y MARCAR EL CALENDARIO
    fetch(url)
        .then(res => res.json())
        .then(data => {
            container.innerHTML = "";

            if (data.length === 0) {
                container.innerHTML = "<p>No tienes citas agendadas</p>";
            }

            data.forEach(app => {
                // --- Bloquear celda en el calendario ---
                if (app.status === "active") {
                    const busyCell = document.querySelector(`td[data-day="${app.day}"][data-time="${app.time}"]`);
                    if (busyCell) {
                        busyCell.innerHTML = "❌"; 
                        busyCell.classList.add("busy"); // Puedes darle estilo CSS
                        busyCell.style.backgroundColor = "#ffb3c1";
                        busyCell.style.pointerEvents = "none"; // Evita clics en celdas ocupadas
                    }
                }

                // --- Dibujar lista de citas abajo ---
                container.innerHTML += `
                    <div class="appointment">
                        <h3>${app.title || "Servicio"}</h3>
                        <p>${app.day} - ${app.time}</p>
                        <p>Usuario: ${app.name || "N/A"}</p>
                        ${
                            app.status === "active"
                            ? `<button onclick="cancel(${app.id})">Cancelar</button>`
                            : `<p style="color:red;">Cancelada</p>`
                        }
                    </div>
                `;
            });
        })
        .catch(err => {
            console.error("Error cargando citas:", err);
            container.innerHTML = "<p>Error al conectar con el servidor</p>";
        });
}

// 2. ESCUCHAR CLICS PARA CREAR CITAS
document.addEventListener('DOMContentLoaded', () => {
    // Inicializamos la carga de datos
    initAppointments();

    const tableCells = document.querySelectorAll('#calendar td[data-day]');

    tableCells.forEach(cell => {
        cell.addEventListener('click', () => {
            const day = cell.getAttribute('data-day');
            const time = cell.getAttribute('data-time');
            
            // Validar que haya un servicio seleccionado
            const selectedService = document.getElementById("selectedServiceText").innerText;

            if (!selectedService || selectedService.trim() === "") {
                alert("⚠️ Por favor, selecciona primero un servicio arriba.");
                return;
            }

            // Confirmación antes de enviar
            if(!confirm(`¿Agendar ${selectedService} para el ${day} a las ${time}?`)) return;

            // ENVIAR POST AL SERVIDOR
            fetch("https://nailsss-production.up.railway.app/appointments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title: selectedService,
                    day: day,
                    time: time,
                    name: "Cliente Prueba", // Cambiar por el nombre real si tienes login
                    status: "active"
                })
            })
            .then(async res => {
                const responseData = await res.json();
                
                if (res.ok) {
                    alert("✅ ¡Cita agendada con éxito!");
                    location.reload(); 
                } else {
                    // Aquí manejamos el error 400 detallado
                    throw new Error(responseData.message || "Error al agendar: Horario no disponible");
                }
            })
            .catch(err => {
                alert("❌ " + err.message);
                console.error("Error en la petición:", err);
            });
        });
    });
});

/* Función para cancelar (debes tenerla definida) */
function cancel(id) {
    if(confirm("¿Seguro que quieres cancelar esta cita?")) {
        fetch(`https://nailsss-production.up.railway.app/appointments/${id}`, {
            method: "DELETE" // O PATCH según tu API
        }).then(() => location.reload());
    }
}




/* =========================
CANCELAR CITA
========================= */
function cancel(id) {

  if (!confirm("¿Seguro que desea cancelar la cita?")) return;

  fetch(`/appointments/${id}`, {
    method: "DELETE"
  })
    .then(res => res.json())
    .then(data => {

      alert("✅ Cita cancelada");

      // 🔥 recargar para actualizar calendario
      window.location.href = "index.html";

    })
    .catch(err => {
      console.error("Error cancelando cita:", err);
      alert("Error cancelando cita");
    });

}