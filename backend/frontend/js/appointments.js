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

        container.innerHTML += `
          <div class="appointment">
            <h3>${app.title || "Servicio"}</h3>
            <p>${app.day} - ${app.time}</p>
            <p>Usuario: ${app.name || "N/A"}</p>

            ${
              app.status === "active"
                ? `<button onclick="cancel(${app.id})">
                    Cancelar
                   </button>`
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