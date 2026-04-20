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
   FUNCIÓN PRINCIPAL DE CITAS
   ========================================== */

function cargarCitas() {
  const url = "https://nailsss-production.up.railway.app/appointments";
  const container = document.getElementById("services");

  fetch(url)
    .then(res => res.json())
    .then(data => {
      console.log("Datos recibidos:", data); // Esto te dirá en consola qué llega
      container.innerHTML = "";

      if (!data || data.length === 0) {
        container.innerHTML = "<p>No tienes citas</p>";
        return;
      }

      data.forEach(app => {
        // --- 1. MARCAR EL CALENDARIO ---
        if (app.status === "active") {
          // Normalizamos: quitamos espacios y pasamos a minúsculas para comparar
          const diaDB = app.day.trim();
          const horaDB = app.time.trim();
          
          // Buscamos la celda (aquí el selector debe ser exacto a tu HTML)
          const celda = document.querySelector(`td[data-day="${diaDB}"][data-time="${horaDB}"]`);
          
          if (celda) {
            celda.innerHTML = "❌";
            celda.style.backgroundColor = "#ffb3c1";
            celda.style.pointerEvents = "none";
          }
        }

        // --- 2. MOSTRAR LISTA ABAJO ---
        container.innerHTML += `
          <div class="appointment" style="border: 1px solid #ccc; margin: 5px; padding: 10px;">
            <h3>${app.title || "Servicio"}</h3>
            <p>${app.day} - ${app.time}</p>
            <p>Usuario: ${app.name || "N/A"}</p>
            ${app.status === "active" 
                ? `<button onclick="cancelarCita(${app.id})">Cancelar</button>` 
                : `<p style="color:red;">Cancelada</p>`}
          </div>
        `;
      });
    })
    .catch(err => {
      console.error("Error en fetch:", err);
      container.innerHTML = "<p>Error al cargar los datos del servidor.</p>";
    });
}

// Función global para que el botón 'onclick' funcione
window.cancelarCita = function(id) {
    if(confirm("¿Cancelar cita?")) {
        fetch(`https://nailsss-production.up.railway.app/appointments/${id}`, { method: "DELETE" })
        .then(() => location.reload());
    }
}

/* ==========================================
   EVENTO DE CLICK Y ARRANQUE
   ========================================== */
document.addEventListener('DOMContentLoaded', () => {
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
          alert("Agendado con éxito");
          location.reload();
        } else {
          alert("Error: Verifica si el horario ya está ocupado");
        }
      });
    });
  });
});

  

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