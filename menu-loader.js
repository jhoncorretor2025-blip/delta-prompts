// ==============================
// MENU LOADER + CONTROLES
// ==============================

(function() {

  function getMenuCandidates() {
    const path = window.location.pathname;
    const depth = Math.max(path.split('/').filter(Boolean).length - 1, 0);
    const relativeRoot = depth > 0 ? '../'.repeat(depth) : './';
    const version = 'delta-prompts-20260607';

    return [
      `${new URL('menu.html', window.location.href).href}?v=${version}`,
      `${relativeRoot}menu.html?v=${version}`,
      `/delta-prompts/menu.html?v=${version}`
    ];
  }

  async function fetchMenu() {
    const urls = [...new Set(getMenuCandidates())];
    let lastError;

    for (const url of urls) {
      try {
        const res = await fetch(url, { cache: 'no-store' });
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
      if (c) c.innerHTML = '<button class="menu-toggle" aria-label="Abrir menu" aria-expanded="false">☰</button><nav class="sidebar"><h2>Delta Prompts</h2><a href="/delta-prompts/index.html">🏠 Início</a><a href="/delta-prompts/paginas/automacao-ia.html">🤖 Automação com IA</a><a href="/delta-prompts/biblioteca.html">📦 Biblioteca</a><a href="/delta-prompts/favoritos.html">❤️ Favoritos</a></nav>';
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
      if (text.includes('pessoal') || text.includes('trabalho') || text.includes('produtividade')) {
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
// PADRAO VISUAL DAS CATEGORIAS
// ==============================

(function(){
  function enhanceCategoryPage() {
    const hasPromptCards = document.querySelector('.prompt-text, pre.prompt-text, #lista');
    const hasCategoryHeading = document.querySelector('main > h1');
    if (!hasPromptCards || !hasCategoryHeading || document.body.classList.contains('category-page')) return;

    document.body.classList.add('category-page');
  }

  document.addEventListener('DOMContentLoaded', enhanceCategoryPage);
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
  const LEGACY_KEYS = ['deltaPrompts', 'deltaFav', 'favoritosIdeiasPraticas'];

  function hashText(text) {
    let hash = 0;
    const value = String(text || '');
    for (let i = 0; i < value.length; i++) {
      hash = ((hash << 5) - hash) + value.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(36);
  }

  function readList(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(value) ? value : [];
    } catch(e) {
      return [];
    }
  }

  function normalizeFavorite(item, source = STORAGE_KEY, index = 0) {
    if (typeof item === 'string') {
      const text = item.trim();
      if (!text) return null;
      return {
        id: `${source}-${hashText(text)}`,
        titulo: 'Prompt favorito',
        texto: text,
        categoria: 'Geral',
        createdAt: Date.now()
      };
    }

    if (!item || typeof item !== 'object') return null;

    if (source === 'deltaPrompts' && item.favorito !== true) return null;
    if (source === 'favoritosIdeiasPraticas' && typeof item !== 'object') return null;

    const titulo = item.titulo || item.title || item.nome || item.categoria || 'Prompt favorito';
    const texto = item.texto || item.conteudo || item.prompt || item.descricao || '';
    if (!String(titulo).trim() && !String(texto).trim()) return null;

    return {
      id: String(item.id || `${source}-${hashText(`${titulo}-${texto}-${index}`)}`),
      titulo: String(titulo).trim(),
      texto: String(texto).trim(),
      categoria: String(item.categoria || item.category || 'Geral').trim(),
      createdAt: Number(item.createdAt || item.data || Date.now())
    };
  }

  function dedupeFavorites(list) {
    const seen = new Set();
    return list.filter(item => {
      const normalized = normalizeFavorite(item);
      if (!normalized) return false;
      const key = normalized.id || hashText(`${normalized.titulo}-${normalized.texto}`);
      if (seen.has(key)) return false;
      seen.add(key);
      Object.assign(item, normalized);
      return true;
    });
  }

  function migrateLegacyFavorites(current) {
    const migrated = [];
    LEGACY_KEYS.forEach(key => {
      readList(key).forEach((item, index) => {
        const normalized = normalizeFavorite(item, key, index);
        if (normalized) migrated.push(normalized);
      });
    });

    const merged = dedupeFavorites([...current, ...migrated]);
    if (migrated.length || merged.length !== current.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    }
    return merged;
  }

  window.getFavoritos = function(){
    return migrateLegacyFavorites(readList(STORAGE_KEY).map((item, index) => normalizeFavorite(item, STORAGE_KEY, index)).filter(Boolean));
  };

  window.saveFavoritos = function(list){
    const normalized = dedupeFavorites((Array.isArray(list) ? list : []).map((item, index) => normalizeFavorite(item, STORAGE_KEY, index)).filter(Boolean));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    window.dispatchEvent(new CustomEvent('delta:favoritos-updated', { detail: normalized }));
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
    'Mapear Processo Repetitivo': 'Atue como especialista em automação com IA. Analise esta rotina: [DESCREVA A ROTINA]. Identifique etapas repetitivas, informações necessárias, ferramentas envolvidas, o que pode ser automatizado e o fluxo ideal.',
    'Descrição de Imóvel': 'Atue como corretor imobiliário especialista em vendas. Crie uma descrição persuasiva para este imóvel: [INSIRA OS DADOS]. Destaque localização, diferenciais, público ideal e chamada para ação.',
    'Descricao de Imovel': 'Atue como corretor imobiliário especialista em vendas. Crie uma descrição persuasiva para este imóvel: [INSIRA OS DADOS]. Destaque localização, diferenciais, público ideal e chamada para ação.',
    'Copy de Vendas': 'Atue como copywriter profissional. Crie uma copy de vendas para: [PRODUTO OU SERVIÇO]. Inclua promessa, benefícios, prova, objeções e chamada para ação.',
    'Post para Instagram': 'Atue como estrategista de redes sociais. Crie um post para Instagram sobre: [TEMA]. Inclua gancho, legenda, hashtags e chamada para ação.'
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
      toast('Não foi possível copiar automaticamente');
    }
  }

  function addWorkflowSection() {
    if (!document.getElementById('home-workflow') || document.querySelector('.workflow-grid')) return;

    const section = document.createElement('section');
    section.className = 'workflow-section';
    section.innerHTML = `
      <div class="section-header">
        <h2>Caminhos rápidos</h2>
        <p>Escolha o melhor ponto de partida para criar, encontrar ou guardar prompts.</p>
      </div>
      <div class="workflow-grid">
        <a class="workflow-card" href="cadastro.html"><span>➕</span><strong>Novo Prompt</strong><small>Monte um prompt personalizado do zero.</small></a>
        <a class="workflow-card" href="prompt_pro.html"><span>⚡</span><strong>Gerador Pro</strong><small>Use um fluxo guiado para chegar mais rápido ao resultado.</small></a>
        <a class="workflow-card" href="biblioteca.html"><span>📦</span><strong>Biblioteca</strong><small>Veja tudo que já existe e encontre modelos prontos.</small></a>
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
        <p>Use estes filtros para ir direto ao tipo de resultado que você quer gerar.</p>
      </div>
      <div class="objective-grid">
        <button type="button" data-home-search="automação">Automatizar tarefas</button>
        <button type="button" data-home-search="vendas">Vender melhor</button>
        <button type="button" data-home-search="imobiliario">Divulgar imóvel</button>
        <button type="button" data-home-search="estudo">Estudar mais rápido</button>
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
    const hero = document.querySelector('.hero');
    if (hero) hero.after(marker);
    else if (search) search.after(marker);

    setTimeout(() => {
      addWorkflowSection();
      addObjectiveSection();
      enhanceFeaturedCards();
    }, 0);
  });
})();
