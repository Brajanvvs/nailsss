const API = "";

/* =========================
INICIO
========================= */
document.addEventListener("DOMContentLoaded", () => {
  loadServices();
  setupCalendar();
});

/* =========================
SELECCIONAR SERVICIO
========================= */
function selectService(service) {

  localStorage.setItem("service", JSON.stringify(service));

  const text = document.getElementById("selectedServiceText");
  text.innerText = "Servicio seleccionado: " + service.title;

}

/* =========================
CARGAR SERVICIOS
========================= */
function loadServices(){

  fetch("/services")
  .then(res=>res.json())
  .then(data=>{

    const container = document.getElementById("services");
    container.innerHTML="";

    data.forEach(service=>{

      container.innerHTML+=`

      <div>

        <h3>${service.title}</h3>
        <p>$${service.price}</p>

        <button onclick='selectService(${JSON.stringify(service)})'>
          Seleccionar
        </button>

      </div>

      `;

    });

  });

}

/* =========================
CALENDARIO (AGENDAR)
========================= */
function setupCalendar() {

  const cells = document.querySelectorAll("#calendar td[data-day]");

  cells.forEach(cell => {

    cell.addEventListener("click", () => {

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

      fetch("/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          service_id: service.id,
          day,
          time,
          user_id: user.id
        })
      })
      .then(res => res.json())
      .then(data => {

        alert("Cita creada");

        cell.innerText = "Ocupado";

      });

    });

  });

}

module.exports = router;