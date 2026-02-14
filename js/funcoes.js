function pegarTexto(btn){
  return btn.closest(".card").querySelector(".prompt-text").innerText.trim();
}

function copiar(btn){
  navigator.clipboard.writeText(pegarTexto(btn));
}

function chat(btn){
  const texto = pegarTexto(btn);
  const url = "https://chat.openai.com/?q=" + encodeURIComponent(texto);
  window.open(url, "_blank");
}

function gemini(btn){
  const texto = pegarTexto(btn);
  navigator.clipboard.writeText(texto);
  window.open("https://gemini.google.com/app", "_blank");
}

function favoritar(btn){
  const card = btn.closest(".card");
  const titulo = card.querySelector("h3").innerText;
  const texto = pegarTexto(btn);

  let fav = JSON.parse(localStorage.getItem("deltaFavoritos")) || [];

  const jaExiste = fav.find(f => f.titulo === titulo);

  if(!jaExiste){
    fav.push({titulo, texto});
    localStorage.setItem("deltaFavoritos", JSON.stringify(fav));
  }
}
