function createService(){

fetch("/services",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

title:document.getElementById("title").value,
price:document.getElementById("price").value,
image:document.getElementById("image").value

})

})
.then(res=>res.json())
.then(data=>{

alert("Servicio creado");

loadServices();

});

}

function loadServices(){

fetch("/services")
.then(res=>res.json())
.then(data=>{

const container = document.getElementById("services");

container.innerHTML="";

data.forEach(service=>{

container.innerHTML+=`

<div>

<h3>${service.title}</h3>

<p>$${service.price}</p>

<button onclick="deleteService(${service.id})">
Eliminar
</button>

</div>

`;

});

});

}

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

loadServices();