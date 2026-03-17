const API = "";

/* =========================
SELECCIONAR SERVICIO
========================= */
function selectService(service) {

  // guardar servicio
  localStorage.setItem("service", JSON.stringify(service));

  // mostrar en pantalla
  const text = document.getElementById("selectedServiceText");
  text.innerText = "Servicio seleccionado: " + service.title;

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

loadServices();