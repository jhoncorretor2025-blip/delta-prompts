// ==============================
// MENU LOADER + CONTROLES
// ==============================

(function() {

  function getMenuCandidates() {
    const path = window.location.pathname;
    const depth = Math.max(path.split('/').filter(Boolean).length - 1, 0);
    const relativeRoot = depth > 0 ? '../'.repeat(depth) : './';

    return [
      new URL('menu.html', window.location.href).href,
      `${relativeRoot}menu.html`,
      '/delta-prompts/menu.html'
    ];
  }

  async function fetchMenu() {
    const urls = [...new Set(getMenuCandidates())];
    let lastError;

    for (const url of urls) {
      try {
        const res = await fetch(url);
        if (res.ok) return res.text();
        lastError = new Error(`Falha ao carregar menu: ${res.status}`);
      } catch (err) {
        lastError = err;
      }
    }

    throw lastError || new Error('Falha ao carregar menu');
  }

  fetchMenu()
    .then(html => {
      const container = document.getElementById('menu');
      if (!container) {
        console.warn('menu-loader: #menu nao encontrado.');
        return;
      }

      container.innerHTML = html;
      attachMenuControls();
    })
    .catch(err => {
      console.error(err);
      const c = document.getElementById('menu');
      if (c) c.innerHTML = '<button class="menu-toggle" aria-label="Abrir menu" aria-expanded="false">☰</button><nav class="sidebar"><h2>Delta Prompts</h2><a href="/delta-prompts/index.html">🏠 Início</a><a href="/delta-prompts/biblioteca.html">📦 Biblioteca</a></nav>';
    });

  window.attachMenuControls = function attachMenuControls() {

    const menuEl = document.getElementById('menu');
    const sidebar = menuEl && menuEl.querySelector('.sidebar');
    const toggle = menuEl && menuEl.querySelector('.menu-toggle');

    if (!menuEl || !sidebar || !toggle) return;

    function setOpen(open) {
      sidebar.classList.toggle('active', open);
      toggle.setAttribute('aria-expanded', String(open));
      document.documentElement.classList.toggle('menu-open', open);
    }

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      setOpen(!sidebar.classList.contains('active'));
    });

    menuEl.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => setOpen(false));
    });

    document.addEventListener('click', (ev) => {
      if (!sidebar.classList.contains('active')) return;
      if (!sidebar.contains(ev.target) && !toggle.contains(ev.target)) setOpen(false);
    });

    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape') setOpen(false);
    });

    const sections = menuEl.querySelectorAll('.menu-section');

    sections.forEach(section => {
      const title = section.querySelector('.menu-title');
      const links = section.querySelector('.menu-links');

      if (!title || !links) return;

      const text = title.innerText.toLowerCase();
      if (text.includes('pessoal') || text.includes('trabalho')) {
        links.classList.add('active');
      }

      title.addEventListener('click', function() {
        menuEl.querySelectorAll('.menu-links').forEach(menu => {
          if (menu !== links) menu.classList.remove('active');
        });

        links.classList.toggle('active');
      });
    });

  };

})();


// ==============================
// GOOGLE ANALYTICS GLOBAL
// ==============================

(function () {

  const GA_ID = 'G-1YF2VY4HXW';

  if (window.gtag) return;

  const script = document.createElement('script');
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

  const STORAGE_KEY = 'deltaFavoritos';

  window.getFavoritos = function(){
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
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
        titulo: item.titulo || '',
        texto: item.texto || '',
        categoria: item.categoria || '',
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
      button.classList.add('favorito');
      button.innerText = '❤️';
    } else {
      button.classList.remove('favorito');
      button.innerText = '🤍';
    }
  };

  window.initFavButtons = function(root = document){
    root.querySelectorAll('.fav-btn').forEach(btn => updateFavButtonUI(btn));
  };

  document.addEventListener('click', function(e){
    const btn = e.target.closest && e.target.closest('.fav-btn');
    if (!btn) return;

    const id = btn.dataset.id;
    const titulo = btn.dataset.titulo || '';
    const texto = btn.dataset.texto || '';
    const categoria = btn.dataset.categoria || '';

    toggleFavorito({ id, titulo, texto, categoria });
    updateFavButtonUI(btn);
  });

  document.addEventListener('DOMContentLoaded', function(){
    initFavButtons();
  });

})();
