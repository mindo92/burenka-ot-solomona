/* Мобильное меню */

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
    if (window.innerWidth > 1000) {
        closeMenu();
    }
});

/* Поиск и фильтры */

const filtersForm = document.querySelector("#filters-form");
const searchInput = document.querySelector("#product-search");
const sortSelect = document.querySelector("#product-sort");
const productGrid = document.querySelector("#product-grid");
const emptyMessage = document.querySelector("#catalog-empty");
const catalogMessage = document.querySelector("#catalog-message");

const productCards = Array.from(document.querySelectorAll(".product-card"));

const categoryButtons = document.querySelectorAll(".categories__button");

// Сохраняем исходный порядок карточек для сортировки по популярности.
productCards.forEach(function (card, index) {
    card.dataset.order = index;
});

function getSelectedValues(name) {
    const checkedInputs = filtersForm.querySelectorAll(
        `input[name="${name}"]:checked`,
    );

    return Array.from(checkedInputs).map(function (input) {
        return input.value;
    });
}

function matchesGroup(selectedValues, productValue) {
    return selectedValues.includes("all") || selectedValues.includes(productValue);
}

function updateCategoryButtons() {
    const selectedCategories = getSelectedValues("category");

    categoryButtons.forEach(function (button) {
        const isActive = selectedCategories.includes(button.dataset.category);

        button.classList.toggle("categories__button--active", isActive);

        button.setAttribute("aria-pressed", String(isActive));
    });
}

function filterProducts() {
    const searchText = searchInput.value.trim().toLowerCase();

    const categories = getSelectedValues("category");
    const producers = getSelectedValues("producer");
    const types = getSelectedValues("type");
    const features = getSelectedValues("feature");

    let visibleCount = 0;

    productCards.forEach(function (card) {
        const title = card
            .querySelector(".product-card__title")
            .textContent.toLowerCase();

        const productFeatures = card.dataset.features.split(" ");

        const matchesSearch = title.includes(searchText);
        const matchesCategory = matchesGroup(categories, card.dataset.category);
        const matchesProducer = matchesGroup(producers, card.dataset.producer);
        const matchesType = matchesGroup(types, card.dataset.type);

        // Товар должен соответствовать всем выбранным особенностям.
        const matchesFeatures = features.every(function (feature) {
            return productFeatures.includes(feature);
        });

        const isVisible =
            matchesSearch &&
            matchesCategory &&
            matchesProducer &&
            matchesType &&
            matchesFeatures;

        card.hidden = !isVisible;

        if (isVisible) {
            visibleCount++;
        }
    });

    emptyMessage.hidden = visibleCount > 0;

    updateCategoryButtons();
}

filtersForm.addEventListener("change", function (event) {
    const changedInput = event.target;

    if (!changedInput.matches('input[type="checkbox"]')) {
        return;
    }

    // У особенностей нет пункта «Все».
    if (changedInput.name === "feature") {
        filterProducts();
        return;
    }

    const groupInputs = Array.from(
        filtersForm.querySelectorAll(`input[name="${changedInput.name}"]`),
    );

    const allInput = groupInputs.find(function (input) {
        return input.value === "all";
    });

    if (changedInput.value === "all") {
        groupInputs.forEach(function (input) {
            input.checked = input.value === "all";
        });
    } else {
        allInput.checked = false;

        const hasSelectedOption = groupInputs.some(function (input) {
            return input.value !== "all" && input.checked;
        });

        if (!hasSelectedOption) {
            allInput.checked = true;
        }
    }

    filterProducts();
});

categoryButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        const selectedCategory = button.dataset.category;

        filtersForm
            .querySelectorAll('input[name="category"]')
            .forEach(function (input) {
                input.checked = input.value === selectedCategory;
            });

        filterProducts();
    });
});

searchInput.addEventListener("input", filterProducts);

/* Сортировка */

function sortProducts() {
    const sortedCards = [...productCards];

    sortedCards.sort(function (firstCard, secondCard) {
        if (sortSelect.value === "price-up") {
            return (
                Number(firstCard.dataset.price) - Number(secondCard.dataset.price)
            );
        }

        if (sortSelect.value === "price-down") {
            return (
                Number(secondCard.dataset.price) - Number(firstCard.dataset.price)
            );
        }

        if (sortSelect.value === "name") {
            const firstTitle = firstCard.querySelector(
                ".product-card__title",
            ).textContent;

            const secondTitle = secondCard.querySelector(
                ".product-card__title",
            ).textContent;

            return firstTitle.localeCompare(secondTitle, "ru");
        }

        return Number(firstCard.dataset.order) - Number(secondCard.dataset.order);
    });

    sortedCards.forEach(function (card) {
        productGrid.append(card);
    });
}

sortSelect.addEventListener("change", sortProducts);

filtersForm.addEventListener("reset", function () {
    searchInput.value = "";
    sortSelect.value = "popular";
    catalogMessage.textContent = "";

    // Ждём, пока браузер сбросит чекбоксы формы.
    setTimeout(function () {
        filterProducts();
        sortProducts();
    }, 0);
});

/* Избранное и корзина: общее хранение со страницей товара. */

productCards.forEach(function (card) {
    const productId = card.dataset.id;
    const productTitle = card
        .querySelector(".product-card__title")
        .textContent.trim();
    const favoriteButton = card.querySelector(".product-card__favorite");
    const cartButton = card.querySelector(".product-card__cart");

    function updateFavoriteButton() {
        const active = shop.isFavorite(productId);
        favoriteButton.querySelector("img").src = active
            ? "../site/icons/catalog-heart-active.svg"
            : "../site/icons/catalog-heart-white.svg";
        favoriteButton.classList.toggle("product-card__favorite--active", active);
        favoriteButton.setAttribute("aria-pressed", String(active));
        favoriteButton.setAttribute(
            "aria-label",
            (active ? "Убрать из избранного: " : "В избранное: ") + productTitle,
        );
    }

    updateFavoriteButton();
    favoriteButton.addEventListener("click", function () {
        if (!shop.toggleFavorite(productId)) {
            catalogMessage.textContent =
                "Не удалось сохранить избранное в браузере.";
        }
        updateFavoriteButton();
    });
    cartButton.addEventListener("click", function () {
        const saved = shop.addToCart(productId, 1);
        const item = shop.getCart().find(function (item) {
            return item.id === productId;
        });
        catalogMessage.textContent = saved
            ? productTitle +
              " добавлен в корзину. Количество: " +
              item.quantity +
              "."
            : "Браузер не позволил сохранить корзину.";
    });
});

filterProducts();
