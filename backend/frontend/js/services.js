const servicesContainer = document.getElementById("services");

const user = JSON.parse(localStorage.getItem("user"));

let selectedService = null;


/* =========================
MOSTRAR PANEL ADMIN
========================= */

if(user && user.role === "admin"){

const adminPanel = document.getElementById("adminPanel");

if(adminPanel){
adminPanel.style.display = "block";
}

}


/* =========================
CARGAR SERVICIOS
========================= */

fetch("/services")
.then(res => res.json())
.then(data => {

servicesContainer.innerHTML = "";

data.forEach(service => {

let deleteButton = "";

if(user && user.role === "admin"){

deleteButton = `
<button onclick="deleteService(${service.id})" style="background:#ff4d6d;margin-top:8px;">
Eliminar
</button>
`;

}

const div = document.createElement("div");
div.className = "service";

div.innerHTML = `
<h3>${service.title}</h3>
<p>$${service.price}</p>
`;

const btn = document.createElement("button");
btn.innerText = "Seleccionar servicio";

/* 🔥 AQUÍ ESTABA EL ERROR → ahora fijo */
btn.addEventListener("click", function(){
  selectedService = service.id;

  const label = document.getElementById("selectedServiceText");

  if(label){
    label.innerText = "Servicio seleccionado: " + service.title;
  }
});

div.appendChild(btn);

if(deleteButton){
  div.innerHTML += deleteButton;
}

servicesContainer.appendChild(div);

});

});


/* =========================
CALENDARIO
========================= */

function loadCalendar(){

document.querySelectorAll("#calendar td[data-day]").forEach(cell => {

cell.innerHTML = "";
cell.classList.remove("ocupado");

});

fetch("/appointments")
.then(res => res.json())
.then(data => {

data.forEach(app => {

if(app.status === "active"){

const cell = document.querySelector(
`td[data-day="${app.day}"][data-time="${app.time}"]`
);

if(cell){

cell.innerHTML = "❌";
cell.classList.add("ocupado");

}

}

});

});

}

loadCalendar();


/* =========================
CLICK CALENDARIO
========================= */

document.querySelectorAll("#calendar td[data-day]").forEach(cell => {

cell.addEventListener("click", () => {

if(cell.classList.contains("ocupado")){
alert("Horario ocupado");
return;
}

/* 🔥 ESTE ES EL FIX REAL */
if(selectedService === null){
alert("Seleccione primero un servicio");
return;
}

const day = cell.dataset.day;
const time = cell.dataset.time;

createAppointment(day,time);

});

});


/* =========================
CREAR CITA
========================= */

function createAppointment(day,time){

const user = JSON.parse(localStorage.getItem("user"));

if(!user){
alert("Debe iniciar sesión");
window.location.href="login.html";
return;
}

fetch("/appointments",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
user_id:user.id,
service_id:selectedService,
day:day,
time:time
})

})
.then(res=>res.json())
.then(data=>{

alert("Cita creada");

location.reload();

});

}


/* =========================
CREAR SERVICIO ADMIN
========================= */

function createService(){

const title = document.getElementById("title").value;
const price = document.getElementById("price").value;
const image = document.getElementById("image").value;

fetch("/services",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
title,
price,
image
})

})
.then(res=>res.json())
.then(data=>{

alert("Servicio creado");

location.reload();

});

}


/* =========================
ELIMINAR SERVICIO ADMIN
========================= */

function deleteService(id){

if(!confirm("¿Eliminar este servicio?")) return;

fetch(`/services/${id}`,{

method:"DELETE"

})
.then(res=>res.json())
.then(data=>{

alert("Servicio eliminado");

location.reload();

});

}