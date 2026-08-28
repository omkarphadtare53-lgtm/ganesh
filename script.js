/* =========================================
   PRELOADER
========================================= */

window.addEventListener("load", () => {

  const preloader =
    document.getElementById("preloader");

  if (!preloader) return;

  setTimeout(() => {

    preloader.style.opacity = "0";

    setTimeout(() => {
      preloader.style.display = "none";
    }, 500);

  }, 700);

});


/* =========================================
   NAVBAR SCROLL
========================================= */

const navbar =
  document.getElementById("navbar");

window.addEventListener("scroll", () => {

  if (!navbar) return;

  navbar.classList.toggle(
    "scrolled",
    window.scrollY > 50
  );

});


/* =========================================
   MOBILE MENU
========================================= */

const menuBtn =
  document.getElementById("menuBtn");

const navMenu =
  document.getElementById("navMenu");

if (menuBtn && navMenu) {

  menuBtn.addEventListener("click", () => {

    navMenu.classList.toggle("active");

    const icon =
      menuBtn.querySelector("i");

    if (icon) {

      icon.classList.toggle("fa-bars");
      icon.classList.toggle("fa-xmark");

    }

  });


  document
    .querySelectorAll("#navMenu a")
    .forEach(link => {

      link.addEventListener("click", () => {

        navMenu.classList.remove("active");

        const icon =
          menuBtn.querySelector("i");

        if (icon) {

          icon.classList.remove("fa-xmark");
          icon.classList.add("fa-bars");

        }

      });

    });

}


/* =========================================
   COUNTDOWN
========================================= */

const festivalDate =
  new Date(
    "2026-09-14T5:00:00"
  ).getTime();


function updateCountdown() {

  const countdown =
    festivalDate - Date.now();

  const days =
    document.getElementById("days");

  const hours =
    document.getElementById("hours");

  const minutes =
    document.getElementById("minutes");

  const seconds =
    document.getElementById("seconds");


  if (
    !days ||
    !hours ||
    !minutes ||
    !seconds
  ) {
    return;
  }


  if (countdown <= 0) {

    days.innerText = "00";
    hours.innerText = "00";
    minutes.innerText = "00";
    seconds.innerText = "00";

    return;

  }


  days.innerText =
    String(
      Math.floor(
        countdown / 86400000
      )
    ).padStart(2, "0");


  hours.innerText =
    String(
      Math.floor(
        (countdown % 86400000) /
        3600000
      )
    ).padStart(2, "0");


  minutes.innerText =
    String(
      Math.floor(
        (countdown % 3600000) /
        60000
      )
    ).padStart(2, "0");


  seconds.innerText =
    String(
      Math.floor(
        (countdown % 60000) /
        1000
      )
    ).padStart(2, "0");

}


updateCountdown();

setInterval(
  updateCountdown,
  1000
);


/* =========================================
   GALLERY
   FULL WIDTH + NO CROP + AUTO SLIDER
========================================= */

const galleryGrid =
  document.querySelector(".gallery-grid");

const galleryItems =
  document.querySelectorAll(".gallery-item");

let currentGallery = 0;
let galleryTimer = null;


/* -----------------------------------------
   GALLERY CSS FIX
----------------------------------------- */

if (
  galleryGrid &&
  galleryItems.length
) {

  /*
   * Grid काढून carousel layout बनवतो
   */

  galleryGrid.style.display = "block";
  galleryGrid.style.position = "relative";
  galleryGrid.style.width = "100%";
  galleryGrid.style.overflow = "hidden";
  galleryGrid.style.borderRadius = "20px";


  galleryItems.forEach((item, index) => {

    item.style.position = "absolute";
    item.style.left = "0";
    item.style.top = "0";
    item.style.width = "100%";
    item.style.margin = "0";
    item.style.borderRadius = "20px";
    item.style.overflow = "hidden";

    /*
     * Photo crop होऊ नये
     */

    const img =
      item.querySelector("img");

    if (img) {

      img.style.width = "100%";
      img.style.height = "auto";
      img.style.maxWidth = "100%";
      img.style.objectFit = "contain";
      img.style.display = "block";
      img.style.margin = "0 auto";

    }

    /*
     * सुरुवातीला फक्त पहिला फोटो
     */

    if (index === 0) {

      item.style.opacity = "1";
      item.style.transform =
        "translateX(0)";

      item.style.zIndex = "2";

    } else {

      item.style.opacity = "0";
      item.style.transform =
        "translateX(100%)";

      item.style.zIndex = "1";

    }

    item.style.transition =
      "opacity 0.7s ease, transform 0.7s ease";

  });


  /* ---------------------------------------
     IMAGE LOAD नंतर योग्य HEIGHT
  --------------------------------------- */

  function resizeGallery() {

    const activeItem =
      galleryItems[currentGallery];

    if (!activeItem) return;

    const img =
      activeItem.querySelector("img");

    if (!img) return;


    if (
      img.complete &&
      img.naturalWidth > 0
    ) {

      const width =
        galleryGrid.clientWidth;

      const ratio =
        img.naturalHeight /
        img.naturalWidth;

      const height =
        width * ratio;

      galleryGrid.style.height =
        Math.min(
          Math.max(height, 220),
          600
        ) + "px";

    }

  }


  galleryItems.forEach(item => {

    const img =
      item.querySelector("img");

    if (img) {

      if (img.complete) {

        resizeGallery();

      } else {

        img.addEventListener(
          "load",
          resizeGallery
        );

      }

    }

  });


  window.addEventListener(
    "resize",
    resizeGallery
  );


  /* ---------------------------------------
     SHOW SLIDE
  --------------------------------------- */

  function showGallerySlide(nextIndex) {

    if (!galleryItems.length) return;

    if (
      nextIndex < 0 ||
      nextIndex >= galleryItems.length
    ) {
      return;
    }


    const previousIndex =
      currentGallery;


    currentGallery =
      nextIndex;


    galleryItems.forEach(
      (item, index) => {

        if (index === currentGallery) {

          item.style.opacity = "1";
          item.style.transform =
            "translateX(0)";
          item.style.zIndex = "2";

        } else if (
          index === previousIndex
        ) {

          item.style.opacity = "0";
          item.style.transform =
            "translateX(-100%)";
          item.style.zIndex = "1";

        } else {

          item.style.opacity = "0";
          item.style.transform =
            "translateX(100%)";
          item.style.zIndex = "0";

        }

      }
    );


    resizeGallery();

  }


  /* ---------------------------------------
     NEXT SLIDE
  --------------------------------------- */

  function nextGallerySlide() {

    let next =
      currentGallery + 1;

    if (
      next >= galleryItems.length
    ) {
      next = 0;
    }

    showGallerySlide(next);

  }


  /* ---------------------------------------
     AUTO SLIDE
  --------------------------------------- */

  if (galleryItems.length > 1) {

    galleryTimer =
      setInterval(
        nextGallerySlide,
        3000
      );

  }


  /* ---------------------------------------
     PAUSE ON HOVER
  --------------------------------------- */

  galleryGrid.addEventListener(
    "mouseenter",
    () => {

      if (galleryTimer) {

        clearInterval(
          galleryTimer
        );

      }

    }
  );


  galleryGrid.addEventListener(
    "mouseleave",
    () => {

      if (galleryItems.length > 1) {

        galleryTimer =
          setInterval(
            nextGallerySlide,
            3000
          );

      }

    }
  );

}


/* =========================================
   LIGHTBOX
========================================= */

const lightbox =
  document.getElementById(
    "lightbox"
  );

const lightboxImage =
  document.getElementById(
    "lightboxImage"
  );

const closeLightbox =
  document.getElementById(
    "closeLightbox"
  );


galleryItems.forEach(item => {

  item.addEventListener(
    "click",
    () => {

      const image =
        item.querySelector("img");

      if (
        !image ||
        !lightbox ||
        !lightboxImage
      ) {
        return;
      }


      lightboxImage.src =
        image.src;

      lightbox.classList.add(
        "active"
      );

      document.body.style.overflow =
        "hidden";

    }
  );

});


if (closeLightbox) {

  closeLightbox.addEventListener(
    "click",
    closeGallery
  );

}


if (lightbox) {

  lightbox.addEventListener(
    "click",
    event => {

      if (
        event.target === lightbox
      ) {

        closeGallery();

      }

    }
  );

}


function closeGallery() {

  if (!lightbox) return;

  lightbox.classList.remove(
    "active"
  );

  document.body.style.overflow =
    "";

}


document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Escape"
    ) {

      closeGallery();

    }

  }
);


/* =========================================
   UPI COPY
========================================= */

function copyUPI() {

  const upi =
    document.getElementById(
      "upiId"
    );

  if (!upi) return;


  const value =
    upi.innerText.trim();


  if (
    navigator.clipboard &&
    window.isSecureContext
  ) {

    navigator.clipboard
      .writeText(value)
      .then(() => {

        alert(
          "UPI ID कॉपी झाला!"
        );

      })
      .catch(() => {

        alert(
          "UPI ID: " + value
        );

      });

  } else {

    alert(
      "UPI ID: " + value
    );

  }

}


/* =========================================
   BACK TO TOP
========================================= */

const backTop =
  document.getElementById(
    "backTop"
  );


window.addEventListener(
  "scroll",
  () => {

    if (!backTop) return;

    backTop.style.display =
      window.scrollY > 500
        ? "block"
        : "none";

  }
);


if (backTop) {

  backTop.addEventListener(
    "click",
    () => {

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

    }
  );

}


/* =========================================
   API
========================================= */

const API_URL =
  "https://ganesh-b.onrender.com";


/* =========================================
   SAFE HTML
========================================= */

function escapeHTML(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


/* =========================================
   LOAD PROGRAMS
========================================= */

async function loadPrograms() {

  const list =
    document.getElementById(
      "programList"
    );

  if (!list) return;


  try {

    const response =
      await fetch(
        `${API_URL}/api/programs`
      );


    if (!response.ok) {

      throw new Error(
        "Programs API failed"
      );

    }


    const result =
      await response.json();


    /*
     * Backend response:
     *
     * {
     *   success: true,
     *   programs: [...]
     * }
     *
     * तसेच direct array सुद्धा support.
     */

    const programs =
      Array.isArray(result)
        ? result
        : Array.isArray(result.programs)
          ? result.programs
          : [];


    if (programs.length === 0) {

      list.innerHTML = `

        <div class="empty">

          📅 सध्या कोणतेही
          कार्यक्रम उपलब्ध नाहीत.

          <br><br>

          लवकरच नवीन कार्यक्रम
          येथे प्रकाशित केले जातील.

        </div>

      `;

      return;

    }


    list.innerHTML = "";


    programs.forEach(
      program => {

        const card =
          document.createElement(
            "div"
          );

        card.className =
          "event-card";


        const title =
          escapeHTML(
            program.title
          );


        const description =
          escapeHTML(
            program.description
          );


        const time =
          escapeHTML(
            program.program_time
          );


        let dateText = "";


        if (program.program_date) {

          const date =
            new Date(
              program.program_date
            );


          if (
            !isNaN(
              date.getTime()
            )
          ) {

            dateText =
              date.toLocaleDateString(
                "mr-IN",
                {
                  day: "numeric",
                  month: "long",
                  year: "numeric"
                }
              );

          } else {

            dateText =
              escapeHTML(
                program.program_date
              );

          }

        }


        card.innerHTML = `

          <div class="event-date">

            <strong>
              ${program.program_date
                ? new Date(
                    program.program_date
                  ).getDate()
                : ""}
            </strong>

            <span>
              ${program.program_date
                ? new Date(
                    program.program_date
                  ).toLocaleDateString(
                    "mr-IN",
                    {
                      month: "short"
                    }
                  )
                : ""}
            </span>

          </div>


          <div class="event-icon">
            🙏
          </div>


          <div class="event-info">

            <h3>
              ${title}
            </h3>

            <p>
              📅 ${dateText}
            </p>

            ${
              time
                ? `
                  <div class="event-time">
                    ⏰ ${time}
                  </div>
                `
                : ""
            }

            ${
              description
                ? `
                  <p>
                    ${description}
                  </p>
                `
                : ""
            }

          </div>

        `;


        list.appendChild(
          card
        );

      }
    );


  } catch (error) {

    console.error(
      "Programs Error:",
      error
    );


    list.innerHTML = `

      <div class="empty">

        ⚠️ कार्यक्रम सध्या
        load करता आले नाहीत.

        <br><br>

        कृपया थोड्या वेळाने पुन्हा प्रयत्न करा.

      </div>

    `;

  }

}


/* =========================================
   LOAD FINANCE
========================================= */

async function loadFinance() {

  try {

    const response =
      await fetch(
        `${API_URL}/api/finance/summary`
      );


    if (!response.ok) {

      throw new Error(
        "Finance API failed"
      );

    }


    const data =
      await response.json();


    const donation =
      Number(
        data.total_donations ??
        data.totalDonation ??
        0
      );


    const expense =
      Number(
        data.total_expenses ??
        data.totalExpense ??
        0
      );


    const balance =
      Number(
        data.balance ??
        donation - expense
      );


    const donationElement =
      document.getElementById(
        "publicDonation"
      );

    const expenseElement =
      document.getElementById(
        "publicExpense"
      );

    const balanceElement =
      document.getElementById(
        "publicBalance"
      );


    if (donationElement) {

      donationElement.textContent =
        formatMoney(donation);

    }


    if (expenseElement) {

      expenseElement.textContent =
        formatMoney(expense);

    }


    if (balanceElement) {

      balanceElement.textContent =
        formatMoney(balance);

    }


  } catch (error) {

    console.error(
      "Finance Error:",
      error
    );

  }

}


/* =========================================
   MONEY FORMAT
========================================= */

function formatMoney(amount) {

  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }
  ).format(
    Number(amount) || 0
  );

}


/* =========================================
   ADMIN ELEMENTS
========================================= */

const loginCard =
  document.getElementById(
    "loginCard"
  );


const dashboard =
  document.getElementById(
    "dashboard"
  );


const loginForm =
  document.getElementById(
    "loginForm"
  );


const errorBox =
  document.getElementById(
    "error"
  );


const logoutButton =
  document.getElementById(
    "logout"
  );


/* =========================================
   ADMIN LOGIN
========================================= */

if (loginForm) {

  loginForm.addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      const mobile =
        document
          .getElementById("mobile")
          ?.value
          .trim();


      const password =
        document
          .getElementById("password")
          ?.value;


      if (!mobile || !password) {

        if (errorBox) {

          errorBox.textContent =
            "Mobile आणि Password टाका.";

        }

        return;

      }


      if (errorBox) {

        errorBox.textContent =
          "Login होत आहे...";

      }


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

              body:
                JSON.stringify({
                  mobile,
                  password
                })

            }
          );


        const data =
          await response.json();


        if (!response.ok) {

          if (errorBox) {

            errorBox.textContent =
              data.message ||
              "Login failed";

          }

          return;

        }


        sessionStorage.setItem(
          "ganesh_token",
          data.token
        );


        sessionStorage.setItem(
          "ganesh_user",
          JSON.stringify(
            data.user
          )
        );


        showDashboard();


      } catch (error) {

        console.error(
          "Login Error:",
          error
        );


        if (errorBox) {

          errorBox.textContent =
            "Backend server शी connection होत नाही.";

        }

      }

    }
  );

}


/* =========================================
   SHOW DASHBOARD
========================================= */

function showDashboard() {

  if (loginCard) {

    loginCard.hidden = true;

  }


  if (dashboard) {

    dashboard.hidden = false;

  }

}


/* =========================================
   CHECK AUTHENTICATION
========================================= */

async function checkAuthentication() {

  const token =
    sessionStorage.getItem(
      "ganesh_token"
    );


  if (!token) return;


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


    if (!response.ok) {

      sessionStorage.clear();

      return;

    }


    const data =
      await response.json();


    console.log(
      "Logged in:",
      data.user
    );


    showDashboard();


  } catch (error) {

    console.error(
      "Authentication Error:",
      error
    );


    sessionStorage.clear();

  }

}


/* =========================================
   LOGOUT
========================================= */

if (logoutButton) {

  logoutButton.addEventListener(
    "click",
    () => {

      sessionStorage.removeItem(
        "ganesh_token"
      );


      sessionStorage.removeItem(
        "ganesh_user"
      );


      if (dashboard) {

        dashboard.hidden = true;

      }


      if (loginCard) {

        loginCard.hidden = false;

      }


      const password =
        document.getElementById(
          "password"
        );


      if (password) {

        password.value = "";

      }


      if (errorBox) {

        errorBox.textContent = "";

      }

    }
  );

}


/* =========================================
   START
========================================= */

loadPrograms();

loadFinance();

checkAuthentication();
