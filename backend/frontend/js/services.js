const API = "";

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

const div = document.createElement("div");

div.innerHTML = `
<h3>${service.title}</h3>
<p>$${service.price}</p>
`;

const btn = document.createElement("button");
btn.innerText = "Seleccionar servicio";

/* 🔥 FIX REAL */
btn.addEventListener("click", () => {
  selectService(service);
});

div.appendChild(btn);


/* 🔥 SOLO ADMIN ELIMINA */
const user = JSON.parse(localStorage.getItem("user"));

if(user && user.role === "admin"){

  const delBtn = document.createElement("button");
  delBtn.innerText = "Eliminar";

  delBtn.addEventListener("click", () => {
    deleteService(service.id);
  });

  div.appendChild(delBtn);
}

container.appendChild(div);

});

});

}

/* =========================
ELIMINAR SERVICIO
========================= */
function deleteService(id){

fetch(`/services/${id}`,{

method:"DELETE"

})
.then(res=>res.json())
.then(data=>{

alert("Servicio eliminado");

loadServices();

});

}

/* =========================
CALENDARIO
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
service_id: service.id,
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

cell.innerText = "❌";
cell.style.background = "#ccc";

} catch (err) {
console.error(err);
alert("Error conectando al servidor");
}

});

});

loadServices();