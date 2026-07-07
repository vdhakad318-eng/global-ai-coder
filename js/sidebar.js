const menuBtn = document.getElementById("menuBtn");
const sidebar = document.querySelector(".sidebar");

menuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("show");
});

document.addEventListener("click", (e) => {

    if (
        !sidebar.contains(e.target) &&
        !menuBtn.contains(e.target)
    ) {
        sidebar.classList.remove("show");
    }

});
