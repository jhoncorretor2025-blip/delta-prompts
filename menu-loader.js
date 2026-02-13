fetch("/delta-prompts/menu.html")
  .then(res => res.text())
  .then(html => {
    document.getElementById("menu").innerHTML = html;
  });

function toggleMenu() {
  document.getElementById("menu").classList.toggle("active");
}
