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
    if (event.target.closest("a")) closeMenu();
});
document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeMenu();
});
window.addEventListener("resize", function () {
    if (window.innerWidth > 1100) closeMenu();
});

/* Выбираем товар по id в адресе страницы. */

const productId = new URLSearchParams(window.location.search).get("id") || "adyghe";
const currentProduct = shop.findProduct(productId);
const productMessage = document.querySelector(".product-page__message");
const priceFormatter = new Intl.NumberFormat("ru-RU");

function formatPrice(price) {
    return priceFormatter.format(price) + " ₽";
}

function showMessage(isSaved, title) {
    productMessage.textContent = isSaved
        ? title + " добавлен в корзину."
        : "Не удалось сохранить корзину. Проверьте настройки браузера.";
}

function updateFavorite(button, id, title) {
    const active = shop.isFavorite(id);
    button.setAttribute("aria-pressed", String(active));
    button.setAttribute(
        "aria-label",
        (active ? "Убрать из избранного: " : "В избранное: ") + title,
    );
    button.querySelector("img").src = active
        ? "../site/icons/catalog-heart-active.svg"
        : "../site/icons/catalog-heart.svg";
}

function fillProduct() {
    document.title = currentProduct.title + " — Буренка от Solomona";
    document.querySelectorAll("[data-field]").forEach(function (element) {
        const field = element.dataset.field;
        element.textContent =
            currentProduct[field] ||
            "Информация уточняется. Смотрите упаковку товара.";
    });
    document.querySelector("[data-price]").textContent = formatPrice(
        currentProduct.price,
    );
    document.querySelector("[data-long-description]").textContent =
        currentProduct.id === "adyghe"
            ? "Адыгейский сыр отличается мягкой текстурой и нежным сливочным вкусом. Он подходит для салатов, закусок и домашних блюд."
            : currentProduct.description;
    const detailPhoto = document.querySelector("[data-detail-photo]");
    detailPhoto.src = currentProduct.image;
    detailPhoto.alt = currentProduct.title;
    document.querySelectorAll("[data-nutrition]").forEach(function (table) {
        currentProduct.nutrition.forEach(function (row) {
            const tr = document.createElement("tr");
            row.forEach(function (text) {
                const td = document.createElement("td");
                td.textContent = text;
                tr.append(td);
            });
            table.append(tr);
        });
        table.closest("table").hidden = currentProduct.nutrition.length === 0;
    });
    document.querySelectorAll("[data-nutrition-empty]").forEach(function (element) {
        element.hidden = currentProduct.nutrition.length > 0;
    });
}

/* Галерея */

function setupGallery() {
    const images = currentProduct.gallery || [currentProduct.image];
    const mainImage = document.querySelector(".product-gallery__image");
    const thumbnails = document.querySelectorAll(".product-gallery__thumbnail");
    const previous = document.querySelector("[data-gallery-prev]");
    const next = document.querySelector("[data-gallery-next]");
    const badge = document.querySelector(".product-gallery__badge");
    let activeIndex = 0;

    function showImage(index) {
        activeIndex = (index + images.length) % images.length;
        mainImage.src = images[activeIndex];
        mainImage.alt = currentProduct.title + ", фото " + (activeIndex + 1);
        thumbnails.forEach(function (button, index) {
            button.setAttribute("aria-pressed", String(index === activeIndex));
        });
    }

    thumbnails.forEach(function (button, index) {
        button.hidden = index >= images.length;
        if (button.hidden) return;
        button.querySelector("img").src = images[index];
        button.addEventListener("click", function () {
            showImage(index);
        });
    });
    document.querySelector(".product-gallery__controls").hidden =
        images.length === 1;
    previous.disabled = images.length === 1;
    next.disabled = images.length === 1;
    previous.addEventListener("click", function () {
        showImage(activeIndex - 1);
    });
    next.addEventListener("click", function () {
        showImage(activeIndex + 1);
    });
    badge.textContent = currentProduct.badge;
    badge.hidden = !currentProduct.badge;
    showImage(0);
}

/* Количество, корзина и сердечки */

function setupActions() {
    const minus = document.querySelector("[data-quantity-minus]");
    const plus = document.querySelector("[data-quantity-plus]");
    const output = document.querySelector(".product-quantity__value");
    const favoriteButtons = document.querySelectorAll("[data-favorite]");
    let quantity = 1;

    function updateQuantity() {
        output.textContent = quantity;
        minus.disabled = quantity <= 1;
        plus.disabled = quantity >= 99;
    }
    minus.addEventListener("click", function () {
        quantity = Math.max(1, quantity - 1);
        updateQuantity();
    });
    plus.addEventListener("click", function () {
        quantity = Math.min(99, quantity + 1);
        updateQuantity();
    });
    document
        .querySelector(".product-info__add")
        .addEventListener("click", function () {
            showMessage(shop.addToCart(productId, quantity), currentProduct.title);
        });
    favoriteButtons.forEach(function (button) {
        updateFavorite(button, productId, currentProduct.title);
        button.addEventListener("click", function () {
            const saved = shop.toggleFavorite(productId);
            if (!saved)
                productMessage.textContent =
                    "Не удалось сохранить избранное в браузере.";
            favoriteButtons.forEach(function (button) {
                updateFavorite(button, productId, currentProduct.title);
            });
        });
    });
    updateQuantity();
}

/* Вкладки: работают также стрелками на клавиатуре. */

function setupTabs() {
    const tabs = Array.from(document.querySelectorAll(".product-details__tab"));
    function selectTab(selected) {
        tabs.forEach(function (tab) {
            const active = tab === selected;
            tab.setAttribute("aria-selected", String(active));
            tab.tabIndex = active ? 0 : -1;
            document.getElementById(tab.getAttribute("aria-controls")).hidden =
                !active;
        });
    }
    tabs.forEach(function (tab, index) {
        tab.addEventListener("click", function () {
            selectTab(tab);
        });
        tab.addEventListener("keydown", function (event) {
            let nextIndex = index;
            if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
            else if (event.key === "ArrowLeft")
                nextIndex = (index + tabs.length - 1) % tabs.length;
            else if (event.key === "Home") nextIndex = 0;
            else if (event.key === "End") nextIndex = tabs.length - 1;
            else return;
            event.preventDefault();
            selectTab(tabs[nextIndex]);
            tabs[nextIndex].focus();
        });
    });
}

/* Рекомендации берём из того же списка товаров. */

function setupRelated() {
    const others = products.filter(function (product) {
        return product.id !== productId;
    });
    const preferredIds =
        currentProduct.id === "adyghe"
            ? ["caciotta", "suluguni", "curd", "butter"]
            : [];
    const recommendations = preferredIds.length
        ? preferredIds.map(shop.findProduct)
        : others
              .filter(function (product) {
                  return product.category === currentProduct.category;
              })
              .concat(
                  others.filter(function (product) {
                      return product.category !== currentProduct.category;
                  }),
              )
              .slice(0, 4);

    document.querySelectorAll("[data-related]").forEach(function (card, index) {
        const product = recommendations[index];
        if (!product) {
            card.hidden = true;
            return;
        }
        card.querySelectorAll("a").forEach(function (link) {
            link.href = "product.html?id=" + encodeURIComponent(product.id);
        });
        const image = card.querySelector(".product-related__image");
        image.src = product.image;
        image.alt = product.title;
        card.querySelector(".product-related__title").textContent = product.title;
        card.querySelector(".product-related__description").textContent =
            product.description;
        card.querySelector(".product-related__brand").textContent = product.brand;
        card.querySelector(".product-related__price").textContent = formatPrice(
            product.price,
        );
        card.querySelector(".product-related__weight").textContent = product.weight;
        const favorite = card.querySelector(".product-related__favorite");
        updateFavorite(favorite, product.id, product.title);
        favorite.addEventListener("click", function () {
            if (!shop.toggleFavorite(product.id))
                productMessage.textContent = "Не удалось сохранить избранное.";
            updateFavorite(favorite, product.id, product.title);
        });
        const add = card.querySelector(".product-related__add");
        add.setAttribute("aria-label", "В корзину: " + product.title);
        add.addEventListener("click", function () {
            showMessage(shop.addToCart(product.id, 1), product.title);
        });
    });
}

if (currentProduct) {
    fillProduct();
    setupGallery();
    setupActions();
    setupTabs();
    setupRelated();
} else {
    document.querySelector(".product-page__content").hidden = true;
    document.querySelector(".product-page__missing").hidden = false;
    document.title = "Товар не найден — Буренка от Solomona";
}
