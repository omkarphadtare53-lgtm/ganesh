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

      icon.classList.toggle(
        "fa-bars"
      );

      icon.classList.toggle(
        "fa-xmark"
      );

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

          icon.classList.remove(
            "fa-xmark"
          );

          icon.classList.add(
            "fa-bars"
          );

        }

      });

    });

}


/* =========================================
   COUNTDOWN
========================================= */

const festivalDate =
  new Date(
    "2026-09-06T10:00:00"
  ).getTime();


function updateCountdown() {

  const countdown =
    festivalDate - Date.now();

  if (countdown <= 0) return;


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
   GALLERY AUTO SLIDE
========================================= */

const galleryItems =
  document.querySelectorAll(
    ".gallery-item"
  );


let currentGallery =
  0;


function showGallerySlide(index) {

  if (!galleryItems.length) return;


  galleryItems.forEach(
    (item, i) => {

      item.style.transition =
        "opacity 0.6s ease, transform 0.6s ease";

      if (i === index) {

        item.style.opacity = "1";
        item.style.transform =
          "scale(1)";

      } else {

        item.style.opacity = "0.75";
        item.style.transform =
          "scale(0.97)";

      }

    }
  );

}


if (galleryItems.length > 0) {

  showGallerySlide(0);


  setInterval(() => {

    currentGallery++;

    if (
      currentGallery >=
      galleryItems.length
    ) {

      currentGallery = 0;

    }

    showGallerySlide(
      currentGallery
    );

  }, 3000);

}


/* =========================================
   GALLERY HOVER EFFECT
========================================= */

galleryItems.forEach(item => {

  item.addEventListener(
    "mouseenter",
    () => {

      item.style.transform =
        "scale(1.03)";

    }
  );


  item.addEventListener(
    "mouseleave",
    () => {

      item.style.transform =
        "scale(1)";

    }
  );

});


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
   ADMIN API
========================================= */

const API_URL =
  "https://ganesh-b.onrender.com";


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
   LOGIN
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
   START AUTH CHECK
========================================= */

checkAuthentication();
