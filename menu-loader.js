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


// ==============================
// MELHORIAS DA HOME
// ==============================

(function(){
  const promptMap = {
    'Descricao de Imovel': 'Atue como corretor imobiliario especialista em vendas. Crie uma descricao persuasiva para este imovel: [INSIRA OS DADOS]. Destaque localizacao, diferenciais, publico ideal e chamada para acao.',
    'Copy de Vendas': 'Atue como copywriter profissional. Crie uma copy de vendas para: [PRODUTO OU SERVICO]. Inclua promessa, beneficios, prova, objeções e chamada para acao.',
    'Post para Instagram': 'Atue como estrategista de redes sociais. Crie um post para Instagram sobre: [TEMA]. Inclua gancho, legenda, hashtags e chamada para acao.'
  };

  function toast(message) {
    let el = document.querySelector('.delta-toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'delta-toast';
      document.body.appendChild(el);
    }

    el.textContent = message;
    el.classList.add('visible');
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.remove('visible'), 2200);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      toast('Prompt copiado');
    } catch (err) {
      toast('Nao foi possivel copiar automaticamente');
    }
  }

  function addWorkflowSection() {
    if (!document.getElementById('home-workflow') || document.querySelector('.workflow-grid')) return;

    const section = document.createElement('section');
    section.className = 'workflow-section';
    section.innerHTML = `
      <div class="section-header">
        <h2>Caminhos rapidos</h2>
        <p>Escolha o melhor ponto de partida para criar, encontrar ou guardar prompts.</p>
      </div>
      <div class="workflow-grid">
        <a class="workflow-card" href="cadastro.html"><span>➕</span><strong>Novo Prompt</strong><small>Monte um prompt personalizado do zero.</small></a>
        <a class="workflow-card" href="prompt_pro.html"><span>⚡</span><strong>Gerador Pro</strong><small>Use um fluxo guiado para chegar mais rapido ao resultado.</small></a>
        <a class="workflow-card" href="biblioteca.html"><span>📦</span><strong>Biblioteca</strong><small>Veja tudo que ja existe e encontre modelos prontos.</small></a>
      </div>
    `;

    document.getElementById('home-workflow').replaceWith(section);
  }

  function addObjectiveSection() {
    const categories = document.querySelector('.categories-section');
    if (!categories || document.querySelector('.objective-section')) return;

    const section = document.createElement('section');
    section.className = 'objective-section';
    section.innerHTML = `
      <div class="section-header">
        <h2>Atalhos por objetivo</h2>
        <p>Use estes filtros para ir direto ao tipo de resultado que voce quer gerar.</p>
      </div>
      <div class="objective-grid">
        <button type="button" data-home-search="vendas">Vender melhor</button>
        <button type="button" data-home-search="imobiliario">Divulgar imovel</button>
        <button type="button" data-home-search="estudo">Estudar mais rapido</button>
        <button type="button" data-home-search="redes sociais">Criar posts</button>
        <button type="button" data-home-search="planejamento">Planejar rotina</button>
        <button type="button" data-home-search="youtube">Criar videos</button>
      </div>
    `;

    categories.before(section);
  }

  function enhanceFeaturedCards() {
    document.querySelectorAll('.featured-card').forEach(card => {
      if (card.querySelector('.card-actions')) return;

      const title = card.querySelector('h3') && card.querySelector('h3').textContent.trim();
      const prompt = promptMap[title];
      if (!prompt) return;

      const actions = document.createElement('div');
      actions.className = 'card-actions';
      actions.innerHTML = `
        <button type="button" data-copy-text="${prompt.replace(/"/g, '&quot;')}">Copiar</button>
        <button type="button" data-favorite-home="true" data-id="home-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}" data-titulo="${title}" data-texto="${prompt.replace(/"/g, '&quot;')}" data-categoria="Recomendados">Favoritar</button>
      `;

      card.appendChild(actions);
    });
  }

  document.addEventListener('click', function(e) {
    const objective = e.target.closest && e.target.closest('[data-home-search]');
    if (objective) {
      const input = document.getElementById('busca-global');
      if (input) {
        input.value = objective.dataset.homeSearch;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    const copy = e.target.closest && e.target.closest('[data-copy-text]');
    if (copy) copyText(copy.dataset.copyText);

    const fav = e.target.closest && e.target.closest('[data-favorite-home]');
    if (fav && window.toggleFavorito) {
      const saved = window.toggleFavorito({
        id: fav.dataset.id,
        titulo: fav.dataset.titulo,
        texto: fav.dataset.texto,
        categoria: fav.dataset.categoria
      });
      fav.textContent = saved ? 'Favorito' : 'Favoritar';
      toast(saved ? 'Adicionado aos favoritos' : 'Removido dos favoritos');
    }
  });

  document.addEventListener('DOMContentLoaded', function() {
    if (!document.getElementById('featured-grid')) return;

    const marker = document.createElement('div');
    marker.id = 'home-workflow';
    const search = document.querySelector('.search-section');
    if (search) search.after(marker);

    setTimeout(() => {
      addWorkflowSection();
      addObjectiveSection();
      enhanceFeaturedCards();
    }, 0);
  });
})();
