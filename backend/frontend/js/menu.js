document.addEventListener("DOMContentLoaded", function(){

  const user = JSON.parse(localStorage.getItem("user"));

  const loginLink = document.getElementById("loginLink");
  const registerLink = document.getElementById("registerLink");
  const logoutLink = document.getElementById("logoutLink");

  if(user){
    if(loginLink) loginLink.style.display = "none";
    if(registerLink) registerLink.style.display = "none";
    if(logoutLink) logoutLink.style.display = "inline";
  }

});


function logout(){
  localStorage.removeItem("user");
  window.location.href = "index.html";
}