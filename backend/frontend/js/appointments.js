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
   GESTIÓN DE CITAS COMPLETA
   ========================================== */

function cargarCitas() {
  const url = "https://nailsss-production.up.railway.app/appointments";
  const container = document.getElementById("services");

  fetch(url)
    .then(res => res.json())
    .then(data => {
      container.innerHTML = "";

      if (data.length === 0) {
        container.innerHTML = "<p>No tienes citas</p>";
        return;
      }

      data.forEach(app => {
        // --- 1. MARCAR EL CALENDARIO (La parte que faltaba) ---
        // Usamos trim() para que "Lunes " sea igual a "Lunes"
        if (app.status === "active") {
          const dia = app.day.trim();
          const hora = app.time.trim();
          
          // Buscamos la celda exacta
          const celdaOcupada = document.querySelector(`td[data-day="${dia}"][data-time="${hora}"]`);
          
          if (celdaOcupada) {
            celdaOcupada.innerHTML = "❌";
            celdaOcupada.style.backgroundColor = "#ffb3c1";
            celdaOcupada.style.pointerEvents = "none"; // Bloquea el clic
          }
        }

        // --- 2. MOSTRAR LA LISTA (Tu código original restaurado) ---
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
      container.innerHTML = "<p>Error cargando citas</p>";
    });
}

/* ==========================================
   EVENTO PARA CREAR CITA AL HACER CLIC
   ========================================== */
document.addEventListener('DOMContentLoaded', () => {
  // Ejecutar la carga inicial
  cargarCitas();

  const celdas = document.querySelectorAll('#calendar td[data-day]');

  celdas.forEach(celda => {
    celda.addEventListener('click', () => {
      const day = celda.getAttribute('data-day');
      const time = celda.getAttribute('data-time');
      const selectedService = document.getElementById("selectedServiceText").innerText;

      if (!selectedService || selectedService.trim() === "") {
        alert("Selecciona un servicio primero");
        return;
      }

      fetch("https://nailsss-production.up.railway.app/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: selectedService,
          day: day,
          time: time,
          name: "Cliente Prueba",
          status: "active"
        })
      })
      .then(res => {
        if (res.ok) {
          alert("Servicio agendado");
          location.reload();
        } else {
          alert("Este horario ya no está disponible");
        }
      })
      .catch(err => console.error("Error:", err));
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