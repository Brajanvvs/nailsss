const API = "";

/* =========================
CUANDO CARGA
========================= */
document.addEventListener("DOMContentLoaded", () => {
  loadServices();
  setupCalendar();
  loadAppointments();
});

/* =========================
SELECCIONAR SERVICIO
========================= */
function selectService(service) {

  localStorage.setItem("service", JSON.stringify(service));

  const text = document.getElementById("selectedServiceText");
  if (text) {
    text.innerText = "Servicio seleccionado: " + service.title;
  }

}

/* =========================
CARGAR SERVICIOS
========================= */
async function loadServices() {

  try {

    const res = await fetch("/services");
    const data = await res.json();

    const container = document.getElementById("services");
    if (!container) return;

    container.innerHTML = "";

    data.forEach(service => {

      container.innerHTML += `
        <div>
          <h3>${service.title}</h3>
          <p>$${service.price}</p>

          <button onclick='selectService(${JSON.stringify(service)})'>
            Seleccionar
          </button>
        </div>
      `;

    });

  } catch (err) {
    console.error("Error cargando servicios:", err);
  }

}

/* =========================
PINTAR CITAS
========================= */
async function loadAppointments() {

  try {

    const res = await fetch("/appointments");
    const data = await res.json();

    data.forEach(app => {

      if (app.status !== "active") return;

      const cell = document.querySelector(
        `td[data-day="${app.day}"][data-time="${app.time}"]`
      );

      if (cell) {
        cell.innerHTML = "Ocupado";
        cell.style.background = "#ccc";
      }

    });

  } catch (err) {
    console.error("Error cargando citas:", err);
  }

}

/* =========================
CLICK CALENDARIO
========================= */
function setupCalendar() {

  const cells = document.querySelectorAll("#calendar td[data-day]");

  cells.forEach(cell => {

    cell.addEventListener("click", async () => {

      if (cell.innerText === "Ocupado") {
        alert("Horario ocupado");
        return;
      }

      const service = JSON.parse(localStorage.getItem("service"));
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user) {
        alert("Debe iniciar sesión");
        window.location.href = "login.html";
        return;
      }

      if (!service) {
        alert("Seleccione un servicio primero");
        return;
      }

      const day = cell.dataset.day;
      const time = cell.dataset.time;

      try {

        // 🔥 VOLVEMOS A COMO FUNCIONABA ANTES
        const res = await fetch("/appointments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            title: service.title, // 👈 CLAVE
            day,
            time,
            user_id: user.id
          })
        });

        const data = await res.json();

        if (!res.ok) {
          console.log(data);
          alert(data.error || "Error creando cita");
          return;
        }

        alert("✅ Cita creada");

        cell.innerText = "Ocupado";
        cell.style.background = "#ccc";

      } catch (err) {
        console.error(err);
        alert("Error conectando al servidor");
      }

    });

  });

}