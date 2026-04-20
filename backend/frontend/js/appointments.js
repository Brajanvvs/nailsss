const container = document.getElementById("appointments"); // ID original restaurado

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

  // 📥 cargar citas
  fetch(url)
    .then(res => res.json())
    .then(data => {
      container.innerHTML = "";

      if (data.length === 0) {
        container.innerHTML = "<p>No tienes citas</p>";
        return;
      }

      data.forEach(app => {
        // --- ❌ LÓGICA PARA MARCAR EL CALENDARIO ---
        if (app.status === "active") {
          // Buscamos la celda que coincida exactamente con el texto de la DB
          const celda = document.querySelector(`td[data-day="${app.day}"][data-time="${app.time}"]`);
          if (celda) {
            celda.innerHTML = "❌";
            celda.style.backgroundColor = "#ffb3c1";
            celda.style.pointerEvents = "none";
          }
        }

        // --- 📋 MOSTRAR LISTA DE CITAS ---
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

// --- 🖱️ EVENTO PARA AGENDAR HACIENDO CLICK EN EL CALENDARIO ---
document.addEventListener('DOMContentLoaded', () => {
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

      // IMPORTANTE: Enviamos los datos como el servidor los espera
      fetch("/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: selectedService,
          day: day,
          time: time,
          userId: user.id, // Pasamos el ID del usuario actual
          name: user.name || "Cliente",
          status: "active"
        })
      })
      .then(res => {
        if (res.ok) {
          alert("¡Cita agendada!");
          location.reload();
        } else {
          // Si sale 400 aquí, es porque el servidor dice que ya está ocupado
          alert("Error: Este horario no está disponible o los datos son incorrectos.");
        }
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