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
// Корзина использует общее хранение с каталогом и страницей товара.
const cartList = document.querySelector(".cart__list");
const clearButton = document.querySelector(".cart__clear");
const emptyCart = document.querySelector(".cart__empty");
const deliveryProgress = document.querySelector(".cart-delivery__progress");
const deliveryNote = document.querySelector(".cart-delivery__note");
const money = new Intl.NumberFormat("ru-RU");
// Берём образец до восстановления: сохранённая корзина может быть пустой.
const cartItemTemplate = cartList.querySelector(".cart-item").cloneNode(true);
function formatPrice(value) {
  return money.format(value) + " ₽";
}
// Сохраняем данные товаров, а не HTML-разметку.
function saveCart() {
  const products = Array.from(cartList.querySelectorAll(".cart-item")).map(
    function (item) {
      const unitPrice = item.querySelector(".cart-item__unit-price");
      return {
        id: item.dataset.id,
        title: item.querySelector(".cart-item__title").textContent,
        brand: item.querySelector(".cart-item__brand").textContent,
        details: item.querySelector(".cart-item__details").textContent,
        image: item.querySelector(".cart-item__image").getAttribute("src"),
        price: Number(item.dataset.price),
        unitPrice: unitPrice ? unitPrice.textContent : "",
        quantity: Number(item.querySelector(".quantity__value").value),
      };
    },
  );
  if (!shop.save(shop.cartKey, products)) {
    console.warn("Не удалось сохранить корзину в браузере.");
  }
}

function createCartItem(product) {
  const item = cartItemTemplate.cloneNode(true);
  item.dataset.price = product.price;
  item.dataset.id = shop.cartId(product);
  item.querySelector(".cart-item__title").textContent = product.title;
  item.querySelector(".cart-item__brand").textContent = product.brand;
  item.querySelector(".cart-item__details").textContent = product.details;
  item.querySelector(".cart-item__image").src = product.image;
  item.querySelector(".cart-item__image").alt = product.title;
  const price = item.querySelector(".cart-item__price");
  // Оставляем цену за килограмм у товаров, для которых она указана.
  price.firstChild.textContent = formatPrice(product.price) + " ";
  const unitPrice = item.querySelector(".cart-item__unit-price");
  unitPrice.textContent = product.unitPrice;
  unitPrice.hidden = !product.unitPrice;
  item.querySelector(".quantity__value").value = product.quantity;
  item
    .querySelector(".quantity")
    .setAttribute("aria-label", "Количество: " + product.title);
  item
    .querySelector(".cart-item__remove")
    .setAttribute("aria-label", "Удалить " + product.title);
  // Находим товар из каталога.
  const catalogProduct =
    shop.findProduct(product.id) ||
    products.find(function (item) {
      return item.title === product.title.trim();
    });

  if (catalogProduct) {
    const productUrl =
      "product.html?id=" + encodeURIComponent(catalogProduct.id);

    // Ссылка на названии.
    const title = item.querySelector(".cart-item__title");
    const titleLink = document.createElement("a");

    titleLink.className = "cart-item__link";
    titleLink.href = productUrl;
    titleLink.textContent = product.title;

    title.replaceChildren(titleLink);

    // Ссылка на фотографии.
    const image = item.querySelector(".cart-item__image");
    const imageLink = document.createElement("a");

    imageLink.className = "cart-item__photo-link";
    imageLink.href = productUrl;
    imageLink.setAttribute("aria-label", "Открыть: " + product.title);

    image.before(imageLink);
    imageLink.append(image);
  }

  return item;
}
function loadCart() {
  cartList.replaceChildren();
  shop.getCart().forEach(function (product) {
    cartList.append(createCartItem(product));
  });
}
function updateCart() {
  const items = cartList.querySelectorAll(".cart-item");
  let subtotal = 0;
  items.forEach(function (item) {
    const quantity = Number(item.querySelector(".quantity__value").value);
    const total = Number(item.dataset.price) * quantity;
    subtotal += total;
    item.querySelector(".cart-item__total").textContent = formatPrice(total);
    item.querySelector('[data-action="minus"]').disabled = quantity <= 1;
    item.querySelector('[data-action="plus"]').disabled = quantity >= 99;
  });
  // Скидка 50 рублей из макета. Реальные правила задаст сервер.
  const discount = Math.min(50, subtotal);
  const remaining = Math.max(0, 1500 - subtotal);
  document.querySelector(".cart__count").textContent = items.length;
  document.querySelector(".cart-summary__count").textContent = items.length;
  document.querySelector(".cart-summary__subtotal").textContent =
    formatPrice(subtotal);
  document.querySelector(".cart-summary__discount").textContent =
    "−" + formatPrice(discount);
  document.querySelector(".cart-summary__total").textContent = formatPrice(
    subtotal - discount,
  );
  document.querySelector(".cart-summary__delivery").textContent =
    "Рассчитаем при оформлении";
  deliveryProgress.value = Math.min(subtotal, 1500);
  deliveryProgress.textContent = subtotal + " из 1500";
  if (remaining > 0) {
    deliveryNote.innerHTML =
      "До бесплатной доставки осталось <strong>" +
      formatPrice(remaining) +
      "</strong>";
  } else {
    deliveryNote.textContent = "Вам доступна бесплатная доставка";
    document.querySelector(".cart-summary__delivery").textContent = "Бесплатно";
  }
  emptyCart.hidden = items.length > 0;
  clearButton.disabled = items.length === 0;
  saveCart();
}
cartList.addEventListener("click", function (event) {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const item = button.closest(".cart-item");
  const quantity = item.querySelector(".quantity__value");
  if (button.dataset.action === "remove") {
    item.remove();
  } else if (button.dataset.action === "plus") {
    quantity.value = Math.min(99, Number(quantity.value) + 1);
  } else {
    quantity.value = Math.max(1, Number(quantity.value) - 1);
  }
  updateCart();
});
clearButton.addEventListener("click", function () {
  cartList.replaceChildren();
  updateCart();
});
loadCart();
updateCart();
const recommendations = document.querySelector(".cart-recommendations__list");
function updateFavoriteButton(button, title, isFavorite) {
  button.setAttribute("aria-pressed", String(isFavorite));
  button.setAttribute(
    "aria-label",
    (isFavorite ? "Убрать из избранного: " : "Добавить в избранное: ") + title,
  );
  button.querySelector("img").src = isFavorite
    ? "../site/icons/catalog-heart-active.svg"
    : "../site/icons/catalog-heart.svg";
}
// Обновляем данные знакомых товаров в рекомендациях.
recommendations.querySelectorAll(".cart-product").forEach(function (card) {
  const title = card.querySelector(".cart-product__title").textContent.trim();
  const product = products.find(function (product) {
    return product.title === title;
  });
  if (!product) return;
  card.querySelector(".cart-product__price").textContent = formatPrice(
    product.price,
  );
  card.querySelector(".cart-product__details").textContent =
    product.weight.replace(/^за\s+/, "");
  card.querySelector(".cart-product__brand").textContent = product.brand;
});

// Восстанавливаем сердечки на карточках.
recommendations.querySelectorAll(".cart-product").forEach(function (product) {
  const title = product.querySelector(".cart-product__title").textContent;
  const button = product.querySelector(".cart-product__favorite");
  updateFavoriteButton(button, title, shop.isFavorite(shop.favoriteId(title)));
});
recommendations.addEventListener("click", function (event) {
  const button = event.target.closest("button");
  if (!button) return;
  const product = button.closest(".cart-product");
  const title = product.querySelector(".cart-product__title").textContent;
  if (button.classList.contains("cart-product__favorite")) {
    const id = shop.favoriteId(title);
    if (!shop.toggleFavorite(id)) {
      console.warn("Не удалось сохранить избранное в браузере.");
    }
    updateFavoriteButton(button, title, shop.isFavorite(id));
    return;
  }
  if (!button.classList.contains("cart-product__add")) return;
  const catalogProduct = products.find(function (item) {
    return item.title === title.trim();
  });
  if (catalogProduct) {
    saveCart();
    if (!shop.addToCart(catalogProduct.id, 1)) {
      console.warn("Не удалось добавить товар в корзину.");
      return;
    }
    loadCart();
    updateCart();
    return;
  }
  // Для товаров, которых пока нет в каталоге, берём данные из карточки.
  const existingItem = Array.from(cartList.querySelectorAll(".cart-item")).find(
    function (item) {
      return item.querySelector(".cart-item__title").textContent === title;
    },
  );
  if (existingItem) {
    const quantity = existingItem.querySelector(".quantity__value");
    quantity.value = Math.min(99, Number(quantity.value) + 1);
    updateCart();
    return;
  }
  const priceText = product.querySelector(".cart-product__price").textContent;
  cartList.append(
    createCartItem({
      title: title,
      brand: product.querySelector(".cart-product__brand").textContent,
      details: product.querySelector(".cart-product__details").textContent,
      image: product.querySelector(".cart-product__image").getAttribute("src"),
      price: Number(priceText.replace(/[^0-9]/g, "")),
      unitPrice: "",
      quantity: 1,
    }),
  );
  updateCart();
});
