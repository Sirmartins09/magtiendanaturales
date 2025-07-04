// === UTILIDADES ===
function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity / 100), 0);
    const cartCount = document.querySelector(".cart-count");
    if (cartCount) cartCount.textContent = totalItems > 0 ? Math.ceil(totalItems) : 0;
}

// === AÑADIR PRODUCTO AL CARRITO ===
function addToCart(product) {
    const cart = getCart();
    const existing = cart.find(p => p.id === product.id);
    if (existing) {
        existing.quantity += product.quantity;
        existing.totalPrice += product.totalPrice;
    } else {
        cart.push(product);
    }
    saveCart(cart);
    alert(`"${product.name}" (${product.quantity} GR) añadido al carrito.`);
}

// === ELIMINAR PRODUCTO DEL CARRITO ===
function removeItemFromCart(id) {
    const cart = getCart().filter(p => p.id !== id);
    saveCart(cart);
    renderCartItems();
}

// === LIMPIAR CARRITO ===
function clearCart() {
    if (confirm("¿Vaciar todo el carrito?")) {
        localStorage.removeItem("cart");
        saveCart([]);
        renderCartItems();
    }
}

// === MOSTRAR PRODUCTOS EN EL CARRITO ===
function renderCartItems() {
    const cart = getCart();
    const container = document.querySelector(".cart-items-container");
    const totalEl = document.getElementById("cart-total-price");
    const emptyMsg = document.querySelector(".cart-empty-message");
    const clearBtn = document.getElementById("clear-cart-button");

    if (!container || !totalEl || !emptyMsg || !clearBtn) return;

    container.innerHTML = "";
    let total = 0;

    if (cart.length === 0) {
        emptyMsg.style.display = "block";
        clearBtn.style.display = "none";
    } else {
        emptyMsg.style.display = "none";
        clearBtn.style.display = "inline-block";

        cart.forEach(product => {
            const item = document.createElement("div");
            item.classList.add("cart-item");
            item.innerHTML = `
                <img src="${product.image}" alt="${product.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${product.name}</h4>
                    <p class="cart-item-quantity">Cantidad: ${product.quantity} gr</p>
                    <p class="cart-item-price">Precio por 100 GR: $${(product.pricePerUnit * 100).toFixed(2)}</p>
                    <p class="cart-item-subtotal">Subtotal: $${product.totalPrice.toFixed(2)}</p>
                    <button class="remove-item-button" data-id="${product.id}">Eliminar</button>
                </div>
            `;
            container.appendChild(item);
            total += product.totalPrice;
        });
    }

    totalEl.textContent = `$${total.toFixed(2)}`;
}

// === ENVIAR PEDIDO POR WHATSAPP ===
function sendOrderViaWhatsApp() {
    const cart = getCart();
    if (cart.length === 0) {
        alert("Tu carrito está vacío.");
        return;
    }

    let message = "¡Hola! Quiero hacer un pedido:\n\n";
    let total = 0;

    cart.forEach((product, index) => {
        message += `${index + 1}. ${product.name} - ${product.quantity} gr - $${product.totalPrice.toFixed(2)}\n`;
        total += product.totalPrice;
    });

    message += `\nTotal de la compra: $${total.toFixed(2)}\n\nMi nombre: (tu nombre)`;

    const WHATSAPP_NUMBER = "5492615590045"; // O el número de WhatsApp que deseas utilizar
    const encoded = encodeURIComponent(message); // ESTA LÍNEA ES LA QUE FALTABA
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, "_blank");
}


// === INICIALIZAR EVENTOS ===
document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();

    const toggleBtn = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const productsDropdownToggle = document.getElementById('productsDropdownToggle');
    const productsDropdownMenu = document.getElementById('productsDropdownMenu');
    const productsDropdown = document.getElementById('productsDropdown');

    // 🔒 Evitar que el menú se cierre al hacer clic en los links del dropdown
    const dropdownLinks = document.querySelectorAll('#productsDropdownMenu a');
    dropdownLinks.forEach(link => {
        link.addEventListener('click', e => e.stopPropagation());
    });

    // Menú hamburguesa
    if (toggleBtn && navLinks) {
        toggleBtn.addEventListener('click', () => {
            navLinks.classList.toggle('show');

            if (!navLinks.classList.contains('show')) {
                productsDropdownMenu?.classList.remove('show-dropdown');
                const chevronIcon = productsDropdownToggle?.querySelector('.fas.fa-chevron-down');
                chevronIcon?.classList.remove('rotate');
            }
        });
    }

    // Dropdown "Productos" en mobile
    if (productsDropdownToggle && productsDropdownMenu && productsDropdown) {
        productsDropdownToggle.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();

            const isMobileView = window.getComputedStyle(toggleBtn).display === 'block';

            if (isMobileView) {
                productsDropdownMenu.classList.toggle('show-dropdown');
                const chevronIcon = productsDropdownToggle.querySelector('.fas.fa-chevron-down');
                chevronIcon?.classList.toggle('rotate');
            }
        });
    }

    // Cierre global si se hace clic fuera
    document.addEventListener('click', (event) => {
        const isClickInsideNav = navLinks.contains(event.target) || toggleBtn.contains(event.target);
        const isClickInsideDropdown =
            productsDropdown?.contains(event.target) || productsDropdownMenu?.contains(event.target);

        if (!isClickInsideNav && navLinks.classList.contains('show')) {
            navLinks.classList.remove('show');
        }

        if (!isClickInsideDropdown && productsDropdownMenu?.classList.contains('show-dropdown')) {
            productsDropdownMenu.classList.remove('show-dropdown');
            const chevronIcon = productsDropdownToggle?.querySelector('.fas.fa-chevron-down');
            chevronIcon?.classList.remove('rotate');
        }
    });

    // --- Tarjetas de productos ---
    const productCards = document.querySelectorAll(".product-list-card");
    productCards.forEach(card => {
        let quantity = 100;
        const display = card.querySelector(".quantity-display");
        const minus = card.querySelector(".quantity-button:first-of-type");
        const plus = card.querySelector(".quantity-button:last-of-type");
        const addBtn = card.querySelector(".add-to-cart-button");

        display.textContent = `${quantity} GR`;

        minus?.addEventListener("click", () => {
            if (quantity > 100) {
                quantity -= 100;
                display.textContent = `${quantity} GR`;
            }
        });

        plus?.addEventListener("click", () => {
            quantity += 100;
            display.textContent = `${quantity} GR`;
        });

        addBtn?.addEventListener("click", () => {
            const name = card.querySelector(".product-list-title")?.textContent.trim();
            const image = card.querySelector(".product-list-image")?.src;
            const priceText = card.querySelector(".product-list-price")?.textContent;
            if (!name || !image || !priceText) return alert("Error al añadir el producto.");

            const match = priceText.match(/\$ ?([\d\.,]+)/);
            const price100 = parseFloat(match[1].replace(',', '.'));
            if (isNaN(price100)) return alert("Error de precio.");

            const pricePerGram = price100 / 100;
            const totalPrice = quantity * pricePerGram;
            const id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

            const product = {
                id,
                name,
                image,
                quantity,
                unit: 'gr',
                pricePerUnit: pricePerGram,
                totalPrice
            };

            addToCart(product);
        });
    });

    // --- Página carrito ---
    const cartPageContainer = document.querySelector(".cart-main-content");
    if (cartPageContainer) {
        renderCartItems();

        document.querySelector(".cart-items-container")?.addEventListener("click", e => {
            if (e.target.classList.contains("remove-item-button")) {
                const productId = e.target.dataset.id;
                if (productId) removeItemFromCart(productId);
            }
        });

        document.getElementById("checkout-whatsapp-button")?.addEventListener("click", sendOrderViaWhatsApp);
        document.getElementById("clear-cart-button")?.addEventListener("click", clearCart);
    }
});
