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
function selectService(id, title) {

  localStorage.setItem("service", JSON.stringify({
    id,
    title
  }));

  document.getElementById("selectedServiceText").innerText =
    "Servicio seleccionado: " + title;

}

/* =========================
CARGAR SERVICIOS (FIX BOTÓN)
========================= */
function loadServices(){

  fetch("/services")
  .then(res=>res.json())
  .then(data=>{

    const container = document.getElementById("services");
    container.innerHTML="";

    data.forEach(service=>{

      const div = document.createElement("div");

      div.innerHTML = `
        <h3>${service.title}</h3>
        <p>$${service.price}</p>
        <button class="select-btn">Seleccionar</button>
      `;

      // 🔥 IMPORTANTE (NO ROMPE HTML)
      div.querySelector(".select-btn").addEventListener("click", () => {
        selectService(service.id, service.title);
      });

      container.appendChild(div);

    });

  })
  .catch(err => console.error("Error servicios:", err));

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
          service_id: Number(service.id),
          day,
          time,
          user_id: user.id
        })
      })
      .then(res => res.json())
      .then(data => {

        if(data.error){
          alert(data.error);
          return;
        }

        alert("Cita creada");
        cell.innerText = "Ocupado";

      })
      .catch(err => {
        console.error(err);
        alert("Error conectando al servidor");
      });

    });

  });

}