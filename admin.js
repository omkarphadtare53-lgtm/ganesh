const login = document.getElementById("loginCard");
const dash = document.getElementById("dashboard");
const form = document.getElementById("loginForm");
const error = document.getElementById("error");

const API_URL = "https://ganesh-backend.onrender.com"; // Frontend आणि backend same domain वर असल्यास रिकामे ठेवा

function showDashboard() {
  login.hidden = true;
  dash.hidden = false;
}

function showLogin() {
  login.hidden = false;
  dash.hidden = true;
}

// ================================
// CHECK EXISTING LOGIN
// ================================

async function checkLogin() {
  const token = sessionStorage.getItem("adminToken");

  if (!token) {
    showLogin();
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      sessionStorage.removeItem("adminToken");
      showLogin();
      return;
    }

    const data = await response.json();

    if (data.success && data.user.role === "admin") {
      showDashboard();
    } else {
      sessionStorage.removeItem("adminToken");
      showLogin();
    }

  } catch (err) {
    console.error("AUTH CHECK ERROR:", err);
    sessionStorage.removeItem("adminToken");
    showLogin();
  }
}

// ================================
// LOGIN
// ================================

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  error.textContent = "";

  const mobile = document
    .getElementById("mobile")
    .value
    .trim();

  const password = document
    .getElementById("password")
    .value;

  if (!mobile || !password) {
    error.textContent = "मोबाईल नंबर आणि Password आवश्यक आहे.";
    return;
  }

  try {

    const response = await fetch(`${API_URL}/api/login`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        mobile,
        password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      error.textContent =
        data.message || "Login failed.";
      return;
    }

    if (
      data.success &&
      data.user &&
      data.user.role === "admin"
    ) {
      sessionStorage.setItem(
        "adminToken",
        data.token
      );

      showDashboard();
    } else {
      error.textContent =
        "Admin access required.";
    }

  } catch (err) {

    console.error("LOGIN ERROR:", err);

    error.textContent =
      "Backend शी connection होत नाही.";
  }
});

// ================================
// LOGOUT
// ================================

document
  .getElementById("logout")
  .addEventListener("click", async () => {

    const token =
      sessionStorage.getItem("adminToken");

    try {

      if (token) {
        await fetch(`${API_URL}/api/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }

    } catch (err) {
      console.error("LOGOUT ERROR:", err);
    }

    sessionStorage.removeItem("adminToken");

    showLogin();
  });

// ================================
// START
// ================================

checkLogin();
