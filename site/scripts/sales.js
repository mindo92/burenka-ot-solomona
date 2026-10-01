// Мобильное меню.
const menuButton = document.querySelector(".header__menu");
const navigation = document.querySelector(".navigation");

function closeMenu() {
  navigation.classList.remove("navigation--open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Открыть меню");
}

menuButton.addEventListener("click", function () {
  const isOpen = navigation.classList.toggle("navigation--open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Закрыть меню" : "Открыть меню");
});

navigation.addEventListener("click", function (event) {
  if (event.target.closest("a")) {
    closeMenu();
  }
});

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeMenu();
  }
});

window.addEventListener("resize", function () {
  if (window.innerWidth > 1100) {
    closeMenu();
  }
});
