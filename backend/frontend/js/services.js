/* =========================
CLICK EN CALENDARIO
========================= */
document.querySelectorAll("#calendar td[data-day]").forEach(cell => {

  cell.addEventListener("click", async () => {

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

      const res = await fetch("/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: service.title,
          day,
          time,
          user_id: user.id
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error creando cita");
        return;
      }

      alert("✅ Cita creada");

      // opcional: marcar celda ocupada
      cell.innerText = "Ocupado";
      cell.style.background = "#ccc";

    } catch (err) {
      console.error(err);
      alert("Error conectando al servidor");
    }

  });

});