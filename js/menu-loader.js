// ==============================
// MENU LOADER
// Carrega o menu e inicia o sistema
// ==============================

(function () {
  const VERSION = "delta-prompts-20260724-menu-v11";

  function getMenuCandidates() {
   return [
  `menu.html?v=${VERSION}`,
  `${window.location.origin}/menu.html?v=${VERSION}`
];
  }

  async function fetchMenu() {
    for (const url of [...new Set(getMenuCandidates())]) {
      try {
        const res = await fetch(url, { cache: "default" });

        if (res.ok) {
          return await res.text();
        }
      } catch (e) {}
    }

    throw new Error("Falha ao carregar menu.");
  }

  async function iniciar() {
    const container = document.getElementById("menu");

    if (!container) return;

    try {
      container.innerHTML = await fetchMenu();

      // Inicializa o núcleo
      if (typeof window.initMenuCore === "function") {
        window.initMenuCore();
      }

      // Inicializa funcionalidades extras
      if (typeof window.initMenuFeatures === "function") {
        window.initMenuFeatures();
      }

    } catch (e) {
      console.error(e);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar, { once: true });
  } else {
    iniciar();
  }

})();