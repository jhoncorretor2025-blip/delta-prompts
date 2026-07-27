// ==============================
// MENU CORE
// Controles principais do menu
// ==============================

window.initMenuCore = function () {

    const menuEl = document.getElementById("menu");

    if (!menuEl) return;

    const sidebar = menuEl.querySelector(".sidebar");
    const toggle = menuEl.querySelector(".menu-toggle");

    if (!sidebar || !toggle) return;

    let aberto = false;

    function abrir(valor) {

        aberto = !!valor;

        sidebar.classList.toggle("active", aberto);

        toggle.setAttribute(
            "aria-expanded",
            String(aberto)
        );

        document.documentElement.classList.toggle(
            "menu-open",
            aberto
        );

    }

    toggle.onclick = function (e) {

        e.preventDefault();
        e.stopPropagation();

        abrir(!aberto);

    };

    menuEl.addEventListener("click", function (e) {

        const link = e.target.closest("a");

        if (link) {
            abrir(false);
        }

        const titulo = e.target.closest(".menu-title");

        if (!titulo) return;

        const section = titulo.closest(".menu-section");

        if (!section) return;

        const links = section.querySelector(".menu-links");

        if (!links) return;

        menuEl
            .querySelectorAll(".menu-links.active")
            .forEach(item => {

                if (item !== links) {
                    item.classList.remove("active");
                }

            });

        links.classList.toggle("active");

    });

    document.addEventListener("keydown", function (e) {

        if (e.key === "Escape") {

            abrir(false);

        }

    });

};