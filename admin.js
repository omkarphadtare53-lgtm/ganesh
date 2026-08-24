const API_URL = "https://ganesh-b.onrender.com";

const login = document.getElementById("loginCard");
const dash = document.getElementById("dashboard");
const form = document.getElementById("loginForm");
const error = document.getElementById("error");
const logout = document.getElementById("logout");


// ================================
// SHOW DASHBOARD
// ================================

function showDashboard() {
  login.hidden = true;
  dash.hidden = false;
}


// ================================
// SHOW LOGIN
// ================================

function showLogin() {
  login.hidden = false;
  dash.hidden = true;
}


// ================================
// LOGIN
// ================================

form.addEventListener("submit", async (e) => {

  e.preventDefault();

  error.textContent = "Login होत आहे...";

  const mobile = document
    .getElementById("mobile")
    .value
    .trim();

  const password = document
    .getElementById("password")
    .value;

  try {

    const response = await fetch(
      `${API_URL}/api/login`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          mobile: mobile,
          password: password
        })
      }
    );

    const data = await response.json();

    console.log("LOGIN RESPONSE:", data);

    if (!response.ok) {

      error.textContent =
        data.message || "Login failed";

      return;
    }


    // ================================
    // ADMIN LOGIN SUCCESS
    // ================================

    if (
      data.success === true &&
      data.user &&
      data.user.role === "admin"
    ) {

      sessionStorage.setItem(
        "adminToken",
        data.token
      );

      sessionStorage.setItem(
        "adminUser",
        JSON.stringify(data.user)
      );

      error.textContent = "";

      showDashboard();

      console.log("ADMIN DASHBOARD SHOWN");

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
// CHECK LOGIN
// ================================

async function checkLogin() {

  const token =
    sessionStorage.getItem("adminToken");

  // Token नाही → Login page
  if (!token) {
    showLogin();
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

    const data =
      await response.json();

    console.log("ME RESPONSE:", data);

    if (
      response.ok &&
      data.success &&
      data.user &&
      data.user.role === "admin"
    ) {

      showDashboard();

    } else {

      sessionStorage.removeItem(
        "adminToken"
      );

      sessionStorage.removeItem(
        "adminUser"
      );

      showLogin();
    }

  } catch (err) {

    console.error(
      "AUTH CHECK ERROR:",
      err
    );

    showLogin();
  }
}


// ================================
// LOGOUT
// ================================

logout.addEventListener(
  "click",
  async () => {

    const token =
      sessionStorage.getItem(
        "adminToken"
      );

    try {

      if (token) {

        await fetch(
          `${API_URL}/api/logout`,
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );

      }

    } catch (err) {

      console.error(
        "LOGOUT ERROR:",
        err
      );

    }

    sessionStorage.removeItem(
      "adminToken"
    );

    sessionStorage.removeItem(
      "adminUser"
    );

    showLogin();

  }
);


// ================================
// START
// ================================

showLogin();

checkLogin();
