// ==============================
// MENU LOADER + CONTROLES
// ==============================

(function() {

  const MENU_PATH = "/delta-prompts/menu.html";

  // Carrega o HTML do menu
  fetch(MENU_PATH)
    .then(res => {
      if (!res.ok) throw new Error("Falha ao carregar menu: " + res.status);
      return res.text();
    })
    .then(html => {
      const container = document.getElementById("menu");
      if (!container) {
        console.warn("menu-loader: #menu não encontrado.");
        return;
      }

      container.innerHTML = html;

      // Ativa controles após injetar
      attachMenuControls();
    })
    .catch(err => {
      console.error(err);
      const c = document.getElementById("menu");
      if (c) c.innerHTML = '<div style="padding:16px;color:#c00;">Erro ao carregar menu</div>';
    });

  // ==========================================
  // CONTROLES DO MENU
  // ==========================================
  window.attachMenuControls = function attachMenuControls() {

    const menuEl = document.getElementById("menu");
    const sidebar = menuEl.querySelector(".sidebar");
    const toggle = menuEl.querySelector(".menu-toggle");

    if (!sidebar || !toggle) return;

    // ==============================
    // TOGGLE MOBILE
    // ==============================
    function setOpen(open) {
      if (open) {
        sidebar.classList.add("active");
        toggle.setAttribute("aria-expanded", "true");
        document.documentElement.classList.add("menu-open");
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

    menuEl.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", () => setOpen(false));
    });

    document.addEventListener("click", (ev) => {
      if (!sidebar.classList.contains("active")) return;
      if (!sidebar.contains(ev.target) && !toggle.contains(ev.target)) {
        setOpen(false);
      }
    });

    document.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape") setOpen(false);
    });

    // ==============================
    // ACORDEÃO (DESKTOP)
    // ==============================
    const sections = menuEl.querySelectorAll(".menu-section");

    sections.forEach(section => {

      const title = section.querySelector(".menu-title");
      const links = section.querySelector(".menu-links");

      if (!title || !links) return;

      // 🔹 Abre Pessoal e Trabalho por padrão
      const text = title.innerText.toLowerCase();
      if (text.includes("pessoal") || text.includes("trabalho")) {
        links.classList.add("active");
      }

      // 🔹 Clique para abrir/fechar
      title.addEventListener("click", function() {

        // Fecha todos
        menuEl.querySelectorAll(".menu-links").forEach(menu => {
          if (menu !== links) {
            menu.classList.remove("active");
          }
        });

        // Alterna o atual
        links.classList.toggle("active");
      });

    });

  };

})();


// ==============================
// GOOGLE ANALYTICS GLOBAL
// ==============================

(function () {

  const GA_ID = "G-1YF2VY4HXW";

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


// ==============================
// FAVORITOS
// ==============================

(function(){

  const STORAGE_KEY = "deltaFavoritos";

  window.getFavoritos = function(){
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch(e) {
      return [];
    }
  };

  window.saveFavoritos = function(list){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  };

  window.isFavorito = function(id){
    return getFavoritos().some(f => f.id === id);
  };

  window.toggleFavorito = function(item){
    const list = getFavoritos();
    const exists = list.findIndex(f => f.id === item.id);

    if (exists === -1) {
      list.unshift({
        id: item.id,
        titulo: item.titulo || "",
        texto: item.texto || "",
        categoria: item.categoria || "",
        createdAt: Date.now()
      });
      saveFavoritos(list);
      return true;
    } else {
      list.splice(exists,1);
      saveFavoritos(list);
      return false;
    }
  };

  window.updateFavButtonUI = function(button){
    const id = button.dataset.id;
    if (!id) return;

    if (isFavorito(id)) {
      button.classList.add("favorito");
      button.innerText = "❤️";
    } else {
      button.classList.remove("favorito");
      button.innerText = "🤍";
    }
  };

  window.initFavButtons = function(root = document){
    root.querySelectorAll(".fav-btn").forEach(btn => updateFavButtonUI(btn));
  };

  document.addEventListener("click", function(e){
    const btn = e.target.closest && e.target.closest(".fav-btn");
    if (!btn) return;

    const id = btn.dataset.id;
    const titulo = btn.dataset.titulo || "";
    const texto = btn.dataset.texto || "";
    const categoria = btn.dataset.categoria || "";

    toggleFavorito({ id, titulo, texto, categoria });
    updateFavButtonUI(btn);
  });

  document.addEventListener("DOMContentLoaded", function(){
    initFavButtons();
  });

})();
