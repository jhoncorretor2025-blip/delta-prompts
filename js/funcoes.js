// ==============================
// BANCO DE PROMPTS - IMAGENS
// ==============================
const promptsImagens = [
  {
    id: 1,
    titulo: "📸 Foto LinkedIn Premium",
    nivel: "basico",
    quandoUsar: "Atualizar perfil profissional",
    prompt: "Transforme minha foto em retrato profissional estilo LinkedIn, fundo neutro desfocado, iluminação suave e expressão confiante.",
    tags: ["profissional", "linkedin", "retrato"]
  },
  {
    id: 2,
    titulo: "🏢 Foto Executiva",
    nivel: "basico",
    quandoUsar: "Transmitir autoridade",
    prompt: "Edite minha foto para retrato executivo corporativo com fundo de escritório moderno.",
    tags: ["corporativo", "executivo", "business"]
  },
  {
    id: 3,
    titulo: "🧑‍💼 Retrato Minimalista",
    nivel: "intermediario",
    quandoUsar: "Visual clean e elegante",
    prompt: "Transforme minha imagem em retrato minimalista moderno com fundo claro e iluminação suave.",
    tags: ["minimalista", "clean", "moderno"]
  },
  {
    id: 4,
    titulo: "🎨 Pintura Digital",
    nivel: "intermediario",
    quandoUsar: "Estilo artístico",
    prompt: "Transforme minha foto em pintura digital semi-realista com pinceladas visíveis e cores vibrantes.",
    tags: ["arte", "pintura", "digital"]
  },
  {
    id: 5,
    titulo: "🎬 Estilo Cinematográfico",
    nivel: "avancado",
    quandoUsar: "Visual dramático",
    prompt: "Edite minha foto com luz dramática cinematográfica, atmosfera de filme, color grading profissional e profundidade de campo.",
    tags: ["cinema", "dramático", "profissional"]
  },
  {
    id: 6,
    titulo: "🦸 Versão Super-Herói",
    nivel: "avancado",
    quandoUsar: "Avatar poderoso",
    prompt: "Transforme minha foto em super-herói moderno com traje épico, cenário de cidade futurista e efeitos de energia.",
    tags: ["herói", "avatar", "criativo"]
  }
];

// ==============================
// BANCO DE PROMPTS - ESTUDO
// ==============================
const promptsEstudo = [
  {
    id: 1,
    titulo: "📋 Plano de Estudos Semanal",
    nivel: "basico",
    quandoUsar: "Organizar rotina de estudos",
    prompt: "Crie um plano de estudos semanal para [matéria], com 2 horas diárias, incluindo revisões e exercícios práticos.",
    tags: ["organização", "planejamento", "rotina"]
  },
  {
    id: 2,
    titulo: "📚 Resumo de Conteúdo",
    nivel: "basico",
    quandoUsar: "Sintetizar material longo",
    prompt: "Faça um resumo estruturado do seguinte conteúdo, destacando os pontos principais em tópicos claros.",
    tags: ["resumo", "síntese", "conteúdo"]
  },
  {
    id: 3,
    titulo: "🧠 Mapa Mental",
    nivel: "intermediario",
    quandoUsar: "Visualizar conexões",
    prompt: "Crie um mapa mental detalhado sobre [tema], mostrando relações entre conceitos principais e secundários.",
    tags: ["mapa mental", "visual", "conexões"]
  },
  {
    id: 4,
    titulo: "📝 Questões de Prova",
    nivel: "intermediario",
    quandoUsar: "Simular avaliações",
    prompt: "Gere 10 questões de múltipla escolha sobre [tema] com gabarito comentado no final.",
    tags: ["prova", "questões", "avaliação"]
  },
  {
    id: 5,
    titulo: "🎓 Técnica Feynman",
    nivel: "avancado",
    quandoUsar: "Dominar conceitos difíceis",
    prompt: "Explique [conceito] como se eu tivesse 12 anos, usando analogias simples e exemplos do cotidiano.",
    tags: ["feynman", "didática", "compreensão"]
  },
  {
    id: 6,
    titulo: "📊 Análise de Erros",
    nivel: "avancado",
    quandoUsar: "Evoluir após provas",
    prompt: "Analise meus erros nesta prova e crie um plano específico para corrigir cada lacuna de conhecimento identificada.",
    tags: ["análise", "erros", "melhoria"]
  }
];

// ==============================
// RENDERIZAR CARDS
// ==============================
function renderizarCards(prompts, containerId){
  const container = document.getElementById(containerId);
  if(!container) return;

  container.innerHTML = prompts.map(p => `
    <div class="card" data-nivel="${p.nivel}" data-id="${p.id}">
      <span class="nivel nivel-${p.nivel}">${getNivelLabel(p.nivel)}</span>
      <h3>${p.titulo}</h3>
      <p class="quando-usar">💡 <strong>Quando usar:</strong> ${p.quandoUsar}</p>
      <p class="prompt-text">${p.prompt}</p>
      <div class="tags">
        ${p.tags.map(t => `<span class="tag">${t}</span>`).join('')}
      </div>
      <div class="acoes">
        <button class="btn-copy">📋 Copiar</button>
        <button class="btn-chat">🤖 ChatGPT</button>
        <button class="btn-gemini">✨ Gemini</button>
        <button class="btn-favorito">🤍 Favoritar</button>
      </div>
    </div>
  `).join('');

  // Re-inicializar eventos
  setTimeout(inicializarEventos, 100);
}

function getNivelLabel(nivel){
  const labels = {
    'basico': '🟢 Básico',
    'intermediario': '🟡 Intermediário',
    'avancado': '🔴 Avançado'
  };
  return labels[nivel] || nivel;
}

// ==============================
// HELPERS
// ==============================
function safeQuery(el, selector){
  return el ? el.querySelector(selector) : null;
}

function simpleHash(str){
  let h = 2166136261 >>> 0;
  for(let i = 0; i < str.length; i++){
    h ^= str.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return (h >>> 0).toString(36);
}

function pegarTexto(btn){
  if(!btn) return "";
  const card = btn.closest(".card");
  if(!card) return "";
  const p = safeQuery(card, ".prompt-text");
  return p ? p.innerText.trim() : "";
}

// ==============================
// AÇÕES DOS BOTÕES
// ==============================
async function copiar(btn){
  const txt = pegarTexto(btn);
  if(!txt) return;
  try{
    await navigator.clipboard.writeText(txt);
    const original = btn.innerText;
    btn.innerText = "✅ Copiado";
    setTimeout(() => btn.innerText = original, 1200);
  } catch(e){
    alert("Não foi possível copiar. Selecione e copie manualmente.");
  }
}

function chat(btn){
  const texto = pegarTexto(btn);
  if(!texto) return;
  const url = "https://chat.openai.com/?q=" + encodeURIComponent(texto);
  window.open(url, "_blank");
}

async function gemini(btn){
  const texto = pegarTexto(btn);
  if(!texto) return;
  try {
    await navigator.clipboard.writeText(texto);
  } catch(e){}
  const url = "https://gemini.google.com/app?prompt=" + encodeURIComponent(texto);
  window.open(url, "_blank");
}

// ==============================
// FAVORITOS
// ==============================
function _loadFavoritos(){
  try {
    return JSON.parse(localStorage.getItem("deltaFavoritos")) || [];
  } catch(e) {
    return [];
  }
}

function _saveFavoritos(list){
  try {
    localStorage.setItem("deltaFavoritos", JSON.stringify(list));
  } catch(e) {}
}

function isFavoritoId(id){
  if(!id) return false;
  return _loadFavoritos().some(f => f.id === id);
}

function atualizarUIbtnFav(btn, id){
  if(!btn) return;
  if(isFavoritoId(id)){
    btn.innerText = "⭐ Salvo";
    btn.classList.add("is-fav");
  } else {
    btn.innerText = "🤍 Favoritar";
    btn.classList.remove("is-fav");
  }
}

function favoritar(btn){
  if(!btn) return;
  const card = btn.closest(".card");
  if(!card) return;
  const titulo = safeQuery(card, "h3")?.innerText || "";
  const texto = pegarTexto(btn);
  let id = card.dataset.id || simpleHash(titulo + "|" + texto);
  card.dataset.id = id;
  
  let lista = _loadFavoritos();
  const idx = lista.findIndex(x => x.id === id);
  
  if(idx === -1){
    lista.unshift({ id, titulo, texto, createdAt: Date.now() });
    _saveFavoritos(lista);
    btn.innerText = "💖 Salvo";
    setTimeout(() => atualizarUIbtnFav(btn, id), 900);
  } else {
    lista.splice(idx, 1);
    _saveFavoritos(lista);
    btn.innerText = "🤍 Removido";
    setTimeout(() => atualizarUIbtnFav(btn, id), 900);
  }
  atualizarUIbtnFav(btn, id);
}

// ==============================
// INICIALIZAÇÃO
// ==============================
function inicializarEventos(){
  document.querySelectorAll(".card").forEach(card => {
    const id = card.dataset.id || simpleHash(card.innerText);
    card.dataset.id = id;

    const btnFav = safeQuery(card, ".btn-favorito");
    if(btnFav) atualizarUIbtnFav(btnFav, id);

    const btnCopy = safeQuery(card, ".btn-copy");
    if(btnCopy) btnCopy.addEventListener("click", () => copiar(btnCopy));
    
    const btnChat = safeQuery(card, ".btn-chat");
    if(btnChat) btnChat.addEventListener("click", () => chat(btnChat));
    
    const btnGem = safeQuery(card, ".btn-gemini");
    if(btnGem) btnGem.addEventListener("click", () => gemini(btnGem));
    
    if(btnFav && !btnFav.dataset.bound){
      btnFav.addEventListener("click", () => favoritar(btnFav));
      btnFav.dataset.bound = "1";
    }
  });
}

function atualizarContador(visiveis){
  const contador = document.getElementById("contador");
  if(contador) contador.textContent = visiveis;
  
  const container = document.querySelector(".galeria-prompts");
  let msg = document.querySelector(".sem-resultado");
  
  if(visiveis === 0){
    if(!msg){
      msg = document.createElement("div");
      msg.className = "sem-resultado";
      msg.innerHTML = "<div style='text-align:center;padding:40px;'><h3>😕 Nenhum prompt encontrado</h3><p>Tente outros termos ou limpe os filtros</p></div>";
      container?.appendChild(msg);
    }
  } else {
    msg?.remove();
  }
}

// ==============================
// DOM READY
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  // Renderizar prompts se existir container
  if(document.getElementById("galeria-imagens")){
    renderizarCards(promptsImagens, "galeria-imagens");
  }
  if(document.getElementById("galeria-estudo")){
    renderizarCards(promptsEstudo, "galeria-estudo");
  }
  
  // Inicializar filtros e eventos
  if(typeof initFiltros === "function") initFiltros();
  inicializarEventos();
  
  // Atualizar contador inicial
  const cards = document.querySelectorAll(".card");
  const contador = document.getElementById("contador");
  if(contador) contador.textContent = cards.length;
});
