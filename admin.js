console.log("ADMIN JS LOADED");

const API_URL = "https://ganesh-b.onrender.com";

const login = document.getElementById("loginCard");
const dash = document.getElementById("dashboard");
const form = document.getElementById("loginForm");
const error = document.getElementById("error");
const logout = document.getElementById("logout");


// ==========================================
// SHOW DASHBOARD
// ==========================================

function showDashboard() {
  login.hidden = true;
  dash.hidden = false;

  loadPrograms();
}


// ==========================================
// SHOW LOGIN
// ==========================================

function showLogin() {
  login.hidden = false;
  dash.hidden = true;
}


// ==========================================
// LOGIN
// ==========================================

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
          mobile,
          password
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


// ==========================================
// CHECK LOGIN
// ==========================================

async function checkLogin() {

  const token =
    sessionStorage.getItem("adminToken");

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


    console.log(
      "ME RESPONSE:",
      data
    );


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


// ==========================================
// LOAD PROGRAMS
// ==========================================

async function loadPrograms() {

  const container =
    document.getElementById("programList");

  if (!container) {
    return;
  }


  container.innerHTML =
    "<p>Programs loading...</p>";


  try {

    const response = await fetch(
      `${API_URL}/api/programs`
    );


    const data =
      await response.json();


    console.log(
      "PROGRAMS RESPONSE:",
      data
    );


    if (!response.ok || !data.success) {

      container.innerHTML =
        "<p>Programs load होत नाहीत.</p>";

      return;
    }


    if (
      !data.programs ||
      data.programs.length === 0
    ) {

      container.innerHTML =
        "<p>अजून कोणताही कार्यक्रम नाही.</p>";

      return;
    }


    container.innerHTML = "";


    data.programs.forEach(
      (program) => {

        const item =
          document.createElement("div");

        item.className =
          "program-item";


        item.innerHTML = `

          <div class="program-info">

            <h3>
              ${escapeHTML(program.title)}
            </h3>

            <p>
              📅 ${program.program_date}
            </p>

            ${
              program.program_time
                ? `<p>⏰ ${escapeHTML(program.program_time)}</p>`
                : ""
            }

            ${
              program.description
                ? `<p>${escapeHTML(program.description)}</p>`
                : ""
            }

          </div>

          <button
            class="delete-program"
            data-id="${program.id}"
          >
            🗑️ Delete
          </button>

        `;


        container.appendChild(item);

      }
    );


    // Delete buttons

    document
      .querySelectorAll(".delete-program")
      .forEach((button) => {

        button.addEventListener(
          "click",
          () => {

            deleteProgram(
              button.dataset.id
            );

          }
        );

      });


  } catch (err) {

    console.error(
      "LOAD PROGRAMS ERROR:",
      err
    );

    container.innerHTML =
      "<p>Backend शी connection होत नाही.</p>";
  }

}


// ==========================================
// ADD PROGRAM
// ==========================================

const programForm =
  document.getElementById(
    "programForm"
  );


if (programForm) {

  programForm.addEventListener(
    "submit",
    async (e) => {

      e.preventDefault();


      const title =
        document
          .getElementById("programTitle")
          .value
          .trim();


      const program_date =
        document
          .getElementById("programDate")
          .value;


      const program_time =
        document
          .getElementById("programTime")
          .value
          .trim();


      const description =
        document
          .getElementById("programDescription")
          .value
          .trim();


      const message =
        document.getElementById(
          "programMessage"
        );


      message.textContent =
        "Program save होत आहे...";


      const token =
        sessionStorage.getItem(
          "adminToken"
        );


      try {

        const response =
          await fetch(
            `${API_URL}/api/programs`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`
              },

              body: JSON.stringify({
                title,
                program_date,
                program_time,
                description
              })
            }
          );


        const data =
          await response.json();


        console.log(
          "ADD PROGRAM RESPONSE:",
          data
        );


        if (!response.ok) {

          message.textContent =
            data.message ||
            "Program add failed.";

          return;
        }


        message.textContent =
          "✅ Program successfully added!";


        programForm.reset();


        await loadPrograms();


      } catch (err) {

        console.error(
          "ADD PROGRAM ERROR:",
          err
        );


        message.textContent =
          "Backend शी connection होत नाही.";
      }

    }
  );

}


// ==========================================
// DELETE PROGRAM
// ==========================================

async function deleteProgram(id) {

  const confirmDelete =
    confirm(
      "हा कार्यक्रम delete करायचा आहे का?"
    );


  if (!confirmDelete) {
    return;
  }


  const token =
    sessionStorage.getItem(
      "adminToken"
    );


  try {

    const response =
      await fetch(
        `${API_URL}/api/programs/${id}`,
        {
          method: "DELETE",

          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );


    const data =
      await response.json();


    console.log(
      "DELETE PROGRAM RESPONSE:",
      data
    );


    if (!response.ok) {

      alert(
        data.message ||
        "Delete failed"
      );

      return;
    }


    alert(
      "Program deleted successfully."
    );


    loadPrograms();


  } catch (err) {

    console.error(
      "DELETE PROGRAM ERROR:",
      err
    );


    alert(
      "Backend शी connection होत नाही."
    );
  }

}


// ==========================================
// HTML SECURITY
// ==========================================

function escapeHTML(value) {

  if (!value) {
    return "";
  }

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


// ==========================================
// LOGOUT
// ==========================================

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


// ==========================================
// START
// ==========================================

showLogin();

checkLogin();
