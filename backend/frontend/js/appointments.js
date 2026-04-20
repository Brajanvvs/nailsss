const container = document.getElementById("appointments");

function cargarCitas() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || !container) return;

  const url = (user.role === "admin") ? "/appointments" : `/appointments/user/${user.id}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      container.innerHTML = "";
      
      // Limpiar el calendario antes de marcar
      document.querySelectorAll('#calendar td[data-day]').forEach(td => {
        td.innerHTML = "";
        td.style.backgroundColor = "";
        td.style.pointerEvents = "auto";
      });

      data.forEach(app => {
        if (app.status === "active") {
          // Normalizamos: quitamos espacios y pasamos a minúsculas
          const diaDB = app.day.trim().toLowerCase();
          const horaDB = app.time.trim().toLowerCase();

          const celdas = document.querySelectorAll('#calendar td[data-day]');
          celdas.forEach(celda => {
            const diaHTML = celda.getAttribute('data-day').trim().toLowerCase();
            const horaHTML = celda.getAttribute('data-time').trim().toLowerCase();

            // Si coinciden, marcamos con X y BLOQUEAMOS el clic
            if (diaHTML === diaDB && horaHTML === horaDB) {
              celda.innerHTML = "❌";
              celda.style.backgroundColor = "#ffb3c1";
              celda.style.pointerEvents = "none"; // Evita que puedas hacer clic y recibir el error 400
            }
          });
        }
      });
    })
    .catch(err => console.error("Error:", err));
}

// Lógica para agendar (Evento Click)
document.addEventListener('DOMContentLoaded', () => {
  cargarCitas();

  const celdas = document.querySelectorAll('#calendar td[data-day]');
  celdas.forEach(celda => {
    celda.addEventListener('click', () => {
      const day = celda.getAttribute('data-day');
      const time = celda.getAttribute('data-time');
      const serviceText = document.getElementById("selectedServiceText").innerText;
      const user = JSON.parse(localStorage.getItem("user"));

      if (!serviceText) return alert("Selecciona un servicio primero");

      fetch("/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: serviceText,
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
          // Aquí capturamos el Error 400 real
          alert("❌ Este horario ya está ocupado en el sistema.");
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