// admin.js - Script para el panel de administración de CastleGaming (CORREGIDO)
const API_BASE_URL = 'http://localhost:4000/api';
let marcas = [];
let proveedores = [];
let categorias = [];
let productos = [];
let usuarios = [];

// Inicialización cuando el DOM está cargado
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado, inicializando panel...');
    inicializarPanel();
    configurarEventListeners();
});

// Función para inicializar el panel
function inicializarPanel() {
    console.log('Inicializando panel...');
    cargarDatosIniciales();
}

// Función para cargar datos iniciales
async function cargarDatosIniciales() {
    try {
        console.log('Cargando datos iniciales...');
        await Promise.all([
            cargarMarcas(),
            cargarProveedores(),
            cargarCategorias(),
            cargarProductos(),
            cargarUsuarios()
        ]);
        
        actualizarSelectsFormularios();
        actualizarEstadisticas();
        
        console.log('Datos iniciales cargados correctamente');
    } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
        mostrarNotificacion('Error al cargar datos iniciales', 'error');
    }
}

// Función para cargar usuarios
async function cargarUsuarios() {
    try {
        console.log('Cargando usuarios...');
        const response = await fetch(`${API_BASE_URL}/usuarios`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error al cargar usuarios: ${errorText}`);
        }
        
        usuarios = await response.json();
        console.log('Usuarios cargados:', usuarios);
        actualizarTablaUsuarios();
        return usuarios;
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
        mostrarNotificacion('Error al cargar usuarios', 'error');
        return [];
    }
}

// Función para actualizar la tabla de usuarios
function actualizarTablaUsuarios() {
    const tbody = document.querySelector('#users tbody');
    if (!tbody) return;
    
    tbody.innerHTML = usuarios.map(usuario => {
        const nombreUsuario = usuario.username || usuario.nombre || 'Sin nombre';
        
        let fechaFormateada = 'No especificada';
        try {
            if (usuario.birthday) {
                const fecha = new Date(usuario.birthday);
                if (!isNaN(fecha.getTime())) {
                    fechaFormateada = fecha.toLocaleDateString();
                }
            }
        } catch (e) {
            console.error('Error formateando fecha:', e);
        }
        
        const adminTexto = usuario.admin ? 'Sí' : 'No';
        
        return `
        <tr>
            <td>${usuario.id}</td>
            <td>${nombreUsuario}</td>
            <td>${usuario.email}</td>
            <td>${fechaFormateada}</td>
            <td>
                <span class="status-badge ${usuario.admin ? 'status-completed' : 'status-cancelled'}">
                    ${adminTexto}
                </span>
            </td>
            <td class="action-buttons">
                <button class="action-btn edit-btn" onclick="editarUsuario(${usuario.id})">Editar</button>
                <button class="action-btn delete-btn" onclick="eliminarUsuario(${usuario.id})">Eliminar</button>
            </td>
        </tr>
        `;
    }).join('');
}

// Función para cambiar el estado de administrador
async function cambiarEstadoAdmin(id, esAdmin) {
    try {
        const response = await fetch(`${API_BASE_URL}/usuarios/${id}/admin`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ admin: esAdmin })
        });
        
        if (!response.ok) throw new Error('Error al actualizar estado de administrador');
        
        mostrarNotificacion(`Usuario ${esAdmin ? 'convertido en administrador' : 'quitado como administrador'} correctamente`, 'success');
        
        const usuarioIndex = usuarios.findIndex(u => u.id === id);
        if (usuarioIndex !== -1) {
            usuarios[usuarioIndex].admin = esAdmin;
        }
        
        actualizarTablaUsuarios();
    } catch (error) {
        console.error('Error al cambiar estado de administrador:', error);
        mostrarNotificacion('Error al cambiar estado de administrador', 'error');
        cargarUsuarios();
    }
}

// Función para actualizar estadísticas del dashboard
function actualizarEstadisticas() {
    document.getElementById('total-products').textContent = productos.length;
    document.getElementById('total-categories').textContent = categorias.length;
    document.getElementById('total-brands').textContent = marcas.length;
    document.getElementById('total-suppliers').textContent = proveedores.filter(p => p.activo).length;
    document.getElementById('total-users').textContent = usuarios.length;
    document.getElementById('total-orders').textContent = '89';
}

// Función para configurar event listeners
function configurarEventListeners() {
    console.log('Configurando event listeners...');
    
    // Formulario de producto
    const productForm = document.getElementById('product-form');
    if (productForm) {
        productForm.removeEventListener('submit', handleProductSubmit);
        productForm.addEventListener('submit', handleProductSubmit);
        console.log('Listener de producto configurado correctamente');
    }
    
    // Formulario de categoría
    const categoryForm = document.getElementById('category-form');
    if (categoryForm) {
        categoryForm.addEventListener('submit', handleCategorySubmit);
    }
    
    // Formulario de marca
    const brandForm = document.getElementById('brand-form');
    if (brandForm) {
        brandForm.addEventListener('submit', handleBrandSubmit);
    }
    
    // Formulario de proveedor
    const supplierForm = document.getElementById('supplier-form');
    if (supplierForm) {
        supplierForm.addEventListener('submit', handleSupplierSubmit);
    }
    
    // Upload de imagen
    const imageUpload = document.getElementById('product-image-upload');
    if (imageUpload) {
        imageUpload.removeEventListener('change', handleImageUpload);
        imageUpload.addEventListener('change', handleImageUpload);
        console.log('Listener de imagen configurado correctamente');
    }
    
    // Event listeners para las pestañas
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            const sectionId = this.closest('.content-section').id;
            showTab(sectionId, tabId);
        });
    });
    
    // Event listeners para el menú de navegación
    document.querySelectorAll('.nav-links a[data-section]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            showSection(sectionId);
        });
    });
    
    console.log('Todos los event listeners configurados');
}

// Función para cambiar entre secciones
function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === sectionId) {
            link.classList.add('active');
        }
    });
    
    if (sectionId === 'brands' || sectionId === 'suppliers' || sectionId === 'categories') {
        const firstTab = document.querySelector(`#${sectionId} .tab:first-child`);
        if (firstTab) {
            showTab(sectionId, firstTab.getAttribute('data-tab'));
        }
    }
    
    if (sectionId === 'products') {
        cargarProductos();
    } else if (sectionId === 'brands') {
        cargarMarcas();
    } else if (sectionId === 'suppliers') {
        cargarProveedores();
    } else if (sectionId === 'categories') {
        cargarCategorias();
    } else if (sectionId === 'users') {
        cargarUsuarios();
    }
}

// Función para cambiar entre pestañas
function showTab(sectionId, tabId) {
    document.querySelectorAll(`#${sectionId} .tab-content`).forEach(tab => {
        tab.classList.remove('active');
    });
    
    const targetTab = document.getElementById(tabId);
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    document.querySelectorAll(`#${sectionId} .tab`).forEach(tab => {
        tab.classList.remove('active');
        if (tab.getAttribute('data-tab') === tabId) {
            tab.classList.add('active');
        }
    });
}

// Función para cargar marcas desde la API
async function cargarMarcas() {
    try {
        console.log('Cargando marcas...');
        const response = await fetch(`${API_BASE_URL}/marcas`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error al cargar marcas: ${errorText}`);
        }
        
        marcas = await response.json();
        console.log('Marcas cargadas:', marcas.length);
        actualizarTablaMarcas();
        return marcas;
    } catch (error) {
        console.error('Error al cargar marcas:', error);
        mostrarNotificacion('Error al cargar marcas', 'error');
        return [];
    }
}

// Función para actualizar la tabla de marcas
function actualizarTablaMarcas() {
    const tbody = document.querySelector('#brands-list-tab tbody');
    if (!tbody) return;
    
    tbody.innerHTML = marcas.map(marca => `
        <tr>
            <td>${marca.id}</td>
            <td>${marca.nombre}</td>
            <td>${marca.productos ? marca.productos.length : 0}</td>
            <td><span class="status-badge status-completed">Activa</span></td>
            <td class="action-buttons">
                <button class="action-btn edit-btn" onclick="editarMarca(${marca.id})">Editar</button>
                <button class="action-btn delete-btn" onclick="eliminarMarca(${marca.id})">Eliminar</button>
            </td>
        </tr>
    `).join('');
}

// Función para cargar proveedores desde la API
async function cargarProveedores() {
    try {
        console.log('Cargando proveedores...');
        const response = await fetch(`${API_BASE_URL}/proveedores`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error al cargar proveedores: ${errorText}`);
        }
        
        proveedores = await response.json();
        console.log('Proveedores cargados:', proveedores.length);
        actualizarTablaProveedores();
        return proveedores;
    } catch (error) {
        console.error('Error al cargar proveedores:', error);
        mostrarNotificacion('Error al cargar proveedores', 'error');
        return [];
    }
}

// Función para actualizar la tabla de proveedores
function actualizarTablaProveedores() {
    const tbody = document.querySelector('#suppliers-list-tab tbody');
    if (!tbody) return;
    
    tbody.innerHTML = proveedores.map(proveedor => `
        <tr>
            <td>${proveedor.id}</td>
            <td>${proveedor.nombreProveedor}</td>
            <td>${proveedor.emailProveedor || 'N/A'}</td>
            <td>${proveedor.telefonoProveedor}</td>
            <td>${proveedor.productos ? proveedor.productos.length : 0}</td>
            <td class="action-buttons">
                <button class="action-btn edit-btn" onclick="editarProveedor(${proveedor.id})">Editar</button>
                <button class="action-btn delete-btn" onclick="eliminarProveedor(${proveedor.id})">Eliminar</button>
            </td>
        </tr>
    `).join('');
}

// Función para cargar categorías desde la API
async function cargarCategorias() {
    try {
        console.log('Cargando categorías...');
        const response = await fetch(`${API_BASE_URL}/categorias`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error al cargar categorías: ${errorText}`);
        }
        
        categorias = await response.json();
        console.log('Categorías cargadas:', categorias.length);
        actualizarTablaCategorias();
        return categorias;
    } catch (error) {
        console.error('Error al cargar categorías:', error);
        mostrarNotificacion('Error al cargar categorías', 'error');
        return [];
    }
}

// Función para actualizar la tabla de categorías
function actualizarTablaCategorias() {
    const tbody = document.querySelector('#categories-list-tab tbody');
    if (!tbody) return;
    
    tbody.innerHTML = categorias.map(categoria => `
        <tr>
            <td>${categoria.id}</td>
            <td>${categoria.nombre}</td>
            <td>${categoria.productos ? categoria.productos.length : 0}</td>
            <td class="action-buttons">
                <button class="action-btn edit-btn" onclick="editarCategoria(${categoria.id})">Editar</button>
                <button class="action-btn delete-btn" onclick="eliminarCategoria(${categoria.id})">Eliminar</button>
            </td>
        </tr>
    `).join('');
}

// Función para cargar productos desde la API
async function cargarProductos() {
    try {
        console.log('Cargando productos desde API...');
        const response = await fetch(`${API_BASE_URL}/productos`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`Error al cargar productos: ${response.status} ${response.statusText}`);
        }
        
        productos = await response.json();
        console.log('Productos cargados:', productos.length, 'encontrados');
        
        if (productos.length > 0) {
            console.log('Tipo de precio del primer producto:', typeof productos[0].precio);
            console.log('Valor de precio del primer producto:', productos[0].precio);
        }
        
        actualizarTablaProductos();
        return productos;
    } catch (error) {
        console.error('Error al cargar productos:', error);
        mostrarNotificacion('Error al cargar productos: ' + error.message, 'error');
        return [];
    }
}

// Función para actualizar la tabla de productos
function actualizarTablaProductos() {
    console.log('Actualizando tabla de productos...');
    const tbody = document.querySelector('#products tbody');
    
    if (!tbody) {
        console.error('No se encontró el tbody de productos');
        return;
    }
    
    if (!productos || productos.length === 0) {
        console.log('No hay productos para mostrar');
        tbody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align: center; padding: 20px;">
                    No hay productos disponibles
                </td>
            </tr>
        `;
        return;
    }
    
    console.log('Renderizando', productos.length, 'productos en la tabla');
    
    // Procesar productos de forma asíncrona para verificar imágenes
    Promise.all(productos.map(async (producto, index) => {
        const precio = typeof producto.precio === 'string' ? 
            parseFloat(producto.precio) : producto.precio;
        const precioOriginal = producto.precioOriginal ? 
            (typeof producto.precioOriginal === 'string' ? 
                parseFloat(producto.precioOriginal) : producto.precioOriginal) : null;
        
        // Verificar y construir URL de imagen
        let imagenUrl = 'https://via.placeholder.com/50x50/2A2A2A/cccccc?text=Imagen';
        
        if (producto.imagenPrincipal && producto.imagenPrincipal !== 'default.jpg') {
            const urlCompleta = producto.imagenPrincipal.startsWith('http') ? 
                producto.imagenPrincipal : `${API_BASE_URL}${producto.imagenPrincipal}`;
            
            const imagenExiste = await verificarImagen(urlCompleta);
            imagenUrl = imagenExiste ? urlCompleta : imagenUrl;
        }
        
        return `
            <tr>
                <td>${producto.id}</td>
                <td>
                    <img src="${imagenUrl}" 
                        alt="${producto.nombre}" 
                        style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; border: 1px solid #333;"
                        onerror="this.src='https://via.placeholder.com/50x50/2A2A2A/cccccc?text=Imagen'">
                </td>
                <td>${producto.nombre}</td>
                <td>${producto.marca?.nombre || 'Sin marca'}</td>
                <td>${producto.categoria?.nombre || 'Sin categoría'}</td>
                <td>€${precio ? precio.toFixed(2) : '0.00'}</td>
                <td>${precioOriginal ? `€${precioOriginal.toFixed(2)}` : 'N/A'}</td>
                <td>${producto.stock || 0}</td>
                <td>
                    <span class="status-badge ${producto.activo ? 'status-completed' : 'status-cancelled'}">
                        ${producto.activo ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td>${producto.destacado ? '<span class="status-badge status-featured" style="margin-left: 5px;">Destacado</span>' : ''}</td>
                <td >
                    <button class="action-btn edit-btn" onclick="editarProducto(${producto.id})">Editar</button>
                    <button class="action-btn delete-btn" onclick="eliminarProducto(${producto.id})">Eliminar</button>
                </td>
            </tr>
        `;
    })).then(rows => {
        tbody.innerHTML = rows.join('');
        console.log('Tabla de productos actualizada con', rows.length, 'productos');
    });
}

// Función para verificar si una imagen existe
async function verificarImagen(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
}

// Función para actualizar los selects en los formularios
async function actualizarSelectsFormularios() {
    console.log('Actualizando selects de formularios...');
    await Promise.all([cargarMarcas(), cargarProveedores(), cargarCategorias()]);
    
    // Actualizar select de marcas en formulario de producto
    const marcaSelect = document.getElementById('product-brand');
    if (marcaSelect) {
        marcaSelect.innerHTML = '<option value="">Seleccionar marca</option>' +
            marcas.map(marca => 
                `<option value="${marca.id}">${marca.nombre}</option>`
            ).join('');
        console.log('Select de marcas actualizado:', marcas.length, 'marcas');
    }
    
    // Actualizar select de proveedores en formulario de producto
    const proveedorSelect = document.getElementById('product-supplier');
    if (proveedorSelect) {
        proveedorSelect.innerHTML = '<option value="">Seleccionar proveedor</option>' +
            proveedores.filter(p => p.activo).map(proveedor => 
                `<option value="${proveedor.id}">${proveedor.nombreProveedor}</option>`
            ).join('');
        console.log('Select de proveedores actualizado:', proveedores.length, 'proveedores');
    }
    
    // Actualizar select de categorías en formulario de producto
    const categoriaSelect = document.getElementById('product-category');
    if (categoriaSelect) {
        categoriaSelect.innerHTML = '<option value="">Seleccionar categoría</option>' +
            categorias.map(categoria => 
                `<option value="${categoria.id}">${categoria.nombre}</option>`
            ).join('');
        console.log('Select de categorías actualizado:', categorias.length, 'categorías');
    }
}

// FUNCIÓN CORREGIDA: Manejar envío del formulario de producto
async function handleProductSubmit(e) {
    e.preventDefault();
    console.log('Enviando formulario de producto...');
    
    const form = e.target;
    const imageFile = document.getElementById('product-image-upload')?.files[0];
    
    let imagenUrl = 'default.jpg';
    
    // Subir imagen primero si existe
    if (imageFile) {
        try {
            console.log('Subiendo imagen antes de crear producto...');
            imagenUrl = await subirImagenProducto(imageFile);
            console.log('URL de imagen obtenida:', imagenUrl);
        } catch (error) {
            console.error('Error al subir imagen:', error);
            mostrarNotificacion('Error al subir imagen: ' + error.message, 'error');
            return;
        }
    }
    
    // Convertir precios a números explícitamente
    const precio = parseFloat(form.elements['product-price'].value);
    const precioOriginalInput = form.elements['product-original-price']?.value;
    const precioOriginal = precioOriginalInput ? parseFloat(precioOriginalInput) : null;
    
    // Crear objeto con los datos del formulario
    const productData = {
        nombre: form.elements['product-name'].value,
        descripcion: form.elements['product-description'].value,
        precio: precio,
        precioOriginal: precioOriginal,
        stock: parseInt(form.elements['product-stock'].value) || 0,
        proveedorId: parseInt(form.elements['product-supplier'].value),
        marcaId: parseInt(form.elements['product-brand'].value),
        categoriaId: parseInt(form.elements['product-category'].value),
        imagenPrincipal: imagenUrl, // Usar la URL de la imagen subida
        imagenesSecundarias: [],
        limiteEdicion: null,
        numeroSerieInicio: null,
        caracteristicasEspeciales: null,
        fechaLanzamiento: new Date().toISOString(),
        activo: form.elements['product-active']?.checked || false,
        destacado: form.elements['product-featured']?.checked || false
    };
    
    console.log('Datos del producto a enviar:', productData);
    
    try {
        // Crear el producto con la imagen ya incluida
        const response = await fetch(`${API_BASE_URL}/productos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });
        
        console.log('Respuesta del servidor:', response.status, response.statusText);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(errorText || 'Error al crear producto');
        }
        
        const nuevoProducto = await response.json();
        console.log('Producto creado:', nuevoProducto);
        
        mostrarNotificacion('Producto creado correctamente', 'success');
        
        // Limpiar formulario
        form.reset();
        const preview = document.getElementById('product-image-preview');
        if (preview) {
            preview.style.display = 'none';
        }
        
        // Recargar la lista de productos
        await cargarProductos();
        actualizarEstadisticas();
        
    } catch (error) {
        console.error('Error al crear producto:', error);
        mostrarNotificacion('Error al crear producto: ' + error.message, 'error');
    }
}

// FUNCIÓN CORREGIDA: Subir imagen del producto
async function subirImagenProducto(imageFile) {
    const formData = new FormData();
    formData.append('imagen', imageFile);
    
    try {
        console.log('Subiendo imagen...', imageFile.name);
        
        // CORRECCIÓN: Usar la ruta correcta /api/upload
        const uploadResponse = await fetch(`${API_BASE_URL}/upload`, {
            method: 'POST',
            body: formData
        });
        
        console.log('Respuesta de subida:', uploadResponse.status);
        
        if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            console.error('Error en subida:', errorText);
            throw new Error('Error al subir imagen: ' + errorText);
        }
        
        const uploadResult = await uploadResponse.json();
        console.log('Imagen subida correctamente:', uploadResult);
        
        return uploadResult.url;
        
    } catch (error) {
        console.error('Error al subir imagen:', error);
        throw error;
    }
}

// FUNCIÓN CORREGIDA: Manejar upload de imagen
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
        mostrarNotificacion('Por favor, selecciona un archivo de imagen válido', 'error');
        e.target.value = '';
        return;
    }
    
    // Validar tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
        mostrarNotificacion('La imagen no debe superar los 5MB', 'error');
        e.target.value = '';
        return;
    }
    
    const preview = document.getElementById('product-image-preview');
    if (!preview) return;
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        preview.src = e.target.result;
        preview.style.display = 'block';
        preview.alt = 'Vista previa de la imagen';
    };
    
    reader.onerror = function() {
        mostrarNotificacion('Error al cargar la imagen', 'error');
    };
    
    reader.readAsDataURL(file);
}

// Manejar envío del formulario de categoría
async function handleCategorySubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = {
        nombre: form.elements['category-name'].value,
        descripcion: form.elements['category-description'].value
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/categorias`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al crear categoría');
        }
        
        const nuevaCategoria = await response.json();
        mostrarNotificacion('Categoría creada correctamente', 'success');
        form.reset();
        
        cargarCategorias();
        actualizarSelectsFormularios();
        actualizarEstadisticas();
        
    } catch (error) {
        console.error('Error al crear categoría:', error);
        mostrarNotificacion(error.message, 'error');
    }
}

// Manejar envío del formulario de marca
async function handleBrandSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = {
        nombre: form.elements['brand-name'].value,
        descripcion: form.elements['brand-description'].value,
        logoUrl: form.elements['brand-logo'].value
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/marcas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al crear marca');
        }
        
        const nuevaMarca = await response.json();
        mostrarNotificacion('Marca creada correctamente', 'success');
        form.reset();
        
        cargarMarcas();
        actualizarSelectsFormularios();
        actualizarEstadisticas();
        
    } catch (error) {
        console.error('Error al crear marca:', error);
        mostrarNotificacion(error.message, 'error');
    }
}

// Manejar envío del formulario de proveedor
async function handleSupplierSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = {
        nombreProveedor: form.elements['supplier-name'].value,
        telefonoProveedor: form.elements['supplier-phone'].value,
        dniProveedor: form.elements['supplier-dni'].value,
        emailProveedor: form.elements['supplier-email'].value,
        direccionProveedor: form.elements['supplier-address'].value,
        activo: form.elements['supplier-active']?.checked || false
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/proveedores`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al crear proveedor');
        }
        
        const nuevoProveedor = await response.json();
        mostrarNotificacion('Proveedor creada correctamente', 'success');
        form.reset();
        
        cargarProveedores();
        actualizarSelectsFormularios();
        actualizarEstadisticas();
        
    } catch (error) {
        console.error('Error al crear proveedor:', error);
        mostrarNotificacion(error.message, 'error');
    }
}

// Función para eliminar producto
async function eliminarProducto(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) return;
    
    try {
        console.log('Eliminando producto:', id);
        const response = await fetch(`${API_BASE_URL}/productos/${id}`, {
            method: 'DELETE'
        });
        
        console.log('Respuesta de eliminación:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error al eliminar:', errorText);
            throw new Error(errorText || 'Error al eliminar producto');
        }
        
        const result = await response.json();
        console.log('Resultado de eliminación:', result);
        mostrarNotificacion(result.message || 'Producto eliminado correctamente', 'success');
        
        await cargarProductos();
        actualizarEstadisticas();
        
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        mostrarNotificacion('Error al eliminar producto: ' + error.message, 'error');
    }
}

// Función para eliminar categoría
async function eliminarCategoria(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta categoría?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/categorias/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al eliminar categoría');
        }
        
        const result = await response.json();
        mostrarNotificacion(result.message || 'Categoría eliminada correctamente', 'success');
        
        cargarCategorias();
        actualizarSelectsFormularios();
        actualizarEstadisticas();
        
    } catch (error) {
        console.error('Error al eliminar categoría:', error);
        mostrarNotificacion(error.message, 'error');
    }
}

// Función para eliminar marca
async function eliminarMarca(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta marca?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/marcas/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al eliminar marca');
        }
        
        const result = await response.json();
        mostrarNotificacion(result.message || 'Marca eliminada correctamente', 'success');
        
        cargarMarcas();
        actualizarSelectsFormularios();
        actualizarEstadisticas();
        
    } catch (error) {
        console.error('Error al eliminar marca:', error);
        mostrarNotificacion(error.message, 'error');
    }
}

// Función para eliminar proveedor
async function eliminarProveedor(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este proveedor?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/proveedores/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al eliminar proveedor');
        }
        
        const result = await response.json();
        mostrarNotificacion(result.message || 'Proveedor eliminado correctamente', 'success');
        
        cargarProveedores();
        actualizarSelectsFormularios();
        actualizarEstadisticas();
        
    } catch (error) {
        console.error('Error al eliminar proveedor:', error);
        mostrarNotificacion(error.message, 'error');
    }
}

// FUNCIONES DE EDICIÓN

// Editar Producto
window.editarProducto = async function(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/productos/${id}`);
        if (!response.ok) throw new Error('Error al cargar producto');
        
        const producto = await response.json();
        
        // Llenar formulario de edición
        document.getElementById('product-name').value = producto.nombre;
        document.getElementById('product-description').value = producto.descripcion;
        document.getElementById('product-price').value = producto.precio;
        document.getElementById('product-original-price').value = producto.precioOriginal || '';
        document.getElementById('product-stock').value = producto.stock;
        document.getElementById('product-brand').value = producto.marca?.id;
        document.getElementById('product-category').value = producto.categoria?.id;
        document.getElementById('product-supplier').value = producto.proveedor?.id;
        
        const activoCheckbox = document.getElementById('product-active');
        const destacadoCheckbox = document.getElementById('product-featured');
        
        if (activoCheckbox) activoCheckbox.checked = producto.activo || false;
        if (destacadoCheckbox) destacadoCheckbox.checked = producto.destacado || false;
        
        console.log('Editando producto - Activo:', producto.activo, 'Destacado:', producto.destacado);
        
        // Mostrar imagen actual
        if (producto.imagenPrincipal && producto.imagenPrincipal !== 'default.jpg') {
            const preview = document.getElementById('product-image-preview');
            const imagenUrl = producto.imagenPrincipal.startsWith('http') ? 
                producto.imagenPrincipal : `${API_BASE_URL}${producto.imagenPrincipal}`;
            preview.src = imagenUrl;
            preview.style.display = 'block';
        }
        
        showSection('add-product');
        
        const submitBtn = document.querySelector('#product-form button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Actualizar Producto';
        submitBtn.onclick = async (e) => {
            e.preventDefault();
            await actualizarProducto(id);
        };
        
    } catch (error) {
        console.error('Error al editar producto:', error);
        mostrarNotificacion('Error al cargar producto para editar', 'error');
    }
};

// FUNCIÓN CORREGIDA: Actualizar Producto
async function actualizarProducto(id) {
    const form = document.getElementById('product-form');
    const imageFile = document.getElementById('product-image-upload')?.files[0];
    
    let updateData = {
        nombre: form.elements['product-name'].value,
        descripcion: form.elements['product-description'].value,
        precio: parseFloat(form.elements['product-price'].value),
        precioOriginal: form.elements['product-original-price']?.value ? 
            parseFloat(form.elements['product-original-price'].value) : null,
        stock: parseInt(form.elements['product-stock'].value),
        marcaId: parseInt(form.elements['product-brand'].value),
        categoriaId: parseInt(form.elements['product-category'].value),
        proveedorId: parseInt(form.elements['product-supplier'].value),
        activo: form.elements['product-active']?.checked || false,
        destacado: form.elements['product-featured']?.checked || false
    };
    
    // Subir nueva imagen si existe
    if (imageFile) {
        try {
            console.log('Subiendo nueva imagen para actualización...');
            const nuevaImagenUrl = await subirImagenProducto(imageFile);
            updateData.imagenPrincipal = nuevaImagenUrl;
            console.log('Nueva imagen URL:', nuevaImagenUrl);
        } catch (error) {
            console.error('Error al subir imagen:', error);
            mostrarNotificacion('Error al subir imagen: ' + error.message, 'error');
            return;
        }
    }
    
    console.log('Actualizando producto - Datos:', updateData);
    
    try {
        const response = await fetch(`${API_BASE_URL}/productos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Error al actualizar producto');
        }
        
        mostrarNotificacion('Producto actualizado correctamente', 'success');
        
        await cargarProductos();
        resetForm('product-form');
        
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        mostrarNotificacion('Error al actualizar producto: ' + error.message, 'error');
    }
}

// Editar Categoría
window.editarCategoria = async function(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/categorias/${id}`);
        if (!response.ok) throw new Error('Error al cargar categoría');
        
        const categoria = await response.json();
        
        document.getElementById('category-name').value = categoria.nombre;
        document.getElementById('category-description').value = categoria.descripcion;
        
        showTab('categories', 'add-category-tab');
        
        const submitBtn = document.querySelector('#category-form button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Actualizar Categoría';
        submitBtn.onclick = async (e) => {
            e.preventDefault();
            await actualizarCategoria(id);
        };
        
    } catch (error) {
        console.error('Error al editar categoría:', error);
        mostrarNotificacion('Error al cargar categoría para editar', 'error');
    }
};

async function actualizarCategoria(id) {
    const form = document.getElementById('category-form');
    
    const categoryData = {
        nombre: form.elements['category-name'].value,
        descripcion: form.elements['category-description'].value
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/categorias/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(categoryData)
        });
        
        if (!response.ok) throw new Error('Error al actualizar categoría');
        
        mostrarNotificacion('Categoría actualizada correctamente', 'success');
        cargarCategorias();
        resetForm('category-form');
        
    } catch (error) {
        console.error('Error al actualizar categoría:', error);
        mostrarNotificacion('Error al actualizar categoría', 'error');
    }
}

// Editar Marca
window.editarMarca = async function(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/marcas/${id}`);
        if (!response.ok) throw new Error('Error al cargar marca');
        
        const marca = await response.json();
        
        document.getElementById('brand-name').value = marca.nombre;
        document.getElementById('brand-description').value = marca.descripcion;
        document.getElementById('brand-logo').value = marca.logoUrl;
        
        showTab('brands', 'add-brand-tab');
        
        const submitBtn = document.querySelector('#brand-form button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Actualizar Marca';
        submitBtn.onclick = async (e) => {
            e.preventDefault();
            await actualizarMarca(id);
        };
        
    } catch (error) {
        console.error('Error al editar marca:', error);
        mostrarNotificacion('Error al cargar marca para editar', 'error');
    }
};

async function actualizarMarca(id) {
    const form = document.getElementById('brand-form');
    
    const brandData = {
        nombre: form.elements['brand-name'].value,
        descripcion: form.elements['brand-description'].value,
        logoUrl: form.elements['brand-logo'].value
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/marcas/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(brandData)
        });
        
        if (!response.ok) throw new Error('Error al actualizar marca');
        
        mostrarNotificacion('Marca actualizada correctamente', 'success');
        cargarMarcas();
        resetForm('brand-form');
        
    } catch (error) {
        console.error('Error al actualizar marca:', error);
        mostrarNotificacion('Error al actualizar marca', 'error');
    }
}

// Editar Proveedor
window.editarProveedor = async function(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/proveedores/${id}`);
        if (!response.ok) throw new Error('Error al cargar proveedor');
        
        const proveedor = await response.json();
        
        document.getElementById('supplier-name').value = proveedor.nombreProveedor;
        document.getElementById('supplier-phone').value = proveedor.telefonoProveedor;
        document.getElementById('supplier-dni').value = proveedor.dniProveedor;
        document.getElementById('supplier-email').value = proveedor.emailProveedor;
        document.getElementById('supplier-address').value = proveedor.direccionProveedor;
        
        const activoCheckbox = document.getElementById('supplier-active');
        if (activoCheckbox) activoCheckbox.checked = proveedor.activo || false;
        
        showTab('suppliers', 'add-supplier-tab');
        
        const submitBtn = document.querySelector('#supplier-form button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Actualizar Proveedor';
        submitBtn.onclick = async (e) => {
            e.preventDefault();
            await actualizarProveedor(id);
        };
        
    } catch (error) {
        console.error('Error al editar proveedor:', error);
        mostrarNotificacion('Error al cargar proveedor para editar', 'error');
    }
};

async function actualizarProveedor(id) {
    const form = document.getElementById('supplier-form');
    
    const supplierData = {
        nombreProveedor: form.elements['supplier-name'].value,
        telefonoProveedor: form.elements['supplier-phone'].value,
        dniProveedor: form.elements['supplier-dni'].value,
        emailProveedor: form.elements['supplier-email'].value,
        direccionProveedor: form.elements['supplier-address'].value,
        activo: form.elements['supplier-active']?.checked || false
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/proveedores/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(supplierData)
        });
        
        if (!response.ok) throw new Error('Error al actualizar proveedor');
        
        mostrarNotificacion('Proveedor actualizado correctamente', 'success');
        cargarProveedores();
        resetForm('supplier-form');
        
    } catch (error) {
        console.error('Error al actualizar proveedor:', error);
        mostrarNotificacion('Error al actualizar proveedor', 'error');
    }
}

// Editar Usuario
window.editarUsuario = async function(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/usuarios/${id}`);
        if (!response.ok) throw new Error('Error al cargar usuario');
        
        const usuario = await response.json();
        mostrarModalEdicionUsuario(usuario);
        
    } catch (error) {
        console.error('Error al editar usuario:', error);
        mostrarNotificacion('Error al cargar usuario para editar', 'error');
    }
};

function mostrarModalEdicionUsuario(usuario) {
    const modalHTML = `
        <div class="modal" id="user-edit-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;">
            <div style="background: var(--card-bg); padding: 20px; border-radius: 8px; width: 400px;">
                <h3>Editar Usuario</h3>
                <form id="user-edit-form">
                    <div class="form-group">
                        <label>Nombre de usuario</label>
                        <input type="text" class="form-control" id="edit-user-username" value="${usuario.username || ''}">
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" class="form-control" id="edit-user-email" value="${usuario.email}">
                    </div>
                    <div class="form-group">
                        <label>Fecha de nacimiento</label>
                        <input type="date" class="form-control" id="edit-user-birthday" value="${usuario.birthday ? usuario.birthday.split('T')[0] : ''}">
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="edit-user-admin" ${usuario.admin ? 'checked' : ''}> Administrador
                        </label>
                    </div>
                    <div class="form-buttons" style="display: flex; gap: 10px; margin-top: 20px;">
                        <button type="button" class="btn" onclick="actualizarUsuario(${usuario.id})">Guardar</button>
                        <button type="button" class="btn btn-secondary" onclick="cerrarModal()">Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

window.cerrarModal = function() {
    const modal = document.getElementById('user-edit-modal');
    if (modal) modal.remove();
};

window.actualizarUsuario = async function(id) {
    const userData = {
        username: document.getElementById('edit-user-username').value,
        email: document.getElementById('edit-user-email').value,
        birthday: document.getElementById('edit-user-birthday').value,
        admin: document.getElementById('edit-user-admin').checked
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        if (!response.ok) throw new Error('Error al actualizar usuario');
        
        mostrarNotificacion('Usuario actualizado correctamente', 'success');
        cargarUsuarios();
        cerrarModal();
        
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        mostrarNotificacion('Error al actualizar usuario', 'error');
    }
};

// Eliminar Usuario
window.eliminarUsuario = async function(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al eliminar usuario');
        }
        
        const result = await response.json();
        mostrarNotificacion(result.message || 'Usuario eliminado correctamente', 'success');
        cargarUsuarios();
        actualizarEstadisticas();
        
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        mostrarNotificacion(error.message, 'error');
    }
};

// Función para resetear formularios
function resetForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.reset();
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Guardar';
            submitBtn.onclick = null;
        }
    }
    
    const preview = document.getElementById('product-image-preview');
    if (preview) {
        preview.style.display = 'none';
    }
}

// Función para mostrar notificaciones
function mostrarNotificacion(mensaje, tipo = 'info') {
    const notificacion = document.createElement('div');
    notificacion.className = `notification ${tipo}`;
    notificacion.innerHTML = `
        <span>${mensaje}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    
    notificacion.style.position = 'fixed';
    notificacion.style.bottom = '20px';
    notificacion.style.right = '20px';
    notificacion.style.padding = '15px';
    notificacion.style.borderRadius = '5px';
    notificacion.style.zIndex = '1000';
    notificacion.style.display = 'flex';
    notificacion.style.alignItems = 'center';
    notificacion.style.gap = '10px';
    notificacion.style.color = 'white';
    notificacion.style.fontWeight = '500';
    
    if (tipo === 'success') {
        notificacion.style.backgroundColor = '#4CAF50';
    } else if (tipo === 'error') {
        notificacion.style.backgroundColor = '#f44336';
    } else {
        notificacion.style.backgroundColor = '#2196F3';
    }
    
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        if (notificacion.parentElement) {
            notificacion.remove();
        }
    }, 5000);
}

// Funciones globales para usar en los onclick de los botones
window.eliminarProducto = eliminarProducto;
window.eliminarCategoria = eliminarCategoria;
window.eliminarMarca = eliminarMarca;
window.eliminarProveedor = eliminarProveedor;
window.showSection = showSection;
window.showTab = showTab;
window.cambiarEstadoAdmin = cambiarEstadoAdmin;
window.handleProductSubmit = handleProductSubmit;
window.handleImageUpload = handleImageUpload;
window.subirImagenProducto = subirImagenProducto;
window.actualizarProducto = actualizarProducto;

console.log('Script admin.js cargado correctamente');