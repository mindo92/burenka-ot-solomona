/* Общее хранение корзины и избранного для трёх страниц. */

const shop = {
    cartKey: "burenka-cart-v1",
    favoritesKey: "burenka-favorites-v2",

    read: function (key, fallback) {
        try {
            const value = localStorage.getItem(key);
            return value === null ? fallback : JSON.parse(value);
        } catch {
            return fallback;
        }
    },

    save: function (key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch {
            return false;
        }
    },

    findProduct: function (id) {
        return products.find(function (product) {
            return product.id === id;
        });
    },

    // У старых записей не было id. Сопоставляем их по названию и цене.
    cartId: function (item) {
        if (item.id) return item.id;
        const product = products.find(function (product) {
            return (
                product.title === item.title.trim() && product.price === item.price
            );
        });
        return product
            ? product.id
            : "legacy:" + item.title.trim() + ":" + item.price;
    },

    favoriteId: function (title) {
        const product = products.find(function (product) {
            return product.title === title.trim();
        });
        return product ? product.id : "legacy:" + title.trim();
    },

    getCart: function () {
        const saved = this.read(this.cartKey, []);
        if (!Array.isArray(saved)) return [];
        return saved
            .filter(function (item) {
                return (
                    item &&
                    typeof item.title === "string" &&
                    typeof item.image === "string" &&
                    Number.isFinite(item.price) &&
                    item.price >= 0 &&
                    Number.isInteger(item.quantity) &&
                    item.quantity > 0
                );
            })
            .map(function (item) {
                return {
                    id: shop.cartId(item),
                    title: item.title,
                    brand: typeof item.brand === "string" ? item.brand : "",
                    details: typeof item.details === "string" ? item.details : "",
                    image: item.image,
                    price: item.price,
                    unitPrice:
                        typeof item.unitPrice === "string" ? item.unitPrice : "",
                    quantity: Math.min(99, item.quantity),
                };
            });
    },

    addToCart: function (id, quantity) {
        const product = this.findProduct(id);
        if (!product) return false;
        const cart = this.getCart();
        const item = cart.find(function (item) {
            return item.id === id;
        });
        if (item) {
            item.quantity = Math.min(99, item.quantity + quantity);
        } else {
            cart.push({
                id: product.id,
                title: product.title,
                brand: product.brand,
                details: product.weight.replace(/^за\s+/, ""),
                image: product.image,
                price: product.price,
                unitPrice: "",
                quantity: Math.min(99, Math.max(1, quantity)),
            });
        }
        return this.save(this.cartKey, cart);
    },

    getFavorites: function () {
        const saved = this.read(this.favoritesKey, []);
        return Array.isArray(saved)
            ? saved.filter(function (id) {
                  return typeof id === "string";
              })
            : [];
    },

    isFavorite: function (id) {
        return this.getFavorites().includes(id);
    },

    toggleFavorite: function (id) {
        const favorites = this.getFavorites();
        const next = favorites.includes(id)
            ? favorites.filter(function (value) {
                  return value !== id;
              })
            : favorites.concat(id);
        return this.save(this.favoritesKey, next);
    },

    // Один раз переносим записи из прежнего хранения каталога.
    migrate: function () {
        if (!this.read("burenka-catalog-migrated-v1", false)) {
            const oldCart = this.read("dairy-cart", {});
            let success = true;
            if (oldCart && typeof oldCart === "object" && !Array.isArray(oldCart)) {
                const cart = this.getCart();
                Object.keys(oldCart).forEach(function (id) {
                    const product = shop.findProduct(id);
                    const quantity = Math.min(99, Math.floor(Number(oldCart[id])));
                    if (!product || !Number.isFinite(quantity) || quantity < 1)
                        return;
                    const existing = cart.find(function (item) {
                        return item.id === id;
                    });
                    if (existing) {
                        existing.quantity = Math.max(existing.quantity, quantity);
                    } else {
                        cart.push({
                            id: id,
                            title: product.title,
                            brand: product.brand,
                            details: product.weight.replace(/^за\s+/, ""),
                            image: product.image,
                            price: product.price,
                            unitPrice: "",
                            quantity: quantity,
                        });
                    }
                });
                success = this.save(this.cartKey, cart);
            }
            if (success) this.save("burenka-catalog-migrated-v1", true);
        }
        if (this.read(this.favoritesKey, null) === null) {
            const oldIds = this.read("dairy-favorites", []);
            const oldTitles = this.read("burenka-favorites-v1", []);
            const favorites = Array.isArray(oldIds)
                ? oldIds.filter(function (id) {
                      return typeof id === "string";
                  })
                : [];
            if (Array.isArray(oldTitles)) {
                oldTitles.forEach(function (title) {
                    if (typeof title !== "string") return;
                    const id = shop.favoriteId(title);
                    if (!favorites.includes(id)) favorites.push(id);
                });
            }
            this.save(this.favoritesKey, favorites);
        }
    },
};

shop.migrate();
