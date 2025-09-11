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