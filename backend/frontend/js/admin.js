function createService(){

  const user = JSON.parse(localStorage.getItem("user"));

  if(!user || user.role !== "admin"){
    alert("No autorizado");
    return;
  }

  fetch("/services",{

    method:"POST",

    headers:{
      "Content-Type":"application/json"
    },

    body:JSON.stringify({

      title:document.getElementById("title").value,
      price:document.getElementById("price").value,
      image:document.getElementById("image").value,
      role: user.role // 🔥 CLAVE

    })

  })
  .then(res=>res.json())
  .then(data=>{

    alert("Servicio creado");

    loadServices();

  });

}


function loadServices(){

  const user = JSON.parse(localStorage.getItem("user"));

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

        ${
          user && user.role === "admin"
          ? `<button onclick="deleteService(${service.id})">Eliminar</button>`
          : ""
        }

      </div>

      `;

    });

  });

}


function deleteService(id){

  const user = JSON.parse(localStorage.getItem("user"));

  if(!user || user.role !== "admin"){
    alert("No autorizado");
    return;
  }

  fetch(`/services/${id}`,{

    method:"DELETE",

    headers:{
      "Content-Type":"application/json"
    },

    body:JSON.stringify({
      role: user.role // 🔥 CLAVE
    })

  })
  .then(res=>res.json())
  .then(data=>{

    alert("Servicio eliminado");

    loadServices();

  });

}


loadServices();