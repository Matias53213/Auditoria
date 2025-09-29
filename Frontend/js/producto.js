// producto.js - SISTEMA COMPLETO ACTUALIZADO CON DESCUENTOS
const API_BASE_URL = 'http://localhost:4000/api';
let productos = [];
let carrito = JSON.parse(localStorage.getItem("carritoCastleGaming")) || [];

// FUNCIÓN - Verificar autenticación
function verificarAutenticacion() {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("userData");
    return !!(token && userData);
}

// FUNCIÓN - Calcular descuento
function calcularDescuento(precioOriginal, precioActual) {
    if (!precioOriginal || precioOriginal <= precioActual) return null;
    const descuento = ((precioOriginal - precioActual) / precioOriginal) * 100;
    return Math.round(descuento);
}

// FUNCIÓN - Formatear precio con descuento
function formatearPrecioConDescuento(precio, precioOriginal) {
    const descuento = calcularDescuento(precioOriginal, precio);
    
    if (descuento && descuento > 0) {
        return `
            <div class="precio-con-descuento">
                <span class="precio-original tachado">€${parseFloat(precioOriginal).toFixed(2)}</span>
                <span class="precio-actual">€${parseFloat(precio).toFixed(2)}</span>
                <span class="badge-descuento">-${descuento}%</span>
            </div>
        `;
    } else {
        return `<span class="precio-sin-descuento">€${parseFloat(precio).toFixed(2)}</span>`;
    }
}

// FUNCIÓN MEJORADA - Agregar al carrito con control de stock
function agregarAlCarrito(producto, cantidad, origen = 'desconocido') {
    console.log('=== AGREGAR AL CARRITO ===', { producto: producto.nombre, cantidad, origen });
    
    const token = localStorage.getItem("token");
    if (!token) {
        console.log('No hay token, redirigiendo a login');
        if (confirm("Debes iniciar sesión. ¿Ir a login?")) {
            window.location.href = "login.html?form=login";
        }
        return false;
    }

    // CONTROL DE STOCK MEJORADO
    const stockDisponible = producto.stock || 0;
    const itemExistente = carrito.find(item => item.id === producto.id);
    const cantidadActual = itemExistente ? itemExistente.cantidad : 0;
    const nuevaCantidadTotal = cantidadActual + cantidad;

    console.log('Control stock:', { stockDisponible, cantidadActual, nuevaCantidadTotal });

    if (nuevaCantidadTotal > stockDisponible) {
        const mensaje = stockDisponible === 0 
            ? 'Este producto está agotado' 
            : `Solo hay ${stockDisponible} unidades disponibles. Ya tienes ${cantidadActual} en el carrito`;
        
        mostrarNotificacion(mensaje, 'error');
        return false;
    }

    // AGREGAR AL CARRITO
    if (itemExistente) {
        itemExistente.cantidad = nuevaCantidadTotal;
        console.log('Producto actualizado en carrito');
    } else {
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            precioOriginal: producto.precioOriginal,
            imagen: producto.imagenPrincipal,
            cantidad: cantidad,
            stock: producto.stock
        });
        console.log('Producto agregado nuevo al carrito');
    }

    localStorage.setItem("carritoCastleGaming", JSON.stringify(carrito));
    actualizarContadorCarrito();
    mostrarNotificacion(`${cantidad} ${producto.nombre} agregado(s) al carrito`, 'success');

    if (window.location.pathname.includes('carrito.html')) {
        cargarCarrito();
    }

    return true;
}

// FUNCIÓN - Actualizar contador
function actualizarContadorCarrito() {
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    const contadores = document.querySelectorAll('.cart-count');
    
    contadores.forEach(contador => {
        contador.textContent = totalItems;
        contador.style.display = totalItems > 0 ? 'flex' : 'none';
    });
}

// FUNCIÓN - Actualizar navbar
function actualizarNavbar() {
    const userActions = document.getElementById('userActions');
    if (!userActions) return;

    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");

    if (token && username) {
        userActions.innerHTML = `
            <div class="user-profile" style="display: flex; align-items: center; gap: 10px;">
                <div class="user-avatar" style="width: 32px; height: 32px; background: var(--primary-orange); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
                    ${username.charAt(0).toUpperCase()}
                </div>
                <div class="user-info" style="display: flex; flex-direction: column;">
                    <span class="user-name" style="font-size: 0.9rem; font-weight: bold;">${username}</span>
                    <span class="user-welcome" style="font-size: 0.8rem; color: var(--gray-text);">Bienvenido</span>
                </div>
            </div>
            <a href="carrito.html" class="user-action">
                <div class="cart-icon">
                    <i class="fas fa-shopping-cart"></i>
                    <span class="cart-count">0</span>
                </div>
                <span>Carrito</span>
            </a>
            <a href="#" class="user-action" id="logoutBtn">
                <i class="fas fa-sign-out-alt"></i>
                <span>Cerrar Sesión</span>
            </a>
        `;
        
        document.getElementById('logoutBtn').addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem("token");
            localStorage.removeItem("username");
            localStorage.removeItem("userId");
            localStorage.removeItem("userData");
            location.reload();
        });
    } else {
        userActions.innerHTML = `
            <a href="login.html" class="user-action">
                <i class="fas fa-user"></i>
                <span>Iniciar Sesión</span>
            </a>
            <a href="login.html" class="user-action">
                <i class="fas fa-user-plus"></i>
                <span>Crear Cuenta</span>
            </a>
            <a href="carrito.html" class="user-action">
                <div class="cart-icon">
                    <i class="fas fa-shopping-cart"></i>
                    <span class="cart-count">0</span>
                </div>
                <span>Carrito</span>
            </a>
        `;
    }

    actualizarContadorCarrito();
}

// ==================== FUNCIONES DE PRODUCTOS ACTUALIZADAS ====================
async function cargarProductos() {
    try {
        const response = await fetch(`${API_BASE_URL}/productos`);
        if (!response.ok) throw new Error('Error al cargar productos');
        
        productos = await response.json();

        if (window.location.pathname.includes('productos.html')) {
            mostrarProductosGrid();
        } else if (window.location.pathname.includes('index.html')) {
            mostrarProductosDestacados();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function mostrarProductosGrid() {
    const container = document.getElementById('products-container');
    if (!container) return;

    container.innerHTML = productos.map(producto => `
        <div class="product-card">
            <div class="product-img">
                <img src="${getImageUrl(producto.imagenPrincipal)}" alt="${producto.nombre}">
                ${producto.destacado ? '<div class="destacado-badge">Destacado</div>' : ''}
                ${producto.stock === 0 ? '<div class="agotado-badge">Agotado</div>' : ''}
                ${calcularDescuento(producto.precioOriginal, producto.precio) ? 
                    '<div class="descuento-badge">-' + calcularDescuento(producto.precioOriginal, producto.precio) + '%</div>' : ''}
            </div>
            <div class="product-info">
                <h3 class="product-title">${producto.nombre}</h3>
                <p class="product-desc">${(producto.descripcion || '').substring(0, 100)}...</p>
                <div class="product-price">
                    ${formatearPrecioConDescuento(producto.precio, producto.precioOriginal)}
                </div>
                <p class="stock-info"><small>Stock: ${producto.stock || 0} unidades</small></p>
                <div class="product-actions">
                    <a href="detalle-producto.html?id=${producto.id}" class="btn btn-outline">Ver Detalles</a>
                    <button class="btn" onclick="agregarAlCarritoDesdeCard(${producto.id})" 
                            ${producto.stock === 0 ? 'disabled' : ''}>
                        <i class="fas fa-shopping-cart"></i> 
                        ${producto.stock === 0 ? 'Agotado' : 'Agregar'}
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function mostrarProductosDestacados() {
    const container = document.getElementById('products-container');
    if (!container) return;

    const productosDestacados = productos.filter(p => p.destacado === true).slice(0, 4);
    
    container.innerHTML = productosDestacados.map(producto => `
        <div class="product-card">
            <div class="product-img">
                <img src="${getImageUrl(producto.imagenPrincipal)}" alt="${producto.nombre}">
                ${producto.destacado ? '<div class="destacado-badge">Destacado</div>' : ''}
                ${producto.stock === 0 ? '<div class="agotado-badge">Agotado</div>' : ''}
                ${calcularDescuento(producto.precioOriginal, producto.precio) ? 
                    '<div class="descuento-badge">-' + calcularDescuento(producto.precioOriginal, producto.precio) + '%</div>' : ''}
            </div>
            <div class="product-info">
                <h3 class="product-title">${producto.nombre}</h3>
                <p class="product-desc">${(producto.descripcion || '').substring(0, 100)}...</p>
                <div class="product-price">
                    ${formatearPrecioConDescuento(producto.precio, producto.precioOriginal)}
                </div>
                <p class="stock-info"><small>Stock: ${producto.stock || 0} unidades</small></p>
                <div class="product-actions">
                    <a href="detalle-producto.html?id=${producto.id}" class="btn btn-outline">Ver Detalles</a>
                    <button class="btn" onclick="agregarAlCarritoDesdeCard(${producto.id})" 
                            ${producto.stock === 0 ? 'disabled' : ''}>
                        <i class="fas fa-shopping-cart"></i> 
                        ${producto.stock === 0 ? 'Agotado' : 'Agregar'}
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function agregarAlCarritoDesdeCard(productId) {
    const producto = productos.find(p => p.id === productId);
    if (producto) {
        agregarAlCarrito(producto, 1, 'pagina-productos');
    }
}

// ==================== FUNCIONES DE DETALLE ACTUALIZADAS ====================
async function cargarDetalleProducto() {
    const productId = new URLSearchParams(window.location.search).get('id');
    if (!productId) {
        mostrarErrorDetalle('ID de producto no válido');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/productos/${productId}`);
        if (!response.ok) throw new Error('Producto no encontrado');
        
        const producto = await response.json();
        mostrarDetalleProducto(producto);
    } catch (error) {
        mostrarErrorDetalle('Error al cargar el producto: ' + error.message);
    }
}

function mostrarDetalleProducto(producto) {
    const container = document.getElementById('product-detail-container');
    if (!container) return;

    const precio = typeof producto.precio === 'string' ? parseFloat(producto.precio) : producto.precio;
    const precioOriginal = typeof producto.precioOriginal === 'string' ? parseFloat(producto.precioOriginal) : producto.precioOriginal;
    const stockDisponible = producto.stock || 0;
    const descuento = calcularDescuento(precioOriginal, precio);

    container.innerHTML = `
        <div class="product-detail">
            <div class="product-gallery">
                <img src="${getImageUrl(producto.imagenPrincipal)}" alt="${producto.nombre}" class="product-main-image">
                ${descuento ? '<div class="descuento-badge-detalle">-${descuento}%</div>' : ''}
            </div>
            <div class="product-info-detail">
                <h1 class="product-title-detail">${producto.nombre}</h1>
                
                ${producto.limiteEdicion ? 
                    `<div class="edicion-limitada">EDICIÓN LIMITADA: ${producto.limiteEdicion} unidades</div>` : ''}
                
                <div class="product-price-detail">
                    ${descuento ? `
                        <div class="precio-con-descuento-detalle">
                            <span class="precio-original-detalle tachado">€${precioOriginal.toFixed(2)}</span>
                            <span class="precio-actual-detalle">€${precio.toFixed(2)}</span>
                            <span class="ahorro-detalle">Ahorras €${(precioOriginal - precio).toFixed(2)}</span>
                        </div>
                    ` : `
                        <span class="precio-sin-descuento-detalle">€${precio.toFixed(2)}</span>
                    `}
                </div>
                
                <div class="stock-info-detalle">
                    <i class="fas fa-box"></i> 
                    ${stockDisponible > 0 ? 
                        `<span style="color: #4CAF50;">En stock (${stockDisponible} unidades disponibles)</span>` : 
                        '<span style="color: #f44336;">Producto agotado</span>'
                    }
                </div>
                
                <p class="product-description-detail">${producto.descripcion || 'Sin descripción disponible'}</p>
                
                <div class="product-specs">
                    <h3><i class="fas fa-list-alt"></i> Especificaciones</h3>
                    ${producto.marca ? `
                        <div class="spec-item">
                            <span class="spec-label">Marca:</span>
                            <span class="spec-value">${producto.marca.nombre}</span>
                        </div>
                    ` : ''}
                    
                    ${producto.categoria ? `
                        <div class="spec-item">
                            <span class="spec-label">Categoría:</span>
                            <span class="spec-value">${producto.categoria.nombre}</span>
                        </div>
                    ` : ''}
                    
                    <div class="spec-item">
                        <span class="spec-label">Estado:</span>
                        <span class="spec-value" style="color: ${producto.activo ? '#4CAF50' : '#f44336'}">
                            ${producto.activo ? 'Activo' : 'Inactivo'}
                        </span>
                    </div>
                    
                    ${descuento ? `
                        <div class="spec-item">
                            <span class="spec-label">Descuento:</span>
                            <span class="spec-value" style="color: #4CAF50; font-weight: bold;">
                                ${descuento}% de descuento
                            </span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="product-actions">
                    <div class="quantity-selector">
                        <button class="quantity-btn" id="decreaseQty">-</button>
                        <input type="text" class="quantity-input" id="quantityInput" value="1" readonly>
                        <button class="quantity-btn" id="increaseQty">+</button>
                    </div>
                    <button class="btn" id="addToCartBtn" ${stockDisponible === 0 ? 'disabled' : ''}>
                        <i class="fas fa-shopping-cart"></i> 
                        ${stockDisponible === 0 ? 'Agotado' : 'Añadir al Carrito'}
                    </button>
                </div>
                
                ${stockDisponible > 0 ? `
                    <div class="stock-message" id="stockMessage" style="margin-top: 10px; font-size: 0.9rem; color: #666; display: none;">
                        Máximo disponible: ${stockDisponible} unidades
                    </div>
                ` : ''}
            </div>
        </div>
    `;

    configurarEventosDetalleProducto(producto);
}

function configurarEventosDetalleProducto(producto) {
    const stockDisponible = producto.stock || 0;
    const quantityInput = document.getElementById('quantityInput');
    const decreaseBtn = document.getElementById('decreaseQty');
    const increaseBtn = document.getElementById('increaseQty');
    const stockMessage = document.getElementById('stockMessage');

    function actualizarCantidad(cambio) {
        let value = parseInt(quantityInput.value) + cambio;
        
        if (value < 1) value = 1;
        if (value > stockDisponible) {
            value = stockDisponible;
            if (stockMessage) stockMessage.style.display = 'block';
        } else {
            if (stockMessage) stockMessage.style.display = 'none';
        }
        
        quantityInput.value = value;
        decreaseBtn.disabled = value <= 1;
    }

    decreaseBtn.addEventListener('click', () => actualizarCantidad(-1));
    increaseBtn.addEventListener('click', () => actualizarCantidad(1));

    decreaseBtn.disabled = parseInt(quantityInput.value) <= 1;

    const addToCartBtn = document.getElementById('addToCartBtn');
    addToCartBtn.addEventListener('click', function() {
        if (stockDisponible === 0) {
            mostrarNotificacion('Este producto está agotado', 'error');
            return;
        }
        
        const cantidad = parseInt(quantityInput.value);
        agregarAlCarrito(producto, cantidad, 'detalle-producto');
    });
}

function mostrarErrorDetalle(mensaje) {
    const container = document.getElementById('product-detail-container');
    if (container) {
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error</h3>
                <p>${mensaje}</p>
                <a href="productos.html" class="btn" style="margin-top: 20px;">Volver a Productos</a>
            </div>
        `;
    }
}

// ==================== FUNCIONES DEL CARRITO ACTUALIZADAS ====================
function cargarCarrito() {
    const container = document.getElementById('cart-container');
    if (!container) return;

    carrito = JSON.parse(localStorage.getItem("carritoCastleGaming")) || [];

    if (carrito.length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart" style="font-size: 5rem; color: var(--gray-text); margin-bottom: 20px;"></i>
                <p style="color: var(--gray-text); margin-bottom: 30px; font-size: 1.2rem;">Tu carrito está vacío</p>
                <a href="productos.html" class="btn">Seguir Comprando</a>
            </div>
        `;
        return;
    }

    const subtotal = carrito.reduce((sum, item) => sum + (parseFloat(item.precio) * item.cantidad), 0);
    const subtotalOriginal = carrito.reduce((sum, item) => {
        const precioOriginal = item.precioOriginal || item.precio;
        return sum + (parseFloat(precioOriginal) * item.cantidad);
    }, 0);
    const ahorroTotal = subtotalOriginal - subtotal;
    const envio = subtotal > 100 ? 0 : 9.99;
    const impuestos = subtotal * 0.21;
    const total = subtotal + envio + impuestos;

    container.innerHTML = `
        <div class="cart-page">
            <div class="cart-items">
                <h3>Tus Productos (${carrito.reduce((sum, item) => sum + item.cantidad, 0)} items)</h3>
                ${carrito.map((item, index) => {
                    const stockDisponible = item.stock || 0;
                    const puedeAumentar = item.cantidad < stockDisponible;
                    const descuento = calcularDescuento(item.precioOriginal, item.precio);
                    
                    return `
                    <div class="cart-item">
                        <img src="${getImageUrl(item.imagen)}" alt="${item.nombre}" class="cart-item-image">
                        <div class="cart-item-details">
                            <h3 class="cart-item-title">
                                <a href="detalle-producto.html?id=${item.id}" style="color: var(--light-text); text-decoration: none;">
                                    ${item.nombre}
                                </a>
                            </h3>
                            <div class="cart-item-price">
                                ${descuento ? `
                                    <div class="precio-carrito">
                                        <span class="precio-original tachado">€${parseFloat(item.precioOriginal).toFixed(2)}</span>
                                        <span class="precio-actual">€${parseFloat(item.precio).toFixed(2)} c/u</span>
                                        <span class="descuento-carrito">-${descuento}%</span>
                                    </div>
                                ` : `
                                    <span class="precio-sin-descuento">€${parseFloat(item.precio).toFixed(2)} c/u</span>
                                `}
                            </div>
                            <p class="cart-item-stock"><small>Stock disponible: ${stockDisponible}</small></p>
                            <div class="cart-item-actions">
                                <div class="quantity-selector">
                                    <button class="quantity-btn" onclick="actualizarCantidadCarrito(${index}, -1)" 
                                            ${item.cantidad <= 1 ? 'disabled' : ''}>-</button>
                                    <input type="text" class="quantity-input" value="${item.cantidad}" readonly>
                                    <button class="quantity-btn" onclick="actualizarCantidadCarrito(${index}, 1)" 
                                            ${!puedeAumentar ? 'disabled' : ''}>+</button>
                                </div>
                                <span class="remove-item" onclick="eliminarDelCarrito(${index})">
                                    <i class="fas fa-trash"></i> Eliminar
                                </span>
                            </div>
                            ${!puedeAumentar ? '<p style="color: #ff9800; font-size: 0.8rem; margin-top: 5px;">Stock máximo alcanzado</p>' : ''}
                        </div>
                        <div class="cart-item-total">
                            <span>€${(parseFloat(item.precio) * item.cantidad).toFixed(2)}</span>
                            ${descuento ? `
                                <span class="ahorro-item" style="color: #4CAF50; font-size: 0.8rem;">
                                    Ahorras: €${((item.precioOriginal - item.precio) * item.cantidad).toFixed(2)}
                                </span>
                            ` : ''}
                        </div>
                    </div>
                `}).join('')}
            </div>
            <div class="cart-summary">
                <h3 class="summary-title">Resumen de Compra</h3>
                
                ${ahorroTotal > 0 ? `
                    <div class="summary-item ahorro-total" style="background: #e8f5e8; padding: 10px; border-radius: 5px; margin-bottom: 10px;">
                        <span style="color: #4CAF50; font-weight: bold;">
                            <i class="fas fa-piggy-bank"></i> Total ahorrado
                        </span>
                        <span style="color: #4CAF50; font-weight: bold;">-€${ahorroTotal.toFixed(2)}</span>
                    </div>
                ` : ''}
                
                <div class="summary-item">
                    <span>Subtotal (${carrito.reduce((sum, item) => sum + item.cantidad, 0)} items)</span>
                    <span>€${subtotal.toFixed(2)}</span>
                </div>
                <div class="summary-item">
                    <span>Envío</span>
                    <span>${envio === 0 ? 'GRATIS' : '€' + envio.toFixed(2)}</span>
                </div>
                <div class="summary-item">
                    <span>Impuestos (21%)</span>
                    <span>€${impuestos.toFixed(2)}</span>
                </div>
                <div class="summary-total">
                    <span>Total</span>
                    <span>€${total.toFixed(2)}</span>
                </div>
                <button class="btn checkout-btn" onclick="procederAlPago()">
                    <i class="fas fa-lock"></i> Proceder al Pago
                </button>
                <button class="btn btn-outline" onclick="vaciarCarrito()" style="margin-top: 10px; width: 100%;">
                    <i class="fas fa-trash"></i> Vaciar Carrito
                </button>
            </div>
        </div>
    `;
}

function actualizarCantidadCarrito(index, cambio) {
    const item = carrito[index];
    const nuevaCantidad = item.cantidad + cambio;
    const stockDisponible = item.stock || 0;

    if (nuevaCantidad < 1) {
        eliminarDelCarrito(index);
        return;
    }

    if (nuevaCantidad > stockDisponible) {
        mostrarNotificacion(`No puedes agregar más de ${stockDisponible} unidades de este producto`, 'warning');
        return;
    }

    item.cantidad = nuevaCantidad;
    localStorage.setItem("carritoCastleGaming", JSON.stringify(carrito));
    cargarCarrito();
    actualizarContadorCarrito();
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    localStorage.setItem("carritoCastleGaming", JSON.stringify(carrito));
    cargarCarrito();
    actualizarContadorCarrito();
    mostrarNotificacion('Producto eliminado del carrito', 'info');
}

function vaciarCarrito() {
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
        carrito = [];
        localStorage.setItem("carritoCastleGaming", JSON.stringify(carrito));
        carloadCarrito();
        actualizarContadorCarrito();
        mostrarNotificacion('Carrito vaciado', 'info');
    }
}

function procederAlPago() {
    const token = localStorage.getItem("token");
    if (!token) {
        mostrarNotificacion('Debes iniciar sesión para realizar una compra', 'error');
        return;
    }
    if (carrito.length === 0) {
        mostrarNotificacion('El carrito está vacío', 'warning');
        return;
    }
    mostrarNotificacion('Redirigiendo al proceso de pago...', 'info');
}

// ==================== UTILIDADES ====================
function getImageUrl(imagePath) {
    if (!imagePath || imagePath === 'default.jpg') {
        return 'https://via.placeholder.com/300x200/2A2A2A/cccccc?text=Imagen+No+Disponible';
    }
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:4000${imagePath}`;
}

function mostrarNotificacion(mensaje, tipo = 'info') {
    const notificacion = document.createElement('div');
    notificacion.innerHTML = `<span>${mensaje}</span><button onclick="this.parentElement.remove()">×</button>`;
    notificacion.style.cssText = `
        position: fixed; top: 20px; right: 20px; padding: 15px 20px; border-radius: 5px; 
        z-index: 1000; color: white; font-weight: 500; display: flex; align-items: center; 
        gap: 10px; animation: slideIn 0.3s ease; background-color: ${
            tipo === 'success' ? '#4CAF50' : 
            tipo === 'error' ? '#f44336' : 
            tipo === 'warning' ? '#FF9800' : '#2196F3'
        };
    `;
    
    document.body.appendChild(notificacion);
    setTimeout(() => notificacion.remove(), 4000);
}

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== INICIANDO SISTEMA ===');
    
    actualizarNavbar();
    actualizarContadorCarrito();
    
    const path = window.location.pathname;
    console.log('Página actual:', path);
    
    if (path.includes('productos.html') || path.includes('index.html')) {
        cargarProductos();
    } else if (path.includes('detalle-producto.html')) {
        cargarDetalleProducto();
    } else if (path.includes('carrito.html')) {
        cargarCarrito();
    }
});

// Estilos mejorados con descuentos
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    .destacado-badge {
        position: absolute; top: 10px; left: 10px; 
        background: var(--primary-orange); color: white; 
        padding: 5px 10px; border-radius: 4px; font-size: 0.8rem; font-weight: bold;
    }
    .agotado-badge {
        position: absolute; top: 10px; right: 10px; 
        background: #f44336; color: white; 
        padding: 5px 10px; border-radius: 4px; font-size: 0.8rem; font-weight: bold;
    }
    .descuento-badge {
        position: absolute; top: 10px; right: 10px; 
        background: #4CAF50; color: white; 
        padding: 5px 10px; border-radius: 4px; font-size: 0.8rem; font-weight: bold;
    }
    .descuento-badge-detalle {
        position: absolute; top: 20px; right: 20px; 
        background: #4CAF50; color: white; 
        padding: 10px 15px; border-radius: 8px; font-size: 1.2rem; font-weight: bold;
    }
    .tachado {
        text-decoration: line-through;
        color: #999;
    }
    .precio-con-descuento {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
    }
    .precio-original {
        font-size: 0.9rem;
        color: #999;
    }
    .precio-actual {
        font-size: 1.2rem;
        font-weight: bold;
        color: var(--primary-orange);
    }
    .badge-descuento {
        background: #4CAF50;
        color: white;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: bold;
    }
    .precio-con-descuento-detalle {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }
    .precio-original-detalle {
        font-size: 1.5rem;
        color: #999;
    }
    .precio-actual-detalle {
        font-size: 2.5rem;
        font-weight: bold;
        color: var(--primary-orange);
    }
    .ahorro-detalle {
        color: #4CAF50;
        font-weight: bold;
        font-size: 1.1rem;
    }
    .precio-carrito {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
    }
    .descuento-carrito {
        background: #4CAF50;
        color: white;
        padding: 2px 6px;
        border-radius: 10px;
        font-size: 0.7rem;
    }
    .ahorro-item {
        display: block;
        margin-top: 5px;
    }
    .ahorro-total {
        border-left: 4px solid #4CAF50;
    }
    .notification button {
        background: none; border: none; color: white; 
        font-size: 1.2rem; cursor: pointer; padding: 0; margin-left: 10px;
    }
    .stock-info {
        color: #666; font-size: 0.9rem; margin: 5px 0;
    }
    .stock-info-detalle {
        margin: 15px 0; font-size: 1.1rem;
    }
    .cart-item-stock {
        color: #666; font-size: 0.9rem; margin: 5px 0;
    }
`;
document.head.appendChild(style);