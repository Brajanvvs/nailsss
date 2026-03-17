// services.js

/* =========================
CONFIG
========================= */
const API = ""; // 🔥 SIN localhost

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
        </div>
      `;

    });

  } catch (err) {
    console.error("❌ Error cargando servicios:", err);
  }

}

/* =========================
CREAR SERVICIO
========================= */
async function createService() {

  try {

    const res = await fetch(API + "/services", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: document.getElementById("title").value,
        price: document.getElementById("price").value,
        image: document.getElementById("image").value
      })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Error creando servicio");
      return;
    }

    alert("✅ Servicio creado");

    loadServices();

  } catch (err) {
    console.error("❌ Error creando servicio:", err);
    alert("Error conectando al servidor");
  }

}

/* =========================
ELIMINAR SERVICIO
========================= */
async function deleteService(id) {

  try {

    const res = await fetch(API + `/services/${id}`, {
      method: "DELETE"
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Error eliminando servicio");
      return;
    }

    alert("🗑 Servicio eliminado");

    loadServices();

  } catch (err) {
    console.error("❌ Error eliminando servicio:", err);
  }

}

/* =========================
INIT
========================= */
loadServices();