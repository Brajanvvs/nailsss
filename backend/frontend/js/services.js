// services.js

const API = "";

/* =========================
SELECCIONAR SERVICIO
========================= */
function selectService(service) {

  // guardar en localStorage
  localStorage.setItem("service", JSON.stringify(service));

  alert("✅ Servicio seleccionado");

  // redirigir si quieres
  window.location.href = "dashboard.html";

}

/* =========================
CARGAR SERVICIOS
========================= */
async function loadServices() {

  try {

    const res = await fetch(API + "/services");
    const data = await res.json();

    const container = document.getElementById("services");

    container.innerHTML = "";

    data.forEach(service => {

      container.innerHTML += `
        <div class="service-card">
          <h3>${service.title}</h3>
          <p>$${service.price}</p>

          <button onclick='selectService(${JSON.stringify(service)})'>
            Seleccionar
          </button>
        </div>
      `;

    });

  } catch (err) {
    console.error("❌ Error cargando servicios:", err);
  }

}

loadServices();