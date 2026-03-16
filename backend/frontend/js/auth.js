const API = "http://localhost:3000";

/* =========================
LOGIN
========================= */

const loginForm = document.getElementById("loginForm");

if(loginForm){

loginForm.addEventListener("submit", async (e)=>{

e.preventDefault();

const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

try{

const res = await fetch(API + "/auth/login",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
email,
password
})
});

const data = await res.json();

if(!res.ok){
alert(data.error || "Error login");
return;
}

localStorage.setItem("user", JSON.stringify(data));

window.location.href="index.html";

}catch(err){

console.log(err);
alert("Error conectando al servidor");

}

});

}


/* =========================
REGISTER
========================= */

const registerForm = document.getElementById("registerForm");

if(registerForm){

registerForm.addEventListener("submit", async (e)=>{

e.preventDefault();

const name = document.getElementById("name").value;
const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

try{

const res = await fetch(API + "/auth/register",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
name,
email,
password
})
});

const data = await res.json();

if(!res.ok){
alert(data.error || "Error registrando");
return;
}

alert("Cuenta creada");

window.location.href="login.html";

}catch(err){

console.log(err);
alert("Error conectando al servidor");

}

});

}