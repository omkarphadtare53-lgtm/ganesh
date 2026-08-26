console.log("ADMIN JS LOADED");

const API_URL =
  "https://ganesh-b.onrender.com";


const login =
  document.getElementById("loginCard");

const dash =
  document.getElementById("dashboard");

const form =
  document.getElementById("loginForm");

const error =
  document.getElementById("error");

const logout =
  document.getElementById("logout");


// ==========================================
// SHOW DASHBOARD
// ==========================================

function showDashboard() {

  login.classList.add("hidden");

  dash.classList.remove("hidden");

  loadFinance();

  loadDonations();

  loadExpenses();

  loadPrograms();
}


// ==========================================
// SHOW LOGIN
// ==========================================

function showLogin() {

  login.classList.remove("hidden");

  dash.classList.add("hidden");
}


// ==========================================
// LOGIN
// ==========================================

form.addEventListener(
  "submit",
  async (e) => {

    e.preventDefault();

    error.textContent =
      "Login होत आहे...";

    const mobile =
      document
        .getElementById("mobile")
        .value
        .trim();

    const password =
      document
        .getElementById("password")
        .value;

    try {

      const response =
        await fetch(
          `${API_URL}/api/login`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
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
        data.success &&
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

  }
);


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
      "AUTH ERROR:",
      err
    );

    showLogin();

  }

}


// ==========================================
// TOKEN
// ==========================================

function getToken() {

  return sessionStorage.getItem(
    "adminToken"
  );

}


// ==========================================
// FINANCE SUMMARY
// ==========================================

async function loadFinance() {

  try {

    const response =
      await fetch(
        `${API_URL}/api/finance/summary`,
        {
          headers: {
            Authorization:
              `Bearer ${getToken()}`
          }
        }
      );

    const data =
      await response.json();

    if (!response.ok) {

      console.error(data);

      return;
    }

    document.getElementById(
      "totalDonation"
    ).textContent =
      "₹" +
      Number(
        data.totalDonation
      ).toLocaleString("en-IN");


    document.getElementById(
      "totalExpense"
    ).textContent =
      "₹" +
      Number(
        data.totalExpense
      ).toLocaleString("en-IN");


    document.getElementById(
      "balance"
    ).textContent =
      "₹" +
      Number(
        data.balance
      ).toLocaleString("en-IN");

  } catch (err) {

    console.error(
      "FINANCE ERROR:",
      err
    );

  }

}


// ==========================================
// SHOW FINANCE FORM
// ==========================================

function showFinanceForm(type) {

  document
    .getElementById(
      "donationSection"
    )
    .classList.add("hidden");

  document
    .getElementById(
      "expenseSection"
    )
    .classList.add("hidden");


  if (type === "donation") {

    document
      .getElementById(
        "donationSection"
      )
      .classList.remove("hidden");

  }


  if (type === "expense") {

    document
      .getElementById(
        "expenseSection"
      )
      .classList.remove("hidden");

  }

}


// ==========================================
// ADD DONATION
// ==========================================

document
  .getElementById("donationForm")
  .addEventListener(
    "submit",
    async (e) => {

      e.preventDefault();

      const message =
        document.getElementById(
          "donationMessage"
        );

      message.textContent =
        "जमा होत आहे...";

      try {

        const response =
          await fetch(
            `${API_URL}/api/donations`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${getToken()}`
              },

              body: JSON.stringify({

                donor_name:
                  document
                    .getElementById(
                      "donorName"
                    )
                    .value
                    .trim(),

                mobile:
                  document
                    .getElementById(
                      "donorMobile"
                    )
                    .value
                    .trim(),

                amount:
                  document
                    .getElementById(
                      "donationAmount"
                    )
                    .value,

                payment_mode:
                  document
                    .getElementById(
                      "donationMode"
                    )
                    .value,

                note:
                  document
                    .getElementById(
                      "donationNote"
                    )
                    .value
                    .trim()

              })
            }
          );

        const data =
          await response.json();

        if (!response.ok) {

          message.textContent =
            data.message ||
            "Donation failed";

          return;
        }

        message.textContent =
          "✅ जमा यशस्वी!";

        document
          .getElementById(
            "donationForm"
          )
          .reset();

        loadFinance();

        loadDonations();

      } catch (err) {

        console.error(err);

        message.textContent =
          "Backend connection error";

      }

    }
  );


// ==========================================
// ADD EXPENSE
// ==========================================

document
  .getElementById("expenseForm")
  .addEventListener(
    "submit",
    async (e) => {

      e.preventDefault();

      const message =
        document.getElementById(
          "expenseMessage"
        );

      message.textContent =
        "खर्च save होत आहे...";

      try {

        const response =
          await fetch(
            `${API_URL}/api/expenses`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${getToken()}`
              },

              body: JSON.stringify({

                title:
                  document
                    .getElementById(
                      "expenseTitle"
                    )
                    .value
                    .trim(),

                amount:
                  document
                    .getElementById(
                      "expenseAmount"
                    )
                    .value,

                payment_mode:
                  document
                    .getElementById(
                      "expenseMode"
                    )
                    .value,

                note:
                  document
                    .getElementById(
                      "expenseNote"
                    )
                    .value
                    .trim()

              })
            }
          );

        const data =
          await response.json();

        if (!response.ok) {

          message.textContent =
            data.message ||
            "Expense failed";

          return;
        }

        message.textContent =
          "✅ खर्च save झाला!";

        document
          .getElementById(
            "expenseForm"
          )
          .reset();

        loadFinance();

        loadExpenses();

      } catch (err) {

        console.error(err);

        message.textContent =
          "Backend connection error";

      }

    }
  );


// ==========================================
// LOAD DONATIONS
// ==========================================

async function loadDonations() {

  const container =
    document.getElementById(
      "donationList"
    );

  try {

    const response =
      await fetch(
        `${API_URL}/api/donations`,
        {
          headers: {
            Authorization:
              `Bearer ${getToken()}`
          }
        }
      );

    const data =
      await response.json();

    if (
      !response.ok ||
      !data.success
    ) {

      container.innerHTML =
        "Data load failed.";

      return;
    }

    if (
      !data.donations ||
      data.donations.length === 0
    ) {

      container.innerHTML =
        "अजून जमा नोंद नाही.";

      return;
    }

    container.innerHTML = "";

    data.donations.forEach(
      (item) => {

        const div =
          document.createElement(
            "div"
          );

        div.className =
          "item";

        div.innerHTML = `

          <div class="item-info">

            <strong>
              ${escapeHTML(
                item.donor_name
              )}
            </strong>

            <div>
              ₹${Number(
                item.amount
              ).toLocaleString("en-IN")}
            </div>

            <small>
              ${escapeHTML(
                item.payment_mode
              )}
            </small>

          </div>

          <button
            class="delete"
            onclick="deleteDonation(${item.id})"
          >
            Delete
          </button>

        `;

        container.appendChild(div);

      }
    );

  } catch (err) {

    console.error(err);

    container.innerHTML =
      "Backend connection error.";

  }

}


// ==========================================
// LOAD EXPENSES
// ==========================================

async function loadExpenses() {

  const container =
    document.getElementById(
      "expenseList"
    );

  try {

    const response =
      await fetch(
        `${API_URL}/api/expenses`,
        {
          headers: {
            Authorization:
              `Bearer ${getToken()}`
          }
        }
      );

    const data =
      await response.json();

    if (
      !response.ok ||
      !data.success
    ) {

      container.innerHTML =
        "Data load failed.";

      return;
    }

    if (
      !data.expenses ||
      data.expenses.length === 0
    ) {

      container.innerHTML =
        "अजून खर्च नोंद नाही.";

      return;
    }

    container.innerHTML = "";

    data.expenses.forEach(
      (item) => {

        const div =
          document.createElement(
            "div"
          );

        div.className =
          "item";

        div.innerHTML = `

          <div class="item-info">

            <strong>
              ${escapeHTML(
                item.title
              )}
            </strong>

            <div>
              ₹${Number(
                item.amount
              ).toLocaleString("en-IN")}
            </div>

            <small>
              ${escapeHTML(
                item.payment_mode
              )}
            </small>

          </div>

          <button
            class="delete"
            onclick="deleteExpense(${item.id})"
          >
            Delete
          </button>

        `;

        container.appendChild(div);

      }
    );

  } catch (err) {

    console.error(err);

    container.innerHTML =
      "Backend connection error.";

  }

}


// ==========================================
// DELETE DONATION
// ==========================================

async function deleteDonation(id) {

  if (
    !confirm(
      "ही जमा नोंद delete करायची का?"
    )
  ) {
    return;
  }

  try {

    const response =
      await fetch(
        `${API_URL}/api/donations/${id}`,
        {
          method: "DELETE",

          headers: {
            Authorization:
              `Bearer ${getToken()}`
          }
        }
      );

    const data =
      await response.json();

    if (!response.ok) {

      alert(
        data.message ||
        "Delete failed"
      );

      return;
    }

    loadFinance();

    loadDonations();

  } catch (err) {

    console.error(err);

    alert(
      "Backend connection error"
    );

  }

}


// ==========================================
// DELETE EXPENSE
// ==========================================

async function deleteExpense(id) {

  if (
    !confirm(
      "हा खर्च delete करायचा का?"
    )
  ) {
    return;
  }

  try {

    const response =
      await fetch(
        `${API_URL}/api/expenses/${id}`,
        {
          method: "DELETE",

          headers: {
            Authorization:
              `Bearer ${getToken()}`
          }
        }
      );

    const data =
      await response.json();

    if (!response.ok) {

      alert(
        data.message ||
        "Delete failed"
      );

      return;
    }

    loadFinance();

    loadExpenses();

  } catch (err) {

    console.error(err);

    alert(
      "Backend connection error"
    );

  }

}


// ==========================================
// PROGRAMS
// ==========================================

async function loadPrograms() {

  const container =
    document.getElementById(
      "programList"
    );

  try {

    const response =
      await fetch(
        `${API_URL}/api/programs`
      );

    const data =
      await response.json();

    if (
      !response.ok ||
      !data.success
    ) {

      container.innerHTML =
        "Programs load failed.";

      return;
    }

    if (
      !data.programs ||
      data.programs.length === 0
    ) {

      container.innerHTML =
        "अजून कार्यक्रम नाही.";

      return;
    }

    container.innerHTML = "";

    data.programs.forEach(
      (program) => {

        const div =
          document.createElement(
            "div"
          );

        div.className =
          "program-item";

        div.innerHTML = `

          <div>

            <strong>
              ${escapeHTML(
                program.title
              )}
            </strong>

            <p>
              📅 ${escapeHTML(
                program.program_date
              )}
            </p>

            <p>
              ${escapeHTML(
                program.program_time || ""
              )}
            </p>

          </div>

          <button
            class="delete"
            onclick="deleteProgram(${program.id})"
          >
            Delete
          </button>

        `;

        container.appendChild(div);

      }
    );

  } catch (err) {

    console.error(err);

    container.innerHTML =
      "Backend connection error.";

  }

}


// ==========================================
// ADD PROGRAM
// ==========================================

document
  .getElementById("programForm")
  .addEventListener(
    "submit",
    async (e) => {

      e.preventDefault();

      const message =
        document.getElementById(
          "programMessage"
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
                  `Bearer ${getToken()}`
              },

              body: JSON.stringify({

                title:
                  document
                    .getElementById(
                      "programTitle"
                    )
                    .value
                    .trim(),

                program_date:
                  document
                    .getElementById(
                      "programDate"
                    )
                    .value,

                program_time:
                  document
                    .getElementById(
                      "programTime"
                    )
                    .value
                    .trim(),

                description:
                  document
                    .getElementById(
                      "programDescription"
                    )
                    .value
                    .trim()

              })
            }
          );

        const data =
          await response.json();

        if (!response.ok) {

          message.textContent =
            data.message ||
            "Program failed";

          return;
        }

        message.textContent =
          "✅ Program added!";

        document
          .getElementById(
            "programForm"
          )
          .reset();

        loadPrograms();

      } catch (err) {

        console.error(err);

        message.textContent =
          "Backend connection error.";

      }

    }
  );


// ==========================================
// DELETE PROGRAM
// ==========================================

async function deleteProgram(id) {

  if (
    !confirm(
      "हा कार्यक्रम delete करायचा का?"
    )
  ) {
    return;
  }

  try {

    const response =
      await fetch(
        `${API_URL}/api/programs/${id}`,
        {
          method: "DELETE",

          headers: {
            Authorization:
              `Bearer ${getToken()}`
          }
        }
      );

    const data =
      await response.json();

    if (!response.ok) {

      alert(
        data.message ||
        "Delete failed"
      );

      return;
    }

    loadPrograms();

  } catch (err) {

    console.error(err);

    alert(
      "Backend connection error"
    );

  }

}


// ==========================================
// HTML SECURITY
// ==========================================

function escapeHTML(value) {

  return String(value || "")
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
      getToken();

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

      console.error(err);

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
