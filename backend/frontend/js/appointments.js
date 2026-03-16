const container = document.getElementById("appointments");

if(container){

const user = JSON.parse(localStorage.getItem("user"));

if(!user){

alert("Debe iniciar sesión");

window.location.href="login.html";

}

let url="";

if(user.role==="admin"){

url="http://localhost:3000/appointments";

}else{

url=`http://localhost:3000/appointments/user/${user.id}`;

}

fetch(url)
.then(res=>res.json())
.then(data=>{

container.innerHTML="";

if(data.length===0){

container.innerHTML="<p>No tienes citas</p>";

return;

}

data.forEach(app=>{

container.innerHTML+=`

<div class="appointment">

<h3>${app.title}</h3>

<p>${app.day} - ${app.time}</p>

<p>Usuario: ${app.name}</p>

${app.status==="active" ? `
<button onclick="cancel(${app.id})">
Cancelar
</button>` : `<p style="color:red;">Cancelada</p>`}

</div>

`;

});

});

}


function cancel(id){

fetch(`http://localhost:3000/appointments/${id}`,{
method:"DELETE"
})
.then(res=>res.json())
.then(data=>{

alert("Cita cancelada");

location.reload();

});

}