document.addEventListener("DOMContentLoaded", function(){

const user = JSON.parse(localStorage.getItem("user"));

const loginLink = document.getElementById("loginLink");
const registerLink = document.getElementById("registerLink");
const logoutLink = document.getElementById("logoutLink");

if(user){

loginLink.style.display = "none";
registerLink.style.display = "none";
logoutLink.style.display = "inline";

}

});


/* =========================
   CERRAR SESIÓN
========================= */

function logout(){

localStorage.removeItem("user");

window.location.href = "index.html";

}