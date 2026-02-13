const path = window.location.pathname.includes("/paginas/")
  ? "../menu.html"
  : "menu.html";

fetch(path)
  .then(res => res.text())
  .then(html => {
    document.getElementById("menu").innerHTML = html;
  });
