window.addEventListener("load",()=>{const p=document.getElementById("preloader");setTimeout(()=>{p.style.opacity="0";setTimeout(()=>p.style.display="none",500)},700)});
const navbar=document.getElementById("navbar");window.addEventListener("scroll",()=>{navbar.classList.toggle("scrolled",window.scrollY>50)});
const menuBtn=document.getElementById("menuBtn"),navMenu=document.getElementById("navMenu");menuBtn.addEventListener("click",()=>{navMenu.classList.toggle("active");const i=menuBtn.querySelector("i");i.classList.toggle("fa-bars");i.classList.toggle("fa-xmark")});document.querySelectorAll("#navMenu a").forEach(l=>l.addEventListener("click",()=>{navMenu.classList.remove("active");const i=menuBtn.querySelector("i");i.classList.remove("fa-xmark");i.classList.add("fa-bars")}));
const festivalDate=new Date("2026-09-06T10:00:00").getTime();function updateCountdown(){const d=festivalDate-Date.now();if(d<=0)return;document.getElementById("days").innerText=String(Math.floor(d/86400000)).padStart(2,"0");document.getElementById("hours").innerText=String(Math.floor(d%86400000/3600000)).padStart(2,"0");document.getElementById("minutes").innerText=String(Math.floor(d%3600000/60000)).padStart(2,"0");document.getElementById("seconds").innerText=String(Math.floor(d%60000/1000)).padStart(2,"0")}updateCountdown();setInterval(updateCountdown,1000);
const lightbox=document.getElementById("lightbox"),lightboxImage=document.getElementById("lightboxImage");document.querySelectorAll(".gallery-item").forEach(item=>item.addEventListener("click",()=>{lightboxImage.src=item.querySelector("img").src;lightbox.classList.add("active")}));document.getElementById("closeLightbox").addEventListener("click",()=>lightbox.classList.remove("active"));lightbox.addEventListener("click",e=>{if(e.target===lightbox)lightbox.classList.remove("active")});
function copyUPI(){const u=document.getElementById("upiId").innerText;navigator.clipboard.writeText(u).then(()=>alert("UPI ID कॉपी झाला!")).catch(()=>alert("UPI ID: "+u))}
const backTop=document.getElementById("backTop");window.addEventListener("scroll",()=>backTop.style.display=window.scrollY>500?"block":"none");backTop.addEventListener("click",()=>window.scrollTo({top:0,behavior:"smooth"}));document.addEventListener("keydown",e=>{if(e.key==="Escape")lightbox.classList.remove("active")});
const API_URL = "https://ganesh-b.onrender.com";

const loginCard = document.getElementById("loginCard");
const dashboard = document.getElementById("dashboard");

const loginForm = document.getElementById("loginForm");
const errorBox = document.getElementById("error");

const logoutButton = document.getElementById("logout");


// ============================
// LOGIN
// ============================

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const mobile = document
        .getElementById("mobile")
        .value
        .trim();

    const password = document
        .getElementById("password")
        .value;

    errorBox.textContent = "Login होत आहे...";

    try {
        const response = await fetch(
            `${API_URL}/api/login`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    mobile,
                    password
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            errorBox.textContent =
                data.message || "Login failed";
            return;
        }

        // Save authentication token
        sessionStorage.setItem(
            "ganesh_token",
            data.token
        );

        sessionStorage.setItem(
            "ganesh_user",
            JSON.stringify(data.user)
        );

        // Show dashboard
        showDashboard();

    } catch (error) {
        console.error(error);

        errorBox.textContent =
            "Backend server शी connection होत नाही.";
    }
});


// ============================
// SHOW DASHBOARD
// ============================

function showDashboard() {
    loginCard.hidden = true;
    dashboard.hidden = false;
}


// ============================
// CHECK EXISTING LOGIN
// ============================

async function checkAuthentication() {

    const token =
        sessionStorage.getItem("ekopa_token");

    if (!token) {
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/api/me`,
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            sessionStorage.clear();
            return;
        }

        const data = await response.json();

        console.log(
            "Logged in:",
            data.user
        );

        showDashboard();

    } catch (error) {

        console.error(error);

        sessionStorage.clear();
    }
}


// ============================
// LOGOUT
// ============================

logoutButton.addEventListener("click", () => {

    sessionStorage.removeItem(
        "ganesh_token"
    );

    sessionStorage.removeItem(
        "ganesh_user"
    );

    dashboard.hidden = true;
    loginCard.hidden = false;

    document.getElementById("password").value = "";

    errorBox.textContent = "";
});


// Start authentication check
checkAuthentication();
