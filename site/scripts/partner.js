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
  menuButton.setAttribute(
    "aria-label",
    isOpen ? "Закрыть меню" : "Открыть меню",
  );
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

// Окно заявки. dialog сам обрабатывает Escape и удерживает фокус внутри окна.
const formWindow = document.querySelector(".partner-form");
const requestForm = document.querySelector(".partner-form__fields");
const formStatus = document.querySelector(".partner-form__status");
const submitButton = document.querySelector(".partner-form__submit");

document.querySelectorAll("[data-open-form]").forEach(function (button) {
  button.addEventListener("click", function () {
    formStatus.textContent = "";
    formWindow.showModal();
  });
});

document
  .querySelector(".partner-form__close")
  .addEventListener("click", function () {
    formWindow.close();
  });

// Пустая ссылка Telegram пока не ведёт на другую страницу.
document
  .querySelector(".partner-contact__telegram")
  .addEventListener("click", function (event) {
    if (!this.getAttribute("href").trim()) {
      event.preventDefault();
    }
  });

// Обработчик должен принимать JSON и возвращать успешный HTTP-статус
// только после принятия заявки. Его адрес указывается в action формы.
// requestForm.addEventListener("submit", async function (event) {
//   event.preventDefault();
//   const endpoint = requestForm.getAttribute("action").trim();

//   if (!endpoint) {
//     formStatus.textContent =
//       "Отправка заявок пока не подключена. Свяжитесь с нами по телефону или электронной почте.";
//     return;
//   }

//   submitButton.disabled = true;
//   submitButton.textContent = "Отправляем…";
//   formStatus.textContent = "";

//   try {
//     const response = await fetch(endpoint, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Accept: "application/json",
//       },
//       body: JSON.stringify({
//         name: requestForm.elements.name.value.trim(),
//         phone: requestForm.elements.phone.value.trim(),
//         message: requestForm.elements.message.value.trim(),
//         _subject: "Новая заявка на сотрудничество — Буренка",
//         _template: "table",
//       }),
//     });

//     const result = await response.json();

//     if (
//       !response.ok ||
//       (result.success !== true && result.success !== "true")
//     ) {
//       throw new Error("Не удалось отправить заявку");
//     }

//     requestForm.reset();
//     formStatus.textContent = "Заявка отправлена! Мы свяжемся с вами.";
//   } catch (error) {
//     formStatus.textContent =
//       "Не удалось отправить заявку. Попробуйте ещё раз или свяжитесь с нами по телефону.";
//   } finally {
//     submitButton.disabled = false;
//     submitButton.textContent = "Отправить заявку";
//   }
// });
