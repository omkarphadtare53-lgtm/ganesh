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

  const mobile =
    document
      .getElementById("mobile")
      .value
      .trim();

  const password =
    document
      .getElementById("password")
      .value;

  if (!mobile || !password) {

    error.textContent =
      "Mobile आणि Password आवश्यक आहे.";

    return;
  }


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


    const data =
      await response.json();


    console.log(
      "LOGIN RESPONSE:",
      data
    );


    if (!response.ok) {

      error.textContent =
        data.message ||
        "Login failed";

      return;
    }


    if (
      data.success === true &&
      data.user &&
      data.user.role === "admin" &&
      data.token
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


      console.log(
        "ADMIN DASHBOARD SHOWN"
      );

    } else {

      error.textContent =
        "Admin access required.";

    }


  } catch (err) {

    console.error(
      "LOGIN ERROR:",
      err
    );

    error.textContent =
      "Backend शी connection होत नाही.";

  }

});


// ==========================================
// CHECK LOGIN
// ==========================================

async function checkLogin() {

  const token =
    sessionStorage.getItem(
      "adminToken"
    );


  if (!token) {

    showLogin();

    return;
  }


  try {

    const response =
      await fetch(
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

    sessionStorage.removeItem(
      "adminToken"
    );

    sessionStorage.removeItem(
      "adminUser"
    );

    showLogin();

  }

}


// ==========================================
// LOAD PROGRAMS
// ==========================================

async function loadPrograms() {

  const container =
    document.getElementById(
      "programList"
    );

  if (!container) {
    return;
  }


  container.innerHTML =
    "<p>Programs loading...</p>";


  try {

    const response =
      await fetch(
        `${API_URL}/api/programs`
      );


    const data =
      await response.json();


    console.log(
      "PROGRAMS RESPONSE:",
      data
    );


    if (
      !response.ok ||
      !data.success
    ) {

      container.innerHTML =
        "<p>Programs load होत नाहीत.</p>";

      return;
    }


    const programs =
      data.programs || [];


    const count =
      document.getElementById(
        "programCount"
      );


    if (count) {

      count.textContent =
        programs.length;

    }


    if (programs.length === 0) {

      container.innerHTML = `
        <div class="empty">
          अजून कोणताही कार्यक्रम नाही.
        </div>
      `;

      return;
    }


    container.innerHTML = "";


    programs.forEach(
      (program) => {

        const item =
          document.createElement(
            "div"
          );


        item.className =
          "program-item";


        item.innerHTML = `

          <h3>
            ${escapeHTML(
              program.title
            )}
          </h3>

          <div class="program-meta">

            📅
            ${escapeHTML(
              program.program_date
            )}

            ${
              program.program_time
                ? `
                  &nbsp; | &nbsp;
                  ⏰
                  ${escapeHTML(
                    program.program_time
                  )}
                `
                : ""
            }

          </div>

          ${
            program.description
              ? `
                <div class="program-description">
                  ${escapeHTML(
                    program.description
                  )}
                </div>
              `
              : ""
          }

          <div class="program-actions">

            <button
              class="btn edit-btn"
              type="button"
              data-edit="${program.id}"
            >
              ✏️ Edit
            </button>

            <button
              class="btn delete-btn"
              type="button"
              data-delete="${program.id}"
            >
              🗑️ Delete
            </button>

          </div>

        `;


        container.appendChild(item);

      }
    );


    // EDIT BUTTONS

    document
      .querySelectorAll(
        "[data-edit]"
      )
      .forEach(
        (button) => {

          button.addEventListener(
            "click",
            () => {

              const id =
                button.dataset.edit;

              editProgram(id);

            }
          );

        }
      );


    // DELETE BUTTONS

    document
      .querySelectorAll(
        "[data-delete]"
      )
      .forEach(
        (button) => {

          button.addEventListener(
            "click",
            () => {

              const id =
                button.dataset.delete;

              deleteProgram(id);

            }
          );

        }
      );


  } catch (err) {

    console.error(
      "LOAD PROGRAMS ERROR:",
      err
    );


    container.innerHTML = `
      <p>
        Backend शी connection होत नाही.
      </p>
    `;

  }

}


// ==========================================
// ADD / EDIT PROGRAM
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


      const id =
        document
          .getElementById(
            "programId"
          )
          .value
          .trim();


      const title =
        document
          .getElementById(
            "programTitle"
          )
          .value
          .trim();


      const program_date =
        document
          .getElementById(
            "programDate"
          )
          .value;


      const program_time =
        document
          .getElementById(
            "programTime"
          )
          .value
          .trim();


      const description =
        document
          .getElementById(
            "programDescription"
          )
          .value
          .trim();


      const message =
        document.getElementById(
          "programMessage"
        );


      if (!title || !program_date) {

        message.textContent =
          "कार्यक्रमाचे नाव आणि तारीख आवश्यक आहे.";

        return;
      }


      const token =
        sessionStorage.getItem(
          "adminToken"
        );


      if (!token) {

        message.textContent =
          "Login session expired.";

        showLogin();

        return;
      }


      message.textContent =
        id
          ? "Program update होत आहे..."
          : "Program save होत आहे...";


      try {

        const url =
          id
            ? `${API_URL}/api/programs/${id}`
            : `${API_URL}/api/programs`;


        const method =
          id
            ? "PUT"
            : "POST";


        const response =
          await fetch(
            url,
            {
              method,

              headers: {

                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`

              },

              body:
                JSON.stringify({

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
          "PROGRAM SAVE RESPONSE:",
          data
        );


        if (!response.ok) {

          message.textContent =
            data.message ||
            "Program save failed.";

          return;
        }


        message.textContent =
          id
            ? "✅ Program updated successfully!"
            : "✅ Program successfully added!";


        programForm.reset();


        document
          .getElementById(
            "programId"
          )
          .value = "";


        const submitButton =
          document.getElementById(
            "programSubmit"
          );


        if (submitButton) {

          submitButton.textContent =
            "➕ कार्यक्रम Add करा";

        }


        const cancelButton =
          document.getElementById(
            "cancelEdit"
          );


        if (cancelButton) {

          cancelButton.hidden =
            true;

        }


        await loadPrograms();


      } catch (err) {

        console.error(
          "SAVE PROGRAM ERROR:",
          err
        );


        message.textContent =
          "Backend शी connection होत नाही.";

      }

    }
  );

}


// ==========================================
// EDIT PROGRAM
// ==========================================

async function editProgram(id) {

  const token =
    sessionStorage.getItem(
      "adminToken"
    );


  try {

    const response =
      await fetch(
        `${API_URL}/api/programs/${id}`,
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
      "EDIT PROGRAM RESPONSE:",
      data
    );


    if (
      !response.ok ||
      !data.success
    ) {

      alert(
        data.message ||
        "Program load failed."
      );

      return;
    }


    const program =
      data.program;


    document.getElementById(
      "programId"
    ).value =
      program.id;


    document.getElementById(
      "programTitle"
    ).value =
      program.title || "";


    document.getElementById(
      "programDate"
    ).value =
      program.program_date || "";


    document.getElementById(
      "programTime"
    ).value =
      program.program_time || "";


    document.getElementById(
      "programDescription"
    ).value =
      program.description || "";


    document.getElementById(
      "programSubmit"
    ).textContent =
      "💾 Program Update करा";


    document.getElementById(
      "cancelEdit"
    ).hidden =
      false;


    document
      .getElementById(
        "programForm"
      )
      .scrollIntoView({
        behavior: "smooth"
      });


  } catch (err) {

    console.error(
      "EDIT PROGRAM ERROR:",
      err
    );


    alert(
      "Backend शी connection होत नाही."
    );

  }

}


// ==========================================
// CANCEL EDIT
// ==========================================

const cancelEdit =
  document.getElementById(
    "cancelEdit"
  );


if (cancelEdit) {

  cancelEdit.addEventListener(
    "click",
    () => {

      programForm.reset();


      document.getElementById(
        "programId"
      ).value = "";


      document.getElementById(
        "programSubmit"
      ).textContent =
        "➕ कार्यक्रम Add करा";


      cancelEdit.hidden =
        true;


      document.getElementById(
        "programMessage"
      ).textContent = "";

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


    await loadPrograms();


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

  if (value === null ||
      value === undefined) {

    return "";
  }


  return String(value)

    .replaceAll(
      "&",
      "&amp;"
    )

    .replaceAll(
      "<",
      "&lt;"
    )

    .replaceAll(
      ">",
      "&gt;"
    )

    .replaceAll(
      '"',
      "&quot;"
    )

    .replaceAll(
      "'",
      "&#039;"
    );

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
