const menuBtn = document.getElementById("menuBtn");
const sidebar = document.querySelector(".sidebar");

menuBtn.addEventListener("click", () => {

    if (window.innerWidth <= 900) {
        // Mobile
        sidebar.classList.toggle("show");
    } else {
        // Desktop
        sidebar.classList.toggle("collapsed");
    }

});

document.addEventListener("click", (e) => {

    if (
        window.innerWidth <= 900 &&
        !sidebar.contains(e.target) &&
        !menuBtn.contains(e.target)
    ) {
        sidebar.classList.remove("show");
    }

});
