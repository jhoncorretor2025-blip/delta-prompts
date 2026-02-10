// ARQUIVO: menu-loader.js
fetch(
  document.currentScript.src.includes("/paginas/")
    ? "../menu.html"
    : "menu.html"
)
  .then(res => res.text())
  .then(html => {
    document.getElementById("menu").innerHTML = html;
  });
