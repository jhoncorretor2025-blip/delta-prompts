// ===== Helpers =====
function safeQuery(el, selector){
  return el ? el.querySelector(selector) : null;
}

// pequeno hash (não criptográfico) para gerar id a partir do texto
function simpleHash(str){
  let h = 2166136261 >>> 0;
  for(let i = 0; i < str.length; i++){
    h ^= str.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return (h >>> 0).toString(36);
}

// ===== PEGAR TEXTO DO CARD =====
function pegarTexto(btn){
  if(!btn) return "";
  const card = btn.closest(".card");
  if(!card) return "";
  const p = safeQuery(card, ".prompt-text");
  return p ? p.innerText.trim() : "";
}

// ===== COPIAR =====
async function copiar(btn){
  const txt = pegarTexto(btn);
  if(!txt) return;
  try{
    await navigator.clipboard.writeText(txt);
    const original = btn.innerText;
    btn.innerText = "✅ Copiado";
    setTimeout(() => btn.innerText = original, 1200);
  } catch(e){
    console.error("Erro ao copiar:", e);
    alert("Não foi possível copiar automaticamente. Selecione o texto e copie manualmente.");
  }
}

// ===== ABRIR CHATGPT =====
function chat(btn){
  const texto = pegarTexto(btn);
  if(!texto) return;
  const url = "https://chat.openai.com/?q=" + encodeURIComponent(texto);
  window.open(url, "_blank");
}

// ===== ABRIR GEMINI =====
async function gemini(btn){
  const texto = pegarTexto(btn);
  if(!texto) return;
  try {
    await navigator.clipboard.writeText(texto);
  } catch(e){
    console.warn("Clipboard não disponível:", e);
  }
  const url = "https://gemini.google.com/app?prompt=" + encodeURIComponent(texto);
  window.open(url, "_blank");
}

// ===== FAVORITAR (TOGGLE) =====
function _loadFavoritos(){
  try {
    return JSON.parse(localStorage.getItem("deltaFavoritos")) || [];
  } catch(e) {
    console.error("parse favs", e);
    return [];
  }
}

function _saveFavoritos(list){
  try {
    localStorage.setItem("deltaFavoritos", JSON.stringify(list));
  } catch(e) {
    console.error("save favs", e);
  }
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
    btn.setAttribute("aria-pressed", "true");
  } else {
    btn.innerText = "🤍 Favoritar";
    btn.classList.remove("is-fav");
    btn.setAttribute("aria-pressed", "false");
  }
}

function favoritar(btn){
  if(!btn) return;
  const card = btn.closest(".card");
  if(!card) return;
  const titulo = (safeQuery(card, "h3")?.innerText || "").trim();
  const texto = pegarTexto(btn);
  
  let id = card.dataset.id || simpleHash(titulo + "|" + texto);
  card.dataset.id = id;
  
  let lista = _loadFavoritos();
  const idx = lista.findIndex(x => x.id === id);
  
  if(idx === -1){
    lista.unshift({
      id,
      titulo,
      texto,
      createdAt: Date.now()
    });
    _saveFavoritos(lista);
    atualizarUIbtnFav(btn, id);
    const original = btn.innerText;
    btn.innerText = "💖 Salvo";
    setTimeout(() => atualizarUIbtnFav(btn, id), 900);
  } else {
    lista.splice(idx, 1);
    _saveFavoritos(lista);
    atualizarUIbtnFav(btn, id);
    btn.innerText = "🤍 Removido";
    setTimeout(() => atualizarUIbtnFav(btn, id), 900);
  }
}

// ===== INICIALIZAÇÃO =====
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".card").forEach(card => {
    const titulo = (safeQuery(card, "h3")?.innerText || "").trim();
    const texto = (safeQuery(card, ".prompt-text")?.innerText || "").trim();
    const id = card.dataset.id || simpleHash(titulo + "|" + texto);
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

  // Inicializar filtros se existir a função
  if(typeof initFiltros === "function"){
    initFiltros();
  }
});

// ===== CONTADOR DE RESULTADOS =====
function atualizarContador(visiveis){
  const contador = document.getElementById("contador");
  if(contador){
    contador.textContent = visiveis;
  }
  
  // Mensagem quando não há resultados
  const cardsContainer = document.querySelector(".galeria-prompts");
  let msgSemResultado = document.querySelector(".sem-resultado");

  if(visiveis === 0){
    if(!msgSemResultado){
      const msg = document.createElement("div");
      msg.className = "sem-resultado";
      msg.innerHTML = `
        <div style="text-align:center;padding:40px;">
          <h3>😕 Nenhum prompt encontrado</h3>
          <p>Tente outros termos ou limpe os filtros</p>
        </div>
      `;
      cardsContainer?.appendChild(msg);
    }
  } else {
    msgSemResultado?.remove();
  }
}
