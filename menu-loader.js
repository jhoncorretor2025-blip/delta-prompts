// menu-loader.js
(function() {
  const MENU_PATH = "/delta-prompts/menu.html"; // ajuste se o repo mudar

  // carrega o HTML do menu e injeta
  fetch(MENU_PATH)
    .then(res => {
      if (!res.ok) throw new Error("Falha ao carregar menu: " + res.status);
      return res.text();
    })
    .then(html => {
      const container = document.getElementById("menu");
      if (!container) {
        console.warn("menu-loader: #menu não encontrado na página.");
        return;
      }
      container.innerHTML = html;

      // depois de injetar, liga os controles
      attachMenuControls();
    })
    .catch(err => {
      console.error(err);
      // opcional: mostrar aviso simples para debug
      const c = document.getElementById("menu");
      if (c) c.innerHTML = '<div style="padding:16px;color:#c00;">Erro ao carregar menu</div>';
    });

  // ---- controles do menu (toggle, clique fora, bloquear scroll) ----
  window.attachMenuControls = function attachMenuControls() {
    const menuEl = document.getElementById("menu");
    const sidebar = menuEl.querySelector(".sidebar");
    const toggle = menuEl.querySelector(".menu-toggle");

    if (!sidebar || !toggle) {
      // se não encontrou, nada a fazer
      return;
    }

    // Toggle function
    function setOpen(open) {
      if (open) {
        sidebar.classList.add("active");
        toggle.setAttribute("aria-expanded", "true");
        document.documentElement.classList.add("menu-open"); // para bloquear scroll
      } else {
        sidebar.classList.remove("active");
        toggle.setAttribute("aria-expanded", "false");
        document.documentElement.classList.remove("menu-open");
      }
    }

    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      setOpen(!sidebar.classList.contains("active"));
    });

    // fechar ao clicar em link (útil no mobile)
    menuEl.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", () => setOpen(false));
    });

    // fechar se clicar fora do menu (no documento)
    document.addEventListener("click", (ev) => {
      if (!sidebar.classList.contains("active")) return;
      if (!sidebar.contains(ev.target) && !toggle.contains(ev.target)) {
        setOpen(false);
      }
    });

    // fechar com Esc
    document.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape") setOpen(false);
    });
  };
})();

// ==============================
// GOOGLE ANALYTICS GLOBAL
// ==============================

(function () {

  const GA_ID = "G-1YF2VY4HXW";

  // Evita carregar duas vezes
  if (window.gtag) return;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', GA_ID);

})();
