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

// ===== FAVORITOS: persistência & UI (colocar no menu-loader.js) =====
(function(){
  const STORAGE_KEY = "deltaFavoritos";

  // ler favoritos
  window.getFavoritos = function(){
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch(e) {
      console.error("Favoritos: parse error", e);
      return [];
    }
  };

  // salvar array de favoritos
  window.saveFavoritos = function(list){
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch(e){
      console.error("Favoritos: save error", e);
    }
  };

  // checa se id já é favorito
  window.isFavorito = function(id){
    return getFavoritos().some(f => f.id === id);
  };

  // toggle favorito: adiciona/remova pelo objeto {id,titulo,texto,categoria}
  window.toggleFavorito = function(item){
    const list = getFavoritos();
    const exists = list.findIndex(f => f.id === item.id);
    if (exists === -1) {
      // adiciona
      list.unshift({
        id: item.id,
        titulo: item.titulo || "",
        texto: item.texto || "",
        categoria: item.categoria || "",
        createdAt: Date.now()
      });
      saveFavoritos(list);
      // analytics
      if (window.gtag) gtag('event','clique_botao',{ botao:'favoritar', pagina: window.location.pathname, item_id: item.id });
      return true; // agora é favorito
    } else {
      // remove
      list.splice(exists,1);
      saveFavoritos(list);
      if (window.gtag) gtag('event','clique_botao',{ botao:'desfavoritar', pagina: window.location.pathname, item_id: item.id });
      return false; // removido
    }
  };

  // atualiza aparência do botão (adiciona classe .favorito)
  window.updateFavButtonUI = function(button){
    const id = button.dataset.id;
    if (!id) return;
    if (isFavorito(id)) {
      button.classList.add("favorito");
      button.innerText = "❤️";
      button.title = "Remover dos favoritos";
    } else {
      button.classList.remove("favorito");
      button.innerText = "🤍";
      button.title = "Adicionar aos favoritos";
    }
  };

  // renderiza (inicializa) todos botões favoritar da página
  window.initFavButtons = function(root = document){
    root.querySelectorAll(".fav-btn").forEach(btn => updateFavButtonUI(btn));
  };

  // Event delegation: responde a cliques em botões .fav-btn
  document.addEventListener("click", function(e){
    const btn = e.target.closest && e.target.closest(".fav-btn");
    if (!btn) return;
    // ler os dados do card via data-attrs
    const id = btn.dataset.id || String(Math.random()).slice(2,10);
    const titulo = btn.dataset.titulo || btn.dataset.title || document.title || "Prompt";
    const texto = btn.dataset.texto || btn.dataset.content || "";
    const categoria = btn.dataset.categoria || "";

    const becameFav = toggleFavorito({ id, titulo, texto, categoria });
    updateFavButtonUI(btn);

    // feedback visual rápido
    btn.classList.add("pulse");
    setTimeout(()=>btn.classList.remove("pulse"),500);
  });

  // inicializa quando DOM estiver pronto (se necessário)
  document.addEventListener("DOMContentLoaded", function(){
    initFavButtons();
  });

})();

