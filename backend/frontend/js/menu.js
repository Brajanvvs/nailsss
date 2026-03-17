document.addEventListener("DOMContentLoaded", function(){

  const user = JSON.parse(localStorage.getItem("user"));

  const loginLink = document.getElementById("loginLink");
  const registerLink = document.getElementById("registerLink");
  const logoutLink = document.getElementById("logoutLink");
  const adminPanel = document.getElementById("adminPanel"); // 🔥 nuevo

  if(user){

    loginLink.style.display = "none";
    registerLink.style.display = "none";
    logoutLink.style.display = "inline";

    // 🔥 MOSTRAR PANEL ADMIN
    if(user.role === "admin" && adminPanel){
      adminPanel.style.display = "block";
    }

  }

});


/* =========================
   CERRAR SESIÓN
========================= */

function logout(){

  localStorage.removeItem("user");

  window.location.href = "index.html";

}