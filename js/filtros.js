// ==============================
// SISTEMA GLOBAL DE FILTROS
// ==============================
(function(){
  let filtroAtual = "todos";
  
  window.initFiltros = function(){
    const botoes = document.querySelectorAll(".filtro-btn");
    if(!botoes.length) return;

    botoes.forEach(botao => {
      botao.addEventListener("click", function(){
        botoes.forEach(btn => btn.classList.remove("ativo"));
        this.classList.add("ativo");
        filtroAtual = this.dataset.tipo;
        aplicarFiltros();
      });
    });
  };

  window.aplicarFiltros = function(){
    const busca = document.getElementById("busca");
    const termo = busca ? busca.value.toLowerCase().trim() : "";

    const cards = document.querySelectorAll(".card");
    let visiveis = 0;

    cards.forEach(card => {
      const texto = card.innerText.toLowerCase();
      const nivel = card.dataset.nivel || "todos";

      const combinaBusca = termo === "" || texto.includes(termo);
      const combinaNivel = filtroAtual === "todos" || nivel === filtroAtual;

      if(combinaBusca && combinaNivel){
        card.style.display = "block";
        visiveis++;
      } else {
        card.style.display = "none";
      }
    });

    if(typeof atualizarContador === "function"){
      atualizarContador(visiveis);
    }
  };
})();
