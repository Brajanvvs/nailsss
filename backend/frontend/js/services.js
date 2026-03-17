const API = "";

/* =========================
CUANDO CARGA
========================= */
document.addEventListener("DOMContentLoaded", () => {
  loadServices();
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