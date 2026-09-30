// Мобильное меню.
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.navigation');

function closeMenu() {
    navigation.classList.remove('navigation--open');
    menuButton.setAttribute('aria-expanded', 'false');
}

menuButton.addEventListener('click', function () {
    const isOpen = navigation.classList.toggle('navigation--open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
});

navigation.querySelectorAll('.navigation__link').forEach(function (link) {
    link.addEventListener('click', closeMenu);
});

document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        closeMenu();
    }
});

// Показываем адрес выбранного магазина в виджете Яндекс Карт.
const mapFrame = document.querySelector('.store-map__frame');
const storeMap = document.querySelector('.store-map');

document.querySelectorAll('[data-address]').forEach(function (button) {
    button.addEventListener('click', function () {
        const address = button.dataset.address;
        mapFrame.src = 'https://yandex.ru/map-widget/v1/?text=' + encodeURIComponent(address) + '&z=16&lang=ru_RU';
        mapFrame.title = 'Карта: ' + address;
        storeMap.scrollIntoView({ block: 'center' });
    });
});
