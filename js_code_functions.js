/* ============================================================
   ⏱ CONFIGURACIÓN
   ============================================================ */
const BLOCK_TIME = 10 * 60 * 1000; // 30 minutos
// const BLOCK_TIME = 60 * 60 * 1000; // 1 hora

/* ============================================================
   📋 COPIAR AL PORTAPAPELES
   ============================================================ */
function copiarAlPortapapeles(texto) {
  navigator.clipboard.writeText(texto)
    .then(() => mostrarToast("Copied: " + texto))
    .catch(err => {
      mostrarToast("Error to copy");
      console.error("Error to copy:", err);
    });
}

/* ============================================================
   🔔 TOAST
   ============================================================ */
function mostrarToast(mensaje) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = mensaje;
  toast.classList.add("show");

  setTimeout(() => toast.classList.remove("show"), 2500);
}

/* ============================================================
   🎥 VIDEO PRINCIPAL
   ============================================================ */
function changeVideo(element) {
  const mainVideo = document.getElementById("mainVideo");
  if (!mainVideo || !element) return;

  mainVideo.pause();
  mainVideo.src = element.getAttribute("src");
  mainVideo.load();
  mainVideo.play();

  document.querySelectorAll(".video-thumb")
    .forEach(v => v.classList.remove("active"));

  element.classList.add("active");
}

/* ============================================================
   🔒 BLOQUEO TEMPORAL FORMULARIO
   ============================================================ */
function bloquearFormularioTemporal(form, overlay) {
  const until = Date.now() + BLOCK_TIME;
  localStorage.setItem("contactBlockedUntil", until);
  activarBloqueo(form, overlay);
}

function activarBloqueo(form, overlay) {
  const blockedUntil = localStorage.getItem("contactBlockedUntil");
  if (!blockedUntil) return;

  if (Date.now() < blockedUntil) {
    if (overlay) overlay.classList.add("active");

    form.querySelectorAll("input, textarea, button")
      .forEach(el => el.disabled = true);

    iniciarCuentaRegresiva(blockedUntil, overlay);
  } else {
    localStorage.removeItem("contactBlockedUntil");
  }
}

function iniciarCuentaRegresiva(time, overlay) {
  const label = document.getElementById("blockTimer");
  if (!label) return;

  const interval = setInterval(() => {
    const restante = time - Date.now();

    if (restante <= 0) {
      clearInterval(interval);
      localStorage.removeItem("contactBlockedUntil");
      if (overlay) overlay.classList.remove("active");
      location.reload();
      return;
    }

    const min = Math.floor(restante / 60000);
    const sec = Math.floor((restante % 60000) / 1000);
    label.textContent = `You can send another message in ${min}:${sec
      .toString()
      .padStart(2, "0")}`;
  }, 1000);
}

/* ============================================================
   🎬 VIDEO MODAL + ✉️ EMAILJS
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {

  /* ---------- VIDEO MODAL (SAFE) ---------- */
  const modal = document.getElementById("videoModal");
  const modalVideo = document.getElementById("modalVideo");
  const closeBtn = document.querySelector(".video-close");

  if (modal && modalVideo && closeBtn) {
    document.querySelectorAll(".video-thumb").forEach(thumb => {

      thumb.addEventListener("loadedmetadata", () => {
        thumb.currentTime = 0.5;
      });

      thumb.addEventListener("seeked", () => {
        const canvas = document.createElement("canvas");
        canvas.width = thumb.videoWidth;
        canvas.height = thumb.videoHeight;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(thumb, 0, 0, canvas.width, canvas.height);

        thumb.poster = canvas.toDataURL("image/jpeg", 0.85);
        thumb.pause();
      });

      thumb.addEventListener("click", () => {
        modalVideo.src = thumb.dataset.video;
        modalVideo.load();
        modal.classList.add("active");
        modalVideo.play();
      });
    });

    closeBtn.addEventListener("click", () => {
      modalVideo.pause();
      modalVideo.src = "";
      modal.classList.remove("active");
    });

    modal.addEventListener("click", e => {
      if (e.target === modal) {
        modalVideo.pause();
        modalVideo.src = "";
        modal.classList.remove("active");
      }
    });
  }

  /* ---------- EMAILJS FORM ---------- */
  const form = document.getElementById("contactForm");
  const overlay = document.getElementById("sendOverlay");
  if (!form) return;

  // 🔒 Revisar bloqueo al cargar
  activarBloqueo(form, overlay);

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // 1️⃣ Correo para TI
    emailjs.sendForm(
      "service_61l76vu",
      "template_rtr8cel",
      this
    );

    // 2️⃣ Correo para el USUARIO
    emailjs.sendForm(
      "service_61l76vu",
      "template_c9zd2rb",
      this
    )
    .then(() => {
      mostrarToast("Message sent successfully!");
      bloquearFormularioTemporal(this, overlay);
      this.reset();
    })
    .catch(() => {
      mostrarToast("Error sending message");
    });
  });

});
