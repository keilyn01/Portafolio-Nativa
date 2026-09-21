const CART_KEY = 'nativa_cart';

const slides = [...document.querySelectorAll('.slide')];
const dots = [...document.querySelectorAll('.dot')];
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');
const slidesTrack = document.querySelector('.slides');
const filterButtons = [...document.querySelectorAll('.portfolio-nav [data-filter]')];
const productBoxes = [...document.querySelectorAll('.portfolio-content .box')];

const dropdown = document.querySelector('.dropdown');
const dropdownToggle = dropdown ? dropdown.firstElementChild : null;
const dropdownItems = dropdown ? [...dropdown.querySelectorAll('.dropdown-menu a')] : [];

function formatCurrency(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(value || 0);
}

function normalizePrice(value) {
  const digits = String(value ?? '0').replace(/[^0-9-]/g, '');
  const parsed = Number(digits || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function extractProductData(button) {
  const container = button.closest('.product-card, .product-detail, .box, article');
  const nameElement = container?.querySelector('.product-info h3, .product-detail__title, h3, .product-name');
  const imageElement = container?.querySelector('img');
  const priceElement = container?.querySelector('.new-price, .product-detail__price span, .product-price, .price');
  const name = nameElement?.textContent?.trim() || button.dataset.name || 'Producto Nativa';
  const image = imageElement?.src || button.dataset.image || 'img/logo.png';
  const price = normalizePrice(priceElement?.textContent || button.dataset.price || '0');

  return {
    id: `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${price}`,
    name,
    image,
    price,
    quantity: Number(button.dataset.quantity || 1)
  };
}

function addToCart(product) {
  const cart = getCart();
  const existingIndex = cart.findIndex((item) => item.id === product.id);

  if (existingIndex >= 0) {
    cart[existingIndex].quantity += product.quantity;
  } else {
    cart.push(product);
  }

  saveCart(cart);
  return cart;
}

function renderCart() {
  const cartItems = document.getElementById('cart-items');
  if (!cartItems) return;

  const cart = getCart();

  if (!cart.length) {
    cartItems.innerHTML = '<div class="cart-empty">Tu bolsa está vacía.</div>';
    document.getElementById('cart-product-count').textContent = '0 productos';
    document.getElementById('cart-total-products').textContent = '$0';
    document.getElementById('cart-discounts').textContent = '-$0';
    document.getElementById('cart-subtotal').textContent = '$0';
    document.getElementById('cart-total').textContent = '$0';
    return;
  }

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discounts = 0;
  const total = subtotal - discounts;

  cartItems.innerHTML = cart.map((item) => `
    <div class="cart-item">
      <div class="cart-item__product">
        <img src="${item.image}" alt="${item.name}" class="cart-item__thumb">
        <span class="cart-item__name">${item.name}</span>
      </div>
      <div class="cart-item__qty">
        <select class="cart-qty-select" data-id="${item.id}" aria-label="Cantidad de ${item.name}">
          ${Array.from({ length: 10 }, (_, index) => index + 1)
            .map((quantity) => `<option value="${quantity}" ${quantity === item.quantity ? 'selected' : ''}>${quantity}</option>`)
            .join('')}
        </select>
      </div>
      <div class="cart-item__price">${formatCurrency(item.price * item.quantity)}</div>
      <button type="button" class="cart-item__remove" data-id="${item.id}" aria-label="Eliminar ${item.name}">
        <i class="fas fa-trash-alt"></i>
      </button>
    </div>
  `).join('');

  document.getElementById('cart-product-count').textContent = `${totalItems} ${totalItems === 1 ? 'producto' : 'productos'}`;
  document.getElementById('cart-total-products').textContent = formatCurrency(subtotal);
  document.getElementById('cart-discounts').textContent = `-$${discounts.toLocaleString('es-CO')}`;
  document.getElementById('cart-subtotal').textContent = formatCurrency(subtotal);
  document.getElementById('cart-total').textContent = formatCurrency(total);
}

function handleCartActions() {
  document.addEventListener('click', (event) => {
    const addButton = event.target.closest('.add-cart-btn');
    if (addButton) {
      event.preventDefault();
      const product = extractProductData(addButton);
      addToCart(product);

      if (!window.location.pathname.toLowerCase().endsWith('comprar.html')) {
        window.location.href = 'comprar.html';
      } else {
        renderCart();
      }
    }

    const removeButton = event.target.closest('.cart-item__remove');
    if (removeButton) {
      const cart = getCart().filter((item) => item.id !== removeButton.dataset.id);
      saveCart(cart);
      renderCart();
    }

    const summaryButton = event.target.closest('.cart-summary__button.secondary');
    if (summaryButton) {
      window.location.href = 'index.html';
    }
  });

  document.addEventListener('change', (event) => {
    if (!event.target.classList.contains('cart-qty-select')) return;

    const cart = getCart();
    const selectedId = event.target.dataset.id;
    const quantity = Math.max(1, Number(event.target.value) || 1);

    const updatedCart = cart.map((item) => item.id === selectedId ? { ...item, quantity } : item);
    saveCart(updatedCart);
    renderCart();
  });
}

handleCartActions();
renderCart();

const categoryByTitle = {
  'Té Vital': 'relajacion',
  'Granola Nativa': 'snacks',
  'Brisa Floral': 'relajacion',
  'Rubor Rose': 'cosmeticos',
  'Aceite Dorado': 'cuidado-personal',
  'Infusión Relax': 'relajacion',
  'Maní del Bosque': 'snacks',
  'Vela Otoño': 'relajacion',
  'Galletas Vitales': 'snacks',
  'Miel de Montaña': 'snacks',
  'Serum Aurora': 'cuidado-personal',
  'Sol Radiante': 'cuidado-personal',
  'Paleta Coral': 'cosmeticos',
  'Jabón Margarita': 'cuidado-personal',
  'Exfoliante Tropical': 'cuidado-personal',
  'Crema Natur': 'cuidado-personal',
  'Shampoo Frescura': 'cuidado-personal',
  'Labial Líquido Intenso': 'cosmeticos',
  'Tinta Encanto': 'cosmeticos',
  'Corrector Natural': 'cosmeticos',
  'Labial Pasión': 'cosmeticos',
  'Lápiz de Ojos Mirada': 'cosmeticos',
  'Lápiz de Cejas Definición': 'cosmeticos'
};

productBoxes.forEach((box) => {
  const productTitle = box.querySelector('.product-info h3')?.textContent.trim() || '';
  const card = box.querySelector('.product-card');
  if (card) {
    card.dataset.category = categoryByTitle[productTitle] || card.dataset.category || 'all';
  }
});

function filterProducts(filterKey) {
  productBoxes.forEach((box) => {
    const card = box.querySelector('.product-card');
    const category = card?.dataset.category || 'all';
    const shouldShow = filterKey === 'all' || category === filterKey;
    box.style.display = shouldShow ? '' : 'none';
  });

  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === filterKey;
    button.classList.toggle('is-active', isActive);
  });
}

filterButtons.forEach((button) => {
  button.addEventListener('click', (event) => {
    event.preventDefault();
    filterProducts(button.dataset.filter);
  });
});

filterProducts('all');

const slideButtons = [...document.querySelectorAll('.slide .hero-btn[data-filter]')];
slideButtons.forEach((button) => {
  button.addEventListener('click', (event) => {
    event.preventDefault();
    const filterKey = button.dataset.filter;
    if (!filterKey) return;
    filterProducts(filterKey);
    document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

let currentIndex = 1;
let autoSlideInterval = null;

if (slides.length > 1 && slidesTrack) {
  const firstClone = slides[0].cloneNode(true);
  const lastClone = slides[slides.length - 1].cloneNode(true);

  slidesTrack.insertBefore(lastClone, slidesTrack.firstChild);
  slidesTrack.appendChild(firstClone);
}

function updateDots() {
  const realSlides = slides.length;
  dots.forEach((dot, i) => {
    const realIndex = (currentIndex - 1 + realSlides) % realSlides;
    dot.classList.toggle('active', i === realIndex);
  });
}

function updateCarousel(index) {
  if (!slidesTrack || slides.length === 0) return;

  const realSlides = slides.length;
  const totalSlides = realSlides + 2;

  if (index >= totalSlides - 1) {
    slidesTrack.style.transition = 'transform 0.5s ease-in-out';
    slidesTrack.style.transform = `translateX(-${totalSlides - 1}00%)`;
    currentIndex = totalSlides - 1;

    setTimeout(() => {
      slidesTrack.style.transition = 'none';
      currentIndex = 1;
      slidesTrack.style.transform = 'translateX(-100%)';
      updateDots();
    }, 500);

    return;
  }

  if (index <= 0) {
    slidesTrack.style.transition = 'transform 0.5s ease-in-out';
    slidesTrack.style.transform = 'translateX(0%)';
    currentIndex = 0;

    setTimeout(() => {
      slidesTrack.style.transition = 'none';
      currentIndex = realSlides;
      slidesTrack.style.transform = `translateX(-${realSlides * 100}%)`;
      updateDots();
    }, 500);

    return;
  }

  currentIndex = index;
  slidesTrack.style.transition = 'transform 0.5s ease-in-out';
  slidesTrack.style.transform = `translateX(-${currentIndex * 100}%)`;
  updateDots();
}

function startAutoCarousel() {
  clearInterval(autoSlideInterval);
  autoSlideInterval = setInterval(() => {
    updateCarousel(currentIndex + 1);
  }, 4000);
}

if (slidesTrack) {
  slidesTrack.style.transition = 'transform 0.5s ease-in-out';
  slidesTrack.style.transform = 'translateX(-100%)';
}

function setDropdownOpen(isOpen) {
  if (!dropdown) return;
  dropdown.classList.toggle('open', isOpen);
  dropdownToggle?.setAttribute('aria-expanded', String(isOpen));
}

if (dropdownToggle) {
  dropdownToggle.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();

    const isOpen = dropdown.classList.contains('open');
    setDropdownOpen(!isOpen);
  });
}

dropdownItems.forEach((item) => {
  item.addEventListener('click', () => {
    setDropdownOpen(false);
  });
});

document.addEventListener('click', (event) => {
  if (!dropdown) return;
  const clickedInsideDropdown = dropdown.contains(event.target);
  if (!clickedInsideDropdown) {
    setDropdownOpen(false);
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    setDropdownOpen(false);
  }
});

document.querySelectorAll('.quantity-picker').forEach((picker) => {
  const input = picker.querySelector('input');
  const buttons = [...picker.querySelectorAll('.qty-btn')];

  if (!input) return;

  const updateValue = (nextValue) => {
    const cleanValue = Number.parseInt(nextValue, 10);
    const boundedValue = Number.isFinite(cleanValue) ? Math.max(1, cleanValue) : 1;
    input.value = String(boundedValue);
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.dataset.action;
      const currentValue = Number.parseInt(input.value, 10) || 1;
      const nextValue = action === 'increase' ? currentValue + 1 : currentValue - 1;
      updateValue(nextValue);
    });
  });

  input.addEventListener('change', () => {
    updateValue(input.value);
  });
});

prevBtn?.addEventListener('click', () => {
  updateCarousel(currentIndex - 1);
  startAutoCarousel();
});

nextBtn?.addEventListener('click', () => {
  updateCarousel(currentIndex + 1);
  startAutoCarousel();
});

dots.forEach((dot) => {
  dot.addEventListener('click', () => {
    const targetIndex = Number(dot.dataset.slide) + 1;
    updateCarousel(targetIndex);
    startAutoCarousel();
  });
});

updateDots();

if (slides.length > 0) {
  startAutoCarousel();
}