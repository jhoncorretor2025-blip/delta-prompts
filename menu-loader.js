const basePath = location.hostname.includes("github.io")
  ? "/delta-prompts/"
  : "/";

fetch(basePath + "menu.html")
  .then(res => res.text())
  .then(html => {
    document.getElementById("menu").innerHTML = html;

    document.querySelectorAll("#menu a").forEach(link => {
      const href = link.getAttribute("href");
      if (!href.startsWith("http")) {
        link.setAttribute("href", basePath + href);
      }
    });
  });
