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

fetch("http://localhost:3000/services")
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

servicesContainer.innerHTML += `
<div class="service">

<h3>${service.title}</h3>

<p>$${service.price}</p>

<button onclick="selectService(${service.id}, '${service.title}')">
Seleccionar servicio
</button>

${deleteButton}

</div>
`;

});

});


/* =========================
SELECCIONAR SERVICIO
========================= */

window.selectService = function(serviceId,title){

selectedService = serviceId;

const label = document.getElementById("selectedServiceText");

if(label){
label.innerText = "Servicio seleccionado: " + title;
}

};


/* =========================
CALENDARIO
========================= */

function loadCalendar(){

document.querySelectorAll("#calendar td[data-day]").forEach(cell => {

cell.innerHTML = "";
cell.classList.remove("ocupado");

});

fetch("http://localhost:3000/appointments")
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

if(!selectedService){
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

fetch("http://localhost:3000/appointments",{

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

fetch("http://localhost:3000/services",{

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

fetch(`http://localhost:3000/services/${id}`,{

method:"DELETE"

})
.then(res=>res.json())
.then(data=>{

alert("Servicio eliminado");

location.reload();

});

}