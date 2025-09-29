// Funcionalidad del Carrusel
document.addEventListener('DOMContentLoaded', function() {
    const carouselItems = document.querySelectorAll('.carousel-item');
    const carouselControls = document.querySelectorAll('.carousel-control');
    let currentIndex = 0;
    let carouselInterval;

    function showSlide(index) {
        // Ocultar todas las diapositivas
        carouselItems.forEach(item => item.classList.remove('active'));
        carouselControls.forEach(control => control.classList.remove('active'));
        
        // Mostrar la diapositiva actual
        carouselItems[index].classList.add('active');
        carouselControls[index].classList.add('active');
        currentIndex = index;
    }

    function nextSlide() {
        let nextIndex = (currentIndex + 1) % carouselItems.length;
        showSlide(nextIndex);
    }

    // Configurar los controles del carrusel
    carouselControls.forEach(control => {
        control.addEventListener('click', function() {
            let index = parseInt(this.getAttribute('data-index'));
            showSlide(index);
            resetCarouselInterval();
        });
    });

    // Iniciar el carrusel automático
    function startCarouselInterval() {
        carouselInterval = setInterval(nextSlide, 5000);
    }

    function resetCarouselInterval() {
        clearInterval(carouselInterval);
        startCarouselInterval();
    }

    startCarouselInterval();

    // Funcionalidad del carrito
    const addToCartButtons = document.querySelectorAll('.product-card .btn');
    const cartCount = document.querySelector('.cart-count');
    let count = 0;

    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (this.textContent === "Ver Detalles") return;
            
            e.preventDefault();
            count++;
            cartCount.textContent = count;
            
            // Efecto visual al añadir al carrito
            this.textContent = "¡Añadido!";
            setTimeout(() => {
                this.textContent = "Añadir al Carrito";
            }, 1500);
        });
    });
});
    // Función para actualizar la navbar según el estado de autenticación
    function updateNavbar() {
        const userActions = document.getElementById('userActions');
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
            try {
                const user = JSON.parse(userData);
                // Crear elemento de perfil de usuario
                userActions.innerHTML = `
                    <div class="user-profile">
                        <div class="user-avatar">
                            ${user.username.charAt(0).toUpperCase()}
                        </div>
                        <div class="user-info">
                            <span class="user-name">${user.username}</span>
                            <span class="user-welcome">Bienvenido</span>
                        </div>
                    </div>
                    <a href="carrito.html" class="user-action">
                        <div class="cart-icon">
                            <i class="fas fa-shopping-cart"></i>
                            <span class="cart-count">3</span>
                        </div>
                        <span>Carrito</span>
                    </a>
                    <a href="#" class="user-action" id="logoutBtn">
                        <i class="fas fa-sign-out-alt"></i>
                        <span>Cerrar Sesión</span>
                    </a>
                `;
                
                // Agregar evento de logout
                document.getElementById('logoutBtn').addEventListener('click', function(e) {
                    e.preventDefault();
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.reload();
                });
            } catch (e) {
                console.error('Error parsing user data:', e);
            }
        }
    }

    // Ejecutar cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', function() {
        updateNavbar();
    });
            // --- CONFIG ---
        const API_BASE_URL = 'http://localhost:4000'; // <-- debe apuntar al host (sin "/api")
        const PLACEHOLDER_IMG = 'https://via.placeholder.com/150x150/2A2A2A/cccccc?text=Imagen';

        // Obtener productos desde la API
        async function fetchProducts() {
            try {
                const res = await fetch(`${API_BASE_URL}/api/productos`);
                if (!res.ok) throw new Error('Error al obtener productos: ' + res.status);
                const productos = await res.json();
                console.log('Productos recibidos (imagenPrincipal):', productos.map(p => ({id: p.id, imagenPrincipal: p.imagenPrincipal})));
                return productos;
            } catch (err) {
                console.error('fetchProducts error:', err);
                return [];
            }
        }

        // Construye la URL final de la imagen (soporta varias formas)
        function buildImageUrl(imagenPrincipal) {
            if (!imagenPrincipal) return null;
            if (imagenPrincipal === 'default.jpg') return null; // tratar como sin imagen
            // URL absoluta
            if (/^https?:\/\//i.test(imagenPrincipal)) return imagenPrincipal;
            // path absoluto en el servidor, ejemplo "/uploads/archivo.png" o "/api/uploads/archivo.png"
            if (imagenPrincipal.startsWith('/')) {
                // Si la API sirve uploads en /uploads a nivel global (recomendado)
                return `${API_BASE_URL}${imagenPrincipal}`;
            }
            // solo filename -> asumimos carpeta /uploads
            return `${API_BASE_URL}/uploads/${encodeURIComponent(imagenPrincipal)}`;
        }

        // Renderiza productos (filtra destacados aquí)
        function renderProducts(products) {
            const container = document.getElementById('products-container');
            if (!products || products.length === 0) {
                container.innerHTML = '<div class="no-products">No hay productos destacados en este momento</div>';
                return;
            }

            // Filtramos destacados y limitamos a 4
            const featured = products.filter(p => !!p.destacado).slice(0, 4);
            if (featured.length === 0) {
                container.innerHTML = '<div class="no-products">No hay productos destacados en este momento</div>';
                return;
            }

            const cards = featured.map(product => {
                const imagenUrlCandidate = buildImageUrl(product.imagenPrincipal);
                // Si buildImageUrl devolvió null, usamos placeholder
                const imagenUrl = imagenUrlCandidate || PLACEHOLDER_IMG;

                // para debug: ver URL final en consola (puedes quitar luego)
                console.log(`Producto ${product.id} -> img: ${imagenUrl}`);

                const precio = (typeof product.precio === 'string') ? parseFloat(product.precio) : product.precio;
                const precioOriginal = product.precioOriginal
                    ? (typeof product.precioOriginal === 'string' ? parseFloat(product.precioOriginal) : product.precioOriginal)
                    : null;

                return `
                    <div class="product-card">
                        <div class="product-img">
                            <img src="${imagenUrl}" alt="${escapeHtml(product.nombre || 'Producto')}"
                            onerror="this.onerror=null;this.src='${PLACEHOLDER_IMG}'">
                            <div class="destacado-badge">Destacado</div>
                        </div>
                        <div class="product-info">
                            <h3 class="product-title">${escapeHtml(product.nombre || '')}</h3>
                            <p class="product-desc">${escapeHtml(product.descripcion || 'Descripción no disponible')}</p>
                            <div class="product-price">
                                ${precioOriginal ? `<span class="product-price-original">€${(precioOriginal||0).toFixed(2)}</span>` : ''}
                                €${(precio||0).toFixed(2)}
                            </div>
                            ${product.limiteEdicion ? `<p><small>Edición Limitada: ${product.limiteEdicion} unidades</small></p>` : ''}
                            <a href="detalle-producto.html?id=${encodeURIComponent(product.id)}" class="btn">Ver Detalles</a>
                        </div>
                    </div>
                `;
            }).join('');

            container.innerHTML = cards;
        }

    // pequeña función para escapar HTML en textos
    function escapeHtml(text) {
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // INIT
    async function initPage() {
        const productos = await fetchProducts();
        renderProducts(productos);
    }

    document.addEventListener('DOMContentLoaded', function() {
        initPage();

        // CARRUSEL (tu código original, sin cambios funcionales)
        const slides = document.querySelectorAll('.carousel-slide');
        const controls = document.querySelectorAll('.carousel-control');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        let currentSlide = 0;
        let autoSlideInterval;

        function showSlide(index) {
            slides.forEach(slide => slide.classList.remove('active'));
            controls.forEach(control => control.classList.remove('active'));
            slides[index].classList.add('active');
            if (controls[index]) controls[index].classList.add('active');
            currentSlide = index;
        }

        function nextSlide() {
            let nextIndex = (currentSlide + 1) % slides.length;
            showSlide(nextIndex);
        }

        function prevSlide() {
            let prevIndex = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(prevIndex);
        }

        controls.forEach((control, index) => {
            control.addEventListener('click', () => { showSlide(index); resetAutoSlide(); });
        });

        prevBtn.addEventListener('click', () => { prevSlide(); resetAutoSlide(); });
        nextBtn.addEventListener('click', () => { nextSlide(); resetAutoSlide(); });

        function startAutoSlide() {
            autoSlideInterval = setInterval(() => nextSlide(), 10000);
        }
        function resetAutoSlide() {
            clearInterval(autoSlideInterval);
            startAutoSlide();
        }
        startAutoSlide();

        const carousel = document.querySelector('.carousel-container');
        carousel.addEventListener('mouseenter', () => clearInterval(autoSlideInterval));
        carousel.addEventListener('mouseleave', () => startAutoSlide());
        showSlide(0);
    });